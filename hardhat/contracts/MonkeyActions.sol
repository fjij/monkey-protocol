//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import "./MonkeyProtocol.sol";
import "./MonkeyRegistry.sol";

contract MonkeyActions {

    // ADMIN

    bytes32 public constant PROTOCOL = keccak256("PROTOCOL");

    MonkeyProtocol private _monkeyProtocol;
    MonkeyRegistry private _monkeyRegistry;

    uint256 private constant DECIMALS = 10 ** 18;

    modifier onlyProtocol {
        require(_monkeyProtocol.hasRole(PROTOCOL, msg.sender));
        _;
    }

    modifier onlyOwner(uint256 monkeyId) {
        require(
            _monkeyRegistry.isMonkeyApproved(monkeyId, msg.sender),
            "not your monkey"
        );
        _;
    }

    constructor(address monkeyProtocol) {
        _monkeyProtocol = MonkeyProtocol(monkeyProtocol);
    }

    event SetRegistry(address monkeyRegistry);

    function setRegistry(address monkeyRegistry) external onlyProtocol {
        _monkeyRegistry = MonkeyRegistry(monkeyRegistry);
        emit SetRegistry(monkeyRegistry);
    }

    event Withdraw(address to, uint256 amount);

    function withdraw(
        address payable to,
        uint256 amount
    ) external onlyProtocol {
        to.transfer(amount);
        emit Withdraw(to, amount);
    }

    // STATS
    struct MonkeyStats {
        uint256 energy;
        uint256 xp;
        bool busy;
    }

    mapping(uint256 => MonkeyStats) private _monkeyStats;

    function monkeyStats(
        uint256 monkeyId
    ) external view returns (MonkeyStats memory) {
        return _monkeyStats[monkeyId];
    }

    // ACTIONS

    modifier canAction(uint256 monkeyId) {
        require(
            _monkeyRegistry.isMonkeyApproved(monkeyId, msg.sender),
            "not your monkey"
        );
        require(!_monkeyStats[monkeyId].busy, "monkey busy");
        _;
    }

    // EXPEDITION

    enum ExpeditionArea {
        School,
        Arctic
    }

    struct MonkeyExpedition {
        uint256 ends;
        ExpeditionArea area;
        bool ongoing;
    }

    mapping(uint256 => MonkeyExpedition) private _monkeyExpeditions;

    function monkeyExpedition(
        uint256 monkeyId
    ) external view returns (MonkeyExpedition memory) {
        return _monkeyExpeditions[monkeyId];
    }

    function startExpedition(
        uint256 monkeyId,
        ExpeditionArea area
    ) external canAction(monkeyId) {
        if (area == ExpeditionArea.School) {
            _monkeyExpeditions[monkeyId].ends = block.timestamp + 8 seconds;
        } else {
            require(_monkeyStats[monkeyId].xp >= 10 * DECIMALS);
            _monkeyExpeditions[monkeyId].ends = block.timestamp + 30 seconds;
        }
        _monkeyStats[monkeyId].busy = true;
        _monkeyExpeditions[monkeyId].area = area;
        _monkeyExpeditions[monkeyId].ongoing = true;
    }

    function endExpedition(uint256 monkeyId) external onlyOwner(monkeyId) {
        require(_monkeyExpeditions[monkeyId].ongoing, "not on expedition");
        require(block.timestamp > _monkeyExpeditions[monkeyId].ends, "not done");
        _monkeyExpeditions[monkeyId].ongoing = false;
        _monkeyStats[monkeyId].busy = false;
        if (_monkeyExpeditions[monkeyId].area == ExpeditionArea.School) {
            _monkeyProtocol.mint(msg.sender, 10 * DECIMALS);
        } else {
            _monkeyProtocol.mint(msg.sender, 50 * DECIMALS);
        }
    }

    // DAYCARE

    event MonkeyXp(uint256 monkeyId, uint256 amount);

    struct MonkeyDaycare {
        uint256 started;
        bool ongoing;
    }

    mapping(uint256 => MonkeyDaycare) private _monkeyDaycares;

    function monkeyDaycare(
        uint256 monkeyId
    ) external view returns (MonkeyDaycare memory) {
        return _monkeyDaycares[monkeyId];
    }

    uint256 public constant XP_PER_TIME = 1 * DECIMALS / 1 seconds;

    function durationToXp(uint256 duration) public pure returns (uint256) {
        return XP_PER_TIME * duration;
    }

    function startDaycare(uint256 monkeyId) external canAction(monkeyId) {
        _monkeyStats[monkeyId].busy = true;
        _monkeyDaycares[monkeyId].started = block.timestamp;
        _monkeyDaycares[monkeyId].ongoing = true;
    }

    function endDaycare(uint256 monkeyId) external onlyOwner(monkeyId) {
        require(_monkeyDaycares[monkeyId].ongoing, "not in daycare");
        _monkeyDaycares[monkeyId].ongoing = false;
        _monkeyStats[monkeyId].busy = false;
        uint256 xp = durationToXp(
            block.timestamp - _monkeyDaycares[monkeyId].started
        );
        _monkeyStats[monkeyId].xp += xp;
        emit MonkeyXp(monkeyId, xp);
    }

    // FEED

    event MonkeyEnergy(uint256 monkeyId, uint256 amount);

    uint256 public constant ENERGY_PER_BANANA = 10 ** 1;

    function energyForBanana(uint256 amount) public pure returns (uint256) {
        return amount * ENERGY_PER_BANANA;
    }

    function feedBanana(
        uint256 monkeyId,
        uint256 amount
    ) external canAction(monkeyId) {
        _monkeyProtocol.burn(msg.sender, amount);
        _monkeyStats[monkeyId].energy += energyForBanana(amount);
    }

    uint256 public constant ENERGY_PER_ETH = 10 ** 6;

    function energyForEth(uint256 amount) public pure returns (uint256) {
        return amount * ENERGY_PER_ETH;
    }

    function feedEth(
        uint256 monkeyId
    ) external payable onlyOwner(monkeyId) {
        _monkeyStats[monkeyId].energy += energyForEth(msg.value);
    }
}
