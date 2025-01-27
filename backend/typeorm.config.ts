import { DataSource } from "typeorm";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config();

export default new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marketplace',
    synchronize: false,
    logging: true,
    entities: [path.join(__dirname, "./src/entities/**/*.{ts,js}")],
    migrations: [path.join(__dirname, "./src/migrations/**/*.{ts,js}")],
    subscribers: [],
});