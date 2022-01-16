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
    }

    mapping(uint256 => Monkey) private _monkeys;
    mapping(address => mapping(uint256 => uint256)) private _reverseMonkeys;

    MonkeyProtocol private _monkeyProtocol;

    modifier onlyProtocol {
        require(_monkeyProtocol.hasRole(PROTOCOL, msg.sender));
        _;
    }

    uint256 private _monkeyLimit;
    string private _baseUri;

    // CONSTRUCTOR

    constructor(
        address monkeyProtocolAddress,
        string memory baseUri,
        uint256 monkeyLimit
    ) ERC721("Monkey", "MPM") {
        _monkeyProtocol = MonkeyProtocol(monkeyProtocolAddress);
        _baseUri = baseUri;
        _monkeyLimit = monkeyLimit;
    }

    // ADOPT

    function adopt() external returns (uint256) {
        uint256 tokenId = _tokenIds.current();
        _tokenIds.increment();
        _mint(msg.sender, tokenId);
        return _register(address(this), tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return super.tokenURI(tokenId % _monkeyLimit);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    // REGISTER

    event MonkeyRegister(
        address sourceContract,
        uint256 tokenId,
        uint256 monkeyId
    );

    function register(
        address sourceContract,
        uint256 tokenId
    ) public returns (uint256) {
        require(IERC165(sourceContract).supportsInterface(
            type(IERC721).interfaceId
        ), "must support erc721");
        require(
            IERC721(sourceContract).ownerOf(tokenId) == msg.sender
            || IERC721(sourceContract).getApproved(tokenId) == msg.sender
        , "must be approved or owner");
        return _register(sourceContract, tokenId);
    }

    function _register(
        address sourceContract,
        uint256 tokenId
    ) internal returns (uint256) {
        _monkeyIds.increment();
        uint256 monkeyId = _monkeyIds.current();
        _monkeys[monkeyId].sourceContract = IERC721(sourceContract);
        _monkeys[monkeyId].sourceTokenId = tokenId;
        _reverseMonkeys[sourceContract][tokenId] = monkeyId;
        emit MonkeyRegister(sourceContract, tokenId, monkeyId);
        return monkeyId;
    }

    // QUERY DATA

    function monkey(uint256 monkeyId) external view returns (Monkey memory) {
        return _monkeys[monkeyId];
    }

    function reverseMonkey(
        address sourceContract,
        uint256 tokenId
    ) external view returns (uint256) {
        return _reverseMonkeys[sourceContract][tokenId];
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
}
