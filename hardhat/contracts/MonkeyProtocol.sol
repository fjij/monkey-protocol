//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MonkeyProtocol is ERC20, AccessControl {
    bytes32 public constant OWNER = keccak256("OWNER");
    bytes32 public constant PROTOCOL = keccak256("PROTOCOL");

    constructor() ERC20("Banana", "MPB") {
        _setRoleAdmin(OWNER, OWNER);
        _setRoleAdmin(PROTOCOL, OWNER);

        _setupRole(OWNER, msg.sender);
    }

    function mint(address to, uint256 amount) external onlyRole(PROTOCOL) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(PROTOCOL) {
        _burn(from, amount);
    }
}
