use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{close_account, transfer_checked, CloseAccount, TransferChecked, Mint, TokenAccount, TokenInterface},
};

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
pub struct Delist<'info> {
    #[account(mut)]
    pub maker: Signer<'info>, // The original NFT owner who is delisting their NFT
    pub maker_mint: InterfaceAccount<'info, Mint>, // The NFT mint being delisted

    #[account(
        seeds = [b"marketplace", marketplace.name.as_bytes()],
        bump = marketplace.bump,
    )]
    pub marketplace: Account<'info, Marketplace>, // The marketplace configuration account

    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = maker,
    )]
    pub maker_ata: InterfaceAccount<'info, TokenAccount>, // Token account to receive the NFT back

    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = listing,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, // Escrow vault holding the NFT

    #[account(
        mut,
        close = maker, // Close account and return rent to maker
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>, // Listing account to be closed

    pub system_program: Program<'info, System>, // Required for system operations
    pub token_program: Interface<'info, TokenInterface>, // Required for token operations
    pub associated_token_program: Program<'info, AssociatedToken>, // Required for ATA operations
}

impl<'info> Delist<'info> {
    pub fn delist(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(), // Source: the vault holding the NFT
            mint: self.maker_mint.to_account_info(), // The NFT mint
            to: self.maker_ata.to_account_info(), // Destination: return to original owner
            authority: self.listing.to_account_info(), // Auth: listing PDA
        };

        // Create signer seeds for the listing PDA to authorize the transfer
        let signer_seeds: &[&[&[u8]]] = &[&[
            &self.marketplace.key().to_bytes(),
            &self.maker_mint.key().to_bytes(),
            &[self.listing.bump],
        ]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Transfer the NFT back to the original owner
        transfer_checked(cpi_ctx, self.vault.amount, self.maker_mint.decimals)?;

        Ok(())
    }

    pub fn close_mint_vault(&mut self) -> Result<()> {
        // Create signer seeds for the listing PDA to authorize closing the vault
        let signer_seeds: &[&[&[u8]]] = &[&[
            &self.marketplace.key().to_bytes(),
            &self.maker_mint.key().to_bytes(),
            &[self.listing.bump],
        ]];

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(), // The vault account to close
            destination: self.maker.to_account_info(), // Return rent to maker
            authority: self.listing.to_account_info(), // Auth: listing PDA
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Close the vault and return the rent to the maker
        close_account(cpi_ctx)?;

        Ok(())
    }
}
