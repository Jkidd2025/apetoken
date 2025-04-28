import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { 
    createV1,
    TokenStandard
} from '@metaplex-foundation/mpl-token-metadata';
import { none, publicKey, percentAmount } from '@metaplex-foundation/umi';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Custom error class for token creation
class TokenCreationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenCreationError';
    }
}

async function main() {
    try {
        // Validate environment variables
        if (!process.env.RPC_URL) {
            throw new TokenCreationError('RPC_URL is not defined in .env file');
        }
        if (!process.env.WALLET_PRIVATE_KEY) {
            throw new TokenCreationError('WALLET_PRIVATE_KEY is not defined in .env file');
        }

        // Initialize connection to Solana network
        const connection = new Connection(process.env.RPC_URL, 'confirmed');
        
        // Initialize UMI
        const umi = createUmi(process.env.RPC_URL);
        const keypair = Keypair.fromSecretKey(Buffer.from(process.env.WALLET_PRIVATE_KEY, 'base64'));
        umi.use(web3JsEddsa());

        // Create a new keypair for the token mint
        const mintKeypair = Keypair.generate();
        
        // Create the token mint
        console.log('Creating token mint...');
        const mint = await createMint(
            connection,
            keypair,
            new PublicKey(process.env.WALLET_PRIVATE_KEY),
            null,
            9 // Decimals
        );

        console.log('✅ Token Mint Address:', mint.toBase58());

        // Get or create the token account for the mint authority
        console.log('Creating token account...');
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            new PublicKey(process.env.WALLET_PRIVATE_KEY)
        );

        console.log('✅ Token Account:', tokenAccount.address.toBase58());

        // Mint tokens to the token account
        console.log('Minting tokens...');
        const mintAmount = BigInt(process.env.TOKEN_SUPPLY || '1000000000') * BigInt(10 ** 9);
        await mintTo(
            connection,
            keypair,
            mint,
            tokenAccount.address,
            new PublicKey(process.env.WALLET_PRIVATE_KEY),
            mintAmount
        );

        console.log('✅ Tokens minted successfully');

        // Read and validate metadata file
        console.log('Reading metadata...');
        const metadataPath = path.join(__dirname, '..', 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
            throw new TokenCreationError('metadata.json file not found');
        }

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        // Validate required metadata fields
        const requiredFields = ['name', 'symbol', 'description', 'image', 'external_url'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                throw new TokenCreationError(`Missing required metadata field: ${field}`);
            }
        }

        // Create metadata account
        console.log('Creating metadata account...');
        const builder = createV1(umi, {
            mint: publicKey(mint.toBase58()),
            authority: umi.identity,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.external_url,
            sellerFeeBasisPoints: percentAmount(metadata.seller_fee_basis_points || 0, 2),
            creators: metadata.creators.map((creator: any) => ({
                address: publicKey(creator.address),
                verified: false,
                share: creator.share,
            })),
            isMutable: true,
            tokenStandard: TokenStandard.Fungible,
            collection: none(),
            uses: none(),
            collectionDetails: none(),
            decimals: none(),
            printSupply: none(),
        });

        const transaction = await builder.buildAndSign(umi);
        const signature = await umi.rpc.sendTransaction(transaction);
        console.log('✅ Metadata Transaction:', signature);

        console.log('\nToken Creation Complete!');
        console.log('----------------------');
        console.log('Token Details:');
        console.log('Name:', metadata.name);
        console.log('Symbol:', metadata.symbol);
        console.log('Description:', metadata.description);
        console.log('Website:', metadata.external_url);
        console.log('Total Supply:', process.env.TOKEN_SUPPLY || '1000000000');
        console.log('Mint Address:', mint.toBase58());
        console.log('Token Account:', tokenAccount.address.toBase58());

    } catch (error) {
        if (error instanceof TokenCreationError) {
            console.error('Token Creation Error:', error.message);
        } else {
            console.error('Unexpected Error:', error);
        }
        process.exit(1);
    }
}

main().catch(console.error); 