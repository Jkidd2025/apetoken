# Ape Armor Token

A Solana SPL token for accessing Ape Armor's subscription services.

## Token Details

- Name: Ape Armor
- Symbol: APE
- Supply: 1,000,000,000
- Decimals: 9
- Description: Ape Armor token is a utility to access the subscription services for protecting customers against scams, rug pulls, and exploits
- Website: www.apearmorsecure.com

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your environment:

- Copy `.env.example` to `.env`
- Update the `WALLET_PRIVATE_KEY` with your wallet's private key
- Update the `RPC_URL` if you want to use a different Solana network

3. Build the project:

```bash
npm run build
```

4. Run the token creation script:

```bash
npm start
```

## Features

- Creates a new SPL token with specified metadata
- Mints the total supply to the creator's wallet
- Configurable token parameters through environment variables

## Security Notes

- Never commit your `.env` file or expose your private keys
- Keep your wallet's private key secure
- Consider using a testnet for initial deployment
