import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity('buyer_profiles')
export class BuyerProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.buyerProfile)
    @JoinColumn()
    user: User;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    address: string;

    @OneToMany(() => Order, (order) => order.buyer)
    purchaseHistory: Order[];

    @Column('simple-array', { nullable: true })
    wishlist: number[];

    @Column({ nullable: true })
    phoneNumber: string; 
}
