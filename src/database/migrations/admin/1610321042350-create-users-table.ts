import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import { commonFields } from "../common.fields";

const tableName = "admin.users";
export class createUsersTable1610321042350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: tableName,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            isGenerated: true,
            isNullable: false,
          },
          {
            name: "username",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_super_user",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "30",
            isNullable: false,
          },

          {
            name: "expired_at",
            type: "timestamp with time zone",
            isNullable: true,
          },
          {
            name: "created_by",
            type: "uuid",
            isNullable: true,
          },
          ...commonFields,
        ],
      }),
      true
    );

    // Add the foreign key constraint
    await queryRunner.createForeignKey(
      tableName,
      new TableForeignKey({
        columnNames: ["created_by"],
        referencedColumnNames: ["id"],
        referencedTableName: tableName,
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the foreign key constraint
    const table = await queryRunner.getTable(tableName);
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("created_by") !== -1
    );
    await queryRunner.dropForeignKey(tableName, foreignKey);

    // Remove the created_by column
    await queryRunner.dropTable(tableName);
  }
}
