import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Landing } from "./Landing";

import { ethers } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const instance = await web3Modal.connect();

const provider = new ethers.providers.Web3Provider(instance);
const signer = provider.getSigner();

function App() {
  return (
    <>
      <Landing />
    </>
  );
}

export default App;
