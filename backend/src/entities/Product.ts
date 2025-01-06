import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SellerProfile } from './SellerProfile';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    manufacturer: string;

    @Column('simple-array')
    images: string[];

    @ManyToOne(() => SellerProfile, seller => seller.products)
    seller: SellerProfile;

    @Column()
    category: string;

    @Column()
    compatibility: string;

    @Column()
    dimensions: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    weight: number;

    @Column()
    warranty: string;

    @Column()
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
