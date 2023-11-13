import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
dotenv.config();

async function main() {

    //Asking for the TokenizedBallot contract address via parameter

    const parameters = process.argv.slice(2)
    if (!parameters || parameters.length < 2)
    throw new Error("Contract address not provided");
    const _contractAddress = parameters[0];
    const proposalNumber = parameters[1];
    const votingAmount = parameters[2];
    console.log(`TokenizedBallot contract address: ${_contractAddress}`);

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

    //Attaching the smartcontract using typechain

    const tballotFactory = new TokenizedBallot__factory(wallet);
    const tballotContract = tballotFactory.attach(_contractAddress) as TokenizedBallot;
    const votingtx = await tballotContract.vote(proposalNumber, votingAmount);
    const receipt = await votingtx.wait();
    console.log(`You Voted!!! ${receipt?.hash}`)
    const mostVoted = tballotContract.winningProposal();
    console.log(`The most voted proposal right now is ${mostVoted}`);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});