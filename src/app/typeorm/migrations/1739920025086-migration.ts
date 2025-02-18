import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1739920025086 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "auth_bloc"`);
	}

	public async down(): Promise<void> {}
}
