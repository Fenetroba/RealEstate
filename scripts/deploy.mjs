/**
 * deploy.mjs
 * Deploys the RealEstate.sol marketplace + NFT contract to the local Hardhat node,
 * then automatically writes the new address to both:
 *   - frontend/.env          (NEXT_PUBLIC_CONTRACT_ADDRESS)
 *   - backend/.env           (PROPERTY_NFT_ADDRESS)
 *
 * Usage:
 *   1. Start Hardhat:   npx hardhat node
 *   2. Deploy:          node scripts/deploy.mjs
 *   3. Restart backend & frontend (pick up new address)
 */

import { ethers } from "ethers";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Connect to Hardhat node ───────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner(0);
const deployerAddress = await signer.getAddress();
console.log("Deployer (Hardhat account #0):", deployerAddress);

// ── Load compiled RealEstate artifact ────────────────────────────────────────
const artifactPath = resolve(ROOT, "artifacts/contracts/RealEstate.sol/RealEstate.json");
if (!existsSync(artifactPath)) {
  console.error("❌ Artifact not found. Run: npx hardhat compile");
  process.exit(1);
}
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

// ── Deploy RealEstate ─────────────────────────────────────────────────────────
// Government wallet = Hardhat account #0 (receives commissions + is the admin)
const governmentWallet = deployerAddress;

console.log("\nDeploying RealEstate contract...");
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(governmentWallet);
await contract.waitForDeployment();

const contractAddress = await contract.getAddress();
console.log("✅ RealEstate deployed to:", contractAddress);
console.log("   Government wallet (commissions):", governmentWallet);

// ── Update frontend/.env ──────────────────────────────────────────────────────
const frontendEnvPath = resolve(ROOT, "frontend/.env");
let frontendEnv = existsSync(frontendEnvPath) ? readFileSync(frontendEnvPath, "utf8") : "";

if (frontendEnv.match(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*/m)) {
  frontendEnv = frontendEnv.replace(
    /^NEXT_PUBLIC_CONTRACT_ADDRESS=.*/m,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
  );
} else {
  frontendEnv += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
}
writeFileSync(frontendEnvPath, frontendEnv);
console.log("✅ Updated frontend/.env NEXT_PUBLIC_CONTRACT_ADDRESS =", contractAddress);

// ── Update backend/.env ───────────────────────────────────────────────────────
const backendEnvPath = resolve(ROOT, "backend/.env");
let backendEnv = existsSync(backendEnvPath) ? readFileSync(backendEnvPath, "utf8") : "";

if (backendEnv.match(/^PROPERTY_NFT_ADDRESS=.*/m)) {
  backendEnv = backendEnv.replace(
    /^PROPERTY_NFT_ADDRESS=.*/m,
    `PROPERTY_NFT_ADDRESS=${contractAddress}`
  );
} else {
  backendEnv += `\nPROPERTY_NFT_ADDRESS=${contractAddress}\n`;
}

// Also update the stale NEXT_PUBLIC_CONTRACT_ADDRESS line if it's in backend/.env
if (backendEnv.match(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*/m)) {
  backendEnv = backendEnv.replace(
    /^NEXT_PUBLIC_CONTRACT_ADDRESS=.*/m,
    `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
  );
}

writeFileSync(backendEnvPath, backendEnv);
console.log("✅ Updated backend/.env  PROPERTY_NFT_ADDRESS =", contractAddress);

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════");
console.log("  Deployment complete!");
console.log("  Contract address:", contractAddress);
console.log("  Restart your backend and frontend to pick up the new address.");
console.log("══════════════════════════════════════════════════════\n");
