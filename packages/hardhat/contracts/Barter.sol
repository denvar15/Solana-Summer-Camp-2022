pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Barter is ERC1155Receiver, Ownable {
    struct ERC1155ForLend {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        address acceptedToken;
        uint256 acceptedTokenId;
        uint256 acceptedTokenStandard;
    }

    mapping(address => mapping(uint256 => ERC1155ForLend)) lentERC1155List;

    //mapping(address => ERC1155ForLend) public lentERC1155List;

    event ERC1155ForLendUpdated(address token);
    event ERC1155ForLendRemoved(address token);

    struct ERC721ForLend {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        address acceptedToken;
        uint256 acceptedTokenId;
        uint256 acceptedTokenStandard;
    }

    mapping(address => mapping(uint256 => ERC721ForLend)) lentERC721List;

    //mapping(address => ERC721ForLend) public lentERC721List;

    event ERC721ForLendUpdated(address token);
    event ERC721ForLendRemoved(address token);
    event Received();

    function startBartering(address token, uint256 tokenId, uint256 durationHours, address acceptedToken,
        uint256 acceptedTokenId, uint256 tokenStandard, uint256 acceptedTokenStandard) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        if (tokenStandard == 1155) {
            require(lentERC1155List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);
            lentERC1155List[token][tokenId] = ERC1155ForLend(durationHours, 0, address(this), address(0), acceptedToken, acceptedTokenId, acceptedTokenStandard);
            lentERC1155List[token][tokenId].lender = msg.sender;
            lentERC1155List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC1155ForLendUpdated(token);
        } else if (tokenStandard == 721) {
            require(lentERC721List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
            lentERC721List[token][tokenId] = ERC721ForLend(durationHours, 0, address(this), address(0), acceptedToken, acceptedTokenId, acceptedTokenStandard);
            lentERC721List[token][tokenId].lender = msg.sender;
            lentERC721List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC721ForLendUpdated(token);
        }
    }

    function makeOffer(address wantedToken, uint256 wantedTokenId, address offerToken, uint256 offerTokenId, uint256 wantedTokenStandard, uint256 offerTokenStandard) public {
        if (wantedTokenStandard == 1155) {
            address token = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            uint256 acceptedTokenId = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId;
            require(lentERC1155List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(lentERC1155List[wantedToken][wantedTokenId].borrowedAtTimestamp, lentERC1155List[wantedToken][wantedTokenId].durationHours)) {
                require(token == offerToken, 'Not accepted token!');
                require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                if (offerTokenStandard == 1155) {
                    IERC1155(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId, 1, data);
                    lentERC1155List[wantedToken][wantedTokenId].borrower = msg.sender;
                    emit ERC1155ForLendUpdated(wantedToken);
                } else if (offerTokenStandard == 721) {
                    IERC721(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId);
                    lentERC1155List[wantedToken][wantedTokenId].borrower = msg.sender;
                    emit ERC1155ForLendUpdated(wantedToken);
                }
            } else {
                IERC1155(token).safeTransferFrom(address(this), msg.sender, wantedTokenId, 1, data);
            }
        } else if (wantedTokenStandard == 721) {
            address token = lentERC721List[wantedToken][wantedTokenId].acceptedToken;
            uint256 acceptedTokenId = lentERC721List[wantedToken][wantedTokenId].acceptedTokenId;
            require(lentERC721List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(lentERC721List[wantedToken][wantedTokenId].borrowedAtTimestamp, lentERC721List[wantedToken][wantedTokenId].durationHours)) {
                require(token == offerToken, 'Not accepted token!');
                require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                if (offerTokenStandard == 1155) {
                    IERC1155(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId, 1, data);
                    lentERC721List[wantedToken][wantedTokenId].borrower = msg.sender;
                    emit ERC721ForLendUpdated(wantedToken);
                } else if (offerTokenStandard == 721) {
                    IERC721(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId);
                    lentERC721List[wantedToken][wantedTokenId].borrower = msg.sender;
                    emit ERC721ForLendUpdated(wantedToken);
                }
            } else {
                IERC721(token).safeTransferFrom(address(this), msg.sender, wantedTokenId);
            }
        }
    }

    function approveBarter(address token, uint256 tokenId, uint256 tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (tokenStandard == 1155) {
            address lender = lentERC1155List[token][tokenId].lender;
            address acceptedToken = lentERC1155List[token][tokenId].acceptedToken;
            uint256 acceptedTokenId = lentERC1155List[token][tokenId].acceptedTokenId;
            uint256 acceptedTokenStandard = lentERC1155List[token][tokenId].acceptedTokenStandard;
            address borrower = lentERC1155List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            IERC1155(token).safeTransferFrom(address(this), borrower, tokenId, 1, data);
            data = abi.encodeWithSignature("");
            if (acceptedTokenStandard == 1155) {
                IERC1155(acceptedToken).safeTransferFrom(address(this), lender, acceptedTokenId, 1, data);
            } else if (acceptedTokenStandard == 721) {
                IERC721(acceptedToken).safeTransferFrom(address(this), lender, acceptedTokenId);
            }
            lentERC1155List[token][tokenId].durationHours = 0;
            lentERC1155List[token][tokenId].borrower = address(0);
            emit ERC1155ForLendRemoved(token);
        } else {
            address lender = lentERC721List[token][tokenId].lender;
            address acceptedToken = lentERC721List[token][tokenId].acceptedToken;
            uint256 acceptedTokenId = lentERC721List[token][tokenId].acceptedTokenId;
            uint256 acceptedTokenStandard = lentERC721List[token][tokenId].acceptedTokenStandard;
            address borrower = lentERC721List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            IERC721(token).safeTransferFrom(address(this), borrower, tokenId);
            data = abi.encodeWithSignature("");
            if (acceptedTokenStandard == 1155) {
                IERC1155(acceptedToken).safeTransferFrom(address(this), lender, acceptedTokenId, 1, data);
            } else if (acceptedTokenStandard == 721) {
                IERC721(acceptedToken).safeTransferFrom(address(this), lender, acceptedTokenId);
            }
            lentERC721List[token][tokenId].durationHours = 0;
            lentERC721List[token][tokenId].borrower = address(0);
        emit ERC721ForLendRemoved(token);
        }
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