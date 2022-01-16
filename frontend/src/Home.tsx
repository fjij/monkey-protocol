import { BigNumber, Signer } from "ethers";
import { useBananas, useMonkey } from "./hooks";
import "./Home.css";
import { formatEther } from "ethers/lib/utils";
import { Link } from "react-router-dom";

import Background from "./assets/background.png";
import Bananas from "./Bananas";

interface HomeProps {
  signer: Signer;
  monkeyId: number;
  setMonkeyId: (monkeyId: number) => void;
}

export default function Home({ signer, monkeyId, setMonkeyId }: HomeProps) {

  const monkey = useMonkey(monkeyId, signer);
  const bananas = useBananas(signer);

  return (
    <div className="Home">
      <div
        className="L-background"
        style={{ backgroundImage: `url(${Background})` }}
      >
        { bananas && <Bananas amount={bananas.amount} /> }
        { monkey.nft && <div className="Home-monkey">
          { !(monkey.stats?.busy) ? <img src={monkey.nft!.image} />
            :  <h1 className="Home-monkey-away">Away</h1>
          }
          <br />
        </div> }
        <div className="Home-bottom">
          <Link to="/daycare" className="Home-button">🛏️</Link>
          <Link to="/feed" className="Home-button">🍕</Link>
          { monkey.nft && <span className="Home-monkey-details">
            <h1>{monkey.nft.name}</h1>
            { monkey.stats && <>
              <b>XP: { formatEther(monkey.stats.xp) }</b><br />
              <b>Energy: { formatEther(monkey.stats.energy) }</b>
            </>}
          </span> }
          <button onClick={async () => {
            if (monkey.monkeyRegistry) {
              const tx = await monkey.monkeyRegistry.adopt();
              const receipt = await tx.wait();
              const id = receipt.events
                ?.filter((e) => e.event === "MonkeyRegister")[0]
                .args?.monkeyId as BigNumber;
              setMonkeyId(id.toNumber());
            }
          }} className="Home-button">🐒</button>
          <Link to="/expedition" className="Home-button">✈️</Link>
        </div>
      </div>
    </div>
  );
}
