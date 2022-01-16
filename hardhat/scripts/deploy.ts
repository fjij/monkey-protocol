import { ethers } from "hardhat";
import fs from "fs";
import hardhat from "hardhat";
import path from "path";

export async function deploy(log: boolean = true) {
  const [owner] = await ethers.getSigners();

  // MonkeyProtocol
  const MonkeyProtocol = await ethers.getContractFactory("MonkeyProtocol");
  const monkeyProtocol = await MonkeyProtocol.deploy();
  await monkeyProtocol.deployed();
  if (log) {
    console.log("MonkeyProtocol deployed to:", monkeyProtocol.address);
  }

  const PROTOCOL = await monkeyProtocol.PROTOCOL();

  await monkeyProtocol.grantRole(PROTOCOL, owner.address);
  if (log) {
    console.log("PROTOCOL granted to owner");
  }

  // MonkeyRegistry
  const MonkeyRegistry = await ethers.getContractFactory("MonkeyRegistry");
  const monkeyRegistry = await MonkeyRegistry.deploy(
    monkeyProtocol.address,
    "ifps://bafybeiari7csbdg3gfgc7l3eocrj5lkepgfguqpsvfvpvt6xrppeahxuby/",
    8
  );
  await monkeyRegistry.deployed();
  if (log) {
    console.log("MonkeyRegistry deployed to:", monkeyRegistry.address);
  }

  await monkeyProtocol.grantRole(PROTOCOL, monkeyRegistry.address);
  if (log) {
    console.log("PROTOCOL granted to MonkeyProtocol");
  }

  // MonkeyActions
  const MonkeyActions = await ethers.getContractFactory("MonkeyActions");
  const monkeyActions = await MonkeyActions.deploy(monkeyProtocol.address);
  await monkeyActions.deployed();
  if (log) {
    console.log("MonkeyActions deployed to:", monkeyActions.address);
  }

  await monkeyProtocol.grantRole(PROTOCOL, monkeyActions.address);
  if (log) {
    console.log("PROTOCOL granted to MonkeyActions");
  }

  await monkeyActions.setRegistry(monkeyRegistry.address);
  if (log) {
    console.log("MonkeyActions registry set");
  }

  return {
    owner,
    monkeyProtocol,
    monkeyRegistry,
    monkeyActions,
  };
}

async function copyAbis() {
  [
    "MonkeyActions",
    "MonkeyProtocol",
    "MonkeyRegistry",
  ].forEach((name) => fs.copyFileSync(
    path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`),
    path.join(__dirname, `../../frontend/src/abis/${name}.json`),
  ));
}

async function main() {
  const { monkeyActions, monkeyRegistry, monkeyProtocol } = await deploy(true);

  const data = JSON.stringify(
    {
      monkeyActions: monkeyActions.address,
      monkeyRegistry: monkeyRegistry.address,
      monkeyProtocol: monkeyProtocol.address,
    },
    null,
    2
  );
  const networkName = hardhat.network.name;

  const filename = (networkName === "hardhat" || networkName === "localhost") ?
    `${networkName}.json` :
    `${networkName}-${Date.now()}.json`;
  fs.writeFileSync(path.join(
    __dirname,
    "../../frontend/src/deployments",
    filename
  ), data);

  await copyAbis();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
