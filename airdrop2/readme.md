# Airdrop2 - Rust Solana Client

Rust implementation of Solana operations using native SDK.

## Test Functions

- `keygen` - Generate new keypair
- `claim_airdrop` - Request 2 SOL from devnet
- `transfer_sol` - Send SOL with balance drainage
- `submit_rs` - Submit Turbin3 completion proof

## Usage

```bash
cargo test keygen -- --nocapture
cargo test claim_airdrop -- --nocapture
cargo test transfer_sol -- --nocapture
cargo test submit_rs -- --nocapture
```

## Dependencies

- `solana-client` - RPC operations
- `solana-sdk` - Core types
- `bs58` - Encoding utilities

Rust alternative to the TypeScript implementation in `../airdrop/`.