import "./feed.css";
import { BigNumber, Signer } from "ethers";
import { useMonkeyActions } from "./contracts";
import { useBananas, useMonkey } from "./hooks";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import Bananas from "./Bananas";

interface FeedProps {
  signer: Signer;
  monkeyId: number;
}

export default function Feed({ signer, monkeyId }: FeedProps) {
  const monkeyActions = useMonkeyActions(signer);
  const monkey = useMonkey(monkeyId, signer);
  const [energyPerEth, setEnergyPerEth] = useState<BigNumber>();
  const [energyPerBanana, setEnergyPerBanana] = useState<BigNumber>();
  const [bananaCount, setBananaCount] = useState<string>();
  const [eth, setEth] = useState<string>();
  const banana = useBananas(signer);
  useEffect(() => {
    if (monkeyActions) {
      monkeyActions.ENERGY_PER_ETH().then(setEnergyPerEth);
      monkeyActions.ENERGY_PER_BANANA().then(setEnergyPerBanana);
    }
  }, [monkeyActions]);
  return (
    <>
      <div className="feed-wrapper">
        <Bananas amount={banana.amount ?? "?"} />
        <h1 className="feed-title">Feed</h1>
        <div className="feed-spacer" />
        <div className="feed-stats">
          <img src={monkey.nft?.image} />
          <div className="feed-top-buttons">
            <h3>{monkey.nft?.name?.toUpperCase()}</h3>
            {monkey.stats && (
              <h3>Energy: {formatEther(monkey.stats.energy)}</h3>
            )}
          </div>
        </div>
        <div className="feed-spacer" />
        <div className="feed-eth">
          <div className="feed-tokens">
            <div className="bundle">
              <h3>Ethereum</h3>
              <div className="feed-details">
                <input
                  className="token-input"
                  placeholder="ETH"
                  type="number"
                  min="0"
                  value={eth}
                  onChange={(e) => setEth(e.target.value)}
                />
                <h3 id="arrow">➡️</h3>
                <button id="energy-added" onClick={async () => {
                  if (monkeyActions && eth) {
                    const tx = await monkeyActions
                      .feedEth(monkeyId, { value: parseEther(eth) });
                    setEth(undefined);
                    await tx.wait();
                    monkey.refresh();
                  }
                }}>
                  {energyPerEth && eth
                    ? formatEther(parseEther(eth).mul(energyPerEth))
                    : "Add Energy"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="feed-spacer" />
        <div className="feed-banana">
          <div className="feed-tokens">
            <div className="bundle">
              <h3>Banana</h3>
              <div className="feed-details">
                <input
                  className="token-input"
                  placeholder="Banana"
                  type="number"
                  min="0"
                  value={bananaCount}
                  onChange={(e) => setBananaCount(e.target.value)}
                />
                <h3 id="arrow">➡️</h3>
                <button id="energy-added" onClick={async () => {
                  if (monkeyActions && bananaCount) {
                    const tx = await monkeyActions
                      .feedBanana(monkeyId, parseEther(bananaCount));
                    setBananaCount(undefined);
                    await tx.wait();
                    monkey.refresh();
                    banana.refresh();
                  }
                }} >
                  {energyPerBanana && bananaCount
                    ? formatEther(parseEther(bananaCount).mul(energyPerBanana))
                    : "Add Energy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
