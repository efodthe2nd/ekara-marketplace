import { Repository } from 'typeorm';
import { Category } from '../entities/Category';
import slugify from 'slugify';

export class CategoryService {
    constructor(private categoryRepository: Repository<Category>) {}

    async create(name: string, parentId?: number): Promise<Category> {
        const existingCategory = await this.categoryRepository.findOne({ 
            where: { name: name.trim().toLowerCase() } 
        });

        if (existingCategory) {
            return existingCategory;
        }

        const slug = slugify(name.toLowerCase());
        const level = parentId ? 2 : 1; // Simple level logic for now

        const category = this.categoryRepository.create({
            name: name.trim(),
            slug,
            level,
            parentId
        });

        return this.categoryRepository.save(category);
    }

    async search(query: string): Promise<Category[]> {
        return this.categoryRepository
            .createQueryBuilder('category')
            .where('LOWER(category.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .orderBy('category.count', 'DESC')
            .take(10)
            .getMany();
    }

    async incrementCount(categoryId: number): Promise<void> {
        await this.categoryRepository.increment({ id: categoryId }, 'count', 1);
    }

    async getPopularCategories(): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { verified: true },
            order: { count: 'DESC' },
            take: 20
        });
    }
}