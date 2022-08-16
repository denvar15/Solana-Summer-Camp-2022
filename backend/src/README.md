# Endpoints contracts

This file describes api contracts for requests on GtG backend server

# Table of contents:

-   [/nft](##/nft)
-   [/collection](##/collection)
-   [/collection/list](##/collection/list)
-   [/user](##/user)
-   [/trade](##/trade)

## /nft

**Get**

Request will return metainformation about single
nft

    Query params:
        address: address of nft

## /collection

**Get**

Request will return metainformation about Genesis Genopets Habitant collection

## /collection/list

**Get**

Request will return _amount_ of random tokens from Genesis Genopets Habitant collection

    Query params:
        amount: amount of tokens to return, default is 10

## /user

**Get**

Request will return _amount_ of users, that had previously participiated in trades on GtG service.

User's accounts are 
```json
    {
        "id": "user's id in database",
        "solanaWallet": "user's solana wallet",
        "ethWallet": "user's etherium wallet"
    },
```

    Query params:
        amount: amount of users to return, default is 10

**Post**

Request will add another user to database

    Query params:
        solanaWallet: user's solana wallet
        ethWallet: user's etherium wallet

## /trade

**Get**

Request will return _amount_ of trades, that were initiated on GtG platform

Example of returned trade
```json
{
    "id": 6,
    "firstNFTAddress": "0x7b9E7aFBc623bcaC2f499Fc25A83aEF01f40221e",
    "firstNFTId": 0,
    "firstNFTStandart": null,
    "userFirst": "0x545891095BcF00257a6b75429B4e157663AA0671",
    "secondNFTAddress": [
        "0x132571a9d52656C26B69aC77626c3C1F739D0dd3"
    ],
    "secondNFTId": [
        1
    ],
    "secondNFTStandart": null,
    "secondSolanaMintAddress": [
        ""
    ],
    "secondMetadata": [
        "{}"
    ],
    "userSecond": null,
    "barterStatus": 1,
    "evmId": 245022926
}
```

    Query params:
        amount: amount of trades to return, default is 10

**Post**

Request will add another trade to database

    Query params:
        See json example above
