import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAmmQ425 } from "../target/types/anchor_amm_q4_25";
import { Account, createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, getAccount, transfer } from '@solana/spl-token'
import { BN } from "bn.js";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import assert from "assert";

describe("AMM Instruction Tests", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorAmmQ425 as Program<AnchorAmmQ425>;

  // helper functions
  const airdrop = async (pubkey: anchor.web3.PublicKey, amount: number) => {
    try {
      const tx = await provider.connection.requestAirdrop(pubkey, amount);
      await provider.connection.confirmTransaction(tx);
    } catch (e) {
      console.log(e);
    }
  }

  const getAta = (owner: PublicKey, mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_PROGRAM_ID,
    );
  }

  // accounts
  const seed = new BN(Date.now());
  const fee = 500 // basis points

  const initializer = Keypair.generate();
  const user1 = Keypair.generate();

  const mint_x = anchor.web3.Keypair.generate();
  const mint_y = anchor.web3.Keypair.generate();

  const [config] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config", "utf-8"), seed.toArrayLike(Buffer, "le", 8)],
    program.programId,
  );
  const [mint_lp] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lp", "utf-8"), config.toBuffer()],
    program.programId,
  );

  const [vault_x] = getAta(config, mint_x.publicKey);
  const [vault_y] = getAta(config, mint_y.publicKey);

  let initializer_ata_x: Account;
  let initializer_ata_y: Account;
  let initializer_ata_lp: Account;
  const [initializer_ata_lp_address] = getAta(initializer.publicKey, mint_lp);

  let user1_ata_x: Account;
  let user1_ata_y: Account;
  const [user1_ata_lp] = getAta(user1.publicKey, mint_lp);

  console.log("User1", user1.publicKey.toBase58());


  before("Setup Accounts", async () => {
    try {
      await airdrop(initializer.publicKey, 100000000);
      await airdrop(user1.publicKey, 100000000);

      await createMint(
        provider.connection,
        initializer,
        initializer.publicKey,
        null,
        6,
        mint_x
      );

      await createMint(
        provider.connection,
        initializer,
        initializer.publicKey,
        null,
        6,
        mint_y
      );

    } catch (e) {
      console.log(e);
    }
  });

  describe("Initialize Pool", () => {
    it("Initialize pool", async () => {
      await program.methods.initialize(
        seed,
        fee,
        initializer.publicKey,
      ).accountsStrict({
        initializer: initializer.publicKey,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([initializer])
        .rpc();

      // check config state
      const configAccount = await program.account.config.fetch(config);
      assert.equal(seed.toNumber(), configAccount.seed.toNumber());
      assert.equal(fee, configAccount.fee);
      assert.equal(initializer.publicKey.toBase58(), configAccount.authority.toBase58());
      assert.equal(mint_x.publicKey.toBase58(), configAccount.mintX.toBase58());
      assert.equal(mint_y.publicKey.toBase58(), configAccount.mintY.toBase58());
      assert.equal(false, configAccount.locked);
    });
  });

  describe("Deposit tokens", () => {
    it("Initial Deposit", async () => {
      initializer_ata_x = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        initializer,
        mint_x.publicKey,
        initializer.publicKey
      );

      initializer_ata_y = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        initializer,
        mint_y.publicKey,
        initializer.publicKey
      );

      await mintTo(
        provider.connection,
        initializer,
        mint_x.publicKey,
        initializer_ata_x.address,
        initializer,
        1_000_000 * 10 ** 6
      );

      await mintTo(
        provider.connection,
        initializer,
        mint_y.publicKey,
        initializer_ata_y.address,
        initializer,
        1_000_000 * 10 ** 6
      );

      const amount = new BN(500_000 * 10 ** 6);
      const max_x = new BN(500_000 * 10 ** 6);
      const max_y = new BN(300_000 * 10 ** 6);

      await program.methods.deposit(
        amount,
        max_x,
        max_y,
      ).accountsStrict({
        user: initializer.publicKey,
        userLp: initializer_ata_lp_address,
        userX: initializer_ata_x.address,
        userY: initializer_ata_y.address,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([initializer])
        .rpc();

      const initializer_lp_ata = await getAccount(
        provider.connection,
        initializer_ata_lp_address
      );

      assert(initializer_lp_ata.amount >= amount.toNumber(), "LP amount is less than expected");
        
    });

    it("Second Deposit", async () => {
      user1_ata_x = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user1,
        mint_x.publicKey,
        user1.publicKey
      );

      user1_ata_y = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user1,
        mint_y.publicKey,
        user1.publicKey
      );

      await mintTo(
        provider.connection,
        user1,
        mint_x.publicKey,
        user1_ata_x.address,
        initializer,
        1_000_000 * 10 ** 6
      );

      await mintTo(
        provider.connection,
        user1,
        mint_y.publicKey,
        user1_ata_y.address,
        initializer,
        1_000_000 * 10 ** 6
      );

      const amount = new BN(100_000 * 10 ** 6);
      const max_x = new BN(500_000 * 10 ** 6);
      const max_y = new BN(100_000 * 10 ** 6);

      await program.methods.deposit(
        amount,
        max_x,
        max_y,
      ).accountsStrict({
        user: user1.publicKey,
        userLp: user1_ata_lp,
        userX: user1_ata_x.address,
        userY: user1_ata_y.address,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([user1])
        .rpc();
    });

    it("Fail when amount is 0", async () => {

      const amount = new BN(0);
      const max_x = new BN(500_000 * 10 ** 6);
      const max_y = new BN(100_000 * 10 ** 6);

      await program.methods.deposit(
        amount,
        max_x,
        max_y,
      ).accountsStrict({
        user: user1.publicKey,
        userLp: user1_ata_lp,
        userX: user1_ata_x.address,
        userY: user1_ata_y.address,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        mintLp: mint_lp,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([user1])
        .rpc()
        .catch((e) => {
          assert.equal(e.error.errorCode.code, "InvalidAmount");
        });
    });
  });

  describe("Swap", () => {
    it("Swap Token X for Y (X → Y)", async () => {
      const amount = new BN(10_000 * 10 ** 6);
      const min = new BN(5_000 * 10 ** 6);

      // Get initial balances
      const user1_x_before = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_before = await getAccount(provider.connection, user1_ata_y.address);
      const vault_x_before = await getAccount(provider.connection, vault_x);
      const vault_y_before = await getAccount(provider.connection, vault_y);

      await program.methods.swap(
        true, // is_x = true means swapping X for Y
        amount,
        min,
      ).accountsStrict({
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        user: user1.publicKey,
        userX: user1_ata_x.address,
        userY: user1_ata_y.address,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([user1])
        .rpc();

      // Verify balances after swap
      const user1_x_after = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_after = await getAccount(provider.connection, user1_ata_y.address);
      const vault_x_after = await getAccount(provider.connection, vault_x);
      const vault_y_after = await getAccount(provider.connection, vault_y);

      // User balance changes
      const user_x_change = user1_x_before.amount - user1_x_after.amount;
      const user_y_change = user1_y_after.amount - user1_y_before.amount;

      // Vault balance changes
      const vault_x_change = vault_x_after.amount - vault_x_before.amount;
      const vault_y_change = vault_y_before.amount - vault_y_after.amount;

      // Assert user balances changed correctly
      assert.equal(user_x_change, amount.toNumber(), "User should lose exact X amount");
      assert(user_y_change > 0, "User should gain Y tokens");
      assert(user_y_change >= min.toNumber(), "User should receive at least minimum Y tokens");
      
      // Assert vault balances changed correctly
      assert.equal(vault_x_change, amount.toNumber(), "Vault should gain exact X amount");
      assert.equal(vault_y_change, user_y_change, "Vault Y decrease should equal user Y increase");
    });

    it("Swap Token Y for X (Y → X)", async () => {
      const amount = new BN(5_000 * 10 ** 6);
      const min = new BN(2_000 * 10 ** 6);

      // Get initial balances
      const user1_x_before = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_before = await getAccount(provider.connection, user1_ata_y.address);
      const vault_x_before = await getAccount(provider.connection, vault_x);
      const vault_y_before = await getAccount(provider.connection, vault_y);

      await program.methods.swap(
        false, // is_x = false means swapping Y for X
        amount,
        min,
      ).accountsStrict({
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        user: user1.publicKey,
        userX: user1_ata_x.address,
        userY: user1_ata_y.address,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([user1])
        .rpc();

      // Verify balances after swap
      const user1_x_after = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_after = await getAccount(provider.connection, user1_ata_y.address);
      const vault_x_after = await getAccount(provider.connection, vault_x);
      const vault_y_after = await getAccount(provider.connection, vault_y);

      // User balance changes
      const user_y_change = user1_y_before.amount - user1_y_after.amount;
      const user_x_change = user1_x_after.amount - user1_x_before.amount;

      // Vault balance changes
      const vault_y_change = vault_y_after.amount - vault_y_before.amount;
      const vault_x_change = vault_x_before.amount - vault_x_after.amount;

      // Assert user balances changed correctly
      assert.equal(user_y_change, amount.toNumber(), "User should lose exact Y amount");
      assert(user_x_change > 0, "User should gain X tokens");
      assert(user_x_change >= min.toNumber(), "User should receive at least minimum X tokens");
      
      // Assert vault balances changed correctly
      assert.equal(vault_y_change, amount.toNumber(), "Vault should gain exact Y amount");
      assert.equal(vault_x_change, user_x_change, "Vault X decrease should equal user X increase");
    });

    it("Fail swap when slippage exceeded", async () => {
      const amount = new BN(10_000 * 10 ** 6);
      const min = new BN(1_000_000 * 10 ** 6); // Unrealistically high minimum

      try {
        await program.methods.swap(
          true,
          amount,
          min,
        ).accountsStrict({
          mintX: mint_x.publicKey,
          mintY: mint_y.publicKey,
          user: user1.publicKey,
          userX: user1_ata_x.address,
          userY: user1_ata_y.address,
          vaultX: vault_x,
          vaultY: vault_y,
          config: config,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
          .signers([user1])
          .rpc();
        
        assert.fail("Should have failed due to slippage");
      } catch (e) {
        assert(e.error.errorCode.code === "SlippageExceeded", "Should fail with SlippageExceeded error");
      }
    });

    it("Fail swap when amount is zero", async () => {
      const amount = new BN(0);
      const min = new BN(0);

      try {
        await program.methods.swap(
          true,
          amount,
          min,
        ).accountsStrict({
          mintX: mint_x.publicKey,
          mintY: mint_y.publicKey,
          user: user1.publicKey,
          userX: user1_ata_x.address,
          userY: user1_ata_y.address,
          vaultX: vault_x,
          vaultY: vault_y,
          config: config,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
          .signers([user1])
          .rpc();
        
        assert.fail("Should have failed due to zero amount");
      } catch (e) {
        assert(e.error.errorCode.code === "InvalidAmount", "Should fail with InvalidAmount error");
      }
    });
  });

  describe("Withdraw", () => {
    it("Withdraw Liquidity", async () => {
      const amount = new BN(100_000 * 10 ** 6); // Withdraw 100k LP tokens
      const min_x = new BN(80_000 * 10 ** 6);
      const min_y = new BN(48_000 * 10 ** 6);

      // Get initial balances
      const initializer_lp_before = await getAccount(provider.connection, initializer_ata_lp_address);
      const initializer_x_before = await getAccount(provider.connection, initializer_ata_x.address);
      const initializer_y_before = await getAccount(provider.connection, initializer_ata_y.address);
      const vault_x_before = await getAccount(provider.connection, vault_x);
      const vault_y_before = await getAccount(provider.connection, vault_y);

      // Get LP supply before
      const lp_mint_before = await program.provider.connection.getAccountInfo(mint_lp);
      const lp_supply_before = initializer_lp_before.amount;

      await program.methods.withdraw(
        amount,
        min_x,
        min_y,
      ).accountsStrict({
        mintLp: mint_lp,
        userLp: initializer_ata_lp_address,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        user: initializer.publicKey,
        userX: initializer_ata_x.address,
        userY: initializer_ata_y.address,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([initializer])
        .rpc();

      // Verify balances after withdraw
      const initializer_lp_after = await getAccount(provider.connection, initializer_ata_lp_address);
      const initializer_x_after = await getAccount(provider.connection, initializer_ata_x.address);
      const initializer_y_after = await getAccount(provider.connection, initializer_ata_y.address);
      const vault_x_after = await getAccount(provider.connection, vault_x);
      const vault_y_after = await getAccount(provider.connection, vault_y);

      // Calculate changes
      const lp_burned = initializer_lp_before.amount - initializer_lp_after.amount;
      const x_received = initializer_x_after.amount - initializer_x_before.amount;
      const y_received = initializer_y_after.amount - initializer_y_before.amount;
      const vault_x_change = vault_x_before.amount - vault_x_after.amount;
      const vault_y_change = vault_y_before.amount - vault_y_after.amount;

      // Assert LP tokens were burned correctly
      assert.equal(lp_burned, amount.toNumber(), "Exact LP amount should be burned");
      
      // Assert user received tokens
      assert(x_received > 0, "User should receive X tokens");
      assert(y_received > 0, "User should receive Y tokens");
      assert(x_received >= min_x.toNumber(), "X received should meet minimum requirement");
      assert(y_received >= min_y.toNumber(), "Y received should meet minimum requirement");
      
      // Assert vault balances decreased
      assert.equal(vault_x_change, x_received, "Vault X decrease should equal user X increase");
      assert.equal(vault_y_change, y_received, "Vault Y decrease should equal user Y increase");

      // Assert proportionality (approximately)
      const x_ratio = Number(x_received) / Number(vault_x_before.amount);
      const y_ratio = Number(y_received) / Number(vault_y_before.amount);
      const ratio_diff = Math.abs(x_ratio - y_ratio);
      assert(ratio_diff < 0.01, "X and Y withdrawal should be proportional");
    });

    it("Partial Withdraw", async () => {
      const amount = new BN(10_000 * 10 ** 6); // Withdraw only 10k LP tokens
      const min_x = new BN(8_000 * 10 ** 6);
      const min_y = new BN(4_800 * 10 ** 6);

      // Get initial balances
      const user1_lp_before = await getAccount(provider.connection, user1_ata_lp);
      const user1_x_before = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_before = await getAccount(provider.connection, user1_ata_y.address);

      await program.methods.withdraw(
        amount,
        min_x,
        min_y,
      ).accountsStrict({
        mintLp: mint_lp,
        userLp: user1_ata_lp,
        mintX: mint_x.publicKey,
        mintY: mint_y.publicKey,
        user: user1.publicKey,
        userX: user1_ata_x.address,
        userY: user1_ata_y.address,
        vaultX: vault_x,
        vaultY: vault_y,
        config: config,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
        .signers([user1])
        .rpc();

      // Verify balances after withdraw
      const user1_lp_after = await getAccount(provider.connection, user1_ata_lp);
      const user1_x_after = await getAccount(provider.connection, user1_ata_x.address);
      const user1_y_after = await getAccount(provider.connection, user1_ata_y.address);

      // Calculate changes
      const lp_burned = user1_lp_before.amount - user1_lp_after.amount;
      const x_received = user1_x_after.amount - user1_x_before.amount;
      const y_received = user1_y_after.amount - user1_y_before.amount;

      // Assert correct amounts
      assert.equal(lp_burned, amount.toNumber(), "Exact LP amount should be burned");
      assert(x_received >= min_x.toNumber(), "X received should meet minimum");
      assert(y_received >= min_y.toNumber(), "Y received should meet minimum");

      // User should still have LP tokens remaining
      assert(user1_lp_after.amount > 0, "User should have remaining LP tokens");
    });

    it("Fail withdraw when slippage exceeded", async () => {
      const amount = new BN(10_000 * 10 ** 6);
      const min_x = new BN(1_000_000 * 10 ** 6); // Unrealistically high
      const min_y = new BN(1_000_000 * 10 ** 6); // Unrealistically high

      try {
        await program.methods.withdraw(
          amount,
          min_x,
          min_y,
        ).accountsStrict({
          mintLp: mint_lp,
          userLp: user1_ata_lp,
          mintX: mint_x.publicKey,
          mintY: mint_y.publicKey,
          user: user1.publicKey,
          userX: user1_ata_x.address,
          userY: user1_ata_y.address,
          vaultX: vault_x,
          vaultY: vault_y,
          config: config,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
          .signers([user1])
          .rpc();
        
        assert.fail("Should have failed due to slippage");
      } catch (e) {
        assert(e.error.errorCode.code === "SlippageExceeded", "Should fail with SlippageExceeded error");
      }
    });

    it("Fail withdraw when amount is zero", async () => {
      const amount = new BN(0);
      const min_x = new BN(0);
      const min_y = new BN(0);

      try {
        await program.methods.withdraw(
          amount,
          min_x,
          min_y,
        ).accountsStrict({
          mintLp: mint_lp,
          userLp: user1_ata_lp,
          mintX: mint_x.publicKey,
          mintY: mint_y.publicKey,
          user: user1.publicKey,
          userX: user1_ata_x.address,
          userY: user1_ata_y.address,
          vaultX: vault_x,
          vaultY: vault_y,
          config: config,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
          .signers([user1])
          .rpc();
        
        assert.fail("Should have failed due to zero amount");
      } catch (e) {
        assert(e.error.errorCode.code === "InvalidAmount", "Should fail with InvalidAmount error");
      }
    });
  });

});


