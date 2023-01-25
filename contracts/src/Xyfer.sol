// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";    
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract Xyfer is ERC20, ERC20Burnable, ERC20Snapshot, Ownable {
    constructor() ERC20("Xyfer", "XFR") {}

    function snapshot() public onlyOwner {
        _snapshot();
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
