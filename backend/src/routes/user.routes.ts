import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';
import { RequestHandler } from 'express';

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // Public routes
    router.post('/register', userController.register);
    router.post('/login', userController.login);

    // Protected routes
    router.get('/profile', authMiddleware, userController.getProfile as RequestHandler);
    router.put('/profile', authMiddleware, userController.updateProfile as RequestHandler);
    router.get('/roles', authMiddleware, userController.getUserRoles as RequestHandler);
    router.post('/roles', authMiddleware, userController.addRole as RequestHandler);

    // Profile picture upload route
    router.post(
        '/profile/picture',
        authMiddleware,
        uploadProfilePicture,  // This middleware now uses memoryStorage
        userController.uploadProfilePicture as RequestHandler
    );

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
    
    router.post('/seller-profile', 
        authMiddleware, 
        requireRole('seller'), 
        userController.createSellerProfile as RequestHandler
    );

    router.put(
        '/profile/location',
        authMiddleware,
        userController.updateLocation as RequestHandler
    );

    return router;
};