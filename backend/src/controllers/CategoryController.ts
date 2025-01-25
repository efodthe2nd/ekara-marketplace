import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    search = async (req: Request, res: Response): Promise<void> => {
        try {
            const { query } = req.query;
            if (typeof query !== 'string') {
                res.status(400).json({ message: 'Query parameter is required' });
                return;
            }
            const categories = await this.categoryService.search(query);
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error searching categories' });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, parentId } = req.body;
            const category = await this.categoryService.create(name, parentId);
            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error creating category' });
        }
    };

    getPopular = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await this.categoryService.getPopularCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching popular categories' });
        }
    };
}