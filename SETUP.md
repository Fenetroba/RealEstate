### The flow is:
Citizen uploads files → backend (FREE, Web2)
        ↓
Frontend calls contract.submitRequest() → MetaMask popup (GAS, Web3)
        ↓
Gov't calls POST /api/admin/approve → backend signs TX (GAS, paid by GOV_PRIVATE_KEY wallet)
        ↓
NFT minted on-chain ✓

So gas is paid twice — citizen pays to submit the request on-chain, gov't pays to approve and mint. This is correct and intentional because both actions are recorded on-chain permanently.



### ##############################################################################################################
To Start the system, 
first delete node_modulee from backend and frontend, and delete .next from frontend, and run npm install

# Terminal 1 (Don't Close - keep it running, this is the local blockchain)
npx hardhat node --hostname 127.0.0.1

# Terminal 2
npx hardhat run scripts/deploy.mjs --network localhost

then check the contract address and update the .env.local in frontend

# Termninal 3
cd frontend -> npm run dev

# Termninal 4
cd backend -> npm run dev

# Termninal 5
cd backend -> npx prisma migrate reset
cd backend -> npx prisma studio 


navigate to Localhost:3000



### -----------------------------------------------------------------------------------------
Issue 2 — 10 second delay on approve & mint
This is normal and expected. The delay is:

Backend calls contract.approveRequest() — ethers.js sends TX to Hardhat
receipt = await tx.wait() — waits for 1 block confirmation
Hardhat mines a block (1-3 seconds)
DB transaction runs
Response sent back      
### -----------------------------------------------------------------------------------------