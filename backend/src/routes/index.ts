// routes/index.ts
import { Router } from 'express';
import { userRouter } from './user.routes';
import { productRouter } from './product.routes';
import { reviewRouter } from './review.routes';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';
import { CategoryController } from '../controllers/CategoryController';
import { ReviewController } from '../controllers/ReviewController';
import { categoryRouter } from './category.routes';

export const AppRouter = (
    userController: UserController,
    productController: ProductController,
    categoryController: CategoryController,
    reviewController: ReviewController
): Router => {
    const router = Router();

    const userRoutes = userRouter(userController);
    const productRoutes = productRouter(productController);
    const categoryRoutes = categoryRouter(categoryController);
    const reviewRoutes = reviewRouter(reviewController);
    

    router.use('/auth', userRoutes);
    router.use('/products', productRoutes);
    router.use('/categories', categoryRoutes);
    router.use('/reviews', reviewRoutes);


    return router;
};