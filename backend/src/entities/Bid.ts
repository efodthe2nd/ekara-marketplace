import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { BidListing } from './BidListing';
import { OrderStatus, EscrowStatus, BidListingStatus, BidStatus } from './enums';

@Entity('bids')
export class Bid {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BidListing, listing => listing.bids)
    listing: BidListing;

    @ManyToOne(() => User)
    bidder: User;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: BidStatus,
        default: BidStatus.ACTIVE
    })
    status: BidStatus;

    @CreateDateColumn()
    createdAt: Date;
}