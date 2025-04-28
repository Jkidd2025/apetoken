import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testRPCConnection() {
    try {
        // Initialize connection to Solana network using Helius RPC
        const connection = new Connection(process.env.RPC_URL!, 'confirmed');
        
        console.log('Testing Helius RPC Connection...');
        
        // Get the current slot
        const slot = await connection.getSlot();
        console.log('Current Slot:', slot);
        
        // Get the current block height
        const blockHeight = await connection.getBlockHeight();
        console.log('Current Block Height:', blockHeight);
        
        // Get the current epoch info
        const epochInfo = await connection.getEpochInfo();
        console.log('Epoch Info:', {
            epoch: epochInfo.epoch,
            slotIndex: epochInfo.slotIndex,
            slotsInEpoch: epochInfo.slotsInEpoch,
            absoluteSlot: epochInfo.absoluteSlot
        });
        
        // Get the current version
        const version = await connection.getVersion();
        console.log('Solana Version:', version);
        
        // Get the current supply
        const supply = await connection.getSupply();
        console.log('Total Supply:', {
            total: supply.value.total / 1e9, // Convert lamports to SOL
            circulating: supply.value.circulating / 1e9,
            nonCirculating: supply.value.nonCirculating / 1e9
        });
        
        // Test transaction confirmation
        const recentBlockhash = await connection.getRecentBlockhash();
        console.log('Recent Blockhash:', recentBlockhash.blockhash);
        
        console.log('\nHelius RPC Connection Test Successful!');
        
    } catch (error) {
        console.error('Error testing RPC connection:', error);
    }
}

testRPCConnection().catch(console.error); 