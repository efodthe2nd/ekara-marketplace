import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { AppRouter } from './routes';
import { UserService } from './services/UserService';
import { User, Buyer, Seller } from './entities/Index';

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
    entities: [User, Buyer, Seller],
    synchronize: process.env.NODE_ENV !== 'production', // Don't use in production!
    logging: process.env.NODE_ENV !== 'production'
});

// Initialize the application
async function initializeApp() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        // Initialize services
        const userService = new UserService(
            AppDataSource.getRepository(User),
            AppDataSource.getRepository(Buyer),
            AppDataSource.getRepository(Seller)
        );

        // Initialize routes
        const appRouter = new AppRouter(userService);
        app.use('/api', appRouter.getRouter());

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
    } catch (error) {
        console.error("Error during initialization:", error);
        process.exit(1);
    }
}

initializeApp();