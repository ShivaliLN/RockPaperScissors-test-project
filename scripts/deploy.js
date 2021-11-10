const hre = require("hardhat");

async function main() {
   // Deploy Token
   const RPCToken = await hre.ethers.getContractFactory("RPCToken");
   const rPCToken = await RPCToken.deploy();
 
   await rPCToken.deployed();
   console.log("RPCToken deployed to:", rPCToken.address);
  // Deploy Contract

  const RockPaperScissors = await hre.ethers.getContractFactory("RockPaperScissors");
  const rockPaperScissors = await RockPaperScissors.deploy(rPCToken.address);
  await rockPaperScissors.deployed();

  console.log("RockPaperScissors deployed to:", rockPaperScissors.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
