import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Token } from './tokenEntity';

@Entity('trades')
export class Trade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_nft_address' })
    firstNFTAddress: string[];

    @Column({ name: 'second_nft_address' })
    secondNFTAddress: string[];

    @Column({ name: 'first_nft_id' })
    firstNFTId: number[];

    @Column({ name: 'second_nft_id' })
    secondNFTId: number[];

    @Column({ name: 'first_solana_mint_address' })
    firstSolanaMintAddress: string[];

    @Column({ name: 'second_solana_mint_address' })
    secondSolanaMintAddress: string[];

    @Column({ name: 'first_wrap' })
    firstWrap: string[];

    @Column({ name: 'second_wrap' })
    secondWrap: string[];

    @Column({ name: 'first_metadata', type: 'json', array: true })
    firstMetadata: Token[];

    @Column({ name: 'second_metadata', type: 'json', array: true })
    secondMetadata: Token[];

    @Column({ name: 'barter_status' })
    barterStatus: number;
}
