// utils/contract.js (BACKEND)
// Uses the government private key to sign transactions.
// NEVER import this file in the frontend.

const { ethers } = require("ethers");

// ── Minimal ABIs (only the functions the backend calls) ──────────────────────
// Add your full ABI here once you have the compiled artifacts.
// For now these cover the functions the backend routes will call.

const PROPERTY_NFT_ABI = [
  // Admin approval — this is what your contract actually has
  "function approveRequest(uint256 requestId) external","function declineRequest(uint256 requestId, string reason) external",
  "function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) external",
  "function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string reason) external",
  "function getUpdateRequests(uint256 propertyId) external view returns (tuple(uint256 id, uint256 propertyId, address requester, bytes32 newMetadataHash, bytes32 newImagesRootHash, bytes32 newDocumentsRootHash, uint8 status, string declineReason, uint256 timestamp)[])",

  // View
  "function getLatestHashes(uint256 propertyId) external view returns (bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash)",
  "function getMetadataVersions(uint256 propertyId) external view returns (tuple(bytes32 metadataHash, bytes32 imagesRootHash, bytes32 documentsRootHash, uint256 timestamp, uint256 versionNo)[])",
  "function isAdmin(address account) external view returns (bool)",

  // Events
  "event RequestApproved(uint256 indexed requestId, uint256 propertyId)",
  "event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price)",
  "event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash)",
];

const MARKETPLACE_ABI = [
  // Events the backend listens to for ownership sync
  "event PropertySold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)",
];

// ── Singleton provider + signer ──────────────────────────────────────────────
let _provider = null;
let _signer = null;
let _propertyNFT = null;
let _marketplace = null;

function getProvider() {
  if (!_provider) {
    _provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }
  return _provider;
}

function getSigner() {
  if (!_signer) {
    if (!process.env.GOV_PRIVATE_KEY) {
      throw new Error("GOV_PRIVATE_KEY is not set in .env");
    }
    _signer = new ethers.Wallet(process.env.GOV_PRIVATE_KEY, getProvider());
  }
  return _signer;
}

function getPropertyNFT() {
  if (!_propertyNFT) {
    if (!process.env.PROPERTY_NFT_ADDRESS) {
      throw new Error("PROPERTY_NFT_ADDRESS is not set in .env");
    }
    _propertyNFT = new ethers.Contract(
      process.env.PROPERTY_NFT_ADDRESS,
      PROPERTY_NFT_ABI,
      getSigner() // gov't signer — can write
    );
  }
  return _propertyNFT;
}

function getMarketplace() {
  if (!_marketplace) {
    if (!process.env.MARKETPLACE_ADDRESS) {
      throw new Error("MARKETPLACE_ADDRESS is not set in .env");
    }
    _marketplace = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      getProvider() // read-only provider for event listening
    );
  }
  return _marketplace;
}

// ── Contract action helpers ──────────────────────────────────────────────────

/**
 * Mint a new property NFT on-chain.
 * Called by admin approval route after DB is updated.
 *
 * @param {string} tokenId         - NFT token ID (numeric string)
 * @param {string} metadataHash    - 64-char hex (no 0x prefix)
 * @param {string} imagesRootHash  - 64-char hex
 * @param {string} documentsRootHash - 64-char hex
 * @returns {ethers.TransactionReceipt}
 */
async function mintPropertyOnChain(requestId) {
  const contract = getPropertyNFT();
  const tx = await contract.approveRequest(requestId);
  return await tx.wait();
}

/**
 * Approve an update request on-chain.
 */
async function approveUpdateOnChain(propertyId, updateIndex) {
  console.log("[approveUpdateOnChain] propertyId:", propertyId, "updateIndex:", updateIndex);
  const contract = getPropertyNFT();
  const tx = await contract.approveUpdateRequest(propertyId, updateIndex);
  return await tx.wait();
}

/**
 * Fetch the current on-chain hash for a token (for verification).
 * Returns the raw bytes32 as a hex string.
 */
async function getOnChainHash(tokenId) {
  const contract = getPropertyNFT();
  // Use getLatestHashes which exists in your RealEstate.sol
  const [metadataHash] = await contract.getLatestHashes(tokenId);
  return metadataHash.slice(2).toLowerCase();
}

/**
 * Fetch full version history from chain.
 */
async function getOnChainVersionHistory(tokenId) {
  const contract = getPropertyNFT();
  const versions = await contract.getMetadataVersions(tokenId);
  return versions.map((v) => ({
    versionNo:    Number(v.versionNo),
    metadataHash: v.metadataHash.slice(2).toLowerCase(),
    timestamp:    Number(v.timestamp),
  }));
}

// ── Marketplace event listener ───────────────────────────────────────────────
// Call this once at startup (in index.js) to keep ownerWallet in sync.

function startMarketplaceListener(prisma) {
  const marketplace = getMarketplace();

  marketplace.on("PropertySold", async (tokenId, from, to, price) => {
    const id = tokenId.toString();
    console.log(`[chain] PropertySold: token ${id} → ${to}`);

    try {
      await prisma.property.update({
        where: { tokenId: id },
        data: { ownerWallet: to.toLowerCase() },
      });
      console.log(`[db] Updated owner of token ${id} to ${to}`);
    } catch (err) {
      console.error(`[db] Failed to update owner for token ${id}:`, err.message);
    }
  });

  console.log("[chain] Marketplace event listener started");
}

module.exports = {
  getProvider,
  getSigner,
  getPropertyNFT,
  getMarketplace,
  mintPropertyOnChain,
  approveUpdateOnChain,
  getOnChainHash,
  getOnChainVersionHistory,
  startMarketplaceListener,
};
