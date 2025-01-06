import { DataSource } from 'typeorm';
import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Construct the path to entities directory
const entitiesPath = path.join(__dirname, 'entities', '*.ts');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketplace',
  synchronize: true, // set to false in production
  logging: true,
  entities: [entitiesPath],
  migrations: [],
  subscribers: [],
});

// Initialize the data source
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });