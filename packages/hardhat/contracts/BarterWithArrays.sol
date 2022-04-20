pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract BarterWithArrays is ERC1155Receiver, Ownable {
    struct ERC1155ForLend {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        address[] acceptedToken;
        uint256[] acceptedTokenId;
        uint256[] acceptedTokenStandard;
        address fulfilledToken;
        uint256 fulfilledTokenId;
        uint256 fulfilledTokenStandard;
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
        address[] acceptedToken;
        uint256[] acceptedTokenId;
        uint256[] acceptedTokenStandard;
        address fulfilledToken;
        uint256 fulfilledTokenId;
        uint256 fulfilledTokenStandard;
    }

    mapping(address => mapping(uint256 => ERC721ForLend)) lentERC721List;

    //mapping(address => ERC721ForLend) public lentERC721List;

    struct Lend {
        uint256 status;
        address token;
        uint256 tokenId;
        uint256 tokenStandard;
        address borrower;
        address[] acceptedToken;
        uint256[] acceptedTokenId;
        uint256[] acceptedTokenStandard;
        address fulfilledToken;
        uint256 fulfilledTokenId;
        uint256 fulfilledTokenStandard;
    }

    mapping(address => Lend[]) public UsersLend;

    mapping(address => uint256) public UsersLendCount;

    event ERC721ForLendUpdated(address token);
    event ERC721ForLendRemoved(address token);
    event Received();

    function startBartering(address token, uint256 tokenId, uint256 durationHours, address[] memory acceptedToken,
        uint256[] memory acceptedTokenId, uint256 tokenStandard, uint256[] memory acceptedTokenStandard) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        UsersLendCount[msg.sender] += 1;
        UsersLend[msg.sender].push(Lend(1, token, tokenId, tokenStandard, address(0), acceptedToken,
            acceptedTokenId, acceptedTokenStandard, address(0), 0, 0));
        if (tokenStandard == 1155) {
            require(lentERC1155List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);
            lentERC1155List[token][tokenId] = ERC1155ForLend(durationHours, 0, address(this), address(0), acceptedToken,
                acceptedTokenId, acceptedTokenStandard, address(0), 0, 0);
            lentERC1155List[token][tokenId].lender = msg.sender;
            lentERC1155List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC1155ForLendUpdated(token);
        } else if (tokenStandard == 721) {
            require(lentERC721List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
            lentERC721List[token][tokenId] = ERC721ForLend(durationHours, 0, address(this), address(0), acceptedToken,
                acceptedTokenId, acceptedTokenStandard, address(0), 0, 0);
            lentERC721List[token][tokenId].lender = msg.sender;
            lentERC721List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC721ForLendUpdated(token);
        }

    }

    function makeOffer(address wantedToken, uint256 wantedTokenId, address offerToken, uint256 offerTokenId,
        uint256 wantedTokenStandard, uint256 offerTokenStandard) public {
        if (wantedTokenStandard == 1155) {
            //address token = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //address[] memory acceptedToken = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //uint256[] memory acceptedTokenId = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId;
            //uint256[] memory acceptedTokenStandard = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard;
            require(lentERC1155List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(lentERC1155List[wantedToken][wantedTokenId].borrowedAtTimestamp, lentERC1155List[wantedToken][wantedTokenId].durationHours)) {
                //require(token == offerToken, 'Not accepted token!');
                //require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                uint256 totalCount = lentERC1155List[wantedToken][wantedTokenId].acceptedToken.length;
                uint256 res = 0;
                for (uint i = 0; i < totalCount; i++) {
                    address tok = lentERC1155List[wantedToken][wantedTokenId].acceptedToken[i];
                    uint256 id = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId[i];
                    uint256 stand = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard[i];
                    if (tok == offerToken && id == offerTokenId && stand == offerTokenStandard) {
                        res = 1;
                    }
                }
                require(res == 1, "Token not in array of accepted!");
                if (offerTokenStandard == 1155) {
                    IERC1155(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId, 1, data);
                } else if (offerTokenStandard == 721) {
                    IERC721(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId);
                }
                lentERC1155List[wantedToken][wantedTokenId].borrower = msg.sender;
                lentERC1155List[wantedToken][wantedTokenId].fulfilledToken = offerToken;
                lentERC1155List[wantedToken][wantedTokenId].fulfilledTokenId = offerTokenId;
                lentERC1155List[wantedToken][wantedTokenId].fulfilledTokenStandard = offerTokenStandard;
                updateUsersLend(offerToken, offerTokenId, offerTokenStandard, wantedToken, wantedTokenId, wantedTokenStandard, msg.sender);
                emit ERC1155ForLendUpdated(wantedToken);
            } else {
                //IERC1155(token).safeTransferFrom(address(this), msg.sender, wantedTokenId, 1, data);
            }
        } else if (wantedTokenStandard == 721) {
            //address token = lentERC721List[wantedToken][wantedTokenId].acceptedToken;
            //address[] memory acceptedToken = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //uint256[] memory acceptedTokenId = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId;
            //uint256[] memory acceptedTokenStandard = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard;
            require(lentERC721List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(lentERC721List[wantedToken][wantedTokenId].borrowedAtTimestamp, lentERC721List[wantedToken][wantedTokenId].durationHours)) {
                //require(token == offerToken, 'Not accepted token!');
                //require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                uint256 totalCount = lentERC1155List[wantedToken][wantedTokenId].acceptedToken.length;
                uint256 res = 0;
                for (uint i = 0; i < totalCount; i++) {
                    address tok = lentERC1155List[wantedToken][wantedTokenId].acceptedToken[i];
                    uint256 id = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId[i];
                    uint256 stand = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard[i];
                    if (tok == offerToken && id == offerTokenId && stand == offerTokenStandard) {
                        res = 1;
                    }
                }
                require(res == 1, "Token not in array of accepted!");
                if (offerTokenStandard == 1155) {
                    IERC1155(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId, 1, data);
                } else if (offerTokenStandard == 721) {
                    IERC721(offerToken).safeTransferFrom(msg.sender, address(this), offerTokenId);
                }
                lentERC721List[wantedToken][wantedTokenId].borrower = msg.sender;
                lentERC721List[wantedToken][wantedTokenId].fulfilledToken = offerToken;
                lentERC721List[wantedToken][wantedTokenId].fulfilledTokenId = offerTokenId;
                lentERC721List[wantedToken][wantedTokenId].fulfilledTokenStandard = offerTokenStandard;
                updateUsersLend(offerToken, offerTokenId, offerTokenStandard, wantedToken, wantedTokenId, wantedTokenStandard, msg.sender);
                emit ERC721ForLendUpdated(wantedToken);
            } else {
                //IERC721(token).safeTransferFrom(address(this), msg.sender, wantedTokenId);
            }
        }
    }

    function approveBarter(address token, uint256 tokenId, uint256 tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (tokenStandard == 1155) {
            address lender = lentERC1155List[token][tokenId].lender;
            address fulfilledToken = lentERC1155List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = lentERC1155List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = lentERC1155List[token][tokenId].fulfilledTokenStandard;
            address borrower = lentERC1155List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            data = abi.encodeWithSignature("");
            require(IERC1155(token).balanceOf(address(this), tokenId) > 0, 'Not enough tokens!');
            if (fulfilledTokenStandard == 1155) {
                require(IERC1155(fulfilledToken).balanceOf(address(this), fulfilledTokenId) > 0, 'Not enough tokens!');
                IERC1155(fulfilledToken).safeTransferFrom(address(this), lender, fulfilledTokenId, 1, data);
            } else if (fulfilledTokenStandard == 721) {
                //require(IERC721Enumerable(acceptedToken).tokenOfOwnerByIndex(address(this), acceptedTokenId) > 0, 'Not enough tokens!');
                IERC721(fulfilledToken).safeTransferFrom(address(this), lender, fulfilledTokenId);
            }
            IERC1155(token).safeTransferFrom(address(this), borrower, tokenId, 1, data);
            lentERC1155List[token][tokenId].durationHours = 0;
            lentERC1155List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersLend[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Lend memory userLend = UsersLend[msg.sender][i];
                if (userLend.token == token && userLend.tokenId == tokenId &&
                    userLend.tokenStandard == tokenStandard) {
                    delete UsersLend[msg.sender][i];
                    UsersLendCount[msg.sender] -= 1;
                }
            }
            emit ERC1155ForLendRemoved(token);
        } else {
            address lender = lentERC721List[token][tokenId].lender;
            address fulfilledToken = lentERC721List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = lentERC721List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = lentERC721List[token][tokenId].fulfilledTokenStandard;
            address borrower = lentERC721List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            data = abi.encodeWithSignature("");
            //require(IERC721Enumerable(token).tokenOfOwnerByIndex(address(this), tokenId) > 0, 'Not enough tokens!');
            if (fulfilledTokenStandard == 1155) {
                require(IERC1155(fulfilledToken).balanceOf(address(this), fulfilledTokenId) > 0, 'Not enough tokens!');
                IERC1155(fulfilledToken).safeTransferFrom(address(this), lender, fulfilledTokenId, 1, data);
            } else if (fulfilledTokenStandard == 721) {
                //require(IERC721Enumerable(acceptedToken).tokenOfOwnerByIndex(address(this), acceptedTokenId) > 0, 'Not enough tokens!');
                IERC721(fulfilledToken).safeTransferFrom(address(this), lender, fulfilledTokenId);
            }
            IERC721(token).safeTransferFrom(address(this), borrower, tokenId);
            lentERC721List[token][tokenId].durationHours = 0;
            lentERC721List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersLend[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Lend memory userLend = UsersLend[msg.sender][i];
                if (userLend.token == token && userLend.tokenId == tokenId &&
                    userLend.tokenStandard == tokenStandard) {
                    delete UsersLend[msg.sender][i];
                    UsersLendCount[msg.sender] -= 1;
                }
            }
            emit ERC721ForLendRemoved(token);
        }
    }

    function updateUsersLend(address offerToken, uint256 offerTokenId, uint256 offerTokenStandard, address wantedToken,
        uint256 wantedTokenId, uint256 wantedTokenStandard, address borrower) private {
        address lender = address(0);
        if (wantedTokenStandard == 1155) {
            lender = lentERC1155List[wantedToken][wantedTokenId].lender;
        } else if (wantedTokenStandard == 721) {
            lender = lentERC721List[wantedToken][wantedTokenId].lender;
        }
        uint256 totalCount = UsersLend[lender].length;
        for (uint i = 0; i<totalCount; i++) {
            Lend memory userLend = UsersLend[lender][i];
            if (userLend.token == wantedToken && userLend.tokenId == wantedTokenId) {
                UsersLend[lender][i].status = 2;
                UsersLend[lender][i].fulfilledToken = offerToken;
                UsersLend[lender][i].fulfilledTokenId = offerTokenId;
                UsersLend[lender][i].fulfilledTokenStandard = offerTokenStandard;
                UsersLend[lender][i].borrower = msg.sender;
            }
        }
    }

    function getAcceptedAddressesLend(address user, uint256 counter) public view returns(address[] memory) {
        return UsersLend[user][counter].acceptedToken;
    }

    function getAcceptedIdsLend(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersLend[user][counter].acceptedTokenId;
    }

    function getAcceptedStandardsLend(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersLend[user][counter].acceptedTokenStandard;
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