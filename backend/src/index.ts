import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { DataSource } from 'typeorm';
import { AppRouter } from './routes';
import { UserService } from './services/UserService';
import * as Entities from './entities';
import { UserController } from './controllers/UserController';
import { ProductService } from './services/ProductService';
import { OrderService } from './services/OrderService';
import { CategoryService } from './services/CategoryService';
import { OrderController } from './controllers/OrderController';
import { ProductController } from './controllers/ProductController';
import { CategoryController } from './controllers/CategoryController';
import { productRepositoryMethods } from './entities/product.repository';
import { Repository } from 'typeorm';
import { ProductRepositoryCustom } from './entities/product.repository';
import dotenv from 'dotenv';
import { Product } from './entities/Product';
import { BidService } from './services/BidService';
import { BidController } from './controllers/BidController';
import { initializeBidScheduler } from './schedulers';
import { ReviewService } from './services/ReviewService';
import { ReviewController } from './controllers/ReviewController';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';


const app = express();



app.use(cors({
    origin: 'http://localhost:3001', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




//app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
        console.log("Initializing services..."); 
        const userService = new UserService(
            AppDataSource.getRepository(Entities.User),
            AppDataSource.getRepository(Entities.BuyerProfile),
            AppDataSource.getRepository(Entities.SellerProfile),
            AppDataSource.getRepository(Entities.Review)
        );
        const productService = new ProductService(
            Object.assign(
                AppDataSource.getRepository(Entities.Product),
                productRepositoryMethods
            ) as Repository<Product> & ProductRepositoryCustom,
            AppDataSource.getRepository(Entities.Review),
            AppDataSource.getRepository(Entities.SellerProfile)
        );

        const categoryService = new CategoryService(
            AppDataSource.getRepository(Entities.Category));
        

        // Initialize services
        
        const orderService = new OrderService(
            AppDataSource.getRepository(Entities.Order),
            AppDataSource.getRepository(Entities.OrderItem),
            AppDataSource.getRepository(Entities.Product)
        );
        const bidService = new BidService(
            AppDataSource.getRepository(Entities.BidListing),
            AppDataSource.getRepository(Entities.Bid),
            AppDataSource.getRepository(Entities.Product)
        );
        const reviewService = new ReviewService(
        
            AppDataSource.getRepository(Entities.Review),
            AppDataSource.getRepository(Entities.User),
            AppDataSource.getRepository(Entities.SellerProfile)
        )

        console.log("Services initialized!");
        console.log(listEndpoints(app));

        // Initialize controllers
        console.log("Initializing controllers..."); 
        const userController = new UserController(
            userService,
            AppDataSource.getRepository(Entities.User)
        );
        const productController = new ProductController(productService);
        const orderController = new OrderController(orderService);
        const categoryController = new CategoryController(categoryService);
        const reviewController = new ReviewController(reviewService);
        
        const bidController = new BidController(bidService);
        console.log("Controllers Initialized"); 
        
        // Initialize bid scheduler
        initializeBidScheduler(bidService);
        
        
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            next();
        });
        
        // Initialize routes
        console.log("About to initialize routes...");
        const appRouter = AppRouter(
            userController, productController, categoryController, reviewController);
            
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