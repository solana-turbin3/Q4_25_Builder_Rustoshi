import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Transaction, sendAndConfirmRawTransaction, LAMPORTS_PER_SOL, SendTransactionError, STAKE_CONFIG_ID, Connection } from "@solana/web3.js"
import { Program } from "@coral-xyz/anchor";
import { DegenDecks } from "../target/types/degen_decks";
import { assert, expect } from "chai";
import { BN } from "bn.js";
import { Account, ASSOCIATED_TOKEN_PROGRAM_ID, createSyncNativeInstruction, getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
    delegateBufferPdaFromDelegatedAccountAndOwnerProgram,
    DELEGATION_PROGRAM_ID,
    delegationMetadataPdaFromDelegatedAccount,
    delegationRecordPdaFromDelegatedAccount,
    MAGIC_CONTEXT_ID,
    MAGIC_PROGRAM_ID

} from "@magicblock-labs/ephemeral-rollups-sdk";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import "dotenv/config"

describe("Degen Decks", () => {
    const connection = new Connection(`${process.env.SOLANA_RPC_URL}`, {
        commitment: "confirmed"
    });

    const provider = new anchor.AnchorProvider(
        connection,
        anchor.Wallet.local()
    )
    anchor.setProvider(provider);
    const program = anchor.workspace.DegenDecks as Program<DegenDecks>;

    const providerEphemeralRollup = new anchor.AnchorProvider(
        new anchor.web3.Connection(
            `https://${process.env.MAGICBLOCK_RPC_URL}`,
            {
                wsEndpoint: `wss://${process.env.MAGICBLOCK_RPC_URL}`,
            },
        ),
        anchor.Wallet.local(),
    );

    const programEphemeralRollup = new Program<DegenDecks>(
        program.idl,
        providerEphemeralRollup
    )


    interface PlayerCredentials {
        signer: PublicKey;
        profile: PublicKey;
        keypair: Keypair;
        ata: Account
    }
    // Helper functions
    const findPDA = (seeds: Array<any>, programId = program.programId) => {
        return anchor.web3.PublicKey.findProgramAddressSync(
            seeds,
            programId
        );
    }
    const sendSOL = async (from: PublicKey, to: PublicKey, lamports: number, signer: Keypair) => {
        const tx = new Transaction();
        tx.add(
            SystemProgram.transfer({
                fromPubkey: from,
                toPubkey: to,
                lamports: lamports
            })
        );
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = signer.publicKey;
        tx.sign(signer);
        const rawTx = tx.serialize();

        await sendAndConfirmRawTransaction(
            connection,
            rawTx
        );
        console.log(`Sent ${lamports / LAMPORTS_PER_SOL} SOL from ${from} to ${to}`)
    }
    const fundWSOLATA = async (payerKp: Keypair, ata: Account, lamports: number) => {
        const tx = new Transaction();
        tx.add(
            SystemProgram.transfer({
                fromPubkey: payerKp.publicKey,
                toPubkey: ata.address,
                lamports: lamports
            })
        );
        tx.add(
            createSyncNativeInstruction(
                ata.address,
                TOKEN_PROGRAM_ID
            )
        );
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = payerKp.publicKey;
        tx.sign(payerKp);
        const rawTx = tx.serialize();

        await sendAndConfirmRawTransaction(
            connection,
            rawTx
        );
        console.log(`Funded ${ata.address} with ${lamports / LAMPORTS_PER_SOL} WSOL`)
    }
    function getPlayerCredentials(owner: PublicKey): PlayerCredentials {
        if (owner.equals(user1.publicKey)) {
            return {
                signer: user1.publicKey,
                profile: userProfile1,
                keypair: user1.payer,
                ata: userAta1
            };
        } else if (owner.equals(user2.publicKey)) {
            return {
                signer: user2.publicKey,
                profile: userProfile2,
                keypair: user2,
                ata: userAta2
            };
        } else if (owner.equals(user3.publicKey)) {
            return {
                signer: user3.publicKey,
                profile: userProfile3,
                keypair: user3,
                ata: userAta3
            };
        }
        throw new Error("Unknown player");
    }
    function findValidMove(hand, callCard, cardsPending, requestedShape) {
        if (!hand || !callCard) return { card: null, shapeRequested: null };

        // 1. If pick2 or pick3 is pending: only play matching counter
        if (cardsPending) {
            const counter = hand.find(c =>
                (cardsPending % 2 === 0 && c.cardNumber === 2) ||
                (cardsPending % 3 === 0 && c.cardNumber === 5)
            );
            if (counter) return { card: counter, shapeRequested: null };
            return { card: null, shapeRequested: null };
        }

        // 2. If a shape is requested (NEED card)
        if (requestedShape) {
            const match = hand.find(c =>
                c.cardNumber === 20 || // WHOT always valid
                c.id === requestedShape
            );
            if (match) {
                if (match.cardNumber === 20) {
                    return { card: match, shapeRequested: randomShape() };
                }
                return { card: match, shapeRequested: null };
            }
            return { card: null, shapeRequested: null };
        }

        // 3. WHOT (20) is always a valid play — pick a shape
        const whot = hand.find(c => c.cardNumber === 20);
        if (whot) {
            return { card: whot, shapeRequested: randomShape() };
        }

        // 4. Standard valid play
        const match = hand.find(
            c => c.id === callCard.id || c.cardNumber === callCard.cardNumber
        );
        if (match) return { card: match, shapeRequested: null };

        return { card: null, shapeRequested: null };
    }

    // Random shape: 1–5
    function randomShape() {
        return Math.floor(Math.random() * 5) + 1;
    }

    async function getCurrentGameState() {
        try {
            return await program.account.game.fetch(game);
        } catch (err) {
            return null;
        }
    }
    async function getCurrentGameStateER() {
        try {
            return await programEphemeralRollup.account.game.fetch(game);
        } catch (err) {
            return null;
        }
    }

    // Cards
    const cards = [
        "CIRCLE",
        "TRIANGLE",
        "CROSS",
        "SQAURE",
        "STARS",
        "NEED",
    ];

    // PDA Seeds Contants
    const CONFIG_SEED = "CONFIG";
    const PROFILE_SEED = "PROFILE";
    const GAME_SEED = "GAME";


    // Game seeds
    const seed1 = new BN(Date.now());

    // Mint Accounts
    const WSOL = new PublicKey("So11111111111111111111111111111111111111112"); //wrapped sol
    const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // USDC

    // Accounts
    const user1 = provider.wallet;
    const feeWallet = user1.publicKey;
    const user2 = Keypair.generate();
    const user3 = Keypair.generate();
    const randomUser = Keypair.generate();

    // PDAs
    let config: PublicKey;
    let programData: PublicKey;

    let userProfile1: PublicKey;
    let userProfile2: PublicKey;
    let userProfile3: PublicKey;

    let userAta1: Account;
    let userAta2: Account;
    let userAta3: Account;

    const game = findPDA([
        Buffer.from(GAME_SEED, "utf-8"),
        new BN(seed1).toArrayLike(Buffer, "le", 8),
        user1.publicKey.toBytes()
    ])[0];
    const feeWsolAta = getAssociatedTokenAddressSync(
        WSOL,
        feeWallet,
        true
    );
    const gameVault = getAssociatedTokenAddressSync(
        WSOL,
        game,
        true
    );

    const bufferGame = delegateBufferPdaFromDelegatedAccountAndOwnerProgram(
        game,
        program.programId
    );
    const metadataGame = delegationMetadataPdaFromDelegatedAccount(
        game
    );
    const recordGame = delegationRecordPdaFromDelegatedAccount(
        game
    );

    // Game variables
    const entryStake = 0.02 * LAMPORTS_PER_SOL;
    const noPlayers = 3;
    const waitTime = new BN(60);
    let winner: PublicKey;
    // Validator is optional - ER will auto-select if null
    const validatorKey = null;
    const commit_frequency = 30000;


    before(async () => {
        // Log accounts
        console.log(`Game PDA: ${game}`);
        // Airdrop SOL
        // await connection.requestAirdrop(randomUser.publicKey, 10 * LAMPORTS_PER_SOL);
        // await connection.requestAirdrop(user1.publicKey, 10 * LAMPORTS_PER_SOL);
        // await connection.requestAirdrop(user2.publicKey, 5 * LAMPORTS_PER_SOL);
        // await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for airdrops

        // funder players WSOL accounts with 0.5 SOL
        await sendSOL(user1.publicKey, user2.publicKey, 0.05 * LAMPORTS_PER_SOL, user1.payer);
        await sendSOL(user1.publicKey, user3.publicKey, 0.05 * LAMPORTS_PER_SOL, user1.payer);

        // Derive PDAs
        config = findPDA([Buffer.from(CONFIG_SEED, "utf-8")])[0];
        userAta1 = await getOrCreateAssociatedTokenAccount(
            connection,
            user1.payer,
            WSOL,
            user1.publicKey
        );
        userAta2 = await getOrCreateAssociatedTokenAccount(
            connection,
            user2,
            WSOL,
            user2.publicKey
        );
        userAta3 = await getOrCreateAssociatedTokenAccount(
            connection,
            user3,
            WSOL,
            user3.publicKey
        );
        // fund players WSOL accounts with 0.2 SOL
        await fundWSOLATA(user1.payer, userAta1, 0.02 * LAMPORTS_PER_SOL);
        await fundWSOLATA(user2, userAta2, 0.02 * LAMPORTS_PER_SOL);
        await fundWSOLATA(user3, userAta3, 0.02 * LAMPORTS_PER_SOL);

        userProfile1 = findPDA([Buffer.from(PROFILE_SEED, "utf-8"), user1.publicKey.toBytes()])[0];
        userProfile2 = findPDA([Buffer.from(PROFILE_SEED, "utf-8"), user2.publicKey.toBytes()])[0];
        userProfile3 = findPDA([Buffer.from(PROFILE_SEED, "utf-8"), user3.publicKey.toBytes()])[0];


        const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
        programData = findPDA([program.programId.toBuffer()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)[0]
        // Verify ProgramData exists after deployment
        const programDataAccount = await connection.getAccountInfo(programData);
        assert.ok(programDataAccount, "ProgramData should exist after deployment");

    });

    describe("> Initialize Config", () => {
        const platformFee = 500; // 5%
        const allow_mints = [
            WSOL,
            USDC
        ];
        it("Should initialize the config", async () => {
            const tx = await program.methods
                .initialize(platformFee, allow_mints)
                .accountsStrict({
                    admin: user1.publicKey,
                    config: config,
                    feeWallet: feeWallet,
                    programData: programData,
                    systemProgram: SystemProgram.programId,
                })
                .signers([user1.payer])
                .rpc();
            console.log("Initialize Config Transaction: ", tx);

            const configAccount = await program.account.config.fetch(config);
            expect(configAccount.platformFee).to.equal(platformFee, "Platform fees do not match");
            expect(configAccount.allowedMints).to.deep.equal(allow_mints, "Allowed mints do not match");
        });

        it("Only admin should initialize", async () => {
            const platformFee = 1000;
            try {
                const tx = await program.methods
                    .initialize(platformFee, allow_mints)
                    .accountsStrict({
                        admin: randomUser.publicKey,
                        config: config,
                        feeWallet: feeWallet,
                        programData: programData,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([randomUser])
                    .rpc();
                console.log("Initialize transaction", tx);
                expect.fail("Expect instruction to throw");
            } catch (error: any) {
                expect(error.message).to.match(/You Are Not Unauthorized/i);
            }
        });
    });

    describe("> Initialize Profile", () => {
        const username1 = "Alice";
        const username2 = "Bob";
        const username3 = "Charlie";

        it("Should initialize user profiles", async () => {
            const tx1 = await program.methods
                .initializeProfile(username1)
                .accountsStrict({
                    signer: user1.publicKey,
                    profile: userProfile1,
                    systemProgram: SystemProgram.programId,
                })
                .signers([user1.payer])
                .rpc();

            const tx2 = await program.methods
                .initializeProfile(username2)
                .accountsStrict({
                    signer: user2.publicKey,
                    profile: userProfile2,
                    systemProgram: SystemProgram.programId,
                })
                .signers([user2])
                .rpc();

            const tx3 = await program.methods
                .initializeProfile(username3)
                .accountsStrict({
                    signer: user3.publicKey,
                    profile: userProfile3,
                    systemProgram: SystemProgram.programId,
                })
                .signers([user3])
                .rpc();

            console.log("Initialize Profile Transaction1: ", tx1);
            console.log("Initialize Profile Transaction2: ", tx2);
            console.log("Initialize Profile Transaction3: ", tx3);

            const profileAccount1 = await program.account.profile.fetch(userProfile1);
            const profileAccount2 = await program.account.profile.fetch(userProfile2);
            const profileAccount3 = await program.account.profile.fetch(userProfile3);

            expect(profileAccount1.username).to.equal(username1, "Username does not match");
            expect(profileAccount2.username).to.equal(username2, "Username does not match");
            expect(profileAccount3.username).to.equal(username3, "Username does not match");
        });
    });

    describe("> Initialize Game", () => {
        it("Should initialize Game Room with WSOL", async () => {

            let ataInfo = await getAccount(connection, userAta1.address);
            const ataBalance = Number(ataInfo.amount);

            const tx = await program.methods
                .initializeGame(
                    seed1,
                    new BN(entryStake),
                    noPlayers,
                    waitTime
                )
                .accountsStrict({
                    signer: user1.publicKey,
                    profile: userProfile1,
                    game: game,
                    gameVault: gameVault,
                    stakeMint: WSOL,
                    userAta: userAta1.address,
                    config: config,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId
                })
                .signers([user1.payer])
                .rpc();
            console.log("Initialize Game transaction: ", tx);


            const gameAccount = await program.account.game.fetch(game);
            const gameVaultInfo = await getAccount(connection, gameVault);
            ataInfo = await getAccount(connection, userAta1.address);
            const ataBalanceAfter = Number(ataInfo.amount);

            console.log(`Entry stake: ${entryStake}`);
            console.log(`ATA balance after initialization: ${ataBalanceAfter}`);
            console.log(`Game vault amount: ${gameVaultInfo.amount}`);

            expect(Number(ataBalanceAfter)).to.equal(ataBalance - entryStake, "ATA balance after initialization does not match");
            expect(Number(gameVaultInfo.amount)).to.equal(entryStake, "Game vault amount does not match");
            expect(gameAccount.owner.toBase58()).to.equal(user1.publicKey.toBase58(), "Owner does not match");
            expect(gameAccount.entryStake.toNumber()).to.equal(entryStake, "Entry stake does not match");
            expect(gameAccount.gameVault.toBase58()).to.equal(gameVault.toBase58(), "Game vault does not match");
            expect(gameAccount.stakeMint.toBase58()).to.equal(WSOL.toBase58(), "Stake mint does not match");
            expect(gameAccount.noPlayers).to.equal(noPlayers, "No players does not match");
            expect(gameAccount.playerTurn).to.equal(0, "Player turn does not match");
            expect(gameAccount.callCard).to.equal(null, "Call card does not match");
            expect(gameAccount.waitTime.toNumber()).to.equal(waitTime.toNumber(), "Wait time does not match");
            expect(gameAccount.seed.toNumber()).to.equal(seed1.toNumber(), "Seed does not match");
            expect(gameAccount.randomSeed).to.equal(null, "Random seed does not match");
            expect(gameAccount.delegated).to.equal(false, "Delegated does not match");
            expect(gameAccount.started).to.equal(false, "Started does not match");
            expect(gameAccount.ended).to.equal(false, "Ended does not match");
            expect(gameAccount.createdAt).to.equal(gameAccount.createdAt, "Created at does not match");
            expect(gameAccount.startedAt).to.equal(null, "Started at does not match");
            expect(gameAccount.endedAt).to.equal(null, "Ended at does not match");
        });
    });

    describe("> User 2 Joins Game", () => {
        it("User 2 Should Join game", async () => {
            let gameAccount = await program.account.game.fetch(game);
            let ataInfo = await getAccount(connection, userAta2.address);
            const ataBalance = Number(ataInfo.amount);

            try {
                const tx = await program.methods
                    .joinGame()
                    .accountsStrict({
                        signer: user2.publicKey,
                        profile: userProfile2,
                        game: game,
                        gameVault: gameVault,
                        stakeMint: WSOL,
                        userAta: userAta2.address,
                        config: config,
                        oracleQueue: new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh"),
                        programIdentity: findPDA([Buffer.from("identity", "utf-8")])[0],
                        vrfProgram: new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"),
                        slotHashes: new PublicKey("SysvarS1otHashes111111111111111111111111111"),
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user2])
                    .rpc();
                console.log("Join transaction: ", tx);
            } catch (error) {
                console.error("Join transaction failed:", error);
                throw error;
            }

            gameAccount = await program.account.game.fetch(game);
            ataInfo = await getAccount(connection, userAta2.address);
            const gameVaultInfo = await getAccount(connection, gameVault);

            console.log(`ATA balance after joining: ${ataInfo.amount}`);
            console.log(`Game vault amount: ${gameVaultInfo.amount}`);
            expect(Number(ataInfo.amount)).to.equal(ataBalance - gameAccount.entryStake.toNumber(), "Balance after joining does not match");
            expect(Number(gameVaultInfo.amount)).to.equal(gameAccount.entryStake.toNumber() * 2, "Game vault amount does not match");
            expect(gameAccount.players.length).to.equal(2, "Players length does not match");
        });
    });

    describe("> User 2 Exits Game", () => {
        it("User 2 Should Exit game", async () => {
            let gameAccount = await program.account.game.fetch(game);
            try {
                const tx = await program.methods
                    .exitGame()
                    .accountsStrict({
                        signer: user2.publicKey,
                        profile: userProfile2,
                        game: game,
                        gameVault: gameVault,
                        stakeMint: WSOL,
                        userAta: userAta2.address,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user2])
                    .rpc();
                console.log("Exit transaction: ", tx);
            } catch (error) {
                console.error("Exit transaction failed:", error);
                throw error;
            }

            gameAccount = await program.account.game.fetch(game);
            const gameVaultInfo = await getAccount(connection, gameVault);

            expect(Number(gameVaultInfo.amount)).to.equal(gameAccount.entryStake.toNumber(), "Game vault amount does not match");
            expect(gameAccount.players.length).to.equal(1, "Players length does not match");
        });
    });

    describe("> User 2 and 3 joins Game", () => {
        it("User 2 Should Join game", async () => {
            let gameAccount = await program.account.game.fetch(game);
            let ataInfo = await getAccount(connection, userAta2.address);
            const ataBalance = Number(ataInfo.amount);

            try {
                const tx = await program.methods
                    .joinGame()
                    .accountsStrict({
                        signer: user2.publicKey,
                        profile: userProfile2,
                        game: game,
                        gameVault: gameVault,
                        stakeMint: WSOL,
                        userAta: userAta2.address,
                        config: config,
                        oracleQueue: new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh"),
                        programIdentity: findPDA([Buffer.from("identity", "utf-8")])[0],
                        vrfProgram: new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"),
                        slotHashes: new PublicKey("SysvarS1otHashes111111111111111111111111111"),
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user2])
                    .rpc();
                console.log("Join transaction: ", tx);
            } catch (error) {
                console.error("Join game failed:", error);
                throw error;
            }

            gameAccount = await program.account.game.fetch(game);
            ataInfo = await getAccount(connection, userAta2.address);
            const gameVaultInfo = await getAccount(connection, gameVault);

            console.log(`ATA balance after joining: ${ataInfo.amount}`);
            console.log(`Game vault amount: ${gameVaultInfo.amount}`);
            expect(Number(ataInfo.amount)).to.equal(ataBalance - gameAccount.entryStake.toNumber(), "Balance after joining does not match");
            expect(Number(gameVaultInfo.amount)).to.equal(gameAccount.entryStake.toNumber() * 2, "Game vault amount does not match");
            expect(gameAccount.players.length).to.equal(2, "Players length does not match");
            // console.info(gameAccount);
            // console.log(gameAccount.players[0]);
            // console.log(gameAccount.players[1]);
        });


        it("User 3 Should Join game", async () => {
            let gameAccount = await program.account.game.fetch(game);
            let ataInfo = await getAccount(connection, userAta3.address);
            const ataBalance = Number(ataInfo.amount);

            try {
                const tx = await program.methods
                    .joinGame()
                    .accountsStrict({
                        signer: user3.publicKey,
                        profile: userProfile3,
                        game: game,
                        gameVault: gameVault,
                        stakeMint: WSOL,
                        userAta: userAta3.address,
                        config: config,
                        oracleQueue: new PublicKey("Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh"),
                        programIdentity: findPDA([Buffer.from("identity", "utf-8")])[0],
                        vrfProgram: new PublicKey("Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"),
                        slotHashes: new PublicKey("SysvarS1otHashes111111111111111111111111111"),
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([user3])
                    .rpc();
                console.log("Join transaction: ", tx);
            } catch (error) {
                console.error("Join game failed:", error);
                throw error;
            }

            // wait for VRF
            await new Promise((resolve) => setTimeout(resolve, 500));

            gameAccount = await program.account.game.fetch(game);
            ataInfo = await getAccount(connection, userAta3.address);
            const gameVaultInfo = await getAccount(connection, gameVault);

            console.log(`ATA balance after joining: ${ataInfo.amount}`);
            console.log(`Game vault amount: ${gameVaultInfo.amount}`);
            expect(Number(ataInfo.amount)).to.equal(ataBalance - gameAccount.entryStake.toNumber(), "Balance after joining does not match");
            expect(Number(gameVaultInfo.amount)).to.equal(gameAccount.entryStake.toNumber() * 3, "Game vault amount does not match");
            expect(gameAccount.randomSeed).to.not.equal(null, "Random seed was not generated");
            expect(gameAccount.players.length).to.equal(3, "Players length does not match");
            // console.info(gameAccount);
            // console.log(gameAccount.players[0]);
            // console.log(gameAccount.players[1]);
        });
    });

    describe("> Full Game Play", () => {
        it("Should delegate game and play full game", async () => {
            // Wait for previous test's blockchain state to propagate
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Verify we have the correct game state (3 players, game started)
            let initialGameState = await getCurrentGameState();
            if (!initialGameState || initialGameState.players.length !== 3 || !initialGameState.started) {
                throw new Error(`Invalid game state: players=${initialGameState?.players.length}, started=${initialGameState?.started}`);
            }

            async function playOneMove(forceDrawIfNoCard = false, firstMove: boolean = true) {
                const regularState = await getCurrentGameState();
                const gameAccount = regularState?.delegated
                    ? (await getCurrentGameStateER() || regularState)
                    : regularState;

                if (!gameAccount) {
                    throw new Error("Failed to fetch game account");
                }

                const currentPlayerIndex = gameAccount.playerTurn - 1;
                const currentPlayer = gameAccount.players[currentPlayerIndex];

                if (!currentPlayer) {
                    throw new Error(`No player at index ${currentPlayerIndex}. PlayerTurn: ${gameAccount.playerTurn}, Players: ${gameAccount.players.length}`);
                }
                const { signer, profile, keypair } = getPlayerCredentials(currentPlayer.owner);

                const { card: validCard, shapeRequested } = findValidMove(
                    currentPlayer.hand,
                    gameAccount.callCard,
                    gameAccount.cardsToDraw,
                    gameAccount.cardRequested
                );

                const providerEphemeralRollup = new anchor.AnchorProvider(
                    new anchor.web3.Connection(
                        "https://devnet-as.magicblock.app/",
                        {
                            wsEndpoint: "wss://devnet-as.magicblock.app/",
                            commitment: "confirmed",
                        }
                    ),
                    new anchor.Wallet(keypair)
                );

                const programEphemeralRollup = new Program<DegenDecks>(
                    program.idl,
                    providerEphemeralRollup
                );


                try {
                    if (validCard && !forceDrawIfNoCard) {
                        // delegated
                        if (gameAccount.delegated) {
                            await programEphemeralRollup.methods
                                .playCard(validCard, shapeRequested ?? null)
                                .accountsStrict({
                                    signer,
                                    profile,
                                    game,
                                })
                                .rpc();
                        }

                        // undelegated
                        else {
                            let tx = await program.methods
                                .playCardAndDelegate(validCard, shapeRequested ?? null, {
                                    commitFrequencyMs: commit_frequency,
                                    validator: validatorKey,
                                })
                                .accountsStrict({
                                    signer,
                                    profile,
                                    game,
                                    ownerProgram: program.programId,
                                    bufferGame,
                                    delegationRecordGame: recordGame,
                                    delegationMetadataGame: metadataGame,
                                    delegationProgram: DELEGATION_PROGRAM_ID,
                                    systemProgram: SystemProgram.programId,
                                })
                                .transaction();

                            tx.feePayer = keypair.publicKey;
                            tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
                            tx.sign(keypair);

                            await provider.sendAndConfirm(tx);
                        }

                        console.log(
                            `${shapeRequested
                                ? currentPlayer.username + " needs " + cards[shapeRequested - 1]
                                : currentPlayer.username + " played " + validCard.cardNumber + " " + cards[validCard.id - 1]
                            })`
                        );
                    } else {

                        if (gameAccount.delegated) {
                            await programEphemeralRollup.methods
                                .drawFromPile()
                                .accountsStrict({
                                    signer,
                                    profile,
                                    game
                                })
                                .rpc();
                        } else {
                            let tx = await program.methods
                                .drawFromPileAndDelegate({
                                    commitFrequencyMs: commit_frequency,
                                    validator: validatorKey,
                                })
                                .accountsStrict({
                                    signer,
                                    profile,
                                    game,
                                    ownerProgram: program.programId,
                                    bufferGame,
                                    delegationRecordGame: recordGame,
                                    delegationMetadataGame: metadataGame,
                                    delegationProgram: DELEGATION_PROGRAM_ID,
                                    systemProgram: SystemProgram.programId,
                                })
                                .transaction();

                            tx.feePayer = keypair.publicKey;
                            tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
                            tx.sign(keypair);

                            await provider.sendAndConfirm(tx);
                        }
                        console.log(`${currentPlayer.username} drew from pile`);
                    }

                } catch (err: any) {
                    console.error("\n=== TRANSACTION FAILED ===");
                    console.error("Error:", err.message || err);

                    // Log transaction signature if available
                    if (err.signature) {
                        console.error("Transaction signature:", err.signature);
                    }

                    // Log program error details
                    if (err.error) {
                        console.error("Program error:", JSON.stringify(err.error, null, 2));
                    }

                    // Log transaction logs if available
                    if (err.logs && err.logs.length > 0) {
                        console.error("\nTransaction logs:");
                        err.logs.forEach((log: string) => console.error("  ", log));
                    }

                    // Log game state for debugging
                    try {
                        const gameState = await getCurrentGameStateER() || await getCurrentGameState();
                        console.error("\nCurrent game state:");
                        console.error("  Player turn:", gameState.playerTurn);
                        console.error("  Current player:", gameState.players[gameState.playerTurn - 1]?.username);
                        console.error("  Call card:", gameState.callCard);
                        console.error("  Cards to draw:", gameState.cardsToDraw);
                        console.error("  Cards in draw pile:", gameState.drawPile.length);
                        console.error("  Card requested:", gameState.cardRequested);
                        console.error("  Delegated:", gameState.delegated);
                        console.error("  Started:", gameState.started);
                        console.error("  Ended:", gameState.ended);
                    } catch (stateErr) {
                        console.error("Could not fetch game state:", stateErr);
                    }
                    // Re-throw to stop execution and surface the error
                    throw err;
                }

                const updatedGame = await getCurrentGameStateER();

                if (updatedGame.ended) {
                    winner = updatedGame.winner;
                    console.log("GAME ENDED — Winner:", updatedGame.winner.toBase58());
                    // commit and undelegate
                    const tx = await programEphemeralRollup
                        .methods
                        .commitGame()
                        .accountsStrict({
                            signer,
                            game: game,
                            magicContext: MAGIC_CONTEXT_ID,
                            magicProgram: MAGIC_PROGRAM_ID
                        })
                        .rpc();
                    console.log("Commit game transaction:", tx);
                    return;
                }
                if (firstMove) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                await playOneMove(false, false);
            }

            await playOneMove(true, true);
        });
    });

    describe("> Winner Claims", () => {
        it("Winner should be able to claim prize from vault", async () => {
            // wait for undelegation
            await new Promise((resolve) => setTimeout(() => resolve(true), 3000))

            if (winner) {
                const gameAccount = await getCurrentGameStateER();
                const player = gameAccount.players.find(p => p.owner.toBase58() == winner.toBase58());
                const {
                    keypair,
                    ata,
                    signer,
                    profile
                } = getPlayerCredentials(winner);
                console.log(player.username, "won");

                // Create provider with winner's keypair
                const winnerProvider = new anchor.AnchorProvider(
                    provider.connection,
                    new anchor.Wallet(keypair),
                    { commitment: "confirmed" }
                );
                const winnerProgram = new Program<DegenDecks>(
                    program.idl,
                    winnerProvider
                );

                const tx = await winnerProgram
                    .methods
                    .claimPrize()
                    .accountsStrict({
                        signer,
                        game: game,
                        gameVault: gameVault,
                        profile: profile,
                        userAta: ata.address,
                        feeAta: feeWsolAta,
                        config: config,
                        stakeMint: WSOL,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SYSTEM_PROGRAM_ID,
                        tokenProgram: TOKEN_PROGRAM_ID
                    })
                    .rpc();
                console.log("claim tx", "https://solscan.io/tx/" + tx + "?cluster=devnet");
            } else {
                console.log("No winner");
            }
        })
    })

}); 