import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePictureColumn1738016213631 implements MigrationInterface {
    name = 'AddProfilePictureColumn1738016213631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profilePicture"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profilePicture" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profilePicture"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profilePicture" character varying`);
    }

}
