pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Treaty is ERC1155, Ownable {
    uint256 private _currentTokenID = 0;
    mapping(uint256 => uint256) public tokenSupply;

    constructor(string memory _uri) ERC1155(_uri)
    {}

    function mint (
        address _to,
        address _toSecond,
        uint256 _id,
        uint256 _quantity,
        bytes memory _data
    ) public onlyOwner {
        if (tokenSupply[_id] == 0)
            require(_id == _currentTokenID, "Wrong id provided");
        _mint(_to, _id, _quantity, _data);
        _mint(_toSecond, _id, _quantity, _data);
        tokenSupply[_id] = tokenSupply[_id] + _quantity;
        _incrementTokenTypeId();
    }

    function _getNextTokenID() private view returns (uint256) {
        return _currentTokenID + 1;
    }

    function _incrementTokenTypeId() private {
        _currentTokenID++;
    }

    function getCurrentTokenID() public view returns(uint256){
        return _currentTokenID;
    }
}