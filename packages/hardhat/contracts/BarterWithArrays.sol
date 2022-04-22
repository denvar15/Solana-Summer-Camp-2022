pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract BarterWithArrays is ERC1155Receiver, Ownable {
    struct ERC1155ForBarter {
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

    mapping(address => mapping(uint256 => ERC1155ForBarter)) barterERC1155List;

    event ERC1155ForBarterUpdated(address token);
    event ERC1155ForBarterRemoved(address token);

    struct ERC721ForBarter {
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

    mapping(address => mapping(uint256 => ERC721ForBarter)) barterERC721List;

    struct Barter {
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

    mapping(address => Barter[]) public UsersBarters;

    mapping(address => uint256) public UsersBarterCount;

    event ERC721ForBarterUpdated(address token);
    event ERC721ForBarterRemoved(address token);
    event Received();

    function startBartering(address token, uint256 tokenId, uint256 durationHours, address[] memory acceptedToken,
        uint256[] memory acceptedTokenId, uint256 tokenStandard, uint256[] memory acceptedTokenStandard) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        UsersBarterCount[msg.sender] += 1;
        UsersBarters[msg.sender].push(Barter(1, token, tokenId, tokenStandard, address(0), acceptedToken,
            acceptedTokenId, acceptedTokenStandard, address(0), 0, 0));
        if (tokenStandard == 1155) {
            require(barterERC1155List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);
            barterERC1155List[token][tokenId] = ERC1155ForBarter(durationHours, 0, address(this), address(0), acceptedToken,
                acceptedTokenId, acceptedTokenStandard, address(0), 0, 0);
            barterERC1155List[token][tokenId].lender = msg.sender;
            barterERC1155List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC1155ForBarterUpdated(token);
        } else if (tokenStandard == 721) {
            require(barterERC721List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
            barterERC721List[token][tokenId] = ERC721ForBarter(durationHours, 0, address(this), address(0), acceptedToken,
                acceptedTokenId, acceptedTokenStandard, address(0), 0, 0);
            barterERC721List[token][tokenId].lender = msg.sender;
            barterERC721List[token][tokenId].borrowedAtTimestamp = block.timestamp;
            emit ERC721ForBarterUpdated(token);
        }

    }

    function makeOffer(address wantedToken, uint256 wantedTokenId, address offerToken, uint256 offerTokenId,
        uint256 wantedTokenStandard, uint256 offerTokenStandard) public {
        if (wantedTokenStandard == 1155) {
            //address token = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //address[] memory acceptedToken = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //uint256[] memory acceptedTokenId = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId;
            //uint256[] memory acceptedTokenStandard = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard;
            require(barterERC1155List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(barterERC1155List[wantedToken][wantedTokenId].borrowedAtTimestamp, barterERC1155List[wantedToken][wantedTokenId].durationHours)) {
                //require(token == offerToken, 'Not accepted token!');
                //require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                uint256 totalCount = barterERC1155List[wantedToken][wantedTokenId].acceptedToken.length;
                uint256 res = 0;
                for (uint i = 0; i < totalCount; i++) {
                    address tok = barterERC1155List[wantedToken][wantedTokenId].acceptedToken[i];
                    uint256 id = barterERC1155List[wantedToken][wantedTokenId].acceptedTokenId[i];
                    uint256 stand = barterERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard[i];
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
                barterERC1155List[wantedToken][wantedTokenId].borrower = msg.sender;
                barterERC1155List[wantedToken][wantedTokenId].fulfilledToken = offerToken;
                barterERC1155List[wantedToken][wantedTokenId].fulfilledTokenId = offerTokenId;
                barterERC1155List[wantedToken][wantedTokenId].fulfilledTokenStandard = offerTokenStandard;
                updateUsersLend(offerToken, offerTokenId, offerTokenStandard, wantedToken, wantedTokenId, wantedTokenStandard, msg.sender);
                emit ERC1155ForBarterUpdated(wantedToken);
            } else {
                //IERC1155(token).safeTransferFrom(address(this), msg.sender, wantedTokenId, 1, data);
            }
        } else if (wantedTokenStandard == 721) {
            //address token = lentERC721List[wantedToken][wantedTokenId].acceptedToken;
            //address[] memory acceptedToken = lentERC1155List[wantedToken][wantedTokenId].acceptedToken;
            //uint256[] memory acceptedTokenId = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenId;
            //uint256[] memory acceptedTokenStandard = lentERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard;
            require(barterERC721List[wantedToken][wantedTokenId].durationHours != 0, "Barter completed!");
            bytes memory data = abi.encodeWithSignature("");
            if (isDurationExpired(barterERC721List[wantedToken][wantedTokenId].borrowedAtTimestamp, barterERC721List[wantedToken][wantedTokenId].durationHours)) {
                //require(token == offerToken, 'Not accepted token!');
                //require(acceptedTokenId == offerTokenId, 'Not accepted id!');
                uint256 totalCount = barterERC1155List[wantedToken][wantedTokenId].acceptedToken.length;
                uint256 res = 0;
                for (uint i = 0; i < totalCount; i++) {
                    address tok = barterERC1155List[wantedToken][wantedTokenId].acceptedToken[i];
                    uint256 id = barterERC1155List[wantedToken][wantedTokenId].acceptedTokenId[i];
                    uint256 stand = barterERC1155List[wantedToken][wantedTokenId].acceptedTokenStandard[i];
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
                barterERC721List[wantedToken][wantedTokenId].borrower = msg.sender;
                barterERC721List[wantedToken][wantedTokenId].fulfilledToken = offerToken;
                barterERC721List[wantedToken][wantedTokenId].fulfilledTokenId = offerTokenId;
                barterERC721List[wantedToken][wantedTokenId].fulfilledTokenStandard = offerTokenStandard;
                updateUsersLend(offerToken, offerTokenId, offerTokenStandard, wantedToken, wantedTokenId, wantedTokenStandard, msg.sender);
                emit ERC721ForBarterUpdated(wantedToken);
            } else {
                //IERC721(token).safeTransferFrom(address(this), msg.sender, wantedTokenId);
            }
        }
    }

    function approveBarter(address token, uint256 tokenId, uint256 tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (tokenStandard == 1155) {
            address lender = barterERC1155List[token][tokenId].lender;
            address fulfilledToken = barterERC1155List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = barterERC1155List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = barterERC1155List[token][tokenId].fulfilledTokenStandard;
            address borrower = barterERC1155List[token][tokenId].borrower;
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
            barterERC1155List[token][tokenId].durationHours = 0;
            barterERC1155List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userLend = UsersBarters[msg.sender][i];
                if (userLend.token == token && userLend.tokenId == tokenId &&
                    userLend.tokenStandard == tokenStandard) {
                    delete UsersBarters[msg.sender][i];
                    UsersBarterCount[msg.sender] -= 1;
                }
            }
            emit ERC1155ForBarterRemoved(token);
        } else {
            address lender = barterERC721List[token][tokenId].lender;
            address fulfilledToken = barterERC721List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = barterERC721List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = barterERC721List[token][tokenId].fulfilledTokenStandard;
            address borrower = barterERC721List[token][tokenId].borrower;
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
            barterERC721List[token][tokenId].durationHours = 0;
            barterERC721List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userLend = UsersBarters[msg.sender][i];
                if (userLend.token == token && userLend.tokenId == tokenId &&
                    userLend.tokenStandard == tokenStandard) {
                    delete UsersBarters[msg.sender][i];
                    UsersBarterCount[msg.sender] -= 1;
                }
            }
            emit ERC721ForBarterRemoved(token);
        }
    }

    function revokeBarter(address token, uint256 tokenId, uint256 tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (tokenStandard == 1155) {
            address lender = barterERC1155List[token][tokenId].lender;
            address fulfilledToken = barterERC1155List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = barterERC1155List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = barterERC1155List[token][tokenId].fulfilledTokenStandard;
            address borrower = barterERC1155List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            data = abi.encodeWithSignature("");
            require(IERC1155(token).balanceOf(address(this), tokenId) > 0, 'Not enough tokens!');
            if (fulfilledTokenStandard == 1155) {
                require(IERC1155(fulfilledToken).balanceOf(address(this), fulfilledTokenId) > 0, 'Not enough tokens!');
                IERC1155(fulfilledToken).safeTransferFrom(address(this), borrower, fulfilledTokenId, 1, data);
            } else if (fulfilledTokenStandard == 721) {
                //require(IERC721Enumerable(acceptedToken).tokenOfOwnerByIndex(address(this), acceptedTokenId) > 0, 'Not enough tokens!');
                IERC721(fulfilledToken).safeTransferFrom(address(this), borrower, fulfilledTokenId);
            }
            IERC1155(token).safeTransferFrom(address(this), lender, tokenId, 1, data);
            barterERC1155List[token][tokenId].durationHours = 0;
            barterERC1155List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[msg.sender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[msg.sender][i];
                    UsersBarterCount[msg.sender] -= 1;
                }
            }
            emit ERC1155ForBarterRemoved(token);
        } else {
            address lender = barterERC721List[token][tokenId].lender;
            address fulfilledToken = barterERC721List[token][tokenId].fulfilledToken;
            uint256 fulfilledTokenId = barterERC721List[token][tokenId].fulfilledTokenId;
            uint256 fulfilledTokenStandard = barterERC721List[token][tokenId].fulfilledTokenStandard;
            address borrower = barterERC721List[token][tokenId].borrower;
            require(lender == msg.sender, 'Not creator of barter!');
            data = abi.encodeWithSignature("");
            //require(IERC721Enumerable(token).tokenOfOwnerByIndex(address(this), tokenId) > 0, 'Not enough tokens!');
            if (fulfilledTokenStandard == 1155) {
                require(IERC1155(fulfilledToken).balanceOf(address(this), fulfilledTokenId) > 0, 'Not enough tokens!');
                IERC1155(fulfilledToken).safeTransferFrom(address(this), borrower, fulfilledTokenId, 1, data);
            } else if (fulfilledTokenStandard == 721) {
                //require(IERC721Enumerable(acceptedToken).tokenOfOwnerByIndex(address(this), acceptedTokenId) > 0, 'Not enough tokens!');
                IERC721(fulfilledToken).safeTransferFrom(address(this), borrower, fulfilledTokenId);
            }
            IERC721(token).safeTransferFrom(address(this), lender, tokenId);
            barterERC721List[token][tokenId].durationHours = 0;
            barterERC721List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[msg.sender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[msg.sender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[msg.sender][i];
                    UsersBarterCount[msg.sender] -= 1;
                }
            }
            emit ERC721ForBarterRemoved(token);
        }
    }

    function updateUsersLend(address offerToken, uint256 offerTokenId, uint256 offerTokenStandard, address wantedToken,
        uint256 wantedTokenId, uint256 wantedTokenStandard, address borrower) private {
        address lender = address(0);
        if (wantedTokenStandard == 1155) {
            lender = barterERC1155List[wantedToken][wantedTokenId].lender;
        } else if (wantedTokenStandard == 721) {
            lender = barterERC721List[wantedToken][wantedTokenId].lender;
        }
        uint256 totalCount = UsersBarters[lender].length;
        for (uint i = 0; i<totalCount; i++) {
            Barter memory userBarter = UsersBarters[lender][i];
            if (userBarter.token == wantedToken && userBarter.tokenId == wantedTokenId) {
                UsersBarters[lender][i].status = 2;
                UsersBarters[lender][i].fulfilledToken = offerToken;
                UsersBarters[lender][i].fulfilledTokenId = offerTokenId;
                UsersBarters[lender][i].fulfilledTokenStandard = offerTokenStandard;
                UsersBarters[lender][i].borrower = borrower;
            }
        }
    }

    function getAcceptedAddressesBarter(address user, uint256 counter) public view returns(address[] memory) {
        return UsersBarters[user][counter].acceptedToken;
    }

    function getAcceptedIdsBarter(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersBarters[user][counter].acceptedTokenId;
    }

    function getAcceptedStandardsBarter(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersBarters[user][counter].acceptedTokenStandard;
    }

    function approveIterChainBarter(address token, uint256 tokenId, uint256 tokenStandard, address borrower) public onlyOwner {
        if (tokenStandard == 1155) {
            address lender = barterERC1155List[token][tokenId].lender;
            require(IERC1155(token).balanceOf(address(this), tokenId) > 0, 'Not enough tokens!');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(address(this), borrower, tokenId, 1, data);
            barterERC1155List[token][tokenId].durationHours = 0;
            barterERC1155List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[lender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[lender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[lender][i];
                    UsersBarterCount[lender] -= 1;
                }
            }
            emit ERC1155ForBarterRemoved(token);
        } else {
            address lender = barterERC721List[token][tokenId].lender;
            IERC721(token).safeTransferFrom(address(this), borrower, tokenId);
            barterERC721List[token][tokenId].durationHours = 0;
            barterERC721List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[lender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[lender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[lender][i];
                    UsersBarterCount[lender] -= 1;
                }
            }
            emit ERC721ForBarterRemoved(token);
        }
    }

    function revokeIterChainBarter(address token, uint256 tokenId, uint256 tokenStandard, address borrower) public onlyOwner {
        if (tokenStandard == 1155) {
            address lender = barterERC1155List[token][tokenId].lender;
            require(IERC1155(token).balanceOf(address(this), tokenId) > 0, 'Not enough tokens!');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(address(this), borrower, tokenId, 1, data);
            barterERC1155List[token][tokenId].durationHours = 0;
            barterERC1155List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[lender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[lender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[lender][i];
                    UsersBarterCount[lender] -= 1;
                }
            }
            emit ERC1155ForBarterRemoved(token);
        } else {
            address lender = barterERC721List[token][tokenId].lender;
            IERC721(token).safeTransferFrom(address(this), borrower, tokenId);
            barterERC721List[token][tokenId].durationHours = 0;
            barterERC721List[token][tokenId].borrower = address(0);
            uint256 totalCount = UsersBarters[lender].length;
            for (uint i = 0; i<totalCount; i++) {
                Barter memory userBarter = UsersBarters[lender][i];
                if (userBarter.token == token && userBarter.tokenId == tokenId &&
                    userBarter.tokenStandard == tokenStandard) {
                    delete UsersBarters[lender][i];
                    UsersBarterCount[lender] -= 1;
                }
            }
            emit ERC721ForBarterRemoved(token);
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
