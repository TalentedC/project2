// SPDX-License-Identifier: MIT
// Import ReentrancyGuard from OpenZeppelin Contracts
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
    
}

contract TokenizedBallot is ReentrancyGuard {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;

    //Validate if targetBlockNumber is in the past

        require(
            targetBlockNumber < block.number,
            "Block number must be in the past"
        );
        
        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        require(proposal < proposals.length, "Invalid proposal index");
        require(
            votingPower(msg.sender) >= amount,
            "TokenizedBallot: trying to vote more than allowed"
        );
        proposals[proposal].voteCount += amount;
    }

    function votingPower(address account) public view returns (uint256) {
        uint256 value =  tokenContract.getPastVotes(account, targetBlockNumber);
        require(value > 0, 
        "This address has 0 voting power. Did you self delegated?");
        return value;

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