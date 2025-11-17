use crate::errors::GameErrors;
use crate::state::{Card, Player};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub owner: Pubkey,
    pub entry_stake: u64,
    pub game_vault: Pubkey,
    pub stake_mint: Pubkey,
    pub no_players: u8,
    pub player_turn: u8,
    #[max_len(5)]
    pub players: Vec<Player>,
    pub winner: Option<Pubkey>,
    pub call_card: Option<Card>,
    #[max_len(54)]
    pub draw_pile: Option<Vec<Card>>,
    pub cards_to_draw: Option<u8>,
    pub card_requested: Option<u8>,
    pub wait_time: i64,
    pub seed: u64,
    pub random_seed: Option<u64>,
    pub delegated: bool,
    pub started: bool,
    pub ended: bool,
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub ended_at: Option<i64>,
    pub last_move_time: Option<i64>,
    pub bump: u8,
}

impl Game {
    pub fn handle_call_card(&mut self) -> Result<()> {
        let call_card = self.call_card.as_ref().ok_or(GameErrors::NoCallCard)?;

        // update last move time
        self.last_move_time = Some(Clock::get().unwrap().unix_timestamp);
        if call_card.card_number == 1 {
            self.handle_hold_on()
        } else if call_card.card_number == 2 {
            self.handle_pick_2()
        } else if call_card.card_number == 5 {
            self.handle_pick_3()
        } else if call_card.card_number == 8 {
            self.handle_suspension()
        } else if call_card.card_number == 14 {
            self.handle_general_market()
        } else if call_card.card_number == 20 {
            self.handle_need()
        } else {
            self.handle_neutral_play()
        }
    }

    pub fn validate_play(&mut self, card: &Card, shape_requested: Option<u8>) -> Result<()> {
        let call_card = self.call_card.as_ref().ok_or(GameErrors::NoCallCard)?;
        let cards_to_draw = self.cards_to_draw;
        let card_requested = self.card_requested;

        // get current player
        let player_index = (self.player_turn - 1) as usize;
        let player = &mut self.players[player_index];

        // check if there is a pending pick 2 or 3
        // Pick 2/3 takes priority over NEED card requests
        if let Some(cards_pending) = cards_to_draw {
            // Only same type can counter.
            // Pick 2 → card_number == 2
            // Pick 3 → card_number == 5
            if (cards_pending % 2 == 0 && card.card_number != 2)
                || (cards_pending % 3 == 0 && card.card_number != 5)
            {
                return err!(GameErrors::YouNeedToPickFromPile);
            }
        }
        // check if there is a need card (only if no pending pick 2/3)
        else if let Some(card_requested) = card_requested {
            // Valid if: WHOT card (20) OR matches the requested shape
            if card.card_number != 20 && card.id != card_requested {
                return err!(GameErrors::CardDoesNotMatchNeed);
            }
        }

        // check if the card is valid
        if card.id == 6
        || card_requested.map_or(false, |req| card.id == req)
        || card.id == call_card.id
        || card.card_number == call_card.card_number
        {
            // remove card from current player's hand
            if let Some(ref mut hand) = player.hand {
                // check if player has card in hand
                if !hand.contains(card) {
                    return err!(GameErrors::YouDoNotOwnThisCard);
                }
                hand.retain(|c| c != card);
                // update call card
                if card.card_number == 20 {
                    if let Some(shape_requested) = shape_requested {
                        if shape_requested < 1 || shape_requested > 5 {
                            return err!(GameErrors::InvalidCardRequested);
                        } else {
                            self.card_requested = Some(shape_requested);
                        }
                    } else {
                        return err!(GameErrors::SpecifyNeededShape);
                    }
                }
                self.call_card = Some(card.clone());
                if self.card_requested.is_some() && card.card_number != 20 {
                    self.card_requested = None;
                }
                return Ok(());
            }
            return err!(GameErrors::PlayerHandDoesNotContainCard);
        } else {
            return err!(GameErrors::CallCardDoesNotMatchPlayCard);
        }
    }

    pub fn check_winner(&mut self) -> Result<()> {
        if self.ended {
            return err!(GameErrors::GameEnded);
        }
        // check if player hand is empty or market has finished
        let player_index = (self.player_turn - 1) as usize;
        let player = &mut self.players[player_index];

        // first check if player hand is empty
        if let Some(ref mut hand) = player.hand {
            if hand.is_empty() {
                self.handle_checkup();
                return Ok(());
            }
        }

        // second check if market has finished
        if let Some(ref mut draw_pile) = self.draw_pile {
            if draw_pile.is_empty() {
                self.handle_market_finish();
                return Ok(());
            }
        }

        return Ok(());
    }

    pub fn next_turn(&mut self, step: u8) {
        self.player_turn = ((self.player_turn - 1 + step) % self.no_players) + 1;
    }

