import { Signer } from "ethers";
import { useBananas, useMonkey } from "./hooks";
import "./Home.css";

interface HomeProps {
  signer: Signer;
  monkeyId: number;
}

export default function Home({ signer, monkeyId }: HomeProps) {

  const monkey = useMonkey(monkeyId, signer);
  const bananas = useBananas(signer);

  return (
    <div className="Home">
      { bananas && <div className="Home-bananas">
        <h1>{bananas.amount} 🍌</h1>
      </div> }
      { monkey.nft && <div className="Home-monkey">
        { !(monkey.stats?.busy) ? <img src={monkey.nft!.image} />
          :  <h1 className="Home-monkey-away">Away</h1>
        }
        <br />
        <div className="Home-monkey-details">
          <h1>{monkey.nft.name}</h1>
          <p>{monkey.nft.description}</p>
        </div>
      </div> }
    </div>
  );
}
