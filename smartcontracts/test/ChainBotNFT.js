const { expect } = require("chai");

describe("Transactions", function () {
  it("Should transfer tokens between accounts", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ChainBotNFT");

    const hardhatToken = await Token.deploy();

    let bot1 = await hardhatToken.create("Bot1", "https://www.botsandai.com/");
    //expect(bot1.value).to.equal(0, "bot1 mistmatch");
    let r1 = await bot1.wait(1);
    console.log(r1);

    let bot2 = await hardhatToken.create("Bot2", "https://www.botsandai.com/2");
    let r2 = await bot2.wait(1);
    console.log(r2);
    //expect(bot2.value).to.equal(1, "bot2 mismatch");    
    // Transfer 50 tokens from owner to addr1
    //await hardhatToken.transfer(addr1.address, 50);
    //expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    //await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    //expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
  });
});
