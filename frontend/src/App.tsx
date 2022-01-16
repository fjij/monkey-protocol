import "./App.css";
import { Landing } from "./Landing";
import Home from "./Home";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Signer } from "ethers";
import FullscreenMessage from "./FullscreenMessage";

function App() {
  const [signer, setSigner] = useState<Signer>()
  const [chainId, setChainId] = useState<number>();

  useEffect(() => {
    signer?.getChainId().then(setChainId);
  }, [signer])

  if (!signer) {
    return <Landing onConnected={setSigner}/>;
  }

  if (chainId !== 31337) {
    return <FullscreenMessage>
      Wrong Chain Id - Switch to 31337
    </FullscreenMessage>
  }

  return (
    <Router>
      <Switch>
        <Route path="/">
          <Home signer={signer} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
