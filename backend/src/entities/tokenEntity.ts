import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Collection } from './collectionEntity';

@Entity('tokens')
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    img: string;

    @Column()
    owner: string;

    @Column()
    address: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'double precision', nullable: true })
    price?: number;

    @Column({ name: 'collection_id' })
    collectionId: number;

    @ManyToOne(() => Collection, (collection) => collection.tokens)
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;
}
