import { ethers } from "ethers";
import { useEffect, useState } from "react";

import { abi as MonkeyProtocolAbi } from "../abis/MonkeyProtocol.json";
import { abi as MonkeyActionsAbi } from "../abis/MonkeyActions.json";
import { abi as MonkeyRegistryAbi } from "../abis/MonkeyRegistry.json";

import type {
  MonkeyRegistry,
  MonkeyActions,
  MonkeyProtocol,
} from "../../../hardhat/typechain";

import deployment from "../deployments/localhost.json";

function useContract(
  signer: ethers.Signer | undefined,
  address: string,
  abi: any,
) {
  const [contract, setContract] = useState<ethers.Contract>();
  useEffect(() => {
    setContract(new ethers.Contract(address, abi, signer));
  }, [signer, address, abi])
  return contract;
}

export function useMonkeyProtocol(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyProtocol,
    MonkeyProtocolAbi
  ) as MonkeyProtocol;
}

export function useMonkeyActions(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyActions,
    MonkeyActionsAbi
  ) as MonkeyActions;
}

export function useMonkeyRegistry(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyRegistry,
    MonkeyRegistryAbi
  ) as MonkeyRegistry;
}
