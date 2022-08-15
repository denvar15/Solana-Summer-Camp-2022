import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trades')
export class Trade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_nft_address', type: 'varchar' })
    firstNFTAddress: string;

    @Column({ name: 'first_nft_id' })
    firstNFTId: number;

    @Column({ name: 'first_nft_standart' })
    firstNFTStandart: number;

    @Column({ name: 'user_first' })
    userFirst: string;

    @Column({
        name: 'second_nft_address',
        type: 'varchar',
        array: true,
    })
    secondNFTAddress: string[];

    @Column({ name: 'second_nft_id', type: 'int', array: true })
    secondNFTId: number[];

    @Column({ name: 'second_nft_standart', type: 'int', array: true })
    secondNFTStandart: number[];

    @Column({
        name: 'second_solana_mint_address',
        type: 'varchar',
        array: true,
    })
    secondSolanaMintAddress: string[];

    @Column({ name: 'second_metadata', type: 'varchar', array: true })
    secondMetadata: string[];

    @Column({ name: 'user_second' })
    userSecond: string;

    @Column({ name: 'barter_status' })
    barterStatus: number;

    @Column({ name: 'evm_id' })
    evmId: number;
}
