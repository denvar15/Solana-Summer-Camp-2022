import { Metaplex, LazyNft, Nft } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, Cluster } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { solanaNet } from '../../constants/net';

const solanaConnection = new Connection(
    clusterApiUrl(solanaNet as Cluster),
);
const metaplex = new Metaplex(solanaConnection);

export const fetchByMint = async (address: PublicKey): Promise<Nft> => {
    const nft = await metaplex.nfts().findByMint(address).run();
    const largestAcc = await solanaConnection.getTokenLargestAccounts(
        address,
    );

    const accInfo = await solanaConnection.getParsedAccountInfo(
        largestAcc.value[0].address,
    );

    console.log(accInfo.value.owner.toString());
    return nft;
};
