import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Token } from './tokenEntity';

@Entity('trades')
export class Trade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_first' })
    userFirst: string;

    @Column({ name: 'user_second' })
    userSecond: string;

    @Column({ name: 'solana_mint_address' })
    solanaMintAddress: string;

    @Column({ name: 'solana_metadata', type: 'json' })
    solanaMetadata: Token;

    @Column({ name: 'neon_wrap_address' })
    neonWrapAddress: string;

    @Column({ name: 'wanted_nft' })
    wantedNFT: string;
}
