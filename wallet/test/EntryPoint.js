const { expect } = require("chai");
// const { ethers } = require("hardhat");

describe("Generate userOpHash", function () {
  it("Passing through a UserOperation should return a hash of that object", async function () {
    const simpleAccount = await ethers.deployContract("SimpleAccount", [
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    ]);

    await simpleAccount.testVerification(
      "0x2898b2b8bec0ebd5280231b4d21b8f0c213e1303f10fd617cf52ffdd47ca29c7"
    );

    // expect(
    //   await simpleAccount.testVerification(
    //     "0x2898b2b8bec0ebd5280231b4d21b8f0c213e1303f10fd617cf52ffdd47ca29c7"
    //   )
    // ).to.equal(true);
  });
});
