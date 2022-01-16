import "./landing.css";
import ConnectWallet from "./ConnectWallet";
import { useMonkeyRegistry } from "./contracts";
import { useEffect, useState } from "react";
import {Signer} from "ethers";

export function Landing() {
  const [signer, setSigner] = useState<Signer>()
  const registry = useMonkeyRegistry(signer);

  useEffect(() => {
    if (registry) {
      registry.adopt();
    }
  }, [registry])

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
          <ConnectWallet onConnected={(signer) => {setSigner(signer)}} />
        </div>
      </div>
    </>
  );
}
