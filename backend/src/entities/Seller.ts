import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity('sellers')
export class Seller extends User {
    @Column()
    companyName: string;

    @Column()
    companyDescription: string;

    @Column()
    website: string;

    @OneToMany(() => Product, product => product.seller, {
        cascade: true,  // Optional: allows cascading operations
        eager: false 
    })
    products: Product[];

    @Column({ default: 0 })
    rating: number;

    @Column({ default: 0 })
    numReviews: number;
}