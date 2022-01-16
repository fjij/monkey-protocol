import { BigNumber, Signer } from "ethers";
import Bed from "./assets/bed.png";
import { ethers } from "ethers";
import { useMonkeyActions } from "./contracts";
import { useMonkey } from "./hooks";
import { formatEther } from "ethers/lib/utils";
import "./daycare.css";

interface DayCareProps {
  signer: Signer;
  monkeyId: number;
}

export default function Daycare({ signer, monkeyId }: DayCareProps) {
  const monkeyActions = useMonkeyActions(signer);
  const monkey = useMonkey(monkeyId, signer);
  //monkey.daycare?.started; //time he entered daycare
  //monkey.daycare?.ongoing; //boolean true if in
  return (
    <>
      <div className="daycare-wrapper">
        <h1 className="daycare-title">Daycare</h1>
        <div className="daycare-stats">
          <h3>{monkey.nft?.name?.toUpperCase()}</h3>
          {monkey.stats && <h3>Total XP: {formatEther(monkey.stats.xp)}</h3>}
        </div>
        <div className="parent">
          <img id="bed" src={Bed} />
          {monkey.daycare?.ongoing && (
            <img id="monkey" src={monkey.nft?.image} />
          )}
        </div>
        <div className="daycare-futures">
          {monkey.daycare?.ongoing && (
            <h3>
              Time Stayed:{" "}
              {monkey.daycare &&
                (
                  Date.now() / 1000 -
                  monkey.daycare.started?.toNumber()
                ).toFixed(0)}{" "}
              seconds
            </h3>
          )}
          <div className="buttons">
            {!monkey.daycare?.ongoing && (
              <button
                onClick={async () => {
                  if (monkeyActions) {
                    const tx = await monkeyActions.startDaycare(monkeyId);
                    const receipt = await tx.wait();
                    monkey.refresh();
                  }
                }}
              >
                Drop Off
              </button>
            )}
            {monkey.daycare?.ongoing && (
              <button
                onClick={async () => {
                  if (monkeyActions) {
                    const tx = await monkeyActions.endDaycare(monkeyId);
                    const receipt = await tx.wait();
                    monkey.refresh();
                  }
                }}
              >
                Pick Up
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