    pub fn handle_draw_from_pile(&mut self) -> Result<()> {
        // First: handle pending Pick 2 / Pick 3 obligations
        if let Some(n) = self.cards_to_draw {
            let draw_pile = self.draw_pile.as_mut().ok_or(GameErrors::NoDrawPile)?;
            let available = draw_pile.len() as u8;

            // player will draw min(n, available)
            let to_draw = n.min(available);

            // get player
            let player_index = (self.player_turn - 1) as usize;
            let player = &mut self.players[player_index];

            // draw the cards
            for _ in 0..to_draw {
                let card = draw_pile.pop().unwrap(); // safe because to_draw ≤ available
                if let Some(hand) = &mut player.hand {
                    hand.push(card);
                }
            }

            // clear stack penalty
            self.cards_to_draw = None;

            self.check_winner()?;
            if self.ended {
                return Ok(());
            }
            self.next_turn(1);
            return Ok(());
        }

        // ---------------------------
        // NORMAL DRAW LOGIC (no pick2/pick3)
        // ---------------------------
        let draw_pile = self.draw_pile.as_mut().ok_or(GameErrors::NoDrawPile)?;
        if let Some(card) = draw_pile.pop() {
            let player_index = (self.player_turn - 1) as usize;
            let player = &mut self.players[player_index];
            if let Some(hand) = &mut player.hand {
                hand.push(card);
            }

            self.check_winner()?;
            if self.ended {
                return Ok(());
            }
            self.next_turn(1);
            return Ok(());
        } else {
            self.check_winner()?;
            if self.ended {
                return Ok(());
            }
            self.next_turn(1);
            return Ok(());
        }
    }

    pub fn handle_neutral_play(&mut self) -> Result<()> {
        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        self.next_turn(1);
        Ok(())
    }

    pub fn handle_pick_2(&mut self) -> Result<()> {
        // stack pick-2 penalties
        match self.cards_to_draw {
            Some(n) => self.cards_to_draw = Some(n + 2),
            None => self.cards_to_draw = Some(2),
        }

        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        // move to next player
        self.next_turn(1);
        Ok(())
    }

    pub fn handle_pick_3(&mut self) -> Result<()> {
        // stack pick-3 penalties
        match self.cards_to_draw {
            Some(n) => self.cards_to_draw = Some(n + 3),
            None => self.cards_to_draw = Some(3),
        }

        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        // move to next player
        self.next_turn(1);
        Ok(())
    }

    pub fn handle_suspension(&mut self) -> Result<()> {
        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        self.next_turn(2);
        Ok(())
    }

    pub fn handle_hold_on(&mut self) -> Result<()> {
        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        Ok(())
    }

    pub fn handle_general_market(&mut self) -> Result<()> {
        let draw_pile = self.draw_pile.as_mut().ok_or(GameErrors::NoDrawPile)?;
        let current_player = (self.player_turn - 1) as usize;

        let total_players = self.no_players as usize;

        for i in 0..total_players {
            if i == current_player {
                continue; // skip current player
            }

            if draw_pile.is_empty() {
                break;
            }

            let card = draw_pile.pop().unwrap();
            if let Some(ref mut hand) = self.players[i].hand {
                hand.push(card);
            }
        }

        self.check_winner()?;
        Ok(())
    }

    pub fn handle_need(&mut self) -> Result<()> {
        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        self.next_turn(1);
        Ok(())
    }

    pub fn handle_count_cards(&mut self) {
        for player in &mut self.players {
            let mut total_count: u8 = 0;

            if let Some(ref hand) = player.hand {
                for card in hand {
                    if card.id == 6 {
                        total_count =
                            total_count.saturating_add(card.card_number.saturating_mul(2));
                    } else {
                        total_count = total_count.saturating_add(card.card_number);
                    }
                }
            }

            player.card_count = Some(total_count);
        }
    }

    pub fn handle_checkup(&mut self) {
        if self.ended {
            return;
        }

        self.handle_count_cards();
        self.winner = Some(self.players[(self.player_turn - 1) as usize].owner);
        self.ended = true;
        self.ended_at = Some(Clock::get().unwrap().unix_timestamp);
        self.player_turn = 0;
    }

    pub fn handle_market_finish(&mut self) {
        if self.ended {
            return;
        }

        self.handle_count_cards();

        // Get the minimum card count across all players
        let min_count = self
            .players
            .iter()
            .filter_map(|p| p.card_count)
            .min()
            .unwrap_or(0);

        // Collect all players who share that minimum count
        let lowest_players: Vec<&Player> = self
            .players
            .iter()
            .filter(|p| p.card_count == Some(min_count))
            .collect();

        // Check if there's more than one player with the same lowest count
        if lowest_players.len() > 1 {
            self.winner = None; // No winner due to tie
        } else {
            self.winner = Some(lowest_players[0].owner);
        }

        self.ended = true;
        self.ended_at = Some(Clock::get().unwrap().unix_timestamp);
        self.player_turn = 0;
    }

    pub fn handle_penalize_opponent(&mut self) -> Result<()> {
        let current_index = (self.player_turn - 1) as usize;
        let player = &mut self.players[current_index];

        // Get current time in seconds
        let now = Clock::get()?.unix_timestamp;

        // Use last_move_time or fallback to game start time
        let last_move = self
            .last_move_time
            .unwrap_or(self.started_at.unwrap_or(now));

        // Only penalize if player exceeded wait_time
        if now - last_move <= self.wait_time {
            return Ok(()); // Not overdue, no penalty
        }

        // Ensure draw pile exists
        let draw_pile = self.draw_pile.as_mut().ok_or(GameErrors::NoDrawPile)?;

        // Draw one card from draw pile to penalize current player
        if let Some(ref mut hand) = player.hand {
            if draw_pile.is_empty() {
                self.handle_market_finish();
                return Ok(());
            }

            let card = draw_pile.pop().unwrap();
            hand.push(card);
        }

        self.check_winner()?;
        if self.ended {
            return Ok(());
        }
        self.next_turn(1);

        Ok(())
    }
}
