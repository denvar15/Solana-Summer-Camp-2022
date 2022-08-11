import { Collection } from '../entities/collectionEntity';
import collectionService from '../services/collectionService';

export const addGenopets = async () => {
    const genopets = new Collection();
    genopets.name = 'Genesis Genopets Habitats';
    genopets.description =
        'Genesis Genopets Habitats are the primary yield generating asset in the game, they enable earning Ki token for your steps and the ability to refine and craft crystals which are used as powerups to boost your in-game abilities of your Genopet.';
    genopets.solanartLink =
        'https://solanart.io/collections/genesisgenopetshabitats';
    genopets.volumeTraded = 3_074_000;
    genopets.img =
        'https://data.solanart.io/img/collections/genopethomepreview.webp';
    console.log(genopets);
    await collectionService.saveCollection(genopets);
};
