import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // Profile routes
    router.get('/profile', authMiddleware, userController.getProfile as RequestHandler);
    router.put('/profile', authMiddleware, userController.updateProfile as RequestHandler);
    router.get('/roles', authMiddleware, userController.getUserRoles as RequestHandler);
    router.post('/roles', authMiddleware, userController.addRole as RequestHandler);

    // Profile picture upload route
    router.post(
        '/profile/picture',
        authMiddleware,
        uploadProfilePicture,
        userController.uploadProfilePicture as RequestHandler
    );

    router.put(
        '/profile/location',
        authMiddleware,
        userController.updateLocation as RequestHandler
    );

    // Seller profile routes
    router.post('/seller-profile', 
        authMiddleware, 
        requireRole('seller'), 
        userController.createSellerProfile as RequestHandler
    );

    // Public profile routes
    router.get('/:userId/seller-profile', userController.getSellerProfile as RequestHandler);

    return router;
};