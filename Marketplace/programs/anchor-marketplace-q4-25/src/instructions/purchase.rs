use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, mint_to, transfer_checked, CloseAccount, Mint, MintTo, TokenAccount,
        TokenInterface, TransferChecked,
    },
};

use crate::state::{Listing, Marketplace};



/// Accounts required for purchasing a listed NFT
#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut)]
    pub taker: Signer<'info>, // The buyer who is purchasing the NFT
    #[account(mut)]
    pub maker: SystemAccount<'info>, // The seller who listed the NFT

    #[account(
        seeds = [b"marketplace", marketplace.name.as_bytes()],
        bump = marketplace.bump,
    )]
    marketplace: Account<'info, Marketplace>, // The marketplace configuration

    maker_mint: InterfaceAccount<'info, Mint>, // The NFT mint being purchased

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = maker_mint,
        associated_token::authority = taker,
    )]
    pub taker_ata: InterfaceAccount<'info, TokenAccount>, // Buyer's token account to receive NFT

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = rewards_mint,
        associated_token::authority = taker,
    )]
    pub taker_ata_reward: InterfaceAccount<'info, TokenAccount>, // Buyer's token account for rewards

    #[account(
        mut,
        close = maker, // Close account and return rent to maker
        seeds = [marketplace.key().as_ref(), maker_mint.key().as_ref()],
        bump = listing.bump,
    )]
    listing: Account<'info, Listing>, // The listing record to be closed

    #[account(
        mut,
        associated_token::mint = maker_mint,
        associated_token::authority = listing,
    )]
    vault: InterfaceAccount<'info, TokenAccount>, // Escrow vault holding the NFT

    #[account(
        mut,
        seeds = [b"treasury", marketplace.key().as_ref()],
        bump = marketplace.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>, // Treasury account to receive marketplace fees

    #[account(
        mut,
        seeds = [b"rewards", marketplace.key().as_ref()],
        bump = marketplace.rewards_bump,
        mint::decimals = 6,
        mint::authority = marketplace,
    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>, // Rewards token mint

    pub associated_token_program: Program<'info, AssociatedToken>, // Required for ATA operations
    pub system_program: Program<'info, System>,                    // Required for system operations
    pub token_program: Interface<'info, TokenInterface>,           // Required for token operations
}



impl<'info> Purchase<'info> {
    pub fn send_sol(&mut self) -> Result<()> {
        // let cpi_program = self.system_program.to_account_info();

        let cpi_accounts = Transfer {
            from: self.taker.to_account_info(), // From buyer
            to: self.maker.to_account_info(),   // To seller
        };

        let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);

        // Calculate amount after subtracting marketplace fee
        let fee = self.marketplace.fee as u64;
        let amount = self.listing.price.checked_sub(fee).unwrap();

        // Transfer payment to seller
        transfer(cpi_ctx, amount)?;

        let cpi_accounts = Transfer {
            from: self.taker.to_account_info(),  // From buyer
            to: self.treasury.to_account_info(), // To marketplace treasury
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Transfer fee to marketplace treasury
        transfer(cpi_ctx, fee)?;
        Ok(())
    }

    pub fn receive_nft(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),        // From vault
            mint: self.maker_mint.to_account_info(),   // NFT mint
            to: self.taker_ata.to_account_info(),      // To buyer's token account
            authority: self.listing.to_account_info(), // Listing PDA as authority
        };

        // Create signer seeds for the listing PDA
        let signer_seeds: &[&[&[u8]]] = &[&[
            &self.marketplace.key().to_bytes(),
            &self.maker_mint.key().to_bytes(),
            &[self.listing.bump],
        ]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Transfer NFT to buyer
        transfer_checked(cpi_ctx, self.vault.amount, self.maker_mint.decimals)?;

        Ok(())
    }

    pub fn receive_rewards(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = MintTo {
            mint: self.rewards_mint.to_account_info(), // Rewards token mint
            to: self.taker_ata_reward.to_account_info(), // Buyer's rewards token account
            authority: self.marketplace.to_account_info(), // Marketplace as minting authority
        };

        // Create signer seeds for the marketplace PDA
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"marketplace",
            self.marketplace.name.as_bytes(),
            &[self.marketplace.bump],
        ]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Mint 1 reward token to buyer
        mint_to(cpi_ctx, 1)?;

        Ok(())
    }

    pub fn close_mint_vault(&mut self) -> Result<()> {
        // Create signer seeds for the listing PDA
        let signer_seeds: &[&[&[u8]]] = &[&[
            &self.marketplace.key().to_bytes(),
            &self.maker_mint.key().to_bytes(),
            &[self.listing.bump],
        ]];

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(), // Vault account to close
            destination: self.maker.to_account_info(), // Return rent to seller
            authority: self.listing.to_account_info(), // Listing PDA as authority
        };

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        // Close vault account and return rent to seller
        close_account(cpi_ctx)?;

        Ok(())
    }
}
