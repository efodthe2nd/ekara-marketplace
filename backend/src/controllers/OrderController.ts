import { Router, Request, Response, RequestHandler } from 'express';
import { OrderService } from '../services/OrderService';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/order';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.middleware';

export class OrderController {
    public router: Router;

    constructor(private orderService: OrderService) {
    }

    private createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const orderDto: CreateOrderDto = req.body;
            const order = await this.orderService.createOrder(orderDto, req.user.id);
            
            res.status(201).json({
                message: 'Order created successfully',
                order
            });
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error creating order' });
        }
    }

    private getBuyerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const orders = await this.orderService.getBuyerOrders(req.user.id);
            res.json(orders);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error fetching orders' });
        }
    }

    private getSellerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const sellerOrders = await this.orderService.getSellerOrders(req.user.id);
            res.json(sellerOrders);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'Error fetching seller orders' });
        }
    }

    private getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
      try {
          if (!req.user) {
              res.status(401).json({ message: 'Unauthorized' });
              return;
          }
  
          const userId = req.user.id;  // Store user ID early
          const order = await this.orderService.getOrderById(Number(req.params.id));
          
          // Now use userId instead of req.user.id
          if (order.buyer.id !== userId && 
              !order.items.some(item => item.seller.user.id === userId)) {
              res.status(403).json({ message: 'Access denied' });
              return;
          }
  
          res.json(order);
      } catch (error: any) {
          res.status(400).json({ message: error?.message || 'Error fetching order' });
      }
  }

  private updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.id;  // Store user ID early
        const orderId = Number(req.params.id);
        const updateStatusDto: UpdateOrderStatusDto = req.body;
        
        const order = await this.orderService.getOrderById(orderId);

        // Use userId instead of req.user.id
        if (order.buyer.id !== userId && 
            !order.items.some(item => item.seller.user.id === userId)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        const updatedOrder = await this.orderService.updateOrderStatus(orderId, updateStatusDto);
        res.json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error: any) {
        res.status(400).json({ message: error?.message || 'Error updating order status' });
    }
}
}