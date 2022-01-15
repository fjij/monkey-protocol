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
  const monkeyRegistry = await MonkeyRegistry.deploy(monkeyProtocol.address);
  await monkeyRegistry.deployed();
  console.log("MonkeyRegistry deployed to:", monkeyProtocol.address);

  await monkeyProtocol.grantRole(PROTOCOL, monkeyRegistry.address);
  console.log("PROTOCOL granted to MonkeyProtocol");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
