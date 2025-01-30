import { Repository } from "typeorm";
import { Product } from "../entities/Product";
import { SellerProfile } from "../entities/SellerProfile";
import { CreateProductDto } from "../dto/user/CreateProductDto";
import { UpdateProductDto } from "../dto/user/UpdateProductDto";
import { productRepositoryMethods } from "../entities/product.repository";
import { Review } from "../entities";
import fs from "fs";
import path from "path";

export interface ProductRepositoryCustom extends Repository<Product> {
  searchProducts(query: string): Promise<Product[]>;
}

export class ProductService {
  constructor(
    private productRepository: Repository<Product> & ProductRepositoryCustom,
    private reviewRepository: Repository<Review>,
    private sellerRepository: Repository<SellerProfile>
  ) {
    Object.assign(this.productRepository, productRepositoryMethods);
  }


  // Add this new method to fetch products by seller ID
  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        seller: {
          user: {
            id: sellerId
          }
        }
      },
      relations: ["seller", "category"],
      order: {
        createdAt: "DESC"
      }
    });
  }

  
  async createProduct(
    productData: Partial<Product>,
    userId: number
  ): Promise<Product> {
    try {
      const sellerProfile = await this.sellerRepository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

      if (!sellerProfile) {
        throw new Error("Seller profile not found");
      }

      const newProduct = this.productRepository.create({
        ...productData,
        categoryId: productData.categoryId,
        seller: sellerProfile,
        images: productData.images || [],
      });

      return this.productRepository.save(newProduct);
    } catch (error) {
      console.error("Error in createProduct service:", error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['seller', 'seller.user', 'categoryRelation'],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        manufacturer: true,
        compatibility: true,
        dimensions: true,
        weight: true,
        warranty: true,
        stock: true,
        images: true,
        seller: {
          id: true,
          companyName: true,
          companyDescription: true,
          rating: true,
          user: {
            id: true,
            username: true
          }
        }
      }
    });
  }


  async updateProduct(
    id: number,
    updateProductDto: Partial<Product>
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { id },
      relations: ["category"], // Add this to load the category relation
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Extract category and create a clean DTO
    const { category, ...cleanUpdateDto } = updateProductDto;

    // Create the merged product without category
    const updatedProduct = this.productRepository.merge(existingProduct, {
      ...cleanUpdateDto,
      updatedAt: new Date(),
    });

    return this.productRepository.save(updatedProduct);
  }

  async deleteProduct(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new Error("Product not found");
    }
  }

  async listProducts(
    page: number = 1,
    limit: number = 10,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    }
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.seller", "seller")
      .leftJoinAndSelect("seller.user", "user")
      .leftJoinAndSelect("product.categoryRelation", "category");

    if (filters?.category) {
      queryBuilder.andWhere("LOWER(category.name) = LOWER(:category)", {
        category: filters.category,
      });
    }

    // if (filters?.category) {
    //   queryBuilder.andWhere("LOWER(category.name) = LOWER(:category)", {
    //     category: filters.category.replace(/-/g, " "), // Convert "engine-parts" to "engine parts"
    //   });
    // }

    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere("product.price >= :minPrice", {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere("product.price <= :maxPrice", {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))",
        { search: `%${filters.search}%` }
      );
    }

    // Get total before pagination
    const total = await queryBuilder.getCount();

    // Get paginated results
    const products = await queryBuilder
      .orderBy("product.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Return products as is, with their relations
    return {
      products,
      total,
    };
  }

  private validateProductInput(productData: CreateProductDto): void {
    if (!productData.name) {
      throw new Error("Product name is required");
    }

    if (productData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    if (productData.stock < 0) {
      throw new Error("Stock cannot be negative");
    }
  }

  private validateProductUpdate(updateData: UpdateProductDto): void {
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    if (updateData.stock !== undefined && updateData.stock < 0) {
      throw new Error("Stock cannot be negative");
    }
  }

  async reduceProductStock(productId: number, quantity: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    product.stock -= quantity;
    await this.productRepository.save(product);
  }

  async checkProductAvailability(productId: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    if (!product) {
      return false;
    }
    return product.stock > 0;
  }

  async updateProductImages(
    productId: number,
    imageUrls: string[]
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ["seller"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Merge new images with existing ones
    product.images = [...(product.images || []), ...imageUrls];
    return this.productRepository.save(product);
  }

  async suggestProducts(query: string, limit: number = 5): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.seller", "seller")
      .where("LOWER(product.name) LIKE LOWER(:query)", { query: `%${query}%` })
      .orWhere("LOWER(product.description) LIKE LOWER(:query)", {
        query: `%${query}%`,
      })
      .take(limit)
      .getMany();
  }

  async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.seller", "seller")
      .where("LOWER(product.name) LIKE LOWER(:query)", { query: `%${query}%` })
      .orWhere("LOWER(product.description) LIKE LOWER(:query)", {
        query: `%${query}%`,
      });

    const total = await queryBuilder.getCount();
    const products = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total };
  }

  async getSellerReviews(sellerId: number, page: number = 1, limit: number = 5): Promise<{ reviews: Review[]; total: number; hasMore: boolean }> {
    const [reviews, total] = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.buyer', 'buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .where('review.sellerId = :sellerId', { sellerId })
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  
    return {
      reviews,
      total,
      hasMore: total > page * limit
    };
  }

  public async getProductsByManufacturer(
    manufacturer: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      // Fetch products based on manufacturer, using pagination
      const products = await this.productRepository.find({
        where: { manufacturer },
        take: limit,
        skip: (page - 1) * limit, // pagination logic
      });

      return products;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Failed to fetch products by manufacturer: ' + error.message);
      } else {
        throw new Error('Failed to fetch products by manufacturer: ' + String(error));
      }
    }
  }

  
}
