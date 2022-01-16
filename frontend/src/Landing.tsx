import react from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import backgroundImage from "./assets/landing.png";
import "./landing.css";
import ConnectWallet from "./ConnectWallet";

export function Landing() {
  return (
    <>
      <div className="title">
        <div>
          <h1>Monkey Protocol</h1>
          <h3>
            Feed, nurse, and take your monkey on expeditions<br></br> to train
            the coolest monkey.
          </h3>
        </div>
        <div className="buttons">
          <ConnectWallet onConnected={() => {}} />
        </div>
      </div>
    </>
  );
}
