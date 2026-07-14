# Ticket Pass Platform

Ticket Pass is a high-throughput, decentralized event ticketing platform built on the **Stellar** network using **Soroban Smart Contracts**. It is architected specifically to handle highly volatile traffic patterns during primary ticket releases ("drops") without experiencing database lockups, out-of-order transactions, or API latency.

---

## 🏗️ System Architecture & Monorepo Structure

The platform uses a decoupled monorepo structure orchestrated via **Turborepo** and **pnpm workspaces**. This isolates frontend, backend, and smart contract layers while allowing shared build toolchains and TypeScript configurations.

```text
event_ticketing-monorepo/
├── apps/
│   ├── api/                 # NestJS Core API (Backend) [Port: 5001]
│   └── web/                 # Next.js App Router Frontend [Port: 5000]
├── packages/
│   ├── contracts/           # Soroban Smart Contracts (Rust / WASM)
│   └── typescript-config/   # Shared TypeScript compiler configurations
├── pnpm-workspace.yaml      # Monorepo workspace configuration
├── turbo.json               # Turborepo task pipeline configuration
└── package.json             # Root monorepo dependencies and scripts
```

---

## ⚙️ Core Features & How They Work

### 1. Cryptographic Authentication (SEP-10)

Instead of traditional credentials, users login using passwordless cryptographic authentication:

- **Challenge Generation**: The NestJS backend generates an invalid sequence challenge transaction signed by the server.
- **Wallet Sign-off**: The frontend uses the **Stellar Wallets Kit** to have the user sign this challenge.
- **Verification & JWT**: The server verifies both cryptographic signatures and issues a stateless JSON Web Token (JWT) authorizing the user session.

### 2. Anti-Scalping Price Cap (On-Chain)

The Soroban smart contract implements custom resale price restrictions to prevent scalping.

- Because Soroban does not support floating-point numbers, computations are performed using **scaled integer math** with a `1000` multiplier.
- The contract enforces a maximum premium threshold on any secondary market transfers:
  $$\text{Max Resale Price} = \text{Original Price} + \frac{\text{Original Price} \times \text{Max Premium Pct Scaled}}{1000}$$

### 3. Parallel Transaction Dispatcher

Stellar enforces sequence number restrictions (one in-flight transaction per account). To enable high-concurrency ticket minting during popular drops, Ticket Pass implements:

- **Channel Accounts Pool**: A pool of pre-funded accounts managed in PostgreSQL. The backend retrieves an idle channel account to act as the sequence provider for the outer transaction.
- **Fee Sponsoring (Fee-Bumps)**: Transactions are wrapped in a Fee-Bump envelope signed by a master Sponsor Account. Users do not need to hold native XLM balances to pay for gas fees.

### 4. Smart Contract Rent & TTL Management

To prevent state bloat on the Stellar ledger, state data is mapped to Soroban's storage tiers:

- **Temporary Storage**: Used for idempotency keys to prevent double-mint replay attacks.
- **Persistent Storage**: Used for ticket ownership maps, ticket metadata, and balances. The contract automatically extends the Time-To-Live (TTL) of persistent state records during mints or transfers.

---

## 🛠️ Getting Started & Running the Platform

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v20+ recommended)
- **pnpm** (v10.0.0+)
- **Rust & Cargo** (for compiling Soroban smart contracts)
- **Stellar CLI** (for testing and deploying contracts)
- **PostgreSQL** database

---

### 📦 1. Installation

From the repository root, install dependencies for all apps and workspaces:

```bash
pnpm install
```

---

### 🗄️ 2. Database Scaffolding (NestJS Backend)

1. Navigate to the API workspace:
   ```bash
   cd apps/api
   ```
2. Copy the template and configure your PostgreSQL database credentials:
   ```bash
   cp .env.example .env
   ```
3. Run the Prisma database migrations to scaffold the tables (`User`, `Event`, `Ticket`, and `ChannelAccount`):
   ```bash
   pnpm prisma migrate dev
   ```

---

### 💻 3. Running the Apps in Development

You can start the frontend and backend simultaneously from the root of the project using Turborepo:

```bash
pnpm dev
```

This boots up:

- **Web Frontend** at [http://localhost:5000](http://localhost:5000)
- **NestJS Backend API** at [http://localhost:5001](http://localhost:5001)
- **Swagger Documentation** at [http://localhost:5001/api/docs](http://localhost:5001/api/docs)

If you wish to run them separately, use pnpm filters:

```bash
# Run NestJS API only
pnpm --filter ticket-pass-api dev

# Run Next.js Web App only
pnpm --filter ticket-pass dev
```

---

### 🦀 4. Compiling & Testing Smart Contracts

The smart contracts are located in `packages/contracts`.

1. **Target compilation**:
   ```bash
   cd packages/contracts
   cargo build --target wasm32-unknown-unknown --release
   ```
2. **Run contract tests**:
   ```bash
   cargo test
   ```

---

## 🚀 Build Pipeline

To bundle and optimize the entire workspace for production deployment:

```bash
pnpm build
```

This builds all shared modules, runs Next.js builds, compiles TypeScript configuration pipelines, and outputs optimized builds into `.next` and `dist` targets.
