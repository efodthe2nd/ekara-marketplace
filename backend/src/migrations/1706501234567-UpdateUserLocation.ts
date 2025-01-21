import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateUserLocation1706501234567 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new location column
        await queryRunner.addColumn("users", new TableColumn({
            name: "location",
            type: "text",
            isNullable: true
        }));

        // Optional: Combine existing city and state into location
        await queryRunner.query(`
            UPDATE "users" 
            SET location = CONCAT_WS(', ', city, state) 
            WHERE city IS NOT NULL OR state IS NOT NULL
        `);

        // Drop old columns
        await queryRunner.dropColumn("users", "city");
        await queryRunner.dropColumn("users", "state");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back the original columns
        await queryRunner.addColumn("users", new TableColumn({
            name: "city",
            type: "text",
            isNullable: true
        }));

        await queryRunner.addColumn("users", new TableColumn({
            name: "state",
            type: "text",
            isNullable: true
        }));

        // Drop the location column
        await queryRunner.dropColumn("users", "location");
    }
}