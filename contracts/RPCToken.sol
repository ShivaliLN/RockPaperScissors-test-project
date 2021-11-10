//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract RPCToken is ERC20 {
    constructor() ERC20("RPCToken", "RPC") {
        _mint(msg.sender, 100);
    }
}