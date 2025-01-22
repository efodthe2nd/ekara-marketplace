import { Router, Request, Response, RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";
import { promisify } from 'util';
import { ProductService } from "../services/ProductService";
import { CreateProductDto } from "../dto/user/CreateProductDto";
import { UpdateProductDto } from "../dto/user/UpdateProductDto";
import {
  authMiddleware,
  requireRole,
  AuthRequest,
} from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

// Promisified fs functions
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);

export class ProductController {
  public router: Router;

  constructor(private productService: ProductService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Product CRUD routes
    this.router.post(
      "/",
      authMiddleware,
      requireRole("seller"),
      this.createProduct as RequestHandler
    );
    
    this.router.get("/", this.getProducts as RequestHandler);
    this.router.get("/:id", this.getProduct as RequestHandler);
    
    this.router.put(
      "/:id",
      authMiddleware,
      requireRole("seller"),
      this.updateProduct as RequestHandler
    );
    
    this.router.delete(
      "/:id",
      authMiddleware,
      requireRole("seller"),
      this.deleteProduct as RequestHandler
    );

    // Image upload route
    this.router.post(
      "/:id/images",
      authMiddleware,
      requireRole("seller"),
      upload.array('images', 5),
      this.uploadProductImages as RequestHandler
    );
  }

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productDto: CreateProductDto = req.body;
      const sellerId = (req as AuthRequest).user!.id;
      const product = await this.productService.createProduct(productDto, sellerId);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public getProducts = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.getProductById(Number(req.params.id));
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productDto: UpdateProductDto = req.body;
      const product = await this.productService.updateProduct(
        Number(req.params.id),
        productDto
      );
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productService.deleteProduct(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public uploadProductImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
  
      if (!files?.length) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
      }
  
      const uploadDir = 'uploads/products';
      const imageUrls: string[] = [];
  
      // Ensure upload directory exists
      try {
        await access(uploadDir, fs.constants.F_OK);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
  
      // Process files
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, file.buffer);
        imageUrls.push(`products/${fileName}`);
      }
  
      await this.productService.updateProductImages(productId, imageUrls);
      res.json({ imageUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: 'Failed to upload images' });
    }
  };
}