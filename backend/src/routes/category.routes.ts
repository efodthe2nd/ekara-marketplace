import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middleware/auth.middleware';

export const categoryRouter = (categoryController: CategoryController): Router => {
    const router = Router();

    router.get('/search', categoryController.search);
    router.get('/popular', categoryController.getPopular);
    router.post('/', authMiddleware, categoryController.create);

    return router;
};