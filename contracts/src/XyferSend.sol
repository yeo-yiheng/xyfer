// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract XyferSend {
    IERC20 _token;

    constructor(address token) {
        _token = IERC20(token);
    }

    modifier checkAllowance(uint amount) {
        require(_token.allowance(msg.sender, address(this)) >= amount, "Error");
        _;
    }

    function depositERC20(uint _amount) public checkAllowance(_amount) {
        _token.transferFrom(msg.sender, address(this), _amount);
    }
    
    function sendERC20(address to, uint amount) public {
        _token.transfer(to, amount);
    }

    function getSmartContractBalance() external view returns(uint) {
        return _token.balanceOf(address(this));
    }
}