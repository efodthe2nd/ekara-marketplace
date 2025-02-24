import { Router, Request, Response, RequestHandler } from "express";
// import * as fs from "fs";
import * as path from "path";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
// import { promisify } from 'util';
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

export class ProductController {
  public router: Router;

  constructor(private productService: ProductService) {}

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Received files:", req.files);
      console.log("Received body:", req.body);
  
      const productData = JSON.parse(req.body.productData);
      const sellerId = (req as AuthRequest).user!.id;
  
      // Use the URLs from Vercel Blob instead of base64
      const imageUrls = req.body.imageUrls || [];
  
      // Combine all data into a single object
      const productToCreate = {
        ...productData,
        images: imageUrls, // This now contains the Vercel Blob URLs
        sellerId,
      };
  
      const product = await this.productService.createProduct(
        productToCreate,
        sellerId
      );
  
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error creating product:", error);
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
        limit = 10,
      } = req.query;

      const result = await this.productService.listProducts(
        Number(page),
        Number(limit),
        {
          category: category as string,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          search: search as string,
        }
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error?.message || "An error occurred" });
    }
  };

  public getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.getProductById(
        Number(req.params.id)
      );
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
        category: undefined,
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
      const productId = Number(req.params.id);
      const userId = (req as AuthRequest).user!.id;
  
      await this.productService.deleteProduct(productId, userId);
      
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to delete product' });
      }
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
  
      // Upload images to Vercel Blob and get URLs
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          const blob = await put(file.originalname, file.buffer, {
            access: "public",
            token: process.env.BLOB_READ_WRITE_TOKEN, // Ensure you have this in your .env file
          });
          return blob.url; // Return the uploaded image URL
        })
      );
  
      // Update the product images in the database
      const updatedProduct = await this.productService.updateProductImages(productId, imageUrls);
  
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: error?.message || "Image upload failed" });
    }
  };

  public getSuggestions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        res.json({ suggestions: [] });
        return;
      }
      const suggestions = await this.productService.suggestProducts(query);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: "Error fetching suggestions" });
    }
  };

  public searchProducts = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      if (!query || typeof query !== "string") {
        res.status(400).json({ message: "Search query is required" });
        return;
      }
      const result = await this.productService.searchProducts(
        query,
        Number(page),
        Number(limit)
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error searching products" });
    }
  };

  getSellerProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        res.status(400).json({ message: "Invalid seller ID" });
        return;
      }

      const products = await this.productService.getProductsBySellerId(
        sellerId
      );
      res.json(products);
    } catch (error: any) {
      console.error("Error getting seller products:", error);
      res
        .status(500)
        .json({ message: error.message || "Error fetching seller products" });
    }
  };

  public getProductsByManufacturer = async (req: Request, res: Response): Promise<void> => {
    console.log('Hit manufacturer route with query:', req.query);
    const { manufacturer, page = 1, limit = 10 } = req.query;

    if (!manufacturer) {
      res.status(400).json({ error: 'Manufacturer query parameter is required' });
      return;
    }

    try {
      // Call the service to get products by manufacturer
      const products = await this.productService.getProductsByManufacturer(
        manufacturer as string,
        Number(page),
        Number(limit)
      );

      if (!products || products.length === 0) {
        res.status(404).json({ message: `No products found for manufacturer: ${manufacturer}` });
        return;
      }

      // Send response
      res.status(200).json({ products });
    } catch (error) {
      console.error('Error fetching products by manufacturer:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
}

public deleteProductImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = Number(req.params.id);
    const imagePath = req.params.imagePath;

    // Delete the image from storage
    const fullPath = path.join(__dirname, '../../', imagePath);
    await fs.unlink(fullPath);

    // Remove the image from the product's images array in database
    const updatedProduct = await this.productService.removeProductImage(
      productId,
      imagePath
    );

    res.json(updatedProduct);
  } catch (error: any) {
    console.error("Delete image error:", error);
    res
      .status(500)
      .json({ message: error?.message || "Failed to delete image" });
  }
};

}
