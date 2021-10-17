// SPDX-License-Identifier: UNLICENSED 

// solidity compiler version (nothing lower)
pragma solidity ^0.8.0;

// hardhat is a etherium enviroment to debug smart contracts 
import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    // we will be using this below to help generate a random number
    uint256 private seed;

    // events
    event NewWave(address indexed from, uint256 timestamp, string message);
    // struct
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }
    // variable waves
        Wave[] waves;

     /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */    
    mapping(address => uint256) public lastWavedAt;

    constructor() payable{
        console.log("I am a smartC and we have been construted!");
    }
    
    // now it requires a string called _message. This is the message our user
    // sends us from the frontend!
    function wave(string memory _message) public{
        // We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
        require(
            lastWavedAt[msg.sender]+30 seconds < block.timestamp,
            "Sorry, you must wait 30 seconds before waving again."
        );
        // update the current timestamp we have for the user 
        lastWavedAt[msg.sender]= block.timestamp;
        
        totalWaves +=1;
        console.log("%s has waved!",msg.sender);
        // here i'm storing the wave data in the array
        waves.push(Wave(msg.sender,_message, block.timestamp));
        // generate a pseudo random number between 0 and 100;
        uint256 randomNumber = (block.difficulty + block.timestamp + seed)%100;
        console.log("Random # generated: %s",randomNumber);
        // set the generated random number as the seed for the next wave
        seed = randomNumber;
        if(randomNumber < 50){
            console.log("%s won!", msg.sender);

        uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
        (bool success,)=(msg.sender).call{value:prizeAmount}("");
        require(success,"Failed to withdraw money from contract.");
        }
        // emit the event
        emit NewWave(msg.sender, block.timestamp, _message);
    }
    
    function getAllWaves() public view returns (Wave[] memory){
        return waves;
    }

    function getTotalWaves() public view returns (uint256){
        console.log("We've %d total waves!", totalWaves);
        return totalWaves;
    }
}