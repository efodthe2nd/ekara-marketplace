import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { BidListingStatus, BidStatus } from './enums';



export enum OrderStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    PAYMENT_IN_ESCROW = 'PAYMENT_IN_ESCROW',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    DISPUTED = 'DISPUTED',
    CANCELLED = 'CANCELLED'
}

export enum EscrowStatus {
    AWAITING_PAYMENT = 'AWAITING_PAYMENT',
    FUNDS_HELD = 'FUNDS_HELD',
    RELEASED_TO_SELLER = 'RELEASED_TO_SELLER',
    REFUNDED_TO_BUYER = 'REFUNDED_TO_BUYER'
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.orders)
    buyer: User;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    items: OrderItem[];

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING_PAYMENT
    })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: EscrowStatus,
        default: EscrowStatus.AWAITING_PAYMENT
    })
    escrowStatus: EscrowStatus;

    @Column()
    shippingAddress: string;

    @Column({ nullable: true })
    trackingNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}