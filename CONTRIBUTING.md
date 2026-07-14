# Contributing to Ticket Pass

Thank you for your interest in contributing to Ticket Pass! This document outlines the standards, workflows, and development guidelines for contributing to our decentralized ticketing platform.

---

## 🌿 Git Workflow & Branching

We use a standard feature-branching Git workflow:
1. **Fork/Clone** the repository.
2. Create a new branch from `main`:
   - For new features: `feature/your-feature-name`
   - For bug fixes: `bugfix/your-bug-name`
   - For documentation: `docs/your-doc-name`
3. Make your changes and commit them following the commit guidelines.
4. Push your branch and open a **Pull Request (PR)** targeting the `main` branch.

---

## 📬 Pull Request Guidelines

When opening a Pull Request, please ensure your PR description follows our structured template. This helps reviewers understand the scope of the changes and verify that proper testing has been conducted.

### PR Description Template

```markdown
### 📝 Description
Provide a brief summary of the changes introduced by this PR, the motivation behind them, and link any related issue numbers (e.g., Closes #123).

### 🧪 Testing Conducted
Please check the types of testing that were performed to validate these changes:
- [ ] **Automated Unit Tests** (e.g., Smart contract unit tests via `cargo test`, component unit tests)
- [ ] **Integration & API Tests** (e.g., NestJS service tests, endpoint validation via Swagger)
- [ ] **Build & Type Verification** (e.g., Ran `pnpm build` successfully with zero TypeScript compilation or lint errors)
- [ ] **Manual Browser/UI Verification** (e.g., Tested wallet connect, ticket purchase flow in browser)

#### Verification Commands & Results
List the exact commands run to test the code and briefly describe the outcome:
\`\`\`bash
# Example:
pnpm build
cd packages/contracts && cargo test
\`\`\`

#### Manual Verification Steps
Detail the steps to manually verify your changes locally:
1. Spin up the dev environments (e.g. `pnpm dev`).
2. Navigate to `http://localhost:5000/...` and check...
```

---

## 💻 Coding Standards & Conventions

### 1. TypeScript & Next.js / NestJS
* **Language**: Write all client-side and server-side code in strict TypeScript.
* **Code Formatting**: We use **Prettier** for formatting. You can format your files using:
  ```bash
  pnpm prettier --write "apps/**/*.{ts,tsx,css}"
  ```
* **Linting**: Run TypeScript compilation checks prior to submitting code:
  ```bash
  pnpm build
  ```
  Ensure there are no compilation errors or unused imports.

### 2. Rust & Soroban Smart Contracts
* **Code Formatting**: Format Rust code using `rustfmt`:
  ```bash
  cd packages/contracts
  cargo fmt
  ```
* **Linting & Safety**: Check for common warnings, safety violations, and optimization scopes using Clippy:
  ```bash
  cargo clippy --all-targets -- -D warnings
  ```
* **WASM Optimizations**: Verify that the compiled WASM size is under the 64 KB limit. Compiling under release profile will trigger the optimization settings defined in `Cargo.toml`.

### 3. Database & Schema
* All database changes must go through **Prisma Migrations** in `apps/api/prisma/schema.prisma`.
* Do not manually modify database tables. Always write declarative schema updates and generate migration files:
  ```bash
  cd apps/api
  pnpm prisma migrate dev --name <migration_name>
  ```

---

## 📝 Commit Guidelines

We encourage the use of **Conventional Commits** to keep a clean, readable git history. Commit messages should follow this format:

```text
<type>(<scope>): <description>

[optional body]
```

### Common Types:
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix (corresponds to a patch release).
- `docs`: Documentation updates (README, CONTRIBUTING, inline docs).
- `style`: Changes that do not affect the meaning of the code (formatting, semicolon fixes).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding or correcting tests.
- `chore`: Build tasks, package updates, or configuration adjustments.

---

## 🧪 Testing Guidelines

* **Smart Contracts**: Every on-chain operation must have accompanying unit tests inside `packages/contracts/contracts/<contract_name>/src/test.rs`. Run tests with:
  ```bash
  cd packages/contracts
  cargo test
  ```
* **Backend API**: Write unit/integration tests for critical controller endpoints and authentication logic.
* **Frontend Components**: Ensure components render and act correctly under mock states.
