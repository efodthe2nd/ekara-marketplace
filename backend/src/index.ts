import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { AppRouter } from './routes';
import { UserService } from './services/UserService';
import * as Entities from './entities';
import { UserController } from './controllers/UserController';
import { ProductService } from './services/ProductService';
import { ProductController } from './controllers/ProductController';
import { productRepositoryMethods } from './entities/product.repository';
import { Repository } from 'typeorm';
import { ProductRepositoryCustom } from './entities/product.repository';
import dotenv from 'dotenv';
import { Product } from './entities/Product';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "marketplace",
    entities: Object.values(Entities),
    synchronize: true,
    logging: true
});

async function initializeApp() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        // Initialize services
        const userService = new UserService(
            AppDataSource.getRepository(Entities.User),
            AppDataSource.getRepository(Entities.BuyerProfile),
            AppDataSource.getRepository(Entities.SellerProfile)
        );
        const productService = new ProductService(
            Object.assign(
                AppDataSource.getRepository(Entities.Product),
                productRepositoryMethods
            ) as Repository<Product> & ProductRepositoryCustom,
            AppDataSource.getRepository(Entities.SellerProfile)
        );

        // Initialize controllers
        const userController = new UserController(userService);
        const productController = new ProductController(productService);

        app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            next();
        });

        // Initialize routes
        const appRouter = AppRouter(userController, productController);
        app.use('/api', appRouter);

        // Error handling middleware
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Something went wrong!' });
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error during initialization:", error.message);
            console.error("Detailed error:", error.stack);
        } else {
            console.error("An unknown error occurred:", error);
        }
        process.exit(1);
    }
}

initializeApp();