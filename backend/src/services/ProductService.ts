import { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import { SellerProfile } from '../entities/SellerProfile';
import { CreateProductDto } from '../dto/user/CreateProductDto';
import { UpdateProductDto } from '../dto/user/UpdateProductDto';
import { productRepositoryMethods } from '../entities/product.repository';

export interface ProductRepositoryCustom extends Repository<Product> {
  searchProducts(query: string): Promise<Product[]>;
}

export class ProductService {
  constructor(
    private productRepository: Repository<Product> & ProductRepositoryCustom,
    private sellerRepository: Repository<SellerProfile>
  ) {
    Object.assign(this.productRepository, productRepositoryMethods);
  }

  async createProduct(createProductDto: CreateProductDto, sellerId: number): Promise<Product> {
    this.validateProductInput(createProductDto);

    const seller = await this.sellerRepository.findOneBy({ id: sellerId });
    if (!seller) {
      throw new Error('Seller not found');
    }

    const newProduct = this.productRepository.create({
      ...createProductDto,
      seller,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return this.productRepository.save(newProduct);
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['seller']
    });
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    this.validateProductUpdate(updateProductDto);

    const updatedProduct = this.productRepository.merge(existingProduct, {
      ...updateProductDto,
      updatedAt: new Date()
    });

    return this.productRepository.save(updatedProduct);
  }

  async deleteProduct(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Product not found');
    }
  }

  async listProducts(
    page: number = 1,
    limit: number = 10,
    category?: string,
    minPrice?: number,
    maxPrice?: number
  ): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const total = await queryBuilder.getCount();

    const products = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total };
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productRepository.searchProducts(query);
  }

  private validateProductInput(productData: CreateProductDto): void {
    if (!productData.name) {
      throw new Error('Product name is required');
    }

    if (productData.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (productData.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
  }

  private validateProductUpdate(updateData: UpdateProductDto): void {
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (updateData.stock !== undefined && updateData.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
  }

  async reduceProductStock(productId: number, quantity: number): Promise<void> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
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
}