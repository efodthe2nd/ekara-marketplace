// routes/index.ts
import { Router } from 'express';
import { userRouter } from './user.routes';
import { productRouter } from './product.routes';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';
import { OrderController } from '../controllers/OrderController';
import { CategoryController } from '../controllers/CategoryController';
import { BidController } from '../controllers/BidController';
import { categoryRouter } from './category.routes';

export const AppRouter = (
    userController: UserController,
    productController: ProductController,
    categoryController: CategoryController,
    // orderController: OrderController,
    // bidController: BidController
): Router => {
    const router = Router();

    // Add debug log before mounting routes
    console.log('Initializing routes...');

    const userRoutes = userRouter(userController);
    const productRoutes = productRouter(productController);
    const categoryRoutes = categoryRouter(categoryController);
    // Debug log user routes
    console.log('User routes:', userRoutes.stack.map((r: any) => {
        if (r.route) {
            return `${Object.keys(r.route.methods)} ${r.route.path}`;
        }
        return null;
    }).filter(Boolean));

    //Debug log product routes
    console.log('Product routes:', productRoutes.stack.map((r: any) => {
        if (r.route) {
            return `${Object.keys(r.route.methods)} ${r.route.path}`;
        }
        return null;
    }).filter(Boolean));

    router.use('/auth', userRoutes);
    router.use('/products', productRoutes);
    router.use('/categories', categoryRoutes);
    // router.use('/orders', orderController.router);
    // router.use('/bids', bidController.router);


    // Debug log all routes after mounting
    console.log('All routes mounted at:', {
        auth: '/api/auth/*',
        products: '/api/products/*',
        orders: '/api/orders/*'
    });

    return router;
};