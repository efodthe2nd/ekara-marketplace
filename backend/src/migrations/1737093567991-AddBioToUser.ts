import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBioToUser1737093567991 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD COLUMN "bio" TEXT DEFAULT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN "bio"`
        );
    }

}
