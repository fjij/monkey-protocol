import "./landing.css";
import ConnectWallet from "./ConnectWallet";
import { Signer } from "ethers";
import LandingBackground from "./assets/landing.png";

interface LandingProps {
  onConnected: (signer: Signer) => void;
}

export function Landing({ onConnected }: LandingProps) {
  return (
    <>
      <div
        className="L-background"
        style={{ backgroundImage: `url(${LandingBackground})` }}
      >
        <div className="title">
          <div>
            <h1>Monkey Protocol</h1>
            <h3>
              Feed, nurse, and take your monkey on expeditions<br></br> to train
              the coolest monkey.
            </h3>
          </div>
          <div className="buttons">
            <ConnectWallet onConnected={onConnected} />
          </div>
        </div>
      </div>
    </>
  );
}
