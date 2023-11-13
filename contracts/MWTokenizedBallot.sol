// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Interface taking one function from larger contract (openzep erc20 voting from MyToken.sol)
interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
    function getVotes(address account) external view returns (uint256);
}

// main contract (name) w/ struct? of proposal name and votecount
contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

// state variables of the contract - targetcontract - holds token contract instance. 
// Proposals - array to store supplied proposals
// tbn the targetblocknumber for voting values to be taken from
    IMyToken public targetContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

// constructor function only executed once when deploying contract. Initialises contract with proposal name array.
// Also with a supplied targetBlockNumber. 
    constructor(
        bytes32[] memory _proposalNames,
        address _targetContract,
        uint256 _targetBlockNumber
        
    ) {
        targetContract = IMyToken(_targetContract);
        targetBlockNumber = _targetBlockNumber;
        require(targetBlockNumber < block.number, "TokenizedBallot: Target block number must be in the past");
        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

// Allows users to vote on a proposal with certain amount of tokens. IT also checks whether the user has  enough voting power.
// updates vote count for that particular proposal.
        function vote(uint256 proposal, uint256 amount) external {
        require(
            votingPower(msg.sender) >= amount,
            "TokenizedBallot: Trying to vote more than allowed");
            proposals[proposal].voteCount += amount;
    }

// Returns voting power of supplied address 
    function votingPower(address account) public view returns (uint256) {
        require(targetBlockNumber < block.number, "TokenizedBallot: Target block number must be in the past");

        return targetContract.getPastVotes(account, targetBlockNumber);
        
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}