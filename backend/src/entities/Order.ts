import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BuyerProfile } from './Buyer';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BuyerProfile, buyer => buyer.purchaseHistory)
    buyer: BuyerProfile;

    @Column('simple-array')
    products: number[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column()
    shippingAddress: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}