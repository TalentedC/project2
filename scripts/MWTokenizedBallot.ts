import { ethers } from "hardhat";
import { TokenizedBallot__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();

const PROPOSALS = ["Bitcoin", "Ethereum", "Pepe"];

async function main() {

    console.log("Deploying Tokenized Ballot");
    console.log("Proposals: ");
    PROPOSALS.forEach((element, index) => {
      console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
      throw new Error("Parameters not provided");
      const contractAddress = parameters[0];
      const targetBlockNumber = 	4679932; // change to desired block number


    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const lastBlock = await provider.getBlock('latest');
    console.log(`Last block number: ${lastBlock?.number}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);;
    console.log(`Using address ${wallet.address}`);
const balanceBN = await provider.getBalance(wallet.address);
const balance = Number(ethers.formatUnits(balanceBN));
console.log(`Wallet balance ${balance} ETH`);

    const deployerOne = wallet;
  

    const ballotFactory = new TokenizedBallot__factory(deployerOne);
    const ballotContract = await ballotFactory.deploy(PROPOSALS.map(ethers.encodeBytes32String), contractAddress, targetBlockNumber as any);
    await ballotContract.waitForDeployment();
    const ballotContractAddress = await ballotContract.getAddress();
    console.log(`Tokenized Ballot Contract deployed to ${ballotContractAddress}`);
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