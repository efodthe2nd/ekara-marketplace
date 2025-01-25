import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCategoryTable1737797268243 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "categories",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "level",
                        type: "int",
                    },
                    {
                        name: "parentId",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "count",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "verified",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            "categories",
            new TableForeignKey({
                columnNames: ["parentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "categories",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("categories");
    }
}