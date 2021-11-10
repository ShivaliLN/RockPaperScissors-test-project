const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("RockPaperScissors", function () {
  let RPCToken, rpctoken, RPS, rps, owner, Alice, Bob, x, y;
  const [salt1, salt2] = [10, 20];
  const [rock, paper, scissors] = [1, 2, 3]; 

    before(async () => {
        RPCToken = await ethers.getContractFactory("RPCToken");
        rpctoken = await RPCToken.deploy();
        console.log("RPCToken deployed to:", rpctoken.address);

        RPS = await ethers.getContractFactory("RockPaperScissors");
        rps = await RPS.deploy(rpctoken.address);
        console.log("RockPaperScissors deployed to:", rps.address);

        [owner, Alice, Bob] = await ethers.getSigners();

        await rpctoken.transfer(Alice.address, 50);
        await rpctoken.transfer(Bob.address, 50);
        await rpctoken.connect(Alice).approve(rps.address, 50);
        await rpctoken.connect(Bob).approve(rps.address, 50);
    });

  describe("Create Game", () => {
    it('Should create game with 10 tokens', async () => {
      await rps.connect(Alice).createGame(Bob.address, 10);
      const game = await rps.games(0);
      assert.equal(game.id.toNumber(), 0);
      assert.equal(game.bet.toNumber(), 10);      
      assert.equal(game.state, 0);
    });

    it('Should create game with 0 tokens', async () => {
      await rps.connect(Bob).createGame(Alice.address, 0);
      const game = await rps.games(1);
      assert.equal(game.id.toNumber(), 1);
      assert.equal(game.bet.toNumber(), 0);      
      assert.equal(game.state, 0);
    });

  });

  describe("Full Round of Game", () => {
    it('Should pay to winner', async () => {
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice Starting Balance: " + x);
    console.log("Bob Starting Balance: " + y);
    await rps.connect(Bob).createGame(Alice.address, 25);
    await rps.connect(Alice).joinGame(2); 
    await rps.connect(Bob).commitMove(2, rock, salt1);
    await rps.connect(Alice).commitMove(2, paper, salt2);
    await rps.connect(Bob).revealMove(2, rock, salt1);
    await rps.connect(Alice).revealMove(2, paper, salt2);
    console.log("****************************************");
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice End Balance: " + x);
    console.log("Bob End Balance: " + y);
    assert.equal(x, 75);
    assert.equal(y, 25);
    
  });
  });

  describe("Player 2 doesn't reveal", () => {
    it('Should not deduct funds from Player 1', async () => {
    
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice Starting Balance: " + x);
    console.log("Bob Starting Balance: " + y);
    await rps.connect(Bob).createGame(Alice.address, 5);
    await rps.connect(Alice).joinGame(3); 
    await rps.connect(Bob).commitMove(3, scissors, salt1);
    await rps.connect(Alice).commitMove(3, paper, salt2);
    await rps.connect(Bob).revealMove(3, scissors, salt1);
    //await rps.connect(Alice).revealMove(3, paper, salt2);
    console.log("****************************************");
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice End Balance: " + x);
    console.log("Bob End Balance: " + y);
    //assert.equal(x, 75);
   // assert.equal(y, 25);
  });
  });

  describe("Full round with 0 bet", () => {
    it('Should not payout anything', async () => {
    
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice Starting Balance: " + x);
    console.log("Bob Starting Balance: " + y);
    await rps.connect(Bob).createGame(Alice.address, 0);
    await rps.connect(Alice).joinGame(4); 
    await rps.connect(Bob).commitMove(4, scissors, salt1);
    await rps.connect(Alice).commitMove(4, paper, salt2);
    await rps.connect(Bob).revealMove(4, scissors, salt1);
    await rps.connect(Alice).revealMove(4, paper, salt2);
    console.log("****************************************");
    x = await rpctoken.balanceOf(Alice.address);
    y = await rpctoken.balanceOf(Bob.address);
    console.log("Alice End Balance: " + x);
    console.log("Bob End Balance: " + y);
      
  });

  it('Should still move state to revealed', async () => {
    const game = await rps.games(4);
    assert.equal(game.bet.toNumber(), 0);      
    assert.equal(game.state, 3);
  });

  });

  describe("Negative Test Scenarios", () => {
    it('Should NOT create game with 60 tokens', async () => {
      await rps.connect(Bob).createGame(Alice.address, 60);
      
    });    
  });



});
