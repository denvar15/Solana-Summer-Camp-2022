import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'solana_wallet' })
    solanaWallet: string;

    @Column({ name: 'eth_wallet' })
    ethWallet: string;
}
