use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DelegateParams {
    pub commit_frequency_ms: u32,
    pub validator: Option<Pubkey>,
}