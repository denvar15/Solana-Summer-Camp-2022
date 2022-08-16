// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IArom {
    struct Checkpoint {
        uint32 fromBlock;
        uint256 votes;
    }

    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    event DelegateVotesChanged(address indexed delegate, uint previousBalance, uint newBalance);

    function enter(uint256 _amount) external;

    function leave(uint256 _share) external;

    function moraBalance(address _account) external view returns (uint256 moraAmount);

    function aromForMora(uint256 _aromAmount) external view returns (uint256 moraAmount);

    function moraForArom(uint256 _moraAmount) external view returns (uint256 aromAmount);

    function transferFrom(address sender, address recipient, uint256 amount) external virtual returns (bool);

    function transfer(address recipient, uint256 amount) external virtual returns (bool);

    function delegates(address delegator) external view returns (address);

    function delegate(address delegatee) external;

    function delegateBySig(address delegatee, uint nonce, uint expiry, uint8 v, bytes32 r, bytes32 s ) external;

    function getCurrentVotes(address account) external view returns (uint256);

    function getPriorVotes(address account, uint blockNumber) external view returns (uint256);
}