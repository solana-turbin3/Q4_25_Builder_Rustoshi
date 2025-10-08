import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js"
import wallet from "/home/rustoshidev/.config/solana/id.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("5bnBNhoRgSDbkDiUHRHhgWGY4aifBRK6kspUCcEsW6YE");

// Recipient address
const to = new PublicKey("G7MTCM2S1W6ufPhYLjodUyRZLBFbPz91CXd5C63aWoqV");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to);
        // Transfer the new token to the "toTokenAccount" we just created
        const transferTx = await transfer(
            connection, 
            keypair, 
            fromTokenAccount.address, 
            toTokenAccount.address, 
            keypair.publicKey, 
            5000 * 1e6
        );
        console.log(transferTx);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();