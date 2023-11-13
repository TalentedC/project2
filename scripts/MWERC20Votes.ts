import { ethers } from "hardhat";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();

const MINT_VALUE = ethers.parseUnits("1");


async function main() {

    console.log("Deploying MyToken");

    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);;
    console.log(`Using address ${wallet.address}`);

    const deployer = wallet;
    const acc1 = wallet;
    const contractFactory = new MyToken__factory(deployer);
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Token contract deployed at ${contractAddress}\n`);


        // mint transaction mints from contract to account 1 with mint value set as constant above
        const mintTx = await contract.mint(acc1.address, MINT_VALUE);
        // wait for mint transaction to proceed
        await mintTx.wait();
        // Display mint value and to the address it has been minted to
        console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.address}\n`
        );
        // find the balance of tokens now in address
        const balanceBN = await contract.balanceOf(acc1.address);
        // Display balance at address
        console.log(`Account ${acc1.address } has ${balanceBN.toString()} decimal units of MyToken\n`);
    
        const votes = await contract.getVotes(acc1.address);
        console.log(`Account ${acc1.address} has ${votes.toString()} units of voting power before self delegating\n`);
    
        // self delegate so that you have voting power. Wait to connect to acc1 and delegate to acc1 address
        const delegateTx = await contract.connect(acc1).delegate(acc1.address);
        // wait for delegation address to go through
        await delegateTx.wait();
        // see whether delegation has occured by checking how many votes acc1 has
        const votesAfter = await contract.getVotes(acc1.address);
        // display
        console.log(`Account ${acc1.address} has ${votesAfter.toString()} units of voting power after self delegating\n`);
        // delegate block 

        const lastBlock = await ethers.provider.getBlock("latest") 
        const lastBlockNumber = lastBlock?.number ?? 0;
        for (let index = lastBlockNumber - 1; index > 0; index--) {
        const pastVotes = await contract.getPastVotes(acc1.address, index);
        console.log(`Account ${acc1.address} had ${pastVotes.toString()} units of voting power at block ${index}\n`);
}

    }

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
