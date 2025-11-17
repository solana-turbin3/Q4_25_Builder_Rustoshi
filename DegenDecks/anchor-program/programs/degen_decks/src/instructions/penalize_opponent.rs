use anchor_lang::prelude::*;
use crate::{
    constants::{
        GAME_SEED, 
        PROFILE_SEED    
    }, 
    errors::GameErrors, 
    state::{
        Game, 
        Profile
    }
};


#[derive(Accounts)]
pub struct PenalizeOpponent<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [
            &PROFILE_SEED.as_bytes(), 
            signer.key().as_ref()
            ],
        bump = profile.bump
    )]
    pub profile: Account<'info, Profile>,
    #[account(
        mut,
        seeds = [
            &GAME_SEED.as_bytes(), 
            game.seed.to_le_bytes().as_ref(), 
            game.owner.as_ref()
            ],
        bump = game.bump
    )]
    game: Account<'info, Game>
}

impl<'info> PenalizeOpponent<'info> {
    pub fn penalize_opponent(&mut self) -> Result<()> {
        let player = self.game.players.iter().find(|p| p.owner == self.signer.key()).ok_or(GameErrors::PlayerNotFound)?;
        
        require!(player.player_index != Some(self.game.player_turn), GameErrors::CannotPenalizeYourself);
        require!(self.game.started == true, GameErrors::GameNotStarted);
        require!(self.game.ended == false, GameErrors::GameEnded);

        self.game.last_move_time = Some(Clock::get()?.unix_timestamp);
        self.game.handle_penalize_opponent()?;

        Ok(())
    }
}