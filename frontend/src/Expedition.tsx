import { BigNumber, Signer } from "ethers";
import { useMonkeyActions } from "./contracts";
import { MonkeyExpedition, useBananas, useMonkey } from "./hooks";
import "./expedition.css";
import "./daycare.css";
import { useState, useEffect } from "react";
import { formatEther } from "ethers/lib/utils";
import Bananas from "./Bananas";

import SchoolImage from "./assets/background.png";
import ArcticImage from "./assets/arctic.png";

interface ExpeditionProps {
  signer: Signer;
  monkeyId: number;
}

interface LocationProps {
  name: String;
  time: String;
  energy: String;
  enoughEnergy: boolean;
  enoughXp: boolean;
  banana: String;
  xp: String;
  img?: string;
  area: number;
  context: MonkeyExpedition;
  onExplore: () => void,
  onReturn: () => void,
}

interface ExpeditionDetails {
  bananas: BigNumber;
  duration: BigNumber;
  energy: BigNumber;
  xp: BigNumber;
}

export default function Expedition({ signer, monkeyId }: ExpeditionProps) {
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

  const bananas = useBananas(signer);
  const monkey = useMonkey(monkeyId, signer);

  async function onExplore(area: number) {
    if (monkeyActions) {
      await (await monkeyActions.startExpedition(monkeyId, area)).wait()
      monkey.refresh();
    }
  }

  async function onReturn() {
    if (monkeyActions) {
      await (await monkeyActions.endExpedition(monkeyId)).wait()
      bananas.refresh();
      monkey.refresh();
    }
  }

  return (
    <div className="Expedition">
      { bananas && <Bananas amount={bananas.amount} /> }
      <div className="exp-title">
        <h1>Expedition</h1>
      </div>
      <div className="daycare-wrapper">
      <div className="daycare-stats">
        <h3>{monkey.nft?.name?.toUpperCase()}</h3>
          {monkey.stats && <h3>Total XP: {formatEther(monkey.stats.xp)}</h3>}
          {monkey.stats && <h3>Energy: {formatEther(monkey.stats.energy)}</h3>}
        </div>
      </div>
      <div className="exp-locations">
        {expeditions && monkey.expedition && monkey.stats && (
          <>
            <Location
              name="Monkey School"
              time={(expeditions[0].duration.toNumber() / 60).toFixed(3)}
              energy={formatEther(expeditions[0].energy)}
              banana={formatEther(expeditions[0].bananas)}
              xp={formatEther(expeditions[0].xp)}
              area={0}
              enoughEnergy={monkey.stats.energy.gte(expeditions[0].energy)}
              enoughXp={monkey.stats.xp.gte(expeditions[0].xp)}
              onExplore={() => onExplore(0)}
              onReturn={onReturn}
              context={monkey.expedition}
              img={SchoolImage}
            />
            <Location
              name="Monkey Arctic"
              time={(expeditions[1].duration.toNumber() / 60).toFixed(3)}
              energy={formatEther(expeditions[1].energy)}
              banana={formatEther(expeditions[1].bananas)}
              xp={formatEther(expeditions[1].xp)}
              enoughEnergy={monkey.stats.energy.gte(expeditions[1].energy)}
              enoughXp={monkey.stats.xp.gte(expeditions[1].xp)}
              context={monkey.expedition}
              onExplore={() => onExplore(0)}
              onReturn={onReturn}
              area={1}
              img={ArcticImage}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Location({
  name,
  time,
  energy,
  banana,
  xp,
  img,
  context,
  area,
  onExplore,
  enoughEnergy,
  enoughXp,
  onReturn,
}: LocationProps) {
  return (
    <>
      <div className="location-wrapper">
        <div className="location-background" style={{backgroundImage: `url(${img})`}}>
          <h3 className="location-name">{name}</h3>
        </div>
        <div className="stats">
          <h4 className="info">Time: {time} minutes</h4>
          <h4 className="info">Obtain: {banana} bananas</h4>
          <h4 className={"info" + ((!context.ongoing && enoughXp) ? "" : " red")}>Min xp required: {xp}</h4>
          <h4 className={"info" + ((!context.ongoing && enoughEnergy) ? "" : " red")}>Consume: {energy} energy</h4>
        </div>
        { !context.ongoing &&
          <button
            className="purple-button"
            disabled={!enoughXp || !enoughEnergy}
            onClick={onExplore}
          >Explore</button>
        }
        { context.ongoing && context.area == area &&
          <button className="purple-button" onClick={onReturn}>Return</button>
        }
      </div>
    </>
  );
}
