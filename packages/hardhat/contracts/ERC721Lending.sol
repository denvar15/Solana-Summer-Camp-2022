pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Lending is Ownable {
    address public acceptedPayTokenAddress;
    address public ERC1155Address;

    struct ERC721ForLend {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        address acceptedToken;
        uint256 acceptedTokenId;
    }

    mapping(address => ERC721ForLend) public lentERC721List;

    struct ERC721TokenEntry {
        address borrowerAddress;
        address token;
        uint256 tokenId;
    }

    ERC721TokenEntry[] private lendersWithTokens;

    event ERC721ForLendUpdated(address token);
    event ERC721ForLendRemoved(uint256 tokenId);
    event Received();

    function startBartering(address token, uint256 tokenId, uint256 durationHours, address acceptedToken, uint256 acceptedTokenId) public {
        // assuming token transfer is approved
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        require(lentERC721List[token].borrower == address(0), 'Lending: Cannot change settings, token already lent');

        IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);

        lentERC721List[token] = ERC721ForLend(durationHours, 0, address(this), address(0), acceptedToken, acceptedTokenId);

        lendersWithTokens.push(ERC721TokenEntry(msg.sender, token, tokenId));

        lentERC721List[token].lender = msg.sender;
        lentERC721List[token].borrowedAtTimestamp = block.timestamp;

        emit ERC721ForLendUpdated(token);
    }

    function makeOffer(address wantedToken, address offerToken, uint256 tokenId) public {

        address token = lentERC721List[wantedToken].acceptedToken;
        uint256 acceptedTokenId = lentERC721List[wantedToken].acceptedTokenId;

        require(lentERC721List[wantedToken].durationHours != 0, "Barter completed!");

        if (isDurationExpired(lentERC721List[wantedToken].borrowedAtTimestamp, lentERC721List[wantedToken].durationHours)) {
            require(token == offerToken, 'Not accepted token!');
            require(acceptedTokenId == tokenId, 'Not accepted id!');

            IERC721(offerToken).safeTransferFrom(msg.sender, address(this), tokenId);

            lentERC721List[wantedToken].borrower = msg.sender;

            emit ERC721ForLendUpdated(wantedToken);
        } else {
            address lender = lentERC721List[token].lender;
            IERC721(token).safeTransferFrom(address(this), msg.sender, tokenId);
        }
    }

    function approveBarter(address token, uint256 tokenId) public {

        address lender = lentERC721List[token].lender;
        address acceptedToken = lentERC721List[token].acceptedToken;
        uint256 acceptedTokenId = lentERC721List[token].acceptedTokenId;
        address borrower = lentERC721List[token].borrower;

        require(lender == msg.sender, 'Not creator of barter!');

        IERC721(acceptedToken).safeTransferFrom(address(this), borrower, tokenId);
        IERC721(token).safeTransferFrom(address(this), lender, acceptedTokenId);

        lentERC721List[token].durationHours = 0;

        emit ERC721ForLendUpdated(token);
    }

    function isDurationExpired(uint256 borrowedAtTimestamp, uint256 durationHours) public view returns(bool) {
        uint256 secondsPassed = block.timestamp - borrowedAtTimestamp;
        uint256 hoursPassed = secondsPassed * 60 * 60;
        return hoursPassed > durationHours;
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    )
    external
    returns(bytes4)
    {
        _operator;
        _from;
        _tokenId;
        _data;
        emit Received();
        return 0x150b7a02;
    }

}