import { Router } from 'express';
import { userRouter } from './user.routes';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';

export const AppRouter = (
    userController: UserController, 
    productController: ProductController
): Router => {
    const router = Router();
    router.use('/auth', userRouter(userController));
    router.use('/products', productController.router);
    return router;
};