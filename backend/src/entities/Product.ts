import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Seller } from './Seller';

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

    @ManyToOne(() => Seller, seller => seller.products)
    seller: Seller;

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
