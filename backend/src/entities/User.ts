import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { BuyerProfile } from './Buyer';
import { SellerProfile } from './SellerProfile';
import { Order } from './Order';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ type: 'text', nullable: true })  // Added bio field
    bio: string;

    @Column('boolean', { default: false })
    isBuyer: boolean;

    @Column('boolean', { default: false })
    isSeller: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => BuyerProfile, (buyerProfile) => buyerProfile.user)
    buyerProfile: BuyerProfile;

    @OneToOne(() => SellerProfile, (sellerProfile) => sellerProfile.user)
    sellerProfile: SellerProfile;

    @OneToMany(() => Order, order => order.buyer)
    orders: Order[];
}