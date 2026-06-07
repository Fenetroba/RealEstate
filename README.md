<div align="center">

# 🏛️ EDENET Real Estate NFT System

### Hybrid Web2 + Web3 Government Land Registry Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3-f7c948?style=for-the-badge)](https://hardhat.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Files live in PostgreSQL. Hashes live on-chain. Linked by token ID.**

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Docs](#-api-endpoints) · [Smart Contract](#-smart-contract)

</div>

---

## 🧠 The Core Idea

Traditional land registries are centralized and prone to document tampering. Existing blockchain solutions store everything on-chain — expensive and impractical for large files.

**EDENET solves this with a hybrid approach:**

- 📁 **Files** (images, deeds, surveys) → stored in **PostgreSQL** under government control
- 🔐 **SHA-256 fingerprints** of those files → stored permanently on the **blockchain**
- ✅ **Anyone can verify** a document hasn't been tampered with — without accessing the document itself

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Property Registration** | Citizens submit property requests with images and documents |
| ✅ **Government Approval** | Admins approve/decline requests — NFT minted on approval |
| 🔐 **Tamper-proof Verification** | SHA-256 hash comparison between DB and blockchain |
| 📜 **Version History** | Full audit trail of metadata updates on-chain |
| 💰 **Marketplace** | Buy/sell properties with automatic 2% government commission |
| 🌿 **Merkle Tree Hashing** | Enables selective file disclosure without revealing all documents |
| 👛 **MetaMask Integration** | Citizen wallet signs submissions; backend signs admin actions |
| 🗄️ **PostgreSQL File Storage** | Actual file bytes stored as `bytea` — no third-party services |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│         App Router · TypeScript · Redux · ethers.js      │
│    Citizen Dashboard · Admin Panel · Property Viewer     │
└──────────────────┬──────────────────┬───────────────────┘
                   │ REST API          │ ethers.js
                   ▼                  ▼
┌─────────────────────────┐  ┌────────────────────────────┐
│   BACKEND (Node.js)     │  │   BLOCKCHAIN (Hardhat)     │
│   Express · Prisma ORM  │  │   Solidity · ERC721        │
│   SHA-256 · Multer      │  │   AccessControl · NFT      │
│                         │  │                            │
│  ┌───────────────────┐  │  │  ┌──────────────────────┐ │
│  │   PostgreSQL DB   │  │  │  │   RealEstate.sol     │ │
│  │  files as bytea   │  │  │  │  bytes32 hash store  │ │
│  │  SHA-256 hashes   │  │  │  │  version history     │ │
│  └───────────────────┘  │  │  └──────────────────────┘ │
└─────────────────────────┘  └────────────────────────────┘
```

### The Hybrid Integrity Flow

```
1. Citizen uploads files → backend SHA-256 hashes → stored in PostgreSQL (bytea)
2. Frontend calls contract.submitRequest() → MetaMask popup → citizen signs on-chain
3. TX confirmed on-chain → backend writes all data to DB (files + hashes + request)
4. Gov't approves → backend GOV_PRIVATE_KEY signs → NFT minted (no MetaMask popup)
5. Anyone can verify: re-hash DB files → compare to on-chain hash → tamper-proof ✓
```

---

## 📁 Project Structure

```
EDENET-RealEstate/
├── contracts/
│   └── RealEstate.sol          # ERC721 + AccessControl smart contract
├── scripts/
│   └── deploy.js               # Hardhat deployment script
├── backend/
│   ├── index.js                # Express entry point
│   ├── routes/
│   │   ├── properties.js       # /request/prepare, /confirm, /images, /documents
│   │   ├── admin.js            # /approve/:id, /decline/:id
│   │   └── verify.js           # tamper-proof audit endpoint
│   ├── utils/
│   │   ├── hash.js             # hashBuffer(), hashMetadata(), computeRootHash()
│   │   └── contract.js         # GOV_PRIVATE_KEY signer (ethers.js)
│   ├── middleware/
│   │   └── upload.js           # multer memory storage
│   └── prisma/
│       └── schema.prisma       # 4-table database schema
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # UI components
│   ├── hooks/                  # Data fetching hooks
│   ├── contexts/
│   │   └── Web3Context.tsx     # Wallet + contract connection
│   ├── lib/
│   │   ├── api/properties.ts   # Backend API calls
│   │   └── web3/
│   │       ├── config.ts       # Environment variables
│   │       └── contract.ts     # ABI + getContract()
│   └── abi/
│       └── RealEstate.json     # Compiled contract ABI
├── hardhat.config.js
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MetaMask browser extension
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Fenetroba/EDENET-RealEstate.git
cd EDENET-RealEstate
git checkout backend
```

### 2. Install dependencies

```bash
# Root (Hardhat)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Set up environment files

**`backend/.env`**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/realestate_db"
GOV_PRIVATE_KEY="0xYOUR_GOVERNMENT_WALLET_PRIVATE_KEY"
GOV_WALLET="0xYOUR_GOVERNMENT_WALLET_ADDRESS"
PROPERTY_NFT_ADDRESS="0xCONTRACT_ADDRESS_AFTER_DEPLOY"
RPC_URL="http://127.0.0.1:8545"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xCONTRACT_ADDRESS_AFTER_DEPLOY
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_GOV_WALLET=0xYOUR_GOVERNMENT_WALLET_ADDRESS
NEXT_PUBLIC_USE_REGISTRY_MOCK=false
```

### 4. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the system

Open **4 terminals**:

```bash
# Terminal 1 — Blockchain node
npx hardhat node

# Terminal 2 — Deploy contract (copy address to both .env files)
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — Backend
cd backend && npm run dev

# Terminal 4 — Frontend
cd frontend && npm run dev
```

### 6. Configure MetaMask

Add Hardhat Local network to MetaMask:
- **Network Name:** Hardhat Local
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Currency Symbol:** ETH

Import the government wallet using the private key from Hardhat output.

---

## 🗄️ Database Schema

```
Property          Document              MetadataVersion       Request
────────          ────────              ───────────────       ───────
id (UUID)         id (UUID)             id (UUID)             id (UUID)
tokenId           propertyId (FK)       propertyId (FK)       propertyId (FK)
ownerWallet       fileData (bytea) ◄─── versionNo             type (MINT/UPDATE)
status            sha256Hash            metadataHash          status
name              fileName              imagesRootHash        metadataHash
location          mimeType              documentsRootHash     imagesRootHash
propertyType      fileType              metadataSnapshot      documentsRootHash
bedrooms          docType               approvedAt            metadataSnapshot
bathrooms         versionNo             approvedBy            submittedBy
squareFeet        sizeBytes                                   reviewedBy
parking           uploadedBy                                  documentIds
floors                                                        declineReason
yearBuilt
price
metadataHash
imagesRootHash
documentsRootHash
chainHash
```

---

## 📡 API Endpoints

### Properties (Citizen-facing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/properties/request/prepare` | Upload files, compute hashes — returns `tempId + hashes`. **No DB write yet.** |
| `POST` | `/api/properties/request/confirm` | Called after MetaMask TX confirms — writes everything to DB |
| `POST` | `/api/properties/:id/update-request` | Submit metadata update request |
| `GET` | `/api/properties` | List all minted properties |
| `GET` | `/api/properties/:id` | Full property detail |
| `GET` | `/api/properties/:id/images` | Property images as base64 array |
| `GET` | `/api/properties/:id/documents` | Property documents as base64 array |

### Admin (requires `x-gov-wallet` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/requests` | List pending requests (`?status=PENDING&type=MINT\|UPDATE`) |
| `POST` | `/api/admin/approve/:requestId` | Approve request — backend signs with `GOV_PRIVATE_KEY` |
| `POST` | `/api/admin/decline/:requestId` | Decline request |

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/verify/:tokenId` | Full tamper-proof audit — returns `tamperProof: true/false` |

---

## 📜 Smart Contract

**`RealEstate.sol`** — ERC721 + AccessControl

### Key Functions

```solidity
// Citizen — MetaMask signs
function submitRequest(PropertyDetails memory details) public

// Admin — backend GOV_PRIVATE_KEY signs (no MetaMask)
function approveRequest(uint256 requestId) public onlyRole(ADMIN_ROLE)
function declineRequest(uint256 requestId, string memory reason) public onlyRole(ADMIN_ROLE)

// Citizen — submit metadata update
function submitUpdateRequest(
    uint256 propertyId,
    bytes32 newMetadataHash,
    bytes32 newImagesRootHash,
    bytes32 newDocumentsRootHash
) public

// Admin — approve update
function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) public onlyRole(ADMIN_ROLE)

// Marketplace
function listProperty(uint256 propertyId, uint256 priceInEther) public
function buyProperty(uint256 propertyId) public payable  // 2% commission to gov wallet

// View
function getLatestHashes(uint256 propertyId) public view returns (bytes32, bytes32, bytes32)
function getMetadataVersions(uint256 propertyId) public view returns (MetadataVersion[] memory)
```

### Hash Architecture

```
Individual file  ──► hashBuffer()       ──► sha256Hash      (Document table)
All image hashes ──► computeRootHash()  ──► imagesRootHash  (on-chain)
All doc hashes   ──► computeRootHash()  ──► documentsRootHash (on-chain)
Metadata JSON    ──► hashMetadata()     ──► metadataHash    (on-chain) ◄── verified here
```

---

## 🔐 Verification System

The `/api/verify/:tokenId` endpoint performs a full tamper-proof audit:

1. Re-hashes every file from raw bytes in PostgreSQL
2. Recomputes Merkle roots for images and documents  
3. Recomputes metadata hash from saved snapshot
4. Fetches current hash from blockchain via `getLatestHashes()`
5. Returns detailed comparison result

```json
{
  "tamperProof": true,
  "metadataHashMatch": true,
  "onChainMatch": true,
  "imagesRootMatch": true,
  "documentsRootMatch": true,
  "allFilesIntact": true,
  "filesIntegrity": [...],
  "versionHistory": [...]
}
```

---

## 🛠️ Useful Commands

```bash
# Database
npx prisma migrate reset          # Wipe and recreate database
npx prisma studio                 # Visual DB browser at localhost:5555
npx prisma migrate dev --name X   # Run new migration after schema changes

