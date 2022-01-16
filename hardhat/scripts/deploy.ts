import { ethers } from "hardhat";

async function main() {

  // MonkeyProtocol
  const MonkeyProtocol = await ethers.getContractFactory("MonkeyProtocol");
  const monkeyProtocol = await MonkeyProtocol.deploy();
  await monkeyProtocol.deployed();
  console.log("MonkeyProtocol deployed to:", monkeyProtocol.address);

  const PROTOCOL = await monkeyProtocol.PROTOCOL();

  // MonkeyRegistry
  const MonkeyRegistry = await ethers.getContractFactory("MonkeyRegistry");
  const monkeyRegistry = await MonkeyRegistry.deploy(
    monkeyProtocol.address,
    "ifps://",
    1
  );
  await monkeyRegistry.deployed();
  console.log("MonkeyRegistry deployed to:", monkeyRegistry.address);

  await monkeyProtocol.grantRole(PROTOCOL, monkeyRegistry.address);
  console.log("PROTOCOL granted to MonkeyProtocol");

  // MonkeyActions
  const MonkeyActions = await ethers.getContractFactory("MonkeyActions");
  const monkeyActions = await MonkeyActions.deploy(monkeyProtocol.address);
  await monkeyActions.deployed();
  console.log("MonkeyActions deployed to:", monkeyActions.address);

  await monkeyProtocol.grantRole(PROTOCOL, monkeyActions.address);
  console.log("PROTOCOL granted to MonkeyActions");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
