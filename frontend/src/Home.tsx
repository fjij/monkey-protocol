import { Signer } from "ethers";
import { useBananas, useMonkey } from "./hooks";
import "./Home.css";
import { formatEther } from "ethers/lib/utils";
import { Link } from "react-router-dom";

import Background from "./assets/background.png";

interface HomeProps {
  signer: Signer;
  monkeyId: number;
}

export default function Home({ signer, monkeyId }: HomeProps) {

  const monkey = useMonkey(monkeyId, signer);
  const bananas = useBananas(signer);

  return (
    <div className="Home">
      <div
        className="L-background"
        style={{ backgroundImage: `url(${Background})` }}
      >
        { bananas && <div className="Home-bananas">
          <h1>{bananas.amount} 🍌</h1>
        </div> }
        { monkey.nft && <div className="Home-monkey">
          { !(monkey.stats?.busy) ? <img src={monkey.nft!.image} />
            :  <h1 className="Home-monkey-away">Away</h1>
          }
          <br />
        </div> }
        <div className="Home-bottom">
          <Link to="/" className="Home-button">📈</Link>
          <Link to="/feed" className="Home-button">🍕</Link>
          { monkey.nft && <span className="Home-monkey-details">
            <h1>{monkey.nft.name}</h1>
            { monkey.stats && <>
              <b>XP: { formatEther(monkey.stats.xp) }</b><br />
              <b>Energy: { formatEther(monkey.stats.energy) }</b>
            </>}
          </span> }
          <Link to="/adopt" className="Home-button">🐒</Link>
          <Link to="/expedition" className="Home-button">✈️</Link>
        </div>
      </div>
    </div>
  );
}
