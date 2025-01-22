import { RequestHandler, Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

export const productRouter = (productController: ProductController): Router => {
  const router = Router();

  // Product routes
  router.get('/', productController.getProducts as RequestHandler);
  router.post('/', authMiddleware, productController.createProduct as RequestHandler);
  router.get('/:id', productController.getProduct as RequestHandler);
  
  // Image upload route
  router.post(
      '/:id/images',
      authMiddleware,
      upload.array('images', 5),
      productController.uploadProductImages as RequestHandler
  );


  return router;
};