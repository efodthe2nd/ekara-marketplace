import { MigrationInterface, QueryRunner } from "typeorm";

export class ImageColumnChange1739367783987 implements MigrationInterface {
        public async up(queryRunner: QueryRunner): Promise<void> {
            // Only alter the column type without adding constraints
            await queryRunner.query(`
                ALTER TABLE products 
                ALTER COLUMN images TYPE varchar[] 
                USING images::varchar[];
            `);
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.query(`
                ALTER TABLE products 
                ALTER COLUMN images TYPE text[] 
                USING images::text[];
            `);
        }
}
