import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {
    // Receiving paramters
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
      throw new Error("Parameters not provided");
    const _targetContract = parameters[0];

    //Congfiguring Provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "https://sepolia.gateway.pokt.network/v1/lb/1a873e75");
    const lastBlock = await provider.getBlock('latest');
    console.log(`Last block number: ${lastBlock?.number}`);
    const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
    const lastBlockDate = new Date(lastBlockTimestamp * 1000);
    console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} 
    ${lastBlockDate.toLocaleTimeString()})`);

    //Configuring wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);;
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
      throw new Error("Not enough ether");
}

    // Attach Contract using Typechain
    const TokenizedBallotFactory = new TokenizedBallot__factory(wallet);
    const TokenizedBallotContract = TokenizedBallotFactory.attach(_targetContract) as TokenizedBallot;
    const tx = await TokenizedBallotContract.winningProposal();
    console.log(`Winning vote is: ${tx}!`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });