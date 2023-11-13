import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider)
  const contractFactory = new MyToken__factory(wallet);
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});