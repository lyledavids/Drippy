// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CriteaUSDC is ERC20, Ownable, ERC20Permit {
    constructor(address recipient, address initialOwner)
        ERC20("CriteaUSDC", "cUSDC")
        Ownable(initialOwner)
        ERC20Permit("CriteaUSDC")
    {
        _mint(recipient, 10000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}