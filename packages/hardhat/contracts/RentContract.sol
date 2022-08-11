pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./IArom.sol";

contract RentContract is ERC1155Receiver, Ownable {
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

    struct Rent {
        uint256 status;
        address token;
        uint256 tokenId;
        uint256 tokenStandard;
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

    function startRent(address token, uint256 tokenId, uint256 tokenStandard, uint256 durationHours, uint256 collateralSum) public {
        require(durationHours > 0, 'Lending: Lending duration must be above 0');
        UsersRentCount[msg.sender] += 1;
        UsersRents[msg.sender].push(Rent(1, token, tokenId, tokenStandard, address(0), collateralSum, durationHours, 0));
        if (tokenStandard == 1155) {
            require(rentERC1155List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            bytes memory data = abi.encodeWithSignature("");
            IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);
            rentERC1155List[token][tokenId] = ERC1155ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
            rentERC1155List[token][tokenId].lender = msg.sender;
            emit ERC1155ForRentUpdated(token);
        } else if (tokenStandard == 721) {
            require(rentERC721List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
            rentERC721List[token][tokenId] = ERC721ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
            rentERC721List[token][tokenId].lender = msg.sender;
            emit ERC721ForRentUpdated(token);
        } else if (tokenStandard == 20) {
            require(rentERC20List[token][tokenId].borrower == address(0), 'Lending: Cannot change settings, token already lent');
            IERC20(token).transferFrom(msg.sender, address(this), 1);
            rentERC20List[token][tokenId] = ERC20ForRent(durationHours, 0, address(this), address(0), collateralSum, 0);
            rentERC20List[token][tokenId].lender = msg.sender;
            emit ERC20ForRentUpdated(token);
        }
    }

    function makeOffer(address wantedToken, uint256 wantedTokenId, uint256 wantedTokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (wantedTokenStandard == 1155) {
            require(rentERC1155List[wantedToken][wantedTokenId].borrowedAtTimestamp == 0, "Rent already started!");
            require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC1155List[wantedToken][wantedTokenId].collateralSum,
                "Not enough collateral allowance!");
            IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            rentERC1155List[wantedToken][wantedTokenId].borrower = msg.sender;
            require(IERC1155(wantedToken).balanceOf(address(this), wantedTokenId) > 0, 'Not enough tokens!');
            IERC1155(wantedToken).safeTransferFrom(address(this), rentERC1155List[wantedToken][wantedTokenId].borrower, wantedTokenId, 1, data);
            IERC20(MoraAddress).approve(AromAddress, rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            IArom(AromAddress).enter(rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            rentERC1155List[wantedToken][wantedTokenId].borrowedAtTimestamp = block.timestamp;
            rentERC1155List[wantedToken][wantedTokenId].aromAtStart = IArom(AromAddress).moraForArom(rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
            emit ERC1155ForRentUpdated(wantedToken);
        } else if (wantedTokenStandard == 721) {
            require(rentERC721List[wantedToken][wantedTokenId].borrowedAtTimestamp == 0, "Rent already started!");
            require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC721List[wantedToken][wantedTokenId].collateralSum,
                "Not enough collateral allowance!");
            IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC721List[wantedToken][wantedTokenId].collateralSum);
            rentERC721List[wantedToken][wantedTokenId].borrower = msg.sender;
            require(IERC721(wantedToken).balanceOf(address(this)) > 0, 'Not enough tokens!');
            IERC721(wantedToken).safeTransferFrom(address(this), rentERC721List[wantedToken][wantedTokenId].borrower, wantedTokenId);
            IERC20(MoraAddress).approve(AromAddress, rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            IArom(AromAddress).enter(rentERC721List[wantedToken][wantedTokenId].collateralSum);
            rentERC721List[wantedToken][wantedTokenId].borrowedAtTimestamp = block.timestamp;
            rentERC721List[wantedToken][wantedTokenId].aromAtStart = IArom(AromAddress).moraForArom(rentERC721List[wantedToken][wantedTokenId].collateralSum);
            updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
            emit ERC721ForRentUpdated(wantedToken);
        } else if (wantedTokenStandard == 20) {
            require(rentERC20List[wantedToken][wantedTokenId].borrowedAtTimestamp == 0, "Rent already started!");
            require(IERC20(MoraAddress).allowance(msg.sender, address(this)) >= rentERC20List[wantedToken][wantedTokenId].collateralSum,
                "Not enough collateral allowance!");
            IERC20(MoraAddress).transferFrom(msg.sender, address(this), rentERC20List[wantedToken][wantedTokenId].collateralSum);
            rentERC20List[wantedToken][wantedTokenId].borrower = msg.sender;
            require(IERC20(wantedToken).balanceOf(address(this)) > 0, 'Not enough tokens!');
            IERC20(wantedToken).transfer(rentERC20List[wantedToken][wantedTokenId].borrower, 1);
            IERC20(MoraAddress).approve(AromAddress, rentERC1155List[wantedToken][wantedTokenId].collateralSum);
            IArom(AromAddress).enter(rentERC20List[wantedToken][wantedTokenId].collateralSum);
            rentERC20List[wantedToken][wantedTokenId].borrowedAtTimestamp = block.timestamp;
            rentERC20List[wantedToken][wantedTokenId].aromAtStart = IArom(AromAddress).moraForArom(rentERC20List[wantedToken][wantedTokenId].collateralSum);
            updateUsersLend(wantedToken, wantedTokenId, wantedTokenStandard, msg.sender, block.timestamp);
            emit ERC20ForRentUpdated(wantedToken);
        }
    }

    function clearUsersRents(address token, uint256 tokenId, uint256 tokenStandard, address sender) public {
        uint256 totalCount = UsersRents[msg.sender].length;
        for (uint i = 0; i < totalCount; i++) {
            Rent memory userLend = UsersRents[msg.sender][i];
            if (userLend.token == token && userLend.tokenId == tokenId &&
                userLend.tokenStandard == tokenStandard) {
                delete UsersRents[msg.sender][i];
                UsersRentCount[msg.sender] -= 1;
            }
        }
    }

    function endRent(address token, uint256 tokenId, uint256 tokenStandard) public {
        bytes memory data = abi.encodeWithSignature("");
        if (tokenStandard == 1155) {
            address lender = rentERC1155List[token][tokenId].lender;
            address borrower = rentERC1155List[token][tokenId].borrower;
            require(IERC1155(token).balanceOf(address(msg.sender), tokenId) > 0, 'Not enough tokens!');
            require(borrower == msg.sender, 'Not borrower!');
            IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, 1, data);
            IERC1155(token).safeTransferFrom(address(this), lender, tokenId, 1, data);
            IArom(AromAddress).leave(rentERC1155List[token][tokenId].collateralSum);
            uint256 profit = IArom(AromAddress).aromForMora(rentERC1155List[token][tokenId].aromAtStart)
            - rentERC1155List[token][tokenId].collateralSum;
            if (!isDurationExpired(rentERC1155List[token][tokenId].borrowedAtTimestamp, rentERC1155List[token][tokenId].durationHours)) {
                IERC20(AromAddress).transferFrom(address(this), borrower, rentERC1155List[token][tokenId].collateralSum);
                IERC20(AromAddress).transferFrom(address(this), lender, profit);
            } else {
                IERC20(AromAddress).transferFrom(address(this), lender, rentERC1155List[token][tokenId].collateralSum + profit);
            }
            rentERC1155List[token][tokenId].durationHours = 0;
            rentERC1155List[token][tokenId].borrower = address(0);
            clearUsersRents(token, tokenId, tokenStandard, msg.sender);
            emit ERC1155ForRentRemoved(token);
        } else if (tokenStandard == 721) {
            address lender = rentERC721List[token][tokenId].lender;
            address borrower = rentERC721List[token][tokenId].borrower;
            require(IERC721(token).balanceOf(address(msg.sender)) > 0, 'Not enough tokens!');
            require(borrower == msg.sender, 'Not borrower!');
            IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
            IERC721(token).safeTransferFrom(address(this), lender, tokenId);
            IArom(AromAddress).leave(rentERC721List[token][tokenId].collateralSum);
            uint256 profit = IArom(AromAddress).aromForMora(rentERC721List[token][tokenId].aromAtStart)
            - rentERC721List[token][tokenId].collateralSum;
            if (!isDurationExpired(rentERC721List[token][tokenId].borrowedAtTimestamp, rentERC721List[token][tokenId].durationHours)) {
                IERC20(AromAddress).transferFrom(address(this), borrower, rentERC721List[token][tokenId].collateralSum);
                IERC20(AromAddress).transferFrom(address(this), lender, profit);
            } else {
                IERC20(AromAddress).transferFrom(address(this), lender, rentERC721List[token][tokenId].collateralSum + profit);
            }
            rentERC721List[token][tokenId].durationHours = 0;
            rentERC721List[token][tokenId].borrower = address(0);
            clearUsersRents(token, tokenId, tokenStandard, msg.sender);
            emit ERC721ForRentRemoved(token);
        } else if (tokenStandard == 20) {
            address lender = rentERC20List[token][tokenId].lender;
            address borrower = rentERC20List[token][tokenId].borrower;
            require(IERC20(token).balanceOf(address(msg.sender)) > 0, 'Not enough tokens!');
            require(borrower == msg.sender, 'Not borrower!');
            IERC20(token).transferFrom(msg.sender, address(this), 1);
            IERC20(token).transferFrom(address(this), lender, 1);
            IArom(AromAddress).leave(rentERC20List[token][tokenId].collateralSum);
            uint256 profit = IArom(AromAddress).aromForMora(rentERC20List[token][tokenId].aromAtStart)
            - rentERC20List[token][tokenId].collateralSum;
            if (!isDurationExpired(rentERC20List[token][tokenId].borrowedAtTimestamp, rentERC20List[token][tokenId].durationHours)) {
                IERC20(AromAddress).transferFrom(address(this), borrower, rentERC20List[token][tokenId].collateralSum);
                IERC20(AromAddress).transferFrom(address(this), lender, profit);
            } else {
                IERC20(AromAddress).transferFrom(address(this), lender, rentERC20List[token][tokenId].collateralSum + profit);
            }
            rentERC20List[token][tokenId].durationHours = 0;
            rentERC20List[token][tokenId].borrower = address(0);
            clearUsersRents(token, tokenId, tokenStandard, msg.sender);
            emit ERC20ForRentRemoved(token);
        }
    }

    function updateUsersLend(address wantedToken, uint256 wantedTokenId, uint256 wantedTokenStandard, address borrower, uint256 time) private {
        address lender = address(0);
        if (wantedTokenStandard == 1155) {
            lender = rentERC1155List[wantedToken][wantedTokenId].lender;
        } else if (wantedTokenStandard == 721) {
            lender = rentERC721List[wantedToken][wantedTokenId].lender;
        } else if (wantedTokenStandard == 20) {
            lender = rentERC20List[wantedToken][wantedTokenId].lender;
        }
        uint256 totalCount = UsersRents[lender].length;
        for (uint i = 0; i<totalCount; i++) {
            Rent memory userRent = UsersRents[lender][i];
            if (userRent.token == wantedToken && userRent.tokenId == wantedTokenId) {
                UsersRents[lender][i].status = 2;
                UsersRents[lender][i].borrower = borrower;
                UsersRents[lender][i].borrowedAtTimestamp = time;
            }
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