# Blockchain
npx hardhat compile               # Recompile contracts
npx hardhat node                  # Start local blockchain
npx hardhat run scripts/deploy.js --network localhost  # Deploy contract

# Testing
node backend/utils/hash.test.js   # Run hash utility tests
```

---

## ⚠️ Important Notes

- **Contract address changes** every time Hardhat node restarts — update both `.env` files after redeployment
- **GOV_PRIVATE_KEY** in `.env` is Hardhat Account #0 — for local development only, never use on mainnet
- **Admin actions** (approve/decline) are signed by the backend using `GOV_PRIVATE_KEY` — no MetaMask popup
- **Citizen actions** (submit request, list property, buy property) require MetaMask confirmation
- Never commit `.env` or `.env.local` files to version control

---

## 🗺️ Roadmap

- [ ] **KYC Login** — email + OTP + ID document verification before wallet connection
- [ ] **Testnet Deployment** — Ethereum Sepolia or Polygon Mumbai
- [ ] **Redis Integration** — replace in-memory pending uploads store
- [ ] **JWT Authentication** — proper token-based auth for admin routes
- [ ] **Batch Approvals** — approve multiple requests in one transaction
- [ ] **Email Notifications** — notify citizens on request status changes
- [ ] **Mobile App** — React Native with WalletConnect

---

## 👥 Team

Built by the EDENET team as a hybrid blockchain land registry system.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Files in PostgreSQL. Hashes on-chain. Trust without exposure.**

⭐ Star this repo if you find it useful!

</div>
