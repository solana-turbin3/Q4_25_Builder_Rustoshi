import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAmmQ425 } from "../target/types/anchor_amm_q4_25";
import { Account, createMint, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
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
  let initializer_ata_lp = getAta(initializer.publicKey, mint_lp)[0];

  let user1_ata_x: Account;
  let user1_ata_y: Account;
  let user1_ata_lp = getAta(user1.publicKey, mint_lp)[0];


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
  })

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
      const max_x = new BN(1_000_000 * 10 ** 6);
      const max_y = new BN(500 * 10 ** 6);

      await program.methods.deposit(
        amount,
        max_x,
        max_y,
      ).accountsStrict({
        user: initializer.publicKey,
        userLp: initializer_ata_lp,
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
  })

});


