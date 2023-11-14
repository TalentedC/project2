import { ethers } from "ethers";
import { TokenizedBallot__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();
const PROPOSALS = ["Vanilla", "Coconut", "Chocolatemint"];


async function main() {

  //Printing Proposals
  console.log("Deploying TokenizedBallot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
  console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  //Asking token contract address from parameters
  const parameters = process.argv.slice(2)
  if (!parameters || parameters.length < 1)
  throw new Error ("Contract address not provided");
  const contractAddress = parameters[0];
  const targetBlockNumber = 4000000;
  console.log(`Token contract address: ${contractAddress}`);
  

  //Configuring the provider
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const lastBlock = await provider.getBlock('latest');
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`);

  //Configuring the wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
    throw new Error("Not enough ether");
    }

  //Deploying the smartcontract using typechain
  
  const tokenizedBallot = new TokenizedBallot__factory(wallet);
  const ballotContract = await tokenizedBallot.deploy(PROPOSALS.map(ethers.encodeBytes32String), contractAddress, targetBlockNumber);
  await ballotContract.waitForDeployment();
  console.log(`Contract deployed to ${ballotContract.target}`);
  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal });
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

