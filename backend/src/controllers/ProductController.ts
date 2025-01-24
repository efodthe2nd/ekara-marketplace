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
  }


  // src/controllers/ProductController.ts
createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received files:', req.files); // Debug line
    console.log('Received body:', req.body); // Debug line

    const files = req.files as Express.Multer.File[];
    const productData = JSON.parse(req.body.productData);

    // Convert files to Base64
    const imageBase64s = files?.map(file => 
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    ) || [];

    console.log('Number of images converted:', imageBase64s.length); // Debug line

    const sellerId = (req as AuthRequest).user!.id;
    
    // Combine all data into a single object
    const productToCreate = {
      ...productData,
      images: imageBase64s, // This contains the base64 strings
      sellerId
    };

    console.log('Creating product with images:', imageBase64s.length > 0); // Debug line

    const product = await this.productService.createProduct(
      productToCreate,
      sellerId
    );
    
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
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
      const productId = Number(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
      }

      const imageUrls = files.map(file => `/uploads/products/${file.filename}`);
      const updatedProduct = await this.productService.updateProductImages(productId, imageUrls);
      
      res.json(updatedProduct);
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: error?.message || "Image upload failed" });
    }
  };
  
}