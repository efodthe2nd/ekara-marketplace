import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';

export const productRouter = (productController: ProductController): Router => {
    const router = Router();

    // Add debug log
    console.log('Registering product routes...');

    // Basic product routes
    router.get('/', productController.getProducts as RequestHandler);
    router.get('/:id', productController.getProduct as RequestHandler);
    
    // Seller-specific routes
    router.get('/seller/:sellerId', 
        authMiddleware,
        productController.getSellerProducts as RequestHandler
    );

    router.get('/seller/:sellerId/stats', 
        productController.getSellerStats as RequestHandler
    );

    // Protected routes
    router.post('/',
        authMiddleware,
        requireRole('seller'),
        productController.createProduct as RequestHandler
    );

    router.put('/:id',
        authMiddleware,
        requireRole('seller'),
        productController.updateProduct as RequestHandler
    );

    router.delete('/:id',
        authMiddleware,
        requireRole('seller'),
        productController.deleteProduct as RequestHandler
    );

    // Search and suggestions
    router.get('/search/suggestions', 
        productController.getSuggestions as RequestHandler
    );

    router.get('/search/results',
        productController.searchProducts as RequestHandler
    );

    // Debug log registered routes
    // console.log('Product routes registered:', router.stack.map(r => {
    //     if (r.route) {
    //         return `${Object.keys((r.route as any).methods)} ${r.route.path}`;
    //     }
    //     return null;
    // }).filter(Boolean));

    return router;
};