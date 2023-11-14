import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
import { MyToken, MyToken__factory} from "../typechain-types";
const MINT_VALUE = ethers.parseUnits("1");
dotenv.config();

async function main() {

    //Asking for the TokenizedBallot contract address via parameter

    const parameters = process.argv.slice(2)
    if (!parameters || parameters.length < 1)
    throw new Error("Contract address not provided");
    const contractAddress = parameters[0];
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
   
    //Attaching the smartcontract using typechain
    const ballotFactory = new MyToken__factory(wallet);
    const ballotContract = ballotFactory.attach(contractAddress) as MyToken;
   
    
    const [deployer, acc1, acc2] = await ethers.getSigners();
    const mintTx = await ballotContract.mint(acc1.address, MINT_VALUE);
    await mintTx.wait();
    const balanceBN = await ballotContract.balanceOf(acc1.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(
      `Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.address}\n`
    );
  
    console.log(
      `Account ${
        acc1.address
      } has ${balanceBN.toString()} decimal units of MyToken\n`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});