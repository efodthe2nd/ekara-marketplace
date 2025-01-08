import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';
import { SellerProfile } from './SellerProfile';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.items)
    order: Order;

    @ManyToOne(() => Product)
    product: Product;

    @ManyToOne(() => SellerProfile)
    seller: SellerProfile;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    priceAtTime: number;
}