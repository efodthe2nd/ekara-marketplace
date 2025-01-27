import { RequestHandler, Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

export const productRouter = (productController: ProductController): Router => {
  const router = Router();

  // Product routes
  console.log('Registering product routes...');

  // Add the seller products route
  router.get(
    '/seller/:sellerId',
    authMiddleware,
    productController.getSellerProducts as RequestHandler
);
  
  router.get('/', productController.getProducts as RequestHandler);
  router.get('/suggestions', productController.getSuggestions as RequestHandler);
  router.get('/search', productController.searchProducts as RequestHandler);
  router.get('/:id', productController.getProduct as RequestHandler);
  router.post(
    '/',
    authMiddleware,
    upload.array('images', 5),
    ((req, res, next) => {
      console.log('Route middleware hit');
      next();
    }),
    productController.createProduct as RequestHandler
  );
  
  console.log('Registered product routes...');
  
  


  return router;
};