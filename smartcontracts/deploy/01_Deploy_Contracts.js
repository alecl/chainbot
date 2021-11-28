let { networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");
const { DateTime } = require("luxon");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log("----------------------------------------------------");
  const ChainBotNFT = await deploy("ChainBotNFT", {
    from: deployer,
    log: true,
  });
  log(`You have deployed an NFT contract to ${ChainBotNFT.address}`);
  const chainBotNFTContract = await ethers.getContractFactory("ChainBotNFT");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const notOwner = accounts[1];
  const chainBotNFT = new ethers.Contract(
    ChainBotNFT.address,
    chainBotNFTContract.interface,
    signer
  );
  const networkName = networkConfig[chainId]["name"];

  log(
    `Verify with:\n npx hardhat verify --network ${networkName} ${ChainBotNFT.address}`
  );
  log("Let's create an NFT now!");
  /*
  let filepath = "./img/small_enough.svg";
  let svg = fs.readFileSync(filepath, { encoding: "utf8" });
  log(
    `We will use ${filepath} as our SVG, and this will turn into a tokenURI. `
  );*/
  tx = await chainBotNFT.create("Bot1", "https://www.botsandai.com/");
  await tx.wait(1);

  var d1 = DateTime.now();
  var d2 = Math.floor(d1.plus({ days: 7 }).toSeconds());

  tx2 = await chainBotNFT.freeze(0, d2)

  tx3 = await chainBotNFT.callStatic.getAuthUri();
  console.log(tx3);

  tx4 = await chainBotNFT.setAuthUri("http://versetech.ai/auth");

  tx5 = await chainBotNFT.callStatic.getBotInfo(0);
  console.log(tx5);

  //await chainBotNFT.updateBotName(0, 'MyBot');
  //await chainBotNFT.updateBotMessageUri(0, "https://www.com");

  tx6 = await chainBotNFT.callStatic.getBotInfo(0);
  console.log(tx6); 

  //await chainBotNFT.updateBotInfo(0, "MyBot2", "https://www.comz");

  tx7 = await chainBotNFT.callStatic.getBotInfo(0);
  console.log(tx7); 

  log(`You've made your first NFT!`);
  //log(`You can view the tokenURI here ${await ChainBotNFT.tokenURI(0)}`);
};

module.exports.tags = ["all", "nft"];
