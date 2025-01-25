import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { SellerProfile } from './SellerProfile';
import { Category } from './Category';
import { JoinColumn as TypeORMJoinColumn } from 'typeorm';

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

    @Column('text', { array: true, nullable: true })
    images: string[];

    @ManyToOne(() => SellerProfile, seller => seller.products)
    seller: SellerProfile;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

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

    @Column({ nullable: true })
    categoryId: number;
}


