import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { Product } from './Product';

@Entity('buyers')
export class Buyer extends User {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    address: string;

    @OneToMany(() => Order, order => order.buyer)
    purchaseHistory: Order[];

    @OneToMany(() => Product, product => product.id)
    wishlist: number[];
}