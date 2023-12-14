const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Base64 Test", function () {
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const googleAccount = await ethers.deployContract("GoogleAccount", [
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    ]);

    return { googleAccount, owner, otherAccount };
  }

  describe("JSON Parsing", function () {
    it("Should parse the payload correctly", async function () {
      const { googleAccount } = await deployContract();
      const JSON_String =
        '{"iss":"accounts.google.com","azp":"629075145814-0il5ad9dgklad6olnla10nebnqc5n2uj.apps.googleusercontent.com","aud":"629075145814-0il5ad9dgklad6olnla10nebnqc5n2uj.apps.googleusercontent.com","sub":"104755661141364739555","email":"andrew.tj.wang@gmail.com","email_verified":true,"at_hash":"KTVUBvrseQXA0mv7X2YwLg","nonce":"0x7f25b329b8c3e93768910f11144df663f6f3bc66930f844b4ca071fa66f0936b","iat":1702425819,"exp":1702429419}';
      expect(await googleAccount.runParseToken(JSON_String)).to.equal(
        "something else"
      );
    });
  });
});
