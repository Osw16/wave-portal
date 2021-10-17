import React, { useEffect,useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
const App = () => {
  const contractABI = abi.abi;
 /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x948149A5292a995Bdd3E0F07376e53BB92A6320a";
  // const contractAddress = "0xE035cEdcfD38DF75f7E6c971895252B74121e4e4";
  // const contractAddress = "0x4064db9089c695eE7e14c9C17652F488674EC0B1";
  // contract registered with =+ 1
  // const contractAddress = "0xB7BfD86Dc6e89A90c3690cD7d8F85C83150850b3";
const getAllWaves = async () =>{
  try{
    const {ethereum} = window;
    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract =new ethers.Contract(contractAddress, contractABI, signer);

      // call the getAllWaves method from your Smart Contract
      const waves = await wavePortalContract.getAllWaves();

      // get address, timestamp, and message in IU
      let wavesCleaned =[];
      waves.forEach(wave =>{
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp *1000),
          message: wave.message
        });
      });

      // store our data in react state
      setAllWaves(wavesCleaned);

      // Listen in for emitter events!
      wavePortalContract.on("NewWave",(from,timestamp,message)=>{
        console.log("NewWave", from, timestamp,message);

        setAllWaves(prevState =>[...prevState,{
          address:from,
          timestamp: new Date(timestamp * 1000),
          message: message
        }])
      })
    }else{
      console.log("Ethereum object doesn't exist!")
    }
  }catch(error){
    console.log(error);
  }
}
  

  const checkIfWalletIsConnected = async() => {
    try{
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      // calling function
      getAllWaves();
      console.log("We have the ethereum object", ethereum);
    }

   /*
      * Check if we're authorized to access the user's wallet
      */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !==0){
      const account = accounts[0];
      console.log("Found an authorized account:",account);
      // setCurrentAccount(account)
    }else{
      console.log("No authorized account found")
    } 
    }catch(error){
      console.log(error);
    }
  }
   /**
  * Implement your connectWallet method here
  */

  const connectWallet = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error)
    }
  }

  /*
  * ethers is a library that helps our frontend talk to our contract. Be sure to import it at the top using import { ethers } from "ethers";.
  */

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You're using contractABI here
        */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave({ gasLimit:30000});
        console.log("Mining...",waveTxn.hash);
        // const waveTxn = await wavePortalContract.wave("this is a message",{ gasLimit:30000});

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}


  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
       Comunidad ETH <span role="img" aria-label="hat">🧢</span> 
        </div>

        <div className="bio">
        I am r0cket07 and I worked in web development and now in web3.  Connect your Ethereum wallet and wave at me!
        </div>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        
          {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

         <div className="txn-number">
        Here You'll see the TXN Number...
        </div>
        {allWaves.map((wave,index)=>{
          return(
              <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App
