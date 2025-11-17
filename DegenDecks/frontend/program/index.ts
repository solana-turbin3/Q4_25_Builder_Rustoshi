import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { DegenDecks } from "./types/degen_decks";
import IDL from "./idl/degen_decks.json";

export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = new Program<DegenDecks>(IDL, provider);
    return program;
};



// helper functions
export const CONFIG_SEED = "CONFIG";
export const PROFILE_SEED = "PROFILE";
export const GAME_SEED = "GAME";
export const PROGRAMID = new PublicKey(IDL.address);

export const getConfigPda = () => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(CONFIG_SEED, "utf-8"), 
        ],
        PROGRAMID
    )[0];
}

export const getProfilePda = (pubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(PROFILE_SEED, "utf-8"), 
            pubkey.toBuffer()
        ],
        PROGRAMID
    )[0];
};

export const getGamePda = (pubkey: PublicKey, seed: BN) => {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from(GAME_SEED, "utf-8"), 
            pubkey.toBuffer(), 
            seed.toArrayLike(Buffer, "le", 8)
        ],
        PROGRAMID
    )[0];
};

