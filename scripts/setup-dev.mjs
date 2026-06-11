/**
 * setup-dev.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Run this ONCE after starting the Hardhat node:
 *
 *   Terminal 1:  npx hardhat node
 *   Terminal 2:  node scripts/setup-dev.mjs
 *
 * What it does:
 *   1. Checks if the stored contract address is still live on the node.
 *   2. If not (node was reset), deploys a fresh RealEstate contract.
 *   3. Writes the address to frontend/.env and backend/.env.
 *   4. Prints a reminder to restart the Next.js dev server.
 *
 * With hardhat.config.js `persist` set, you only need to run this once.
 * If you restart the node WITHOUT --reset, the state (and address) is restored.
 */

import { ethers } from "ethers";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const FRONTEND_ENV = resolve(ROOT, "frontend/.env");
const BACKEND_ENV  = resolve(ROOT, "backend/.env");
const ARTIFACT     = resolve(ROOT, "artifacts/contracts/RealEstate.sol/RealEstate.json");
const RPC          = "http://127.0.0.1:8545";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readEnvValue(envPath, key) {
  if (!existsSync(envPath)) return null;
  const match = readFileSync(envPath, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

function setEnvValue(envPath, key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  if (content.match(new RegExp(`^${key}=`, "m"))) {
    content = content.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
  } else {
    content += `\n${key}=${value}\n`;
  }
  writeFileSync(envPath, content);
}

async function isContractLive(provider, address) {
  if (!address || !ethers.isAddress(address)) return false;
  try {
    const code = await provider.getCode(address);
    return code !== "0x" && code.length > 2;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const provider = new ethers.JsonRpcProvider(RPC);

// Check node is up
try {
  await provider.getBlockNumber();
} catch {
  console.error("❌ Cannot reach Hardhat node at", RPC);
  console.error("   Start it first:  npx hardhat node");
  process.exit(1);
}

console.log("✅ Hardhat node is running");

// Check existing contract address from frontend .env
const existingAddr = readEnvValue(FRONTEND_ENV, "NEXT_PUBLIC_CONTRACT_ADDRESS");
const isLive = await isContractLive(provider, existingAddr);

if (isLive) {
  console.log(`✅ Contract already live at ${existingAddr}`);
  console.log("   No deployment needed. Start/restart frontend & backend.");
  process.exit(0);
}

console.log(existingAddr
  ? `⚠️  Contract at ${existingAddr} is gone (node was reset). Redeploying…`
  : "ℹ️  No contract address found. Deploying…"
);

// Load artifact
if (!existsSync(ARTIFACT)) {
  console.error("❌ Artifact missing. Run:  npx hardhat compile");
  process.exit(1);
}
const artifact = JSON.parse(readFileSync(ARTIFACT, "utf8"));

// Deploy
const signer = await provider.getSigner(0);
const deployer = await signer.getAddress();
console.log("Deployer:", deployer);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(deployer); // deployer = gov wallet
await contract.waitForDeployment();
const addr = await contract.getAddress();

// Update .env files
setEnvValue(FRONTEND_ENV, "NEXT_PUBLIC_CONTRACT_ADDRESS", addr);
setEnvValue(BACKEND_ENV,  "PROPERTY_NFT_ADDRESS", addr);
// Remove stale duplicate line in backend/.env if present
const backendContent = readFileSync(BACKEND_ENV, "utf8");
if ((backendContent.match(/^NEXT_PUBLIC_CONTRACT_ADDRESS=/gm) || []).length > 0) {
  writeFileSync(BACKEND_ENV,
    backendContent.replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*\n?/gm, "")
  );
}

// Copy ABI to frontend
const frontendAbi = resolve(ROOT, "frontend/abi/RealEstate.json");
writeFileSync(frontendAbi, JSON.stringify(artifact, null, 2));

console.log("\n══════════════════════════════════════════════════════════════");
console.log("  ✅ RealEstate deployed to:", addr);
console.log("  ✅ frontend/.env updated");
console.log("  ✅ backend/.env updated");
console.log("  ✅ frontend/abi/RealEstate.json updated");
console.log("\n  ⚡ NEXT STEPS:");
console.log("     1. Restart backend:   cd backend && npm start");
console.log("     2. Restart frontend:  cd frontend && npm run dev");
console.log("        (MUST restart — Next.js caches env vars at build time)");
console.log("══════════════════════════════════════════════════════════════\n");
