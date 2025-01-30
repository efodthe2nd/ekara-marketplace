import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';
import { upload } from '../middleware/upload.middleware';

export const productRouter = (productController: ProductController): Router => {
    const router = Router();

    router.get('/test', (req, res) => {
        console.log('Test route hit');
        res.json({ message: 'Test route works' });
    });

    // Search and specific routes first
    router.get('/search/suggestions', 
        productController.getSuggestions as RequestHandler
    );

    router.get('/search/results',
        productController.searchProducts as RequestHandler
    );

    router.get('/manufacturer', 
        productController.getProductsByManufacturer as RequestHandler
    );

    // Seller-specific routes
    router.get('/seller/:sellerId', 
        authMiddleware,
        productController.getSellerProducts as RequestHandler
    );

    // Basic product routes
    router.get('/', 
        productController.getProducts as RequestHandler);
        
    router.get('/:id', 
        productController.getProduct as RequestHandler);

    // Protected routes
    router.post('/',
        authMiddleware,
        requireRole('seller'), 
        upload.array('images', 5),
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
    
    return router;
};