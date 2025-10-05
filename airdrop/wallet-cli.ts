import bs58 from 'bs58'
import promptSync from 'prompt-sync'


const prompt = promptSync();

async function base58ToWallet() {
    const bs58Wallet = prompt("Enter your bs58 wallet: ");
    let wallet = bs58.decode(bs58Wallet.trim());
    console.log(wallet);
}

async function walletToBase58() {
    const wallet = [27,18,18,146,36,152,226,172,65,77,5,201,58,235,52,180,119,69,238,72,207,145,32,19,85,165,80,74,194,124,6,113,67,49,27,99,38,172,70,128,189,210,127,159,229,238,149,95,188,247,158,106,21,235,57,90,192,145,242,67,161,50,26,2];
    let base58 = bs58.encode(wallet).toString();
    console.log(base58);
}

console.log("Choose conversion route: ");
console.log("1. Base58 to Wallet");
console.log("2. Wallet to Base58");

let option: number = Number(prompt(""));
if(option === 1) base58ToWallet()
if (option === 2) walletToBase58();
else console.log("Invalid input");