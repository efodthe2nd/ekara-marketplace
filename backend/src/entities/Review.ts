import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Buyer } from './Buyer';
import { Seller } from './Seller';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Buyer)
    buyer: Buyer;

    @ManyToOne(() => Seller)
    seller: Seller;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}