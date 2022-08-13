pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./IArom.sol";

contract RentContract is ERC1155Receiver, Ownable {
    /*
    struct ERC1155ForRent {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        uint256 collateralSum;
        uint256 aromAtStart;
    }

    mapping(address => mapping(uint256 => ERC1155ForRent)) rentERC1155List;

    event ERC1155ForRentUpdated(address token);
    event ERC1155ForRentRemoved(address token);

    struct ERC20ForRent {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        uint256 collateralSum;
        uint256 aromAtStart;
    }

    mapping(address => mapping(uint256 => ERC20ForRent)) rentERC20List;

    event ERC20ForRentUpdated(address token);
    event ERC20ForRentRemoved(address token);

    struct ERC721ForRent {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        uint256 collateralSum;
        uint256 aromAtStart;
    }

    mapping(address => mapping(uint256 => ERC721ForRent)) rentERC721List;

    event ERC721ForRentUpdated(address token);
    event ERC721ForRentRemoved(address token);
    */

    struct ERCForRent {
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
        address lender;
        address borrower;
        uint256 collateralSum;
        uint256 aromAtStart;
    }

    mapping(uint256 => mapping(address => mapping(uint256 => ERCForRent[]))) rentERCList;

    event NFTForRentUpdated(address token, uint256 tokenId);
    event NFTForRentRemoved(address token, uint256 tokenId);

    struct Rent {
        uint256 status;
        address[] token;
        uint256[] tokenId;
        uint256[] tokenStandard;
        address borrower;
        uint256 collateralSum;
        uint256 durationHours;
        uint256 borrowedAtTimestamp;
    }

    mapping(address => Rent[]) public UsersRents;

    mapping(address => uint256) public UsersRentCount;

    event Received();

    address AromAddress = 0xBc22A1304213b1a11eed3c5D116908575939BC4b;
    address MoraAddress = 0x972f3FE7Cd7f10ae8D27AAc17F0938Ea4773b149;

    function startRent(address[] memory token, uint256[] memory tokenId, uint256[] memory tokenStandard, uint256 durationHours, uint256 collateralSum) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        uint256 totalCount = token.length;
        UsersRentCount[msg.sender] += 1;
        UsersRents[msg.sender].push(Rent(1, token, tokenId, tokenStandard, address(0), collateralSum, durationHours, 0));
        bytes memory data = abi.encodeWithSignature("");
        for (uint i = 0; i < totalCount; i++) {
            //require(rentERCList[tokenStandard[i]][token[i]][tokenId[i]].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            if (tokenStandard[i] == 1155) {
                IERC1155(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i], 1, data);
            } else if (tokenStandard[i] == 721) {
                IERC721(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i]);
            } else if (tokenStandard[i] == 20) {
                IERC20(token[i]).transferFrom(msg.sender, address(this), 1);
            }
            rentERCList[tokenStandard[i]][token[i]][tokenId[i]].push(ERCForRent(durationHours, 0, msg.sender, address(0), collateralSum, 0));
            emit NFTForRentUpdated(token[i], tokenId[i]);
        }
    }

    /*function startRent(address[] memory token, uint256[] memory tokenId, uint256[] memory tokenStandard, uint256 durationHours, uint256 collateralSum) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        uint256 totalCount = token.length;
        UsersRentCount[msg.sender] += 1;
        UsersRents[msg.sender].push(Rent(1, token, tokenId, tokenStandard, address(0), collateralSum, durationHours, 0));
        for (uint i = 0; i < totalCount; i++) {
            if (tokenStandard[i] == 1155) {
                bytes memory data = abi.encodeWithSignature("");
                    require(rentERC1155List[token[i]][tokenId[i]].borrower == address(0), 'Lending: Cannot change settings, token already lent');
                    IERC1155(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i], 1, data);
                    rentERC1155List[token[i]][tokenId[i]] = ERC1155ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
                    rentERC1155List[token[i]][tokenId[i]].lender = msg.sender;
                    emit ERC1155ForRentUpdated(token[i]);
            } else if (tokenStandard[i] == 721) {
                    require(rentERC721List[token[i]][tokenId[i]].borrower == address(0), 'Lending: Cannot change settings, token already lent');
                    IERC721(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i]);
                    rentERC721List[token[i]][tokenId[i]] = ERC721ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
                    rentERC721List[token[i]][tokenId[i]].lender = msg.sender;
                    emit ERC721ForRentUpdated(token[i]);
            } else if (tokenStandard[i] == 20) {
                    require(rentERC20List[token[i]][tokenId[i]].borrower == address(0), 'Lending: Cannot change settings, token already lent');
                    IERC20(token[i]).transferFrom(msg.sender, address(this), 1);
                    rentERC20List[token[i]][tokenId[i]] = ERC20ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
                    rentERC20List[token[i]][tokenId[i]].lender = msg.sender;
                    emit ERC20ForRentUpdated(token[i]);
            }
        }
    }*/

    function makeOffer(address[] memory wantedToken, uint256[] memory wantedTokenId, uint256[] memory wantedTokenStandard, address lender) public {
        bytes memory data = abi.encodeWithSignature("");
        uint256 totalCount = wantedToken.length;
        for (uint i = 0; i < totalCount; i++) {
            uint256 rentsCount = rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]].length;
            ERCForRent memory item;
            uint index;
            for (uint j = 0; j < rentsCount; j++) {
                if (rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]][j].lender == lender) {
                    item = rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]][j];
                    index = j;
                }
            }
            require(item.borrowedAtTimestamp == 0, "Rent already started!");
            require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= item.collateralSum,
                "Not enough collateral allowance!");
            IERC20(MoraAddress).transferFrom(msg.sender, address(this), item.collateralSum);
            if (wantedTokenStandard[i] == 1155) {
                require(IERC1155(wantedToken[i]).balanceOf(address(this), wantedTokenId[i]) > 0, 'Not enough tokens!');
                IERC1155(wantedToken[i]).safeTransferFrom(address(this), msg.sender, wantedTokenId[i], 1, data);
            } else if (wantedTokenStandard[i] == 721) {
                require(IERC721(wantedToken[i]).balanceOf(address(this)) > 0, 'Not enough tokens!');
                IERC721(wantedToken[i]).safeTransferFrom(address(this), msg.sender, wantedTokenId[i]);
            } else if (wantedTokenStandard[i] == 20) {
                require(IERC20(wantedToken[i]).balanceOf(address(this)) > 0, 'Not enough tokens!');
                IERC20(wantedToken[i]).transfer(msg.sender, 1);
            }
            IERC20(MoraAddress).approve(AromAddress, item.collateralSum);
            IArom(AromAddress).enter(item.collateralSum);
            rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]][index].borrowedAtTimestamp = block.timestamp;
            rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]][index].borrower = msg.sender;
            rentERCList[wantedTokenStandard[i]][wantedToken[i]][wantedTokenId[i]][index].aromAtStart = IArom(AromAddress).moraForArom(item.collateralSum);
            updateUsersLend(wantedToken[i], wantedTokenId[i], wantedTokenStandard[i], msg.sender, block.timestamp, lender);
            emit NFTForRentUpdated(wantedToken[i], wantedTokenId[i]);
        }
    }

    /*function makeOffer(address[] memory wantedToken, uint256[] memory wantedTokenId, uint256[] memory wantedTokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        uint256 totalCount = wantedToken.length;
        for (uint i = 0; i < totalCount; i++) {
            if (wantedTokenStandard[i] == 1155) {
                require(rentERC1155List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp == 0, "Rent already started!");
                require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC1155List[wantedToken[i]][wantedTokenId[i]].collateralSum,
                    "Not enough collateral allowance!");
                IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC1155List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC1155List[wantedToken[i]][wantedTokenId[i]].borrower = msg.sender;
                require(IERC1155(wantedToken[i]).balanceOf(address(this), wantedTokenId[i]) > 0, 'Not enough tokens!');
                IERC1155(wantedToken[i]).safeTransferFrom(address(this), rentERC1155List[wantedToken[i]][wantedTokenId[i]].borrower, wantedTokenId[i], 1, data);
                IERC20(MoraAddress).approve(AromAddress, rentERC1155List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                IArom(AromAddress).enter(rentERC1155List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC1155List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp = block.timestamp;
                rentERC1155List[wantedToken[i]][wantedTokenId[i]].aromAtStart = IArom(AromAddress).moraForArom(rentERC1155List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                updateUsersLend(wantedToken[i], wantedTokenId[i], wantedTokenStandard[i], msg.sender, block.timestamp);
                emit ERC1155ForRentUpdated(wantedToken[i]);
            } else if (wantedTokenStandard[i] == 721) {
                require(rentERC721List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp == 0, "Rent already started!");
                require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC721List[wantedToken[i]][wantedTokenId[i]].collateralSum,
                    "Not enough collateral allowance!");
                IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC721List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC721List[wantedToken[i]][wantedTokenId[i]].borrower = msg.sender;
                require(IERC721(wantedToken[i]).balanceOf(address(this)) > 0, 'Not enough tokens!');
                IERC721(wantedToken[i]).safeTransferFrom(address(this), rentERC721List[wantedToken[i]][wantedTokenId[i]].borrower, wantedTokenId[i]);
                IERC20(MoraAddress).approve(AromAddress, rentERC721List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                IArom(AromAddress).enter(rentERC721List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC721List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp = block.timestamp;
                rentERC721List[wantedToken[i]][wantedTokenId[i]].aromAtStart = IArom(AromAddress).moraForArom(rentERC721List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                updateUsersLend(wantedToken[i], wantedTokenId[i], wantedTokenStandard[i], msg.sender, block.timestamp);
                emit ERC721ForRentUpdated(wantedToken[i]);
            } else if (wantedTokenStandard[i] == 20) {
                require(rentERC20List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp == 0, "Rent already started!");
                require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC20List[wantedToken[i]][wantedTokenId[i]].collateralSum,
                    "Not enough collateral allowance!");
                IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC20List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC20List[wantedToken[i]][wantedTokenId[i]].borrower = msg.sender;
                require(IERC20(wantedToken[i]).balanceOf(address(this)) > 0, 'Not enough tokens!');
                IERC20(wantedToken[i]).transfer(rentERC20List[wantedToken[i]][wantedTokenId[i]].borrower, 1);
                IERC20(MoraAddress).approve(AromAddress, rentERC20List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                IArom(AromAddress).enter(rentERC20List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                rentERC20List[wantedToken[i]][wantedTokenId[i]].borrowedAtTimestamp = block.timestamp;
                rentERC20List[wantedToken[i]][wantedTokenId[i]].aromAtStart = IArom(AromAddress).moraForArom(rentERC20List[wantedToken[i]][wantedTokenId[i]].collateralSum);
                updateUsersLend(wantedToken[i], wantedTokenId[i], wantedTokenStandard[i], msg.sender, block.timestamp);
                emit ERC20ForRentUpdated(wantedToken[i]);
            }
        }
    }*/

    function clearUsersRents(address token, uint256 tokenId, uint256 tokenStandard, address sender) public {
        uint256 totalCount = UsersRents[msg.sender].length;
        for (uint i = 0; i < totalCount; i++) {
            Rent memory userLend = UsersRents[msg.sender][i];
            uint256 totalCountTokens = userLend.token.length;
            for (uint j = 0; j < totalCountTokens; j++) {
                if (userLend.token[j] == token && userLend.tokenId[j] == tokenId &&
                    userLend.tokenStandard[j] == tokenStandard) {
                    delete UsersRents[msg.sender][i];
                    UsersRentCount[msg.sender] -= 1;
                }
            }
        }
    }

    function endRent(address[] memory token, uint256[] memory tokenId, uint256[] memory tokenStandard, address lender) public {
        bytes memory data = abi.encodeWithSignature("");
        uint256 totalCount = token.length;
        uint256 totalSupply = IERC20(AromAddress).totalSupply();
        for (uint i = 0; i < totalCount; i++) {
            ERCForRent memory item;
            uint index;
            uint256 rentsCount = rentERCList[tokenStandard[i]][token[i]][tokenId[i]].length;
            for (uint j = 0; j < rentsCount; j++) {
                if (rentERCList[tokenStandard[i]][token[i]][tokenId[i]][j].lender == lender) {
                    item = rentERCList[tokenStandard[i]][token[i]][tokenId[i]][j];
                    index = j;
                }
            }
            address borrower = item.borrower;
            require(borrower == msg.sender, 'Not borrower!');
            uint256 profit = IArom(AromAddress).aromForMora(item.aromAtStart) - item.collateralSum;
            if (tokenStandard[i] == 1155) {
                require(IERC1155(token[i]).balanceOf(address(borrower), tokenId[i]) > 0, 'Not enough tokens!');
                IERC1155(token[i]).safeTransferFrom(borrower, address(this), tokenId[i], 1, data);
                IERC1155(token[i]).safeTransferFrom(address(this), lender, tokenId[i], 1, data);
            } else if (tokenStandard[i] == 721) {
                require(IERC721(token[i]).balanceOf(address(borrower)) > 0, 'Not enough tokens!');
                IERC721(token[i]).safeTransferFrom(borrower, address(this), tokenId[i]);
                IERC721(token[i]).safeTransferFrom(address(this), lender, tokenId[i]);
            } else if (tokenStandard[i] == 20) {
                require(IERC20(token[i]).balanceOf(address(borrower)) > 0, 'Not enough tokens!');
                IERC20(token[i]).transferFrom(borrower, address(this), 1);
                IERC20(token[i]).transfer(lender, 1);
            }
            IArom(AromAddress).leave(item.collateralSum / totalSupply);
            if (!isDurationExpired(item.borrowedAtTimestamp, item.durationHours)) {
                IERC20(AromAddress).transfer(borrower, item.collateralSum);
                IERC20(AromAddress).transfer(lender, profit);
            } else {
                IERC20(AromAddress).transfer(lender, item.collateralSum + profit);
            }
            rentERCList[tokenStandard[i]][token[i]][tokenId[i]][index].durationHours = 0;
            rentERCList[tokenStandard[i]][token[i]][tokenId[i]][index].borrower = address(0);
            clearUsersRents(token[i], tokenId[i], tokenStandard[i], borrower);
            emit NFTForRentRemoved(token[i], tokenId[i]);
        }
    }

    /*
    function endRent(address[] memory token, uint256[] memory tokenId, uint256[] memory tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        uint256 totalCount = token.length;
        uint256 totalSupply = IERC20(AromAddress).totalSupply();
        for (uint i = 0; i < totalCount; i++) {
            if (tokenStandard[i] == 1155) {
                address lender = rentERC1155List[token[i]][tokenId[i]].lender;
                address borrower = rentERC1155List[token[i]][tokenId[i]].borrower;
                require(IERC1155(token[i]).balanceOf(address(msg.sender), tokenId[i]) > 0, 'Not enough tokens!');
                require(borrower == msg.sender, 'Not borrower!');
                uint256 profit = IArom(AromAddress).aromForMora(rentERC1155List[token[i]][tokenId[i]].aromAtStart) - rentERC1155List[token[i]][tokenId[i]].collateralSum;
                IERC1155(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i], 1, data);
                IERC1155(token[i]).safeTransferFrom(address(this), lender, tokenId[i], 1, data);
                IArom(AromAddress).leave(rentERC1155List[token[i]][tokenId[i]].collateralSum / totalSupply);
                if (!isDurationExpired(rentERC1155List[token[i]][tokenId[i]].borrowedAtTimestamp, rentERC1155List[token[i]][tokenId[i]].durationHours)) {
                    IERC20(AromAddress).transfer(borrower, rentERC1155List[token[i]][tokenId[i]].collateralSum);
                    IERC20(AromAddress).transfer(lender, profit);
                } else {
                    IERC20(AromAddress).transfer(lender, rentERC1155List[token[i]][tokenId[i]].collateralSum + profit);
                }
                rentERC1155List[token[i]][tokenId[i]].durationHours = 0;
                rentERC1155List[token[i]][tokenId[i]].borrower = address(0);
                clearUsersRents(token[i], tokenId[i], tokenStandard[i], msg.sender);
                emit ERC1155ForRentRemoved(token[i]);
            } else if (tokenStandard[i] == 721) {
                address lender = rentERC721List[token[i]][tokenId[i]].lender;
                address borrower = rentERC721List[token[i]][tokenId[i]].borrower;
                require(IERC721(token[i]).balanceOf(address(msg.sender)) > 0, 'Not enough tokens!');
                require(borrower == msg.sender, 'Not borrower!');
                uint256 profit = IArom(AromAddress).aromForMora(rentERC721List[token[i]][tokenId[i]].aromAtStart) - rentERC721List[token[i]][tokenId[i]].collateralSum;
                IERC721(token[i]).safeTransferFrom(msg.sender, address(this), tokenId[i]);
                IERC721(token[i]).safeTransferFrom(address(this), lender, tokenId[i]);
                IArom(AromAddress).leave(rentERC721List[token[i]][tokenId[i]].collateralSum / totalSupply);
                if (!isDurationExpired(rentERC721List[token[i]][tokenId[i]].borrowedAtTimestamp, rentERC721List[token[i]][tokenId[i]].durationHours)) {
                    IERC20(AromAddress).transfer(borrower, rentERC721List[token[i]][tokenId[i]].collateralSum);
                    IERC20(AromAddress).transfer(lender, profit);
                } else {
                    IERC20(AromAddress).transfer(lender, rentERC721List[token[i]][tokenId[i]].collateralSum + profit);
                }
                rentERC721List[token[i]][tokenId[i]].durationHours = 0;
                rentERC721List[token[i]][tokenId[i]].borrower = address(0);
                clearUsersRents(token[i], tokenId[i], tokenStandard[i], msg.sender);
                emit ERC721ForRentRemoved(token[i]);
            } else if (tokenStandard[i] == 20) {
                address lender = rentERC20List[token[i]][tokenId[i]].lender;
                address borrower = rentERC20List[token[i]][tokenId[i]].borrower;
                require(IERC20(token[i]).balanceOf(address(msg.sender)) > 0, 'Not enough tokens!');
                require(borrower == msg.sender, 'Not borrower!');
                uint256 profit = IArom(AromAddress).aromForMora(rentERC20List[token[i]][tokenId[i]].aromAtStart) - rentERC20List[token[i]][tokenId[i]].collateralSum;
                IERC20(token[i]).transferFrom(msg.sender, address(this), 1);
                IERC20(token[i]).transfer(lender, 1);
                IArom(AromAddress).leave(rentERC20List[token[i]][tokenId[i]].collateralSum / totalSupply);
                if (!isDurationExpired(rentERC20List[token[i]][tokenId[i]].borrowedAtTimestamp, rentERC20List[token[i]][tokenId[i]].durationHours)) {
                    IERC20(AromAddress).transfer(borrower, rentERC20List[token[i]][tokenId[i]].collateralSum);
                    IERC20(AromAddress).transfer(lender, profit);
                } else {
                    IERC20(AromAddress).transfer(lender, rentERC20List[token[i]][tokenId[i]].collateralSum + profit);
                }
                rentERC20List[token[i]][tokenId[i]].durationHours = 0;
                rentERC20List[token[i]][tokenId[i]].borrower = address(0);
                clearUsersRents(token[i], tokenId[i], tokenStandard[i], msg.sender);
                emit ERC20ForRentRemoved(token[i]);
            }
        }
    }
    */

    function updateUsersLend(address wantedToken, uint256 wantedTokenId, uint256 wantedTokenStandard, address borrower, uint256 time, address lender) private {
        uint256 totalCount = UsersRents[lender].length;
        for (uint i = 0; i < totalCount; i++) {
            Rent memory userRent = UsersRents[lender][i];
            uint256 totalCountTokens = userRent.token.length;
            for (uint j = 0; j < totalCountTokens; j++) {
                if (userRent.token[j] == wantedToken && userRent.tokenId[j] == wantedTokenId) {
                    UsersRents[lender][i].status = 2;
                    UsersRents[lender][i].borrower = borrower;
                    UsersRents[lender][i].borrowedAtTimestamp = time;
                }
            }
        }
    }

    function isDurationExpired(uint256 borrowedAtTimestamp, uint256 durationHours) public view returns(bool) {
        uint256 secondsPassed = block.timestamp - borrowedAtTimestamp;
        uint256 hoursPassed = secondsPassed * 60 * 60;
        return hoursPassed > durationHours;
    }

    function getOfferedAddressesRent(address user, uint256 counter) public view returns(address[] memory) {
        return UsersRents[user][counter].token;
    }

    function getOfferedIdsRent(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersRents[user][counter].tokenId;
    }

    function getOfferedStandardsRent(address user, uint256 counter) public view returns(uint256[] memory) {
        return UsersRents[user][counter].tokenStandard;
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

    /*
function approveRent(address token, uint256 tokenId, uint256 tokenStandard) public {
    bytes memory data = abi.encodeWithSignature("");
    if (tokenStandard == 1155) {
        address lender = rentERC1155List[token][tokenId].lender;
        address borrower = rentERC1155List[token][tokenId].borrower;
        require(lender == msg.sender, 'Not creator of rent!');
        require(IERC1155(token).balanceOf(address(this), tokenId) > 0, 'Not enough tokens!');
        IERC1155(token).safeTransferFrom(address(this), borrower, tokenId, 1, data);
        IArom(AromAddress).enter(rentERC1155List[token][tokenId].collateralSum);
        rentERC1155List[token][tokenId].borrowedAtTimestamp = block.timestamp;
        updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
        emit ERC1155ForRentUpdated(token);
    } else if (tokenStandard == 721) {
        address lender = rentERC721List[token][tokenId].lender;
        address borrower = rentERC721List[token][tokenId].borrower;
        require(lender == msg.sender, 'Not creator of barter!');
        IERC721(token).safeTransferFrom(address(this), borrower, tokenId);
        IArom(AromAddress).enter(rentERC1155List[token][tokenId].collateralSum);
        rentERC721List[token][tokenId].borrowedAtTimestamp = block.timestamp;
        updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
        emit ERC721ForRentUpdated(token);
    } else if (tokenStandard == 20) {
        address lender = rentERC20List[token][tokenId].lender;
        address borrower = rentERC20List[token][tokenId].borrower;
        require(lender == msg.sender, 'Not creator of barter!');
        IERC20(token).transfer(borrower, 1);
        IArom(AromAddress).enter(rentERC1155List[token][tokenId].collateralSum);
        rentERC20List[token][tokenId].borrowedAtTimestamp = block.timestamp;
        updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
        emit ERC20ForRentUpdated(token);
    }
}
*/
}
