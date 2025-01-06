import { Router, Request, Response, RequestHandler } from 'express';
import { ProductService } from '../services/ProductService';
import { CreateProductDto } from '../dto/user/CreateProductDto';
import { UpdateProductDto } from '../dto/user/UpdateProductDto';
import { authMiddleware, requireRole, requireAnyRole, AuthRequest } from '../middleware/auth.middleware';

export class ProductController {
    public router: Router;
    
    constructor(private productService: ProductService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', authMiddleware, requireRole('seller'), this.createProduct as RequestHandler);
        this.router.get('/', this.getProducts as RequestHandler);
        this.router.get('/:id', this.getProduct as RequestHandler);
        this.router.put('/:id', authMiddleware, requireRole('seller'), this.updateProduct as RequestHandler);
        this.router.delete('/:id', authMiddleware, requireRole('seller'), this.deleteProduct as RequestHandler);
    }

    private createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const productDto: CreateProductDto = req.body;
            const sellerId = (req as AuthRequest).user!.id;
            const product = await this.productService.createProduct(productDto, sellerId);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'An error occurred' });
        }
    }

    private getProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
            
            if (search) {
                const products = await this.productService.searchProducts(search as string);
                res.json(products);
                return;
            }

            const result = await this.productService.listProducts(
                Number(page),
                Number(limit),
                category as string,
                minPrice ? Number(minPrice) : undefined,
                maxPrice ? Number(maxPrice) : undefined
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'An error occurred' });
        }
    }

    private getProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await this.productService.getProductById(Number(req.params.id));
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
                return;
            }
            res.json(product);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'An error occurred' });
        }
    }

    private updateProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            const productDto: UpdateProductDto = req.body;
            const product = await this.productService.updateProduct(Number(req.params.id), productDto);
            res.json(product);
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'An error occurred' });
        }
    }

    private deleteProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            await this.productService.deleteProduct(Number(req.params.id));
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error?.message || 'An error occurred' });
        }
    }
}