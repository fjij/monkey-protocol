import { expect } from "chai";
import { ethers } from "hardhat";
import hardhat from "hardhat";
import { deploy } from "../scripts/deploy";

describe("MP stories", () => {
  it("Basic usage", async () => {
    const {
      monkeyRegistry,
      monkeyActions,
      monkeyProtocol,
      owner,
    } = await deploy(false);

    await monkeyRegistry.adopt();

    await monkeyRegistry.adopt();

    const monkeyId = await monkeyRegistry.reverseMonkey(monkeyRegistry.address, 0);
    expect(monkeyId.toNumber()).to.equal(1);

    await monkeyActions.feedEth(1, { value: ethers.utils.parseEther("1.0")});

    expect((await monkeyActions.monkeyStats(1)).energy)
      .to.equal(ethers.utils.parseEther("1000000"));

    await monkeyActions.startExpedition(1, 0);

    await expect(monkeyActions.endExpedition(1)).to.be.revertedWith("not done");

    await expect(monkeyActions.feedEth(1)).to.be.revertedWith("monkey busy");
    await expect(monkeyActions.startDaycare(1)).to.be.revertedWith("monkey busy");
    await expect(monkeyActions.startExpedition(1, 0)).to.be.revertedWith("monkey busy");

    await hardhat.network.provider.send("evm_increaseTime", [3600])

    await monkeyActions.endExpedition(1);

    expect((await monkeyActions.monkeyStats(1)).energy)
      .to.equal(ethers.utils.parseEther("999992"));

    expect((await monkeyProtocol.balanceOf(owner.address)))
      .to.equal(ethers.utils.parseEther("10"));

    await monkeyActions.feedBanana(2, ethers.utils.parseEther("10.0"));

    expect((await monkeyProtocol.balanceOf(owner.address)))
      .to.equal(ethers.utils.parseEther("0"));

    expect((await monkeyActions.monkeyStats(2)).energy)
      .to.equal(ethers.utils.parseEther("100"));

    await monkeyActions.startDaycare(2);


    await hardhat.network.provider.send("evm_increaseTime", [1000])

    await monkeyActions.endDaycare(2);

    expect((await monkeyActions.monkeyStats(2)).xp)
      .to.equal(ethers.utils.parseEther("1000"));

    await expect(monkeyActions.startExpedition(1, 1))
      .to.be.revertedWith("not enough xp");

    await monkeyActions.startExpedition(2, 1);

    await hardhat.network.provider.send("evm_increaseTime", [1000])

    await monkeyActions.endExpedition(2);

    expect((await monkeyActions.monkeyStats(2)).energy)
      .to.equal(ethers.utils.parseEther("70"));

    expect((await monkeyProtocol.balanceOf(owner.address)))
      .to.equal(ethers.utils.parseEther("50"));
  });
});
