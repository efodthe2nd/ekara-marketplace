import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity('seller_profiles')
export class SellerProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.sellerProfile)
    @JoinColumn()
    user: User;

    @Column()
    companyName: string;

    @Column()
    companyDescription: string;

    @Column({ nullable: true })
    website: string;

    @OneToMany(() => Product, (product) => product.seller)
    products: Product[];

    @Column({ type: 'float', default: 0 })
    rating: number;

    @Column({ default: 0 })
    numReviews: number;
}
