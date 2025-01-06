import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

export const productRouter = (productController: ProductController): Router => {
    return productController.router;
};