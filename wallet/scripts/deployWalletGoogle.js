const hre = require("hardhat");

async function main() {
  const googleAccount = await hre.ethers.deployContract("GoogleAccount", [
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  ]);

  await googleAccount.waitForDeployment();

  console.log(`Google wallet deployed to ${googleAccount.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
