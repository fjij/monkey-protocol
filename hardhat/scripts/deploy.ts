import { ethers } from "hardhat";

async function main() {

  const MonkeyProtocol = await ethers.getContractFactory("MonkeyProtocol");
  const monkeyProtocol = await MonkeyProtocol.deploy();
  await monkeyProtocol.deployed();
  console.log("MonkeyProtocol deployed to:", monkeyProtocol.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
