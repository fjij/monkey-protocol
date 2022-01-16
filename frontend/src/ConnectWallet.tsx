import { ethers, Signer } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {
};

const web3Modal = new Web3Modal({
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
        instance.on("chainChanged", () => {
          const provider = new ethers.providers.Web3Provider(instance);
          onConnected(provider.getSigner());
        });
        const provider = new ethers.providers.Web3Provider(instance);
        onConnected(provider.getSigner());
      }}
    >
      Launch App
    </button>
  );
}
