use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Listing{
    pub maker: Pubkey, // The wallet address of the seller who created this listing
    pub maker_mint: Pubkey, // The mint address of the NFT being sold
    pub price: u64, // The selling price in lamports (SOL's smallest unit)
    pub bump: u8,
}
