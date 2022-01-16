import { ethers } from "hardhat";

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
    "ifps://",
    1
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
  }
}


async function main() {
  await deploy(true);



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
