use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)] // Commented out but could be used for automatic space calculation
pub struct Marketplace {
    pub admin: Pubkey, // The wallet address of the marketplace administrator/authority
    pub fee: u16, // The marketplace fee percentage in basis points (e.g., 250 = 2.5%)
    pub bump: u8, // PDA bump seed for the marketplace account
    pub treasury_bump: u8, // PDA bump seed for the marketplace treasury account
    pub rewards_bump: u8, // PDA bump seed for the marketplace rewards distribution account
    #[max_len(32)]
    pub name: String, // The name of the marketplace used for branding and identification
}
