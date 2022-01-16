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
        require(
            _monkeyProtocol.hasRole(PROTOCOL, msg.sender),
            "only protocol"
        );
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
        _initExpeditions();
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
        require(!_monkeyStats[monkeyId].busy, "monkey busy");
        _;
    }

    // EXPEDITION

    enum ExpeditionArea {
        School,
        Arctic
    }

    struct Expedition {
        uint256 duration;
        uint256 energy;
        uint256 xp;
        uint256 bananas;
    }

    mapping(ExpeditionArea => Expedition) private _expeditions;

    function expedition(
        ExpeditionArea area
    ) external view returns (Expedition memory) {
        return _expeditions[area];
    }

    function _initExpeditions() internal {
        _expeditions[ExpeditionArea.School] = Expedition(
            8 seconds,
            8 * DECIMALS,
            0 * DECIMALS,
            10 * DECIMALS
        );
        _expeditions[ExpeditionArea.Arctic] = Expedition(
            30 seconds,
            30 * DECIMALS,
            10 * DECIMALS,
            50 * DECIMALS
        );
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

    event MonkeyDrain(uint256 monkeyId, uint256 amount);

    function startExpedition(
        uint256 monkeyId,
        ExpeditionArea area
    ) external onlyOwner(monkeyId) canAction(monkeyId) {
        require(
            _monkeyStats[monkeyId].xp >= _expeditions[area].xp,
            "not enough xp"
        );
        require(
            _monkeyStats[monkeyId].energy >= _expeditions[area].energy,
            "not enough energy"
        );
        _monkeyStats[monkeyId].energy -= _expeditions[area].energy;
        emit MonkeyDrain(monkeyId, _expeditions[area].energy);

        _monkeyExpeditions[monkeyId].ends =
            block.timestamp + _expeditions[area].duration;
        _monkeyExpeditions[monkeyId].area = area;
        _monkeyExpeditions[monkeyId].ongoing = true;

        _monkeyStats[monkeyId].busy = true;
    }

    function endExpedition(
        uint256 monkeyId
    ) external onlyOwner(monkeyId) {
        require(_monkeyExpeditions[monkeyId].ongoing, "not on expedition");
        require(
            block.timestamp > _monkeyExpeditions[monkeyId].ends,
            "not done"
        );
        _monkeyExpeditions[monkeyId].ongoing = false;
        _monkeyStats[monkeyId].busy = false;
        _monkeyProtocol.mint(
            msg.sender,
            _expeditions[_monkeyExpeditions[monkeyId].area].bananas
        );
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

    function startDaycare(
        uint256 monkeyId
    ) external onlyOwner(monkeyId) canAction(monkeyId) {
        _monkeyStats[monkeyId].busy = true;
        _monkeyDaycares[monkeyId].started = block.timestamp;
        _monkeyDaycares[monkeyId].ongoing = true;
    }

    function endDaycare(
        uint256 monkeyId
    ) external onlyOwner(monkeyId) {
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
    ) external onlyOwner(monkeyId) canAction(monkeyId) {
        _monkeyProtocol.burn(msg.sender, amount);
        _monkeyStats[monkeyId].energy += energyForBanana(amount);
        emit MonkeyEnergy(monkeyId, energyForBanana(amount));
    }

    uint256 public constant ENERGY_PER_ETH = 10 ** 6;

    function energyForEth(uint256 amount) public pure returns (uint256) {
        return amount * ENERGY_PER_ETH;
    }

    function feedEth(
        uint256 monkeyId
    ) external payable canAction(monkeyId) canAction(monkeyId) {
        _monkeyStats[monkeyId].energy += energyForEth(msg.value);
        emit MonkeyEnergy(monkeyId, energyForEth(msg.value));
    }
}
