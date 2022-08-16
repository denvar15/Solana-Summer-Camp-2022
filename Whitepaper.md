# GtG - Guild to Guild Whitepaper

# Abstract

Solana is currently one of the fastest growing and most user-friendly blockchains in the world. Solana blockchain is fast, attracts many developers and, of course, is already becoming a platform for the GameFi segment. By the end of 2022, a lot of large and well-developed projects are expected to launch, and a large number of players are coming in. But for the GameFi segment, guilds have already become traditional on other networks. Guilds are a systematic player in the market, they help new players get into and stay in the game, they raise funds to create new tools and games on the networks.

So far, there are no large guilds in Solana blockchain yet. Our product gives them tools that are unparalleled in the marketplace. It will help them get up and running faster on the Solana network and change the picture of the world for users and developers. Powerful tools = Powerful guilds.

# Barter
What is Barter in GtG? It is the process of exchanging one nft for another. This tool solves one common problem - to get rid of one nft and get another usually you need either
1. Put it up for sale, sell it, and use the money you get in tokens to buy another nft
2. Or make a personal agreement with the person who owns the desired product and make an exchange on the principles of trust

But the first option is bad because it makes you do redundant and unnecessary steps, you have to pay commissions and be a holder of some tokens.
And the second one is bad in that you either risk to be cheated by the owner of the desired nft, or you yourself are forcing him to run the risk.

Barter in GtG is a smart contract deployed in the Neon network smart contract. It allows you to make exchanges on a completely untrusted basis, you do not need to know the other side of the contract, you do not need to sell nft for some currency and make unnecessary steps. You just create an offer, wait until someone satisfies it, and confirm it. There is no room for deception, no room for loss. In addition, the desired nft can be any format nft - ERC721/ERC1155/Solana NFT, which the site will automatically wrap into ERC20 token.

# Rent

The problem of leasing their nfts has long been a massive problem for all developed networks. And all its solutions did not take into account the peculiarities of large players on the market, who own many valuable, but often idle nft assets.

Our solution is a smart contract that allows you to lease multiple nfts of all available types at once, just like a Barter contract.

But more than that, your funds that you present as collateral for nft leased will not be idle. Our contract automatically places them in staking at Moraswap, the systemically important DEX in Neon. Thus, the donating user will get the interest from the pledged assets during the lease, while the rented nft user will use them absolutely free. Both participants of the transaction will be satisfied and will not have to lose the profit or trust each other.

The case of non-return of nfts is unlikely, most guilds are afraid of losing business reputation, and the profit from nfts which refused to be returned will not recoup the potential losses.

If returned late, the entire amount of the deposit is transferred to the landlord as compensation for the wait.

# ERC20 Wrapper

We have implemented a system for wrapping Solana NFT into ERC20 Neon tokens.

This system is based on the example in the Neon EVM repository for spl token wrapping.

In our case, we assume that the user wants to wrap metaplex nft in Solana DevNet, the Contract on the Neon network automatically creates a new wrapper for each nft, for each instance, into which the original nft is translated through a Solana transaction. This erc20 token is then an exact representation of its locked in Neon contract Solana version. Since it stores the tokenMint address, we still have full access to its data and can provide it to the user.

The platform user can just as easily deploy the token back to a separate tab, this mirrors the creation of the wrapper.

# Our contacts

Twitter - 
Telegram - 