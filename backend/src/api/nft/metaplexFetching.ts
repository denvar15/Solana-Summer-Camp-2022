import { Metaplex, LazyNft } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, Cluster } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { solanaNet } from '../../constants/net';

const solanaConnection = new Connection(
    clusterApiUrl(solanaNet as Cluster),
);
const metaplex = new Metaplex(solanaConnection);

export const fetchByMint = async (address: PublicKey) => {
    const nft = await metaplex
        .nfts()
        .findAllByMintList(new Array(address))
        // .findAllByOwner(address)
        .run();
    // async map doesn't work at all, so this is easiest solution
    for (let token = 0; token < nft.length; token++) {
        if (nft[token].lazy == true) {
            nft[token] = await metaplex
                .nfts()
                .loadNft(nft[token] as LazyNft)
                .run();
        }
    }
    return nft;
};
