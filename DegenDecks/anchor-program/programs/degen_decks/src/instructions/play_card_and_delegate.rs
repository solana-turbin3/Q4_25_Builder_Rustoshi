use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::{
    anchor::{delegate}, 
    cpi::DelegateConfig
};
use crate::{
    constants::{
        GAME_SEED, 
        PROFILE_SEED
    }, 
    errors::GameErrors, 
    state::{
        Card, DelegateParams, Game, Profile
    }
};


#[delegate]
#[derive(Accounts)]
pub struct PlayCardAndDelegate<'info> {
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
        del,
        seeds = [
            &GAME_SEED.as_bytes(), 
            game.seed.to_le_bytes().as_ref(), 
            game.owner.as_ref()
            ],
        bump = game.bump
    )]
    game: Account<'info, Game>
}

impl<'info> PlayCardAndDelegate<'info> {
    pub fn play_card_and_delegate(&mut self, card: Card, shape_requested: Option<u8>, params: DelegateParams) -> Result<()> {
        let player = self.game.players.iter().find(|p| p.owner == self.signer.key()).ok_or(GameErrors::PlayerNotFound)?;
        
        require!(player.player_index == Some(self.game.player_turn), GameErrors::NotYourTurn);
        require!(self.game.started == true, GameErrors::GameNotStarted);
        require!(self.game.ended == false, GameErrors::GameEnded);


        self.game.validate_play(&card, shape_requested)?;
        self.game.handle_call_card()?;

        if !self.game.delegated && !self.game.ended {
            self.game.delegated = true;
            // delegate to ER
            let config = DelegateConfig {
                commit_frequency_ms: params.commit_frequency_ms,
                validator: params.validator,
            };
            self.game.exit(&crate::ID)?;
            self.delegate_game(
                &self.signer,
                &[
                    &GAME_SEED.as_bytes(), 
                    self.game.seed.to_le_bytes().as_ref(), 
                    self.game.owner.as_ref()
                ],
                config
            )?;
        }

        Ok(())
    }
}