import { BigNumber, Signer } from "ethers";
import { useMonkeyActions } from "./contracts";
import "./expedition.css";
import { useState, useEffect } from "react";
import { formatEther } from "ethers/lib/utils";

interface ExpeditionProps {
  signer: Signer;
  monkeyId: number;
}

interface LocationProps {
  name: String;
  time: String;
  energy: String;
  banana: String;
  xp: String;
}

interface ExpeditionDetails {
  bananas: BigNumber;
  duration: BigNumber;
  energy: BigNumber;
  xp: BigNumber;
}

export default function Expedition({ signer }: ExpeditionProps) {
  const monkeyActions = useMonkeyActions(signer);
  const [expeditions, setExpeditions] = useState<ExpeditionDetails[]>();
  useEffect(() => {
    if (monkeyActions) {
      (async () => {
        const expeditions = (await Promise.all(
          [0, 1].map((n) => monkeyActions.expedition(n))
        )) as ExpeditionDetails[];
        setExpeditions(expeditions);
      })();
    }
  }, [monkeyActions]);
  return (
    <>
      <div className="exp-title">
        <h1>Expedition</h1>
      </div>
      <div className="exp-locations">
        {expeditions && (
          <>
            <Location
              name="Monkey School"
              time={(expeditions[0].duration.toNumber() / 60).toFixed(3)}
              energy={formatEther(expeditions[0].energy)}
              banana={formatEther(expeditions[0].bananas)}
              xp={formatEther(expeditions[0].xp)}
            />
            <Location
              name="Monkey Arctic"
              time={(expeditions[1].duration.toNumber() / 60).toFixed(3)}
              energy={formatEther(expeditions[1].energy)}
              banana={formatEther(expeditions[1].bananas)}
              xp={formatEther(expeditions[1].xp)}
            />
          </>
        )}
        <Location
          name="To Be Added"
          time="XXXX"
          energy="XXXX"
          banana="XXXX"
          xp="XXXX"
        />
      </div>
    </>
  );
}

function Location({ name, time, energy, banana, xp }: LocationProps) {
  return (
    <>
      <div className="location-wrapper">
        <div className="location-background">
          <div className="stats">
            <h4 id="info">Min xp required: {xp}</h4>
            <h4 id="info">Time: {time} minutes</h4>
            <h4 id="info">Consume: {energy} energy</h4>
            <h4 id="info">Obtain: {banana} bananas</h4>
          </div>
        </div>
        <h3 className="location-name">{name}</h3>
      </div>
    </>
  );
}
