use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::state::Card;
pub use instructions::*;
pub use state::DelegateParams;

declare_id!("Dege4SWaJoarqG9qh3wWhKwP84XaCru2FuNCEkAUQY6U");


#[ephemeral]
#[program]
pub mod degen_decks {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        platform_fee: u16,
        allow_mints: Vec<Pubkey>,
    ) -> Result<()> {
        ctx.accounts
            .initialize(platform_fee, allow_mints, ctx.bumps.config)
    }

    pub fn initialize_profile(ctx: Context<InitializeProfile>, username: String) -> Result<()> {
        ctx.accounts.initialize_profile(username, ctx.bumps.profile)
    }

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        seed: u64,
        entry_stake: u64,
        no_players: u8,
        wait_time: i64,
    ) -> Result<()> {
        ctx.accounts
            .initialize_game(seed, entry_stake, no_players, wait_time, ctx.bumps.game)?;
        ctx.accounts.deposit_stake(entry_stake)
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        ctx.accounts.join_game()?;
        ctx.accounts.deposit_stake()?;
        if ctx.accounts.game.players.len() == ctx.accounts.game.no_players as usize {
            ctx.accounts.request_randomness()?;
        }
        Ok(())
    }

    pub fn exit_game(ctx: Context<ExitGame>) -> Result<()> {
        ctx.accounts.exit_game()?;
        ctx.accounts.withdraw_stake()
    }

    pub fn play_card(
        ctx: Context<PlayCard>,
        card: Card,
        shape_requested: Option<u8>,
    ) -> Result<()> {
        ctx.accounts.play_card(card, shape_requested)
    }

    pub fn play_card_and_delegate(
        ctx: Context<PlayCardAndDelegate>,
        card: Card,
        shape_requested: Option<u8>,
        params: DelegateParams
    ) -> Result<()> {
        ctx.accounts.play_card_and_delegate(card, shape_requested, params)
    }

    pub fn draw_from_pile(ctx: Context<DrawFromPile>) -> Result<()> {
        ctx.accounts.draw_from_pile()
    }

    pub fn draw_from_pile_and_delegate(ctx: Context<DrawFromPileAndDelegate>, params: DelegateParams) -> Result<()> {
        ctx.accounts.draw_from_pile_and_delegate(params)
    }

    pub fn penalize_opponent(ctx: Context<PenalizeOpponent>) -> Result<()> {
        ctx.accounts.penalize_opponent()
    }

    pub fn penalize_opponent_and_delegate(ctx: Context<PenalizeOpponentAndDelegate>, params: DelegateParams) -> Result<()> {
        ctx.accounts.penalize_opponent_and_delegate(params)
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        ctx.accounts.claim_prize()
    }

    pub fn consume_randomness(ctx: Context<ConsumeRandomness>, randomness: [u8; 32]) -> Result<()> {
        ctx.accounts.consume_randomness(randomness)
    }

    pub fn commit_game(ctx: Context<CommitGame>) -> Result<()> {
        ctx.accounts.commit_game()
    }
}
