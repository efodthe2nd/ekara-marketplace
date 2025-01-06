import { Router } from 'express';
import { userRouter } from './user.routes';
import { UserController } from '../controllers/UserController';

export const AppRouter = (userController: UserController): Router => {
    const router = Router();
    router.use('/auth', userRouter(userController));
    return router;
};