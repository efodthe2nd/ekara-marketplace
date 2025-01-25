import { Repository, LessThanOrEqual } from 'typeorm';
import { Product } from './Product';


export interface ProductRepositoryCustom extends Repository<Product> {
    searchProducts(query: string): Promise<Product[]>;
  }
  

export const productRepositoryMethods = {
    async findByCategory(this: Repository<Product>, category: string) {
        return this.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('category.name = :category', { category })
            .getMany();
    },

    async findByManufacturer(this: Repository<Product>, manufacturer: string): Promise<Product[]> {
        return this.find({ where: { manufacturer } });
    },

    async searchProducts(this: Repository<Product>, query: string): Promise<Product[]> {
        return this.createQueryBuilder('product')
            .where('product.name LIKE :query', { query: `%${query}%` })
            .orWhere('product.description LIKE :query', { query: `%${query}%` })
            .orWhere('product.manufacturer LIKE :query', { query: `%${query}%` })
            .getMany();
    },

    async findProductsWithLowStock(this: Repository<Product>, threshold: number): Promise<Product[]> {
        return this.find({ 
            where: { 
                stock: LessThanOrEqual(threshold) 
            } 
        });
    }
};

export interface ProductRepositoryCustom {
    findByCategory(category: string): Promise<Product[]>;
}