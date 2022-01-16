import "./feed.css";
import { BigNumber, Signer } from "ethers";
import { useMonkeyActions } from "./contracts";
import { useMonkey } from "./hooks";
import { formatEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";

interface FeedProps {
  signer: Signer;
  monkeyId: number;
}

export default function Feed({ signer, monkeyId }: FeedProps) {
  const monkeyActions = useMonkeyActions(signer);
  const monkey = useMonkey(monkeyId, signer);
  const [energyPerEth, setEnergyPerEth] = useState<BigNumber>();
  const [energyPerBanana, setEnergyPerBanana] = useState<BigNumber>();
  useEffect(() => {
    if (monkeyActions) {
      monkeyActions.ENERGY_PER_ETH().then(setEnergyPerEth);
      monkeyActions.ENERGY_PER_BANANA().then(setEnergyPerBanana);
    }
  }, [monkeyActions]);
  return (
    <>
      <div className="feed-wrapper">
        <h1 className="feed-title">Feed</h1>
        <br></br>
        <div className="feed-stats">
          <img src={monkey.nft?.image} />
          <div className="feed-top-buttons">
            <h3>{monkey.nft?.name?.toUpperCase()}</h3>
            {monkey.stats && (
              <h3>Energy: {formatEther(monkey.stats.energy)}</h3>
            )}
          </div>
        </div>
        <br></br>
        <div className="feed-eth">
          <div className="feed-tokens">
            <img src={monkey.nft?.image} />
            <div className="bundle">
              <h3>Ethereum</h3>
              <div className="feed-details">
                <h3 id="token-input">
                  <input placeholder="# of Ethereum" />
                </h3>
                <h3 id="arrow">➡️</h3>
                <button id="energy-added">Add Energy</button>
              </div>
            </div>
          </div>
        </div>
        <br></br>
        <div className="feed-banana">
          <div className="feed-tokens">
            <img src={monkey.nft?.image} />
            <div className="bundle">
              <h3>Banana</h3>
              <div className="feed-details">
                <h3 id="token-input">
                  <input placeholder="#of Banana: 40/50" />
                </h3>
                <h3 id="arrow">➡️</h3>
                <button id="energy-added">Add Energy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
