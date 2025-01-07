import { Router } from 'express';
import { userRouter } from './user.routes';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';

export const AppRouter = (
    userController: UserController, 
    productController: ProductController
): Router => {
    const router = Router();
    
    // Add debug log before mounting routes
    console.log('Initializing routes...');
    
    const userRoutes = userRouter(userController);
    // Debug log user routes
    console.log('User routes:', userRoutes.stack.map((r: any) => {
        if (r.route) {
            return `${Object.keys(r.route.methods)} ${r.route.path}`;
        }
        return null;
    }).filter(Boolean));
    
    router.use('/auth', userRoutes);
    router.use('/products', productController.router);
    
    // Debug log all routes after mounting
    console.log('All routes mounted at:', {
        auth: '/api/auth/*',
        products: '/api/products/*'
    });
    
    return router;
};