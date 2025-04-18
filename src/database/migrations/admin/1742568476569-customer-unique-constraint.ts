import { MigrationInterface, QueryRunner } from "typeorm";

export class CustomerMigration1742568476569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint for entity_name_en and supplier_id
    await queryRunner.query(`
      ALTER TABLE customer
      ADD CONSTRAINT unique_entity_name_en_per_supplier
      UNIQUE (entity_name_en, supplier_id)
    `);

    // Add unique constraint for entity_name_kh and supplier_id
    await queryRunner.query(`
      ALTER TABLE customer
      ADD CONSTRAINT unique_entity_name_kh_per_supplier
      UNIQUE (entity_name_kh, supplier_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the constraints
    await queryRunner.query(`
      ALTER TABLE customer
      DROP CONSTRAINT unique_entity_name_en_per_supplier
    `);

    await queryRunner.query(`
      ALTER TABLE customer
      DROP CONSTRAINT unique_entity_name_kh_per_supplier
    `);
  }
} 