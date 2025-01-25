import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from './Product';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    level: number;

    @Column({ nullable: true })
    parentId: number;

    @Column({ unique: true })
    slug: string;

    @Column({ default: 0 })
    count: number;

    @Column({ default: false })
    verified: boolean;

    @ManyToOne(() => Category, category => category.children, { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];

    @OneToMany(() => Product, product => product.category)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}