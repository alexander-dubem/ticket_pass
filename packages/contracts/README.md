# Ticket Pass Soroban Smart Contracts

This folder contains the Soroban smart contract for the Ticket Pass decentralized ticketing platform.

## Prerequisites

If you do not have Rust or `stellar-cli` installed, follow these instructions to set them up:

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Add WASM Target
Soroban smart contracts compile to WebAssembly. Add the WebAssembly target for Rust:
```bash
rustup target add wasm32-unknown-unknown
```

### 3. Install Stellar CLI
Download and install the `stellar-cli` tool:
```bash
cargo install --locked stellar-cli --features opt
```

## Compilation

To compile the smart contract and optimize its size for deployment:

```bash
cargo build --target wasm32-unknown-unknown --release
```

The optimized WASM contract file will be located at:
`target/wasm32-unknown-unknown/release/ticket_pass_contract.wasm`

## Running Tests

To run the built-in Rust unit tests for the smart contract:

```bash
cargo test
```
