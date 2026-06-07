import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const hardhatSigner = await provider.getSigner(0);

// Replace with whichever account needs funding
const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const tx = await hardhatSigner.sendTransaction({
  to: targetAddress,
  value: ethers.parseEther("100"),
});
await tx.wait();
console.log("✅ Sent 100 ETH to", targetAddress);