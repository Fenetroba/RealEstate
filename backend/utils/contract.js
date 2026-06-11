// utils/contract.js (BACKEND)
// Uses the government private key to sign transactions on the RealEstate contract.
// NEVER import this file in the frontend.

const { ethers } = require("ethers");

// ── Minimal ABI covering the functions the backend calls ─────────────────────
const PROPERTY_NFT_ABI = [
  // Admin: approve / decline property mint requests
  "function approveRequest(uint256 requestId) external",
  "function declineRequest(uint256 requestId, string reason) external",

  // Admin: approve / decline metadata update requests
  "function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) external",
  "function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string reason) external",

  // View: update requests for a property
  "function getUpdateRequests(uint256 propertyId) external view returns (tuple(uint256 id, uint256 propertyId, address requester, bytes32 newMetadataHash, bytes32 newImagesRootHash, bytes32 newDocumentsRootHash, uint8 status, string declineReason, uint256 timestamp)[])",

  // View: latest hashes (for verification)
  "function getLatestHashes(uint256 propertyId) external view returns (bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash)",

  // View: full version history
  "function getMetadataVersions(uint256 propertyId) external view returns (tuple(bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 timestamp, uint256 versionNo)[])",

  // View: admin check
  "function isAdmin(address account) external view returns (bool)",

  // Rental functions
  "function listForRent(uint256 propertyId, uint256 rentPriceInEther) external",
  "function rentProperty(uint256 propertyId) external payable",
  "function isForRent(uint256) external view returns (bool)",
  "function rentPrice(uint256) external view returns (uint256)",

  // submitRequest — used by backend to submit on behalf of users when minting
  "function submitRequest(tuple(string name, string location, string propertyType, uint256 price, bool isForSale, bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 bedrooms, uint256 bathrooms, uint256 sqft, uint256 parking, uint256 floors, uint256 yearBuilt) details) external payable",

  // registrationFee — needed to pass correct value with submitRequest
  "function registrationFee() external view returns (uint256)",

  // Events (used by marketplace listener)
  "event RequestApproved(uint256 indexed requestId, uint256 propertyId)",
  "event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price)",
  "event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash)",
];

// ── Singleton instances (initialised lazily) ─────────────────────────────────
let _provider = null;
let _signer = null;
let _propertyNFT = null;
let _cachedNFTAddress = null; // track address so we rebuild if it changes

function getProvider() {
  if (!_provider) {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    _provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return _provider;
}

function getSigner() {
  if (!_signer) {
    if (!process.env.GOV_PRIVATE_KEY) {
      throw new Error("GOV_PRIVATE_KEY is not set in backend/.env");
    }
    _signer = new ethers.Wallet(process.env.GOV_PRIVATE_KEY, getProvider());
  }
  return _signer;
}

function getPropertyNFT() {
  const address = process.env.PROPERTY_NFT_ADDRESS;
  if (!address || address === "0xYourContractAddressHere") {
    throw new Error(
      "PROPERTY_NFT_ADDRESS is not set in backend/.env — run: node scripts/setup-dev.mjs"
    );
  }
  // Rebuild if address changed (after redeployment without restarting backend)
  if (!_propertyNFT || _cachedNFTAddress !== address) {
    _propertyNFT = new ethers.Contract(address, PROPERTY_NFT_ABI, getSigner());
    _cachedNFTAddress = address;
  }
  return _propertyNFT;
}

// ── Contract action helpers ───────────────────────────────────────────────────

/**
 * Approve a MINT request on-chain (calls approveRequest on RealEstate.sol).
 * This mints the NFT to the requester and sets up the property on-chain.
 *
 * @param {number|string} requestId  - The on-chain requestId (numeric)
 * @returns {ethers.TransactionReceipt}
 */
async function mintPropertyOnChain(requestId) {
  const contract = getPropertyNFT();
  const tx = await contract.approveRequest(Number(requestId));
  return await tx.wait();
}

/**
 * Approve an UPDATE request on-chain.
 *
 * @param {number|string} propertyId  - On-chain propertyId (numeric tokenId)
 * @param {number}        updateIndex - Index within updateRequests[propertyId]
 * @returns {ethers.TransactionReceipt}
 */
async function approveUpdateOnChain(propertyId, updateIndex) {
  const contract = getPropertyNFT();
  const tx = await contract.approveUpdateRequest(Number(propertyId), Number(updateIndex));
  return await tx.wait();
}

/**
 * Fetch the latest on-chain metadataHash for a token.
 * Used by the verification route to compare against the DB.
 *
 * @param {number|string} tokenId
 * @returns {string} lowercase hex without 0x prefix
 */
async function getOnChainHash(tokenId) {
  const contract = getPropertyNFT();
  const [metadataHash] = await contract.getLatestHashes(Number(tokenId));
  return metadataHash.slice(2).toLowerCase();
}

/**
 * Fetch full version history from chain.
 */
async function getOnChainVersionHistory(tokenId) {
  const contract = getPropertyNFT();
  const versions = await contract.getMetadataVersions(Number(tokenId));
  return versions.map((v) => ({
    versionNo:    Number(v.versionNo),
    metadataHash: v.metadataHash.slice(2).toLowerCase(),
    timestamp:    Number(v.timestamp),
  }));
}

/**
 * Listen for PropertySold events and keep ownerWallet in DB in sync.
 * Call this once at backend startup (pass the prisma client).
 */
function startMarketplaceListener(prisma) {
  let contract;
  try {
    contract = getPropertyNFT();
  } catch (err) {
    console.warn("[chain] Marketplace listener skipped:", err.message);
    return;
  }

  contract.on("PropertySold", async (propertyId, from, to, price) => {
    const id = propertyId.toString();
    console.log(`[chain] PropertySold: token ${id} ${from} → ${to}`);
    try {
      await prisma.property.update({
        where: { tokenId: id },
        data:  { ownerWallet: to.toLowerCase() },
      });
      console.log(`[db] Updated owner of token ${id} to ${to}`);
    } catch (err) {
      console.error(`[db] Failed to update owner for token ${id}:`, err.message);
    }
  });

  console.log("[chain] Marketplace event listener started (PropertySold)");
}

module.exports = {
  getProvider,
  getSigner,
  getPropertyNFT,
  // Kept for backwards compat — same as getPropertyNFT
  getMarketplace: getPropertyNFT,
  mintPropertyOnChain,
  approveUpdateOnChain,
  getOnChainHash,
  getOnChainVersionHistory,
  startMarketplaceListener,
};
