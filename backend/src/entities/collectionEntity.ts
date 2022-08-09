import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Token } from './tokenEntity';

@Entity('collections')
export class Collection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    img?: string;

    @Column({ name: 'solanart_link' })
    solanartLink: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'double precision', nullable: true, name: 'volume_traded' })
    volumeTraded?: number;

    @OneToMany(() => Token, (token) => token.collection)
    tokens: Token[]
}
