//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Rock Paper Scissors with commit & reveal 
 * @dev Players must approve this contract to spend RPCTokens
 * @author Shivali Sharma 
 **/

contract RockPaperScissors {
    IERC20 public RPCToken;

    enum State {
    CREATED,
    JOINED,
    COMMITED,
    REVEALED
  }
  
  struct Game {
    uint id;
    uint bet;
    address[] players;
    State state;
  } 

  struct Move {
    bytes32 hash;
    uint value;
  }
  mapping(uint => Game) public games;
  mapping(uint => mapping(address => Move)) public moves;
  mapping(uint => uint) public winningMoves;
  uint public gameId;
  
  constructor(address _rpcTokenAddress) {
    // 1 - Rock = wins over 3
    // 2- Paper = wins over 1
    //3 - Scissors = wins over 2    
    winningMoves[1] = 3;
    winningMoves[2] = 1;
    winningMoves[3] = 2;

    RPCToken = IERC20(_rpcTokenAddress);
  }


  /**
  @notice This function is called by player 1 to create the game
  @param participant address
 **/
  function createGame(address participant, uint _betAmount) external payable {
    if(_betAmount > 0){
      require(RPCToken.balanceOf(msg.sender) >= _betAmount, "You do not have sufficient tokens to play the game.");
      require(RPCToken.allowance(msg.sender, address(this)) >= _betAmount, "You haven't approved sufficient tokens to play the game.");
    }
    address[] memory players = new address[](2);
    players[0] = msg.sender;
    players[1] = participant;

    games[gameId] = Game(
      gameId, 
      _betAmount,
      players,
      State.CREATED
    );
    gameId++;
  }
  
  /**
  @notice This function is called when player 2 joins the game created by player 1
  @param _gameId uint
 **/
  function joinGame(uint _gameId) external payable {
    Game storage game = games[_gameId];
    require(msg.sender == game.players[1], 'sender must be second player'); //also throw if game does not exist
    if(game.bet > 0){
      require(RPCToken.balanceOf(msg.sender) >= game.bet, "You do not have sufficient tokens to play the game.");
      require(RPCToken.allowance(msg.sender, address(this)) >= game.bet, "You haven't approved sufficient tokens to play the game.");
    }
    require(game.state == State.CREATED, 'game must be in CREATED state');
    game.state = State.JOINED;
  }
  
  /**
  @notice This function is called when players commit their moves
  @param _gameId uint
  @param moveId uint
  @param salt uint
 **/
  function commitMove(uint _gameId, uint moveId, uint salt) external {
    Game storage game = games[_gameId];
    require(game.state == State.JOINED, 'game must be in JOINED state');
    require(msg.sender == game.players[0] || msg.sender == game.players[1], 'can only be called by one of players');
    require(moves[_gameId][msg.sender].hash == 0, 'move already made'); // if no move yet, it will default to 0
    require(moveId == 1 || moveId == 2 || moveId == 3, 'move needs to be 1, 2 or 3');
    moves[_gameId][msg.sender] = Move(keccak256(abi.encodePacked(moveId, salt)), 0);
    if(moves[_gameId][game.players[0]].hash != 0 
      && moves[_gameId][game.players[1]].hash != 0) {
      game.state = State.COMMITED;    
    }
  }
  
  /**
  @notice This function is called when players reveal their moves
  @param _gameId uint
  @param moveId uint
  @param salt uint
 **/
  function revealMove(uint _gameId, uint moveId, uint salt) external {
    Game storage game = games[_gameId];
    Move storage move1 = moves[_gameId][game.players[0]];
    Move storage move2 = moves[_gameId][game.players[1]];
    Move storage moveSender = moves[_gameId][msg.sender];
    require(game.state == State.COMMITED, 'game must be in COMMITED state');
    require(msg.sender == game.players[0] || msg.sender == game.players[1], 'can only be called by one of players');
    require(moveSender.hash == keccak256(abi.encodePacked(moveId, salt)), 'moveId does not match commitment');
    moveSender.value = moveId;
    if(move1.value != 0 
      && move2.value != 0) {
        if(move1.value == move2.value) {
          //Tie
          game.state = State.REVEALED;
          return;
        }
        
        if(winningMoves[move1.value] == move2.value){
            RPCToken.transferFrom(game.players[1], game.players[0], game.bet);
        }else {
            RPCToken.transferFrom(game.players[0], game.players[1], game.bet);
        }      
        game.state = State.REVEALED;
    }

}
}
