pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Lending is ERC1155Receiver, Ownable {
    address public acceptedPayTokenAddress;
    address public ERC1155Address;

    struct ERC1155ForLend {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        address acceptedToken;
        uint256 acceptedTokenId;
    }

    mapping(address => ERC1155ForLend) public lentERC1155List;

    struct ERC1155TokenEntry {
        address borrowerAddress;
        address token;
        uint256 tokenId;
    }

    ERC1155TokenEntry[] private lendersWithTokens;

    event ERC1155ForLendUpdated(address token);
    event ERC1155ForLendRemoved(address token);

    function startBartering(address token, uint256 tokenId, uint256 durationHours, address acceptedToken, uint256 acceptedTokenId) public {
        // assuming token transfer is approved
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        require(lentERC1155List[token].borrower == address(0), 'Lending: Cannot change settings, token already lent');
        bytes memory data = abi.encodeWithSignature("");

        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);

        lentERC1155List[token] = ERC1155ForLend(durationHours, 0, address(this), address(0), acceptedToken, acceptedTokenId);

        lendersWithTokens.push(ERC1155TokenEntry(msg.sender, token, tokenId));

        lentERC1155List[token].lender = msg.sender;
        lentERC1155List[token].borrowedAtTimestamp = block.timestamp;

        emit ERC1155ForLendUpdated(token);
    }

    function makeOffer(address wantedToken, address offerToken, uint256 tokenId) public {

        address token = lentERC1155List[wantedToken].acceptedToken;
        uint256 acceptedTokenId = lentERC1155List[wantedToken].acceptedTokenId;

        require(lentERC1155List[wantedToken].durationHours != 0, "Barter completed!");
        bytes memory data = abi.encodeWithSignature("");

        if (isDurationExpired(lentERC1155List[wantedToken].borrowedAtTimestamp, lentERC1155List[wantedToken].durationHours)) {
            require(token == offerToken, 'Not accepted token!');
            require(acceptedTokenId == tokenId, 'Not accepted id!');

            IERC1155(offerToken).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);

            lentERC1155List[wantedToken].borrower = msg.sender;

            emit ERC1155ForLendUpdated(wantedToken);
        } else {
            address lender = lentERC1155List[token].lender;
            IERC1155(token).safeTransferFrom(address(this), msg.sender, tokenId, 1, data);
        }
    }

    function approveBarter(address token, uint256 tokenId) public {

        address lender = lentERC1155List[token].lender;
        address acceptedToken = lentERC1155List[token].acceptedToken;
        uint256 acceptedTokenId = lentERC1155List[token].acceptedTokenId;
        address borrower = lentERC1155List[token].borrower;

        require(lender == msg.sender, 'Not creator of barter!');

        bytes memory data = abi.encodeWithSignature("");
        IERC1155(acceptedToken).safeTransferFrom(address(this), borrower, tokenId, 1, data);
        IERC1155(token).safeTransferFrom(address(this), lender, acceptedTokenId, 1, data);

        lentERC1155List[token].durationHours = 0;

        emit ERC1155ForLendRemoved(token);
    }

    function isDurationExpired(uint256 borrowedAtTimestamp, uint256 durationHours) public view returns(bool) {
        uint256 secondsPassed = block.timestamp - borrowedAtTimestamp;
        uint256 hoursPassed = secondsPassed * 60 * 60;
        return hoursPassed > durationHours;
    }


    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

}