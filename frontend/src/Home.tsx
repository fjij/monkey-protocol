import { Signer } from "ethers";

interface HomeProps {
  signer: Signer;
}

export default function Home({ signer }: HomeProps) {
  return (
    <div className="Home">
      <div className="title">
        <h1>Home</h1>
      </div>
    </div>
  );
}
