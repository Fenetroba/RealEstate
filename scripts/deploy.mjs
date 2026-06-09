import { ethers } from "ethers";
import { readFileSync } from "fs";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = await provider.getSigner(0);

console.log("Deploying with account:", await signer.getAddress());

const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/RealEstate.sol/RealEstate.json", "utf8")
);

// Your MetaMask wallet = government wallet (receives commission)
const governmentWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const contract = await factory.deploy(governmentWallet);
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log("✅ RealEstate deployed to(Contract Address):", address);
console.log("📋 Government wallet (commission receiver):", governmentWallet);
console.log("📋 Copy contract address for frontend!");