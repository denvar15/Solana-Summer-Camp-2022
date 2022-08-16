# GtG - Guild to Guild
Our project is dedicated to interacting with nft from the Solana and Neon networks. 
It allows players and guilds to easily and trustlessly exchange their NFTs from both networks and rent them out singly and in bulk.

Link to our whitepaper - 

# About Us
For Solana Summer Camp 2022, we have fully implemented the Solana nft wrapper in the Neon Dev Net erc20 nft. Any user can contribute their nft, swap with someone, rent it out, and then return it to the Solana network in a timely manner. All of this was implemented during the hackathon. The lease contract was also fully written and integration with MoraSwap, the ecosystem DEX for Neon, was achieved.

Translated with www.DeepL.com/Translator (free version)

# Video demonstration
Link - 

# Launching the project
We recommend using node js version 14.19.1 and the package manager yarn. Our project works on Solana Dev Net and Neon Dev Net

Before you deploy contracts, make sure you have changed the secret phrase in hardhat.config to your own in the packages/hardhat directory and have enough Neon in your account, and remember to change the addresses for mint ERC1155 and ERC721 in the file in the deploy folder

```bash
git clone https://github.com/denvar15/Solana-Summer-Camp-2022.git
cd Solana-Summer-Camp-2022
yarn install
yarn run start
```

> in a second terminal window:

```bash
cd Solana-Summer-Camp-2022
yarn run deploy
```

If all went well, you will need to log into your Solana and Neon EVM wallets on the localhost tab. The project is tested for Metamask and Phantom wallet respectively. Connect to the site and see your nfts in both networks

# User Flow Barter

To make a test exchange you will need two Metamask wallets with Neon balance.

1. We can choose one nft that we want to offer. Moving on to the next step
2. We can choose several nfts, one of which we would potentially like to get. If we choose a nft from Solana, we need to accept the transaction in the Metamask popup before proceeding to the next step. This is the creation of an ERC20 wrapper for this nft
3. In the third step, we want to enter the duration during which our offer will be active on the site. All this time our token will be frozen in the contract. Confirm the creation of a wrapper for Solana nft if you chose it as offered and the translation for it in the Phantom wallet accordingly. Next, confirm the right to dispose of the offered nft for the contract, confirm the interaction with the contract.
4. After that, for a test exchange, we want to log in to the platform as some other user. To do this, switch to another wallet in metamask, replenish it with the necessary amount of Neon and zamint there test nft. One of these nfts must be among the desired ones in the offer created in the previous steps, otherwise the contract will not let such a deal close
5. Go to the Active Offers tab under Barter. There you should see your offer created from the first wallet, select the nft that you selected from the first wallet in mirror form - the one that was offered will become desired and vice versa. After that, clicking on the button should lead to the wallet metamask, give permission to dispose of your nft and confirm the interaction with the contract
6. Now you should go back to your first wallet and enter the Approve Barter tab, where the barter copy you just filled in from another account is expected to appear. You need to approve it in order for the nft to leave the contract and go to the new owners. Select the appropriate nft at the bottom of the page and click on confirm. You will then need to confirm the interaction with the contract in metamask. That's it, you can go to the start exchange page and look there for your new ERC721/ERC1155 nft. But, if you made an exchange to Solana nft, since it is not yet unpacked from the ERC20 wrapper, you can find it in the Withdraw tab!

Note: to take the nft out of the withdraw tab, where all your wrapped in erc20 solana nft go, just click on it and confirm one transaction in metamask and one in phantom

# User Flow Rent

To create a test rental agreement you need two wallets, at least one nft and a Neon balance on both wallets, just as in the barter

1. Choose one or more nft you want to offer. Specify the length of time you are willing to rent your asset, and indicate the value in MORA that will be the security deposit for your nft. This insures you against non-return. Confirmation of transactions is similar to the barter section
2. Now, for a test rent, go from the second wallet to the Active Rents tab in the Rent section. There should appear the rental offer you just created from the first wallet. Make sure your Mora balance is greater than the specified deposit. To get Mora go to moraswap.com/exchange/swap and exchange your Neon for Mora. This is critical because Mora will be in staking status on the Moraswap contract for the duration of the first wallet's asset lease. You will need to confirm the contract's permission to dispose of your Mora and interact with the contract itself
3. Staying on the second account, you can check your nft from the rental offer. If it is an ERC721/ERC1155 nft, you will see it on the Start Rent tab, and if it is a Solana nft wrapped in erc20, you will see it on the withdraw tab. 
4. To close your lease, click the End Rent tab in the Rent tab. Your current lease should be displayed there. Remember, if you close your lease before it expires, you get your deposit back, and the similar landlord of the nft itself gets the interest accumulated on your Mora. If you close the lease late, however, your entire deposit goes to the original owner as compensation.
5. To close, you will need to confirm the contract's right to dispose of the nft that you return to the owner and confirm the interaction with the contract. That's all, the lease is closed, you are back to square one.

Note: at the moment there is no interest on mora stacking in moraswap yet. In this case, it is a convention of working in Dev Net

# Our contacts

Twitter - 
Telegram - 
