import { Nft } from '@metaplex-foundation/js';
import { Token } from '../entities/tokenEntity';

export const convertToken = (nft: Nft, token: Token) => {
    token.address = nft.mintAddress.toString();
    token.name = nft.json.name || nft.name;
    token.owner = nft.metadataAddress.toString();
    token.description = nft.json.description;
    token.img = nft.json.image;
};
