import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { Bid } from './Bid';
import { BidListingStatus } from './enums';

@Entity('bid_listings')
export class BidListing {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    seller: User;

    @ManyToOne(() => Product)
    product: Product;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    startingPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    currentPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    minimumIncrement: number;

    @Column()
    endTime: Date;

    @Column({
        type: 'enum',
        enum: BidListingStatus,
        default: BidListingStatus.ACTIVE
    })
    status: BidListingStatus;

    @OneToMany(() => Bid, bid => bid.listing)
    bids: Bid[];

    @CreateDateColumn()
    createdAt: Date;
}