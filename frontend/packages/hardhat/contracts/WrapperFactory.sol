// SPDX-License-Identifier: MIT
pragma solidity >0.4.23 <0.9.0;
import "./NeonERC20Wrapper.sol";
contract WrapperFactory {
    NeonERC20Wrapper[] private _wrappers;
    function createWrapp(
        bytes32 _tokenMint
    ) public {
        NeonERC20Wrapper wrapp = new NeonERC20Wrapper(
            _tokenMint
        );
        _wrappers.push(wrapp);
    }
    function allWrapps(uint256 limit, uint256 offset)
        public
        view
        returns (NeonERC20Wrapper[] memory coll)
    {
        return _wrappers;
    }

    function getWrapp(uint256 index)
    public
    view
    returns (NeonERC20Wrapper Wrapp) {
        return _wrappers[index];
    }
}