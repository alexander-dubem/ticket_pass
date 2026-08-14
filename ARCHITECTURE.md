# Architecture

## Overview

Ticket Pass is a decentralized event ticketing platform built on the **Stellar** network using **Soroban smart contracts**. It handles high-throughput ticket drops without database lockups or API latency.

## System Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Next.js Web   │────▶│   NestJS API    │────▶│   PostgreSQL     │
│   (Frontend)    │     │   (Backend)     │     │   (Prisma ORM)   │
│   Port 5000     │     │   Port 5001     │     │                  │
└────────┬────────┘     └────────┬────────┘     └──────────────────┘
         │                       │
         │      ┌────────────────┘
         │      │
         ▼      ▼
┌─────────────────┐     ┌─────────────────┐
│  Stellar Wallets │     │  Soroban Smart  │
│  (Freighter,     │     │  Contracts      │
│   Albedo, etc.)  │     │  (Rust/WASM)    │
└─────────────────┘     └─────────────────┘
```

## Layers

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Wallet**: `@creit.tech/stellar-wallets-kit`
- **Auth**: SEP-10 challenge/response via `WalletContext`
- **State**: React Context + localStorage hydration

### Backend (`apps/api`)
- **Framework**: NestJS 10
- **ORM**: Prisma 5
- **Auth**: `@nestjs/jwt` + SEP-10 verification
- **Docs**: Swagger/OpenAPI at `/api/docs`
- **Stellar**: `@stellar/stellar-sdk` v12 for transaction building

### Smart Contracts (`packages/contracts`)
- **Language**: Rust (no_std, WASM target)
- **Storage**: Temporary (idempotency) + Persistent (ownership, metadata)
- **Math**: Scaled integer (`1000` multiplier) for anti-scalping price caps

## Key Flows

### 1. Authentication (SEP-10)
1. Frontend requests challenge from `/auth/challenge`
2. Backend signs challenge with server keypair
3. Frontend has user sign challenge via wallet
4. Frontend sends signed XDR to `/auth/login`
5. Backend verifies signatures, issues JWT

### 2. Ticket Minting
1. User clicks "Mint" on event page
2. Frontend builds Soroban contract invocation XDR
3. Backend receives inner XDR, wraps in fee-bump envelope
4. Sponsor account pays gas; channel account provides sequence
5. Transaction submitted to Stellar testnet

### 3. Anti-Scalping
- Contract stores original mint price
- On transfer, contract calculates max resale price:
  `maxPrice = originalPrice + (originalPrice * maxPremiumPctScaled / 1000)`
- Transfer rejected if price exceeds cap

### 4. Parallel Dispatch
- Pool of pre-funded channel accounts in DB
- `checkoutChannel()` atomically locks an account
- Each mint uses a different channel to avoid sequence conflicts
- Channel returned to pool after transaction completes

## Data Models

- **User**: Stellar address, JWT session, created events
- **Event**: Title, description, date, price, capacity, resale cap, contract address
- **Ticket**: Event FK, owner address, on-chain ticket ID, transaction hash, status
- **ChannelAccount**: Stellar address, secret key, locked status for parallel dispatch

## Environment Variables

See `.env.example` in the repo root for required configuration.

## Development

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5000
- API: http://localhost:5001
- Swagger: http://localhost:5001/api/docs
