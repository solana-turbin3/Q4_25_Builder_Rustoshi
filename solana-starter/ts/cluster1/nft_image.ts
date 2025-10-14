import wallet from "/home/rustoshidev/.config/solana/id.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({address: "https://devnet.irys.xyz/",}));
umi.use(signerIdentity(signer));

// https://arwave.net
// https://devnet.irys.xyz/

(async () => {
    try {
        //1. Load image
        const myImage = await readFile("./jam.jpeg")
        //2. Convert image to generic file.
        const file = createGenericFile(myImage, "jam.jpeg", {
            contentType: "image/jpeg"
        });
        //3. Upload image
        const uri = await umi.uploader.upload([file]);
        console.log("Your image URI: ", uri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
