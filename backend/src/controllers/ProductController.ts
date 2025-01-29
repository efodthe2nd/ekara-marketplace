import { Router, Request, Response, RequestHandler } from "express";
import * as fs from "fs";
import * as path from "path";
import { promisify } from 'util';
import { ProductService } from "../services/ProductService";
import { CreateProductDto } from "../dto/user/CreateProductDto";
import { Product } from "../entities/Product";
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
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 10 
    } = req.query;

    const result = await this.productService.listProducts(
      Number(page),
      Number(limit),
      {
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search as string
      }
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
      const updateDto: UpdateProductDto = req.body;
      // Convert the DTO to match what the service expects
      const productUpdateData: Partial<Product> = {
        ...updateDto,
        // If categoryId is provided, it will be used directly
        // Remove any category string if it exists in the request
        category: undefined
      };
  
      const product = await this.productService.updateProduct(
        Number(req.params.id),
        productUpdateData
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

  public getSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        res.json({ suggestions: [] });
        return;
      }
      const suggestions = await this.productService.suggestProducts(query);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching suggestions' });
    }
  };
  
  public searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }
      const result = await this.productService.searchProducts(query, Number(page), Number(limit));
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error searching products' });
    }
  };

  getSellerProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        res.status(400).json({ message: "Invalid seller ID" });
        return;
      }

      const products = await this.productService.getProductsBySellerId(sellerId);
      res.json(products);
    } catch (error: any) {
      console.error('Error getting seller products:', error);
      res.status(500).json({ message: error.message || "Error fetching seller products" });
    }
  };

  public getSellerStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        res.status(400).json({ message: "Invalid seller ID" });
        return;
      }

      const stats = await this.productService.getSellerStats(sellerId);
      res.json(stats);
    } catch (error: any) {
      console.error('Error getting seller stats:', error);
      res.status(500).json({ message: error.message || "Error fetching seller stats" });
    }
  };

  // public getSellerReviews = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const sellerId = parseInt(req.params.sellerId);
  //     if (isNaN(sellerId)) {
  //       res.status(400).json({ message: "Invalid seller ID" });
  //       return;
  //     }
  
  //     const reviews = await this.productService.getSellerReviews(sellerId);
  //     res.json(reviews);
  //   } catch (error: any) {
  //     console.error('Error getting seller reviews:', error);
  //     res.status(500).json({ message: error.message || "Error fetching seller reviews" });
  //   }
  // };
  
}