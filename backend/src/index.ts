import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { AppRouter } from './routes';
import { UserService } from './services/UserService';
import * as Entities from './entities';  // Import all entities
import { UserController } from './controllers/UserController';
import dotenv from 'dotenv';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "marketplace",
    entities: Object.values(Entities),  // Use all imported entities
    synchronize: true,  // Explicitly set to true for development
    logging: true
});

// Initialize the application
async function initializeApp() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        // Initialize services
        const userService = new UserService(
            AppDataSource.getRepository(Entities.User),
            AppDataSource.getRepository(Entities.BuyerProfile),
            AppDataSource.getRepository(Entities.SellerProfile)
        );


        // Initialize controller
        const userController = new UserController(userService);

        // Initialize routes
        const appRouter = AppRouter(userController);
        app.use('/api', appRouter);

        // Error handling middleware
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Something went wrong!' });
        });

        // Start the server
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