import { BigNumber, Signer } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import {
  useMonkeyActions,
  useMonkeyProtocol,
  useMonkeyRegistry,
  useNft,
} from "./contracts";

export function useStoredState<T>(key: string, defaultValue: T) {
  const item = localStorage.getItem(key);
  const [value, setValue] = useState<T>(
    item ? JSON.parse(item).value : defaultValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ value }));
  }, [value]);

  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}

export interface Monkey {
  sourceContract: string;
  sourceTokenId: BigNumber;
}

export function useBananas(signer: Signer) {
  const [amount, setAmount] = useState<string>();
  const [address, setAddress] = useState<string>();

  const monkeyProtocol = useMonkeyProtocol(signer);

  useEffect(() => {
    if (signer) {
      signer.getAddress().then(setAddress);
    }
  }, [signer]);

  useEffect(() => {
    if (monkeyProtocol && address && !amount) {
      monkeyProtocol.balanceOf(address).then((n) => setAmount(formatEther(n)));
    }
  }, [monkeyProtocol, address, amount]);

  return {
    amount,
    refresh: () => setAmount(undefined),
  };
}

export interface MonkeyStats {
  energy: BigNumber;
  xp: BigNumber;
  busy: boolean;
}

export interface MonkeyExpedition {
  ends: BigNumber;
  area: number;
  ongoing: boolean;
}

export interface MonkeyDaycare {
  started: BigNumber;
  ongoing: boolean;
}

export function useMonkey(monkeyId: number, signer: Signer) {
  const [monkey, setMonkey] = useState<Monkey>();
  const [stats, setStats] = useState<MonkeyStats>();
  const [expedition, setExpedition] = useState<MonkeyExpedition>();
  const [daycare, setDaycare] = useState<MonkeyDaycare>();
  const monkeyRegistry = useMonkeyRegistry(signer);
  const monkeyActions = useMonkeyActions(signer);
  const nft = useNft(signer, monkey?.sourceContract, monkey?.sourceTokenId);

  useEffect(() => {
    if (monkeyRegistry) {
      monkeyRegistry.monkey(monkeyId).then(setMonkey);
    }
  }, [monkeyRegistry, monkeyId]);

  useEffect(() => {
    if (monkeyActions) {
      if (!stats) {
        monkeyActions.monkeyStats(monkeyId).then(setStats);
      }
    }
  }, [monkeyRegistry, stats]);

  useEffect(() => {
    if (monkeyActions) {
      if (!expedition) {
        monkeyActions.monkeyExpedition(monkeyId).then(setExpedition);
      }
    }
  }, [monkeyRegistry, expedition]);

  useEffect(() => {
    if (monkeyActions) {
      if (!daycare) {
        monkeyActions.monkeyDaycare(monkeyId).then(setDaycare);
      }
    }
  }, [monkeyRegistry, daycare]);

  return {
    nft,
    stats,
    expedition,
    daycare,
    refresh: () => {
      setStats(undefined);
      setExpedition(undefined);
      setDaycare(undefined);
    },
    monkeyRegistry,
    monkeyActions,
  };
}
