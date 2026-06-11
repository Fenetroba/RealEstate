import { ethers } from "ethers";
import { readFileSync } from "fs";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const hardhatSigner = await provider.getSigner(0);

const yourAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// // Fund your MetaMask with 100 ETH
// console.log("💸 Funding your MetaMask wallet...");
// const fundTx = await hardhatSigner.sendTransaction({
//   to: yourAddress,
//   value: ethers.parseEther("100"),
// });
// await fundTx.wait();
// console.log("✅ Sent 100 ETH to", yourAddress);

// Grant ADMIN_ROLE to your MetaMask
console.log("🔑 Granting Admin role to your wallet...");
const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/RealEstate.sol/RealEstate.json", "utf8")
);
const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, hardhatSigner);

const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const tx1 = await contract.grantRole(ADMIN_ROLE, yourAddress);
await tx1.wait();
console.log("✅ ADMIN_ROLE granted to", yourAddress);

const tx2 = await contract.grantRole(DEFAULT_ADMIN_ROLE, yourAddress);
await tx2.wait();
console.log("✅ DEFAULT_ADMIN_ROLE granted to", yourAddress);

console.log("🎉 You are now the contract admin — minting and approving will work!");