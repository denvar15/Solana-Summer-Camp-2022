import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Token } from './tokenEntity';

@Entity('trades')
export class Trade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_nft_address', type: 'varchar', array: true })
    firstNFTAddress: string[];

    @Column({
        name: 'second_nft_address',
        type: 'varchar',
        array: true,
    })
    secondNFTAddress: string[];

    @Column({ name: 'first_nft_id', type: 'varchar', array: true })
    firstNFTId: number[];

    @Column({ name: 'second_nft_id', type: 'varchar', array: true })
    secondNFTId: number[];

    @Column({
        name: 'first_solana_mint_address',
        type: 'varchar',
        array: true,
    })
    firstSolanaMintAddress: string[];

    @Column({
        name: 'second_solana_mint_address',
        type: 'varchar',
        array: true,
    })
    secondSolanaMintAddress: string[];

    @Column({ name: 'first_wrap', type: 'varchar', array: true })
    firstWrap: string[];

    @Column({ name: 'second_wrap', type: 'varchar', array: true })
    secondWrap: string[];

    @Column({ name: 'first_metadata', type: 'json', array: true })
    firstMetadata: Token[];

    @Column({ name: 'second_metadata', type: 'json', array: true })
    secondMetadata: Token[];

    @Column({ name: 'barter_status' })
    barterStatus: number;
}
