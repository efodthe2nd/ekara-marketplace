// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';
import { RequestHandler } from 'express';

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // Public routes (these work fine)
    router.post('/register', userController.register);
    router.post('/login', userController.login);

    // Protected routes - using RequestHandler type casting
    router.get('/profile', authMiddleware, userController.getProfile as RequestHandler);
    router.put('/profile', authMiddleware, userController.updateProfile as RequestHandler);
    router.get('/roles', authMiddleware, userController.getUserRoles as RequestHandler);
    router.post('/roles', authMiddleware, userController.addRole as RequestHandler);

    // Role-specific routes
    router.get('/buyer-dashboard', 
        authMiddleware,
        requireRole('buyer'),
        userController.getProfile as RequestHandler
    );

    router.get('/seller-dashboard', 
        authMiddleware,
        requireRole('seller'),
        userController.getProfile as RequestHandler
    );

    // Admin routes
    router.get('/users', authMiddleware, userController.getAllUsers as RequestHandler);
    console.log('Setting up seller-profile route...');
    router.post('/seller-profile', 
        authMiddleware, 
        requireRole('seller'), 
        userController.createSellerProfile as RequestHandler
    );

    router.post(
        '/profile/picture',
        authMiddleware,
        uploadProfilePicture,
        userController.uploadProfilePicture as RequestHandler
    );

    console.log('User routes setup complete');

    router.put(
        '/profile/location',
        authMiddleware,
        userController.updateLocation as RequestHandler
    );

    return router;
};