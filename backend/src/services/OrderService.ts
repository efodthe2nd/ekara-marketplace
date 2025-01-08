// src/services/OrderService.ts
import { Repository } from 'typeorm';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { CreateOrderDto } from '../dto/order/CreateOrderDto';
import { UpdateOrderStatusDto } from '../dto/order/UpdateOrderStatusDto';
import { OrderStatus, EscrowStatus } from '../entities/enums/OrderEnums';

export class OrderService {
    constructor(
        private orderRepository: Repository<Order>,
        private orderItemRepository: Repository<OrderItem>,
        private productRepository: Repository<Product>
    ) {}

    async createOrder(createOrderDto: CreateOrderDto, buyerId: number): Promise<Order> {
        // Start transaction
        const order = this.orderRepository.create({
            buyer: { id: buyerId },
            shippingAddress: createOrderDto.shippingAddress,
            status: OrderStatus.PENDING_PAYMENT,
            escrowStatus: EscrowStatus.AWAITING_PAYMENT
        });

        // Calculate total and create order items
        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const item of createOrderDto.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId },
                relations: ['seller']
            });

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            const orderItem = this.orderItemRepository.create({
                product,
                quantity: item.quantity,
                priceAtTime: product.price,
                seller: product.seller
            });

            totalAmount += product.price * item.quantity;
            orderItems.push(orderItem);
        }

        order.totalAmount = totalAmount;
        const savedOrder = await this.orderRepository.save(order);

        // Save order items
        for (const item of orderItems) {
            item.order = savedOrder;
            await this.orderItemRepository.save(item);
        }

        return this.getOrderById(savedOrder.id);
    }

    async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.getOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, dto.status)) {
            throw new Error('Invalid status transition');
        }

        order.status = dto.status;
        return this.orderRepository.save(order);
    }

    async getOrderById(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['buyer', 'items', 'items.product', 'items.seller']
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async getBuyerOrders(buyerId: number): Promise<Order[]> {
        return this.orderRepository.find({
            where: { buyer: { id: buyerId } },
            relations: ['items', 'items.product', 'items.seller'],
            order: { createdAt: 'DESC' }
        });
    }

    async getSellerOrders(sellerId: number): Promise<Order[]> {
        return this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('items.seller', 'seller')
            .where('seller.id = :sellerId', { sellerId })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }

    private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
          [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAYMENT_IN_ESCROW, OrderStatus.CANCELLED],
          [OrderStatus.PAYMENT_IN_ESCROW]: [OrderStatus.SHIPPED, OrderStatus.DISPUTED],
          [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.DISPUTED],
          [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
          [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          [OrderStatus.COMPLETED]: [], // Add empty array for final states
          [OrderStatus.CANCELLED]: []  // Add empty array for final states
      };
  
      return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

}