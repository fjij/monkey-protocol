import { ethers, Signer } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    /*options: {
      infuraId: "INFURA_ID", // required
    },*/
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

interface ConnectWalletProps {
  onConnected: (signer: Signer) => void;
}

export default function ConnectWallet({ onConnected }: ConnectWalletProps) {
  return (
    <button
      onClick={async () => {
        const instance = await web3Modal.connect();

        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        onConnected(signer);
      }}
    >
      Launch App
    </button>
  );
}
