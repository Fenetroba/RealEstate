import { ethers } from "ethers";
import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Connect directly to the local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner();

console.log("Deploying with account:", await signer.getAddress());

// Load the compiled contract artifact
const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/RealEstate.sol/RealEstate.json", "utf8")
);

// Deploy
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy();
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log("✅ RealEstate deployed to(Contract Address):", address);
console.log("📋 Copy this address — you'll need it for the frontend!");