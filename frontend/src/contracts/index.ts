import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";

import MonkeyProtocolData from "../abis/MonkeyProtocol.json";
import MonkeyActionsData from "../abis/MonkeyActions.json";
import MonkeyRegistryData from "../abis/MonkeyRegistry.json";
import IERC721MetadataData from "../abis/IERC721Metadata.json";

import type {
  MonkeyRegistry,
  MonkeyActions,
  MonkeyProtocol,
  IERC721Metadata,
} from "../../../hardhat/typechain";

import deployment from "../deployments/rinkeby-1642348540283.json";
import { resolveUri } from "../web3";
import axios from "axios";

function useContract(
  signer: ethers.Signer | undefined,
  address: string | undefined,
  abi: any
) {
  const [contract, setContract] = useState<ethers.Contract>();
  useEffect(() => {
    if (address) {
      setContract(new ethers.Contract(address, abi, signer));
    }
  }, [signer, address, abi]);
  return contract;
}

interface NftMetadata {
  name: string;
  description: string;
  image: string;
}

export function useNft(
  signer: ethers.Signer | undefined,
  address?: string,
  tokenId?: BigNumber
) {
  const nft = useContract(signer, address, IERC721MetadataData.abi) as
    | IERC721Metadata
    | undefined;
  const [metadata, setMetadata] = useState<NftMetadata>();
  useEffect(() => {
    if (nft && tokenId) {
      (async () => {
        const uri = await nft.tokenURI(tokenId);
        const res = await axios.get(resolveUri(uri));
        const { name, description, image } = res.data as NftMetadata;
        setMetadata({ name, description, image: resolveUri(image) });
      })();
    }
  }, [nft, tokenId]);
  return metadata;
}

export function useMonkeyProtocol(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyProtocol,
    MonkeyProtocolData.abi
  ) as MonkeyProtocol;
}

export function useMonkeyActions(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyActions,
    MonkeyActionsData.abi
  ) as MonkeyActions | undefined;
}

export function useMonkeyRegistry(signer: ethers.Signer | undefined) {
  return useContract(
    signer,
    deployment.monkeyRegistry,
    MonkeyRegistryData.abi
  ) as MonkeyRegistry | undefined;
}
