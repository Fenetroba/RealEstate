# Claude-ready analysis for EDENET-RealEstate (client)

## Purpose
This document summarizes the important files, folder responsibilities, and the runtime flow so you can feed it to Claude.ai for architecture/QA tasks.

---

## High-level project
- Framework: Next.js (App Router) using `next@16`, React 19, TypeScript, Tailwind.
- Blockchain: `ethers` for web3; contract ABIs in `abi/`.
- State: Redux Toolkit in `store/` with slices for `wallet`, `property`, `auth`, `kyc`, `ui`, `dao`, `notification`.

---

## Important top-level folders (brief)
- `app/` — App Router pages and layouts. Entry points: `app/layout.tsx`, `app/page.tsx`, plus route folders (`auth`, `dashboard`, `buy`, `rent`, `properties`, `profile`, `market`, `about`, etc.).
- `components/` — UI components grouped by feature (layout, home, dashboard, property, web3, auth, verify, submit). Important components: layout `Navbar`, `Footer`, home sections `HeroSection`, `FeaturedProperties`, web3 components under `components/web3`.
- `lib/` — Business logic and helpers: web3 helpers (`web3/`), registry mappers, property utilities, mock data, pagination, caching.
- `hooks/` — Custom hooks for data and UI: `useProperties`, `usePropertyDetail`, `useSubmitProperty`, `useWalletRegistryTransfers`, etc.
- `contexts/` — React contexts. Key: `Web3Context.tsx` which builds provider/signer/contract and exposes `useWeb3()`.
- `store/` — Redux store setup (`store/index.ts`), hooks and `slices/` (auth, wallet, property, ui...).
- `types/` — TypeScript definitions (ethereum/registry/property types).
- `abi/` — Smart contract ABIs (e.g., `RealEstate.json`).
- `public/` — Static assets.
- `scripts/` — Helper scripts (e.g., tokenization scripts).
- `README.md`, `package.json`, `next.config.ts`, `tailwind.config.ts` — project config & metadata.

---

## Key files and their roles
- `app/layout.tsx` — global layout, font, metadata, wraps pages in `AppProviders` and `ThemeProvider`.
- `app/page.tsx` — homepage; composes `HeroSection`, `FeaturedProperties`, site `Navbar` and `Footer`.
- `contexts/Web3Context.tsx` — builds `BrowserProvider`, `Signer`, and `Contract` using `getContract()`; dispatches Redux wallet actions; exposes `connect`/`disconnect`.
- `lib/web3/*` — helpers for connecting and building contracts; contains `contract` factory and connect-flow utilities used by `Web3Context` and components.
- `abi/RealEstate.json` — ABI used by `getContract()`.
- `store/index.ts` — configures Redux store and slices; exported `RootState` and `AppDispatch` types.
- `store/slices/walletSlice.ts` — (entry point for wallet state) handles connect/disconnect/auto-connect; used heavily by `Web3Context`.
- `components/providers/AppProviders` — provider composition (likely wraps Redux Provider, persistor, etc.).
- `components/web3/*` — UI for wallet connection, registry operations, and transaction flows.
- `hooks/*` — domain hooks used by pages and components for data fetching and mutation.
- `lib/registry-*`, `lib/property-*` — core mapping and data transformation logic for registry, property listings, and verification flows.

---

## Typical runtime flow (user visits and interacts)
1. Browser requests `/` → Next resolves `app/layout.tsx` and `app/page.tsx`.
2. `layout.tsx` mounts `AppProviders` which likely includes Redux Provider and `Web3Provider` from `components/providers`.
3. `Web3Provider` (implemented in `contexts/Web3Context.tsx`) runs `tryAutoConnect()` via the Redux `wallet` slice to detect existing wallet sessions.
4. If user connects, `Web3Context` creates `BrowserProvider`, obtains `Signer`, and `getContract(signer)` using ABI from `abi/RealEstate.json` (via `lib/web3/contract`).
5. UI components (e.g., `components/web3/*`, `components/property/*`) call hooks in `hooks/` which call `lib/` helpers to read or transform data, dispatch Redux actions, or call contract methods via contract object from `useWeb3()`.
6. Transactions and contract reads use `ethers` + ABI; store updates flow through `store/slices/*` and components re-render based on state.

---

## Files to highlight for Claude (good anchors for analysis)
- `app/layout.tsx` ([app/layout.tsx](app/layout.tsx))
- `app/page.tsx` ([app/page.tsx](app/page.tsx))
- `contexts/Web3Context.tsx` ([contexts/Web3Context.tsx](contexts/Web3Context.tsx))
- `lib/web3/contract.ts` (or equivalent in `lib/web3/`) — contract factory
- `abi/RealEstate.json` ([abi/RealEstate.json](abi/RealEstate.json))
- `store/index.ts` ([store/index.ts](store/index.ts))
- `store/slices/walletSlice.ts` (and other slices in `store/slices/`)
- `components/providers/AppProviders.tsx` and `components/providers/ThemeProvider.tsx`
- `hooks/useProperties.ts`, `usePropertyDetail.ts`, `useSubmitProperty.ts`
- `lib/registry-*` and `lib/property-*` mapping utilities

---

## Suggested instruction to feed Claude
1. Provide this file as context.
2. Ask Claude to map call graph from `app/layout.tsx` → `AppProviders` → `Web3Provider` → `store/slices/walletSlice` → `lib/web3/*` → `abi/RealEstate.json`.
3. Request a list of functions that perform on-chain writes (search `lib/web3`, `hooks`, and `store/slices` for `contract.*` or `signer.*`).

---

## Next steps I can do for you
- Produce a full file list (recursive) in a single JSON or Markdown file.
- Create a simple Mermaid flow diagram of the runtime flow.
- Extract all `contract.*` and `signer.*` occurrences for on-chain write/read analysis.

Tell me which of those you want next.