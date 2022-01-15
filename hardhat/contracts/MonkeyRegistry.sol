//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./MonkeyProtocol.sol";

contract MonkeyRegistry is ERC721 {

    bytes32 public constant PROTOCOL = keccak256("PROTOCOL");

    using Counters for Counters.Counter;
    Counters.Counter private _monkeyIds;
    Counters.Counter private _tokenIds;

    struct Monkey {
        IERC721 sourceContract;
        uint256 sourceTokenId;
        uint256 xp;
        uint256 energy;
    }

    Monkey[] private _monkeys;

    MonkeyProtocol public monkeyProtocol;

    modifier onlyProtocol {
        require(monkeyProtocol.hasRole(PROTOCOL, msg.sender));
        _;
    }

    // CONSTRUCTOR

    constructor(address monkeyProtocolAddress) ERC721("Monkey", "MPM") {
        monkeyProtocol = MonkeyProtocol(monkeyProtocolAddress);
    }

    // ADOPT

    function adopt() external {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _register(address(this), tokenId);
    }

    // REGISTER

    event MonkeyRegister(
        address sourceContract,
        uint256 tokenId,
        uint256 monkeyId
    );

    function register(address sourceContract, uint256 tokenId) public {
        require(IERC165(sourceContract).supportsInterface(
            type(IERC721).interfaceId
        ), "must support erc721");
        require(
            IERC721(sourceContract).ownerOf(tokenId) == msg.sender
            || IERC721(sourceContract).getApproved(tokenId) == msg.sender
        , "must be approved or owner");
        _register(sourceContract, tokenId);
    }

    function _register(address sourceContract, uint256 tokenId) internal {
        _monkeyIds.increment();
        uint256 monkeyId = _monkeyIds.current();
        _monkeys[monkeyId].sourceContract = IERC721(sourceContract);
        _monkeys[monkeyId].sourceTokenId = tokenId;
        emit MonkeyRegister(sourceContract, tokenId, monkeyId);
    }

    // QUERY DATA

    function monkey(uint256 monkeyId) external view returns (Monkey memory) {
        return _monkeys[monkeyId];
    }

    function monkeyOwner(uint256 monkeyId) public view returns (address) {
        return _monkeys[monkeyId].sourceContract.ownerOf(
            _monkeys[monkeyId].sourceTokenId
        );
    }

    function isMonkeyApproved(
        uint256 monkeyId,
        address account
    ) public view returns (bool) {
        return _monkeys[monkeyId].sourceContract.ownerOf(
            _monkeys[monkeyId].sourceTokenId
        ) == account || _monkeys[monkeyId].sourceContract.getApproved(
            _monkeys[monkeyId].sourceTokenId
        ) == account;
    }

    // MONKEY STATS

    event MonkeyGainEnergy(uint256 monkeyId, uint256 amount, uint256 total);

    function gainEnergy(uint256 monkeyId, uint256 amount) public onlyProtocol {
        _monkeys[monkeyId].energy += amount;
        emit MonkeyGainEnergy(monkeyId, amount, _monkeys[monkeyId].energy);
    }

    event MonkeyUseEnergy(uint256 monkeyId, uint256 amount, uint256 total);

    function useEnergy(uint256 monkeyId, uint256 amount) public onlyProtocol {
        _monkeys[monkeyId].energy -= amount;
        emit MonkeyUseEnergy(monkeyId, amount, _monkeys[monkeyId].energy);
    }

    event MonkeyGainXp(uint256 monkeyId, uint256 amount, uint256 total);

    function gainXp(uint256 monkeyId, uint256 amount) public onlyProtocol {
        _monkeys[monkeyId].xp += amount;
        emit MonkeyGainXp(monkeyId, amount, _monkeys[monkeyId].xp);
    }
}
