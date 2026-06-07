import { ethers } from "ethers";
import { readFileSync } from "fs";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner(0);

console.log("Deploying with account:", await signer.getAddress());

const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/RealEstate.sol/RealEstate.json", "utf8")
);

// Your MetaMask wallet = government wallet (receives commission)
const governmentWallet = "0x838c47Aa5F37C5532940877E42D7da2c93C10a6F";

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(governmentWallet);
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log("✅ RealEstate deployed to(Contract Address):", address);
console.log("📋 Government wallet (commission receiver):", governmentWallet);
console.log("📋 Copy contract address for frontend!");