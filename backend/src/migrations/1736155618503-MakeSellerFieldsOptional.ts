import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeSellerFieldsOptional1736155618503 implements MigrationInterface {
    name = 'MakeSellerFieldsOptional1736155618503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seller_profiles" ALTER COLUMN "companyName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "seller_profiles" ALTER COLUMN "companyDescription" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "seller_profiles" ALTER COLUMN "companyDescription" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "seller_profiles" ALTER COLUMN "companyName" SET NOT NULL`);
    }

}
