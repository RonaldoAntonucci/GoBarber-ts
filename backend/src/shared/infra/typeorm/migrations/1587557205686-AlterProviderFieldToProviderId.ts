import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterProviderFieldToProviderId1587557205686
  implements MigrationInterface {
  private tableName = 'appointments';

  private column = new TableColumn({
    name: 'provider_id',
    type: 'uuid',
    isNullable: true,
  });

  private foreignKey = new TableForeignKey({
    name: 'AppointmentProvider',
    columnNames: ['provider_id'],
    referencedColumnNames: ['id'],
    referencedTableName: 'users',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(this.tableName, 'provider');
    await queryRunner.addColumn(this.tableName, this.column);

    await queryRunner.createForeignKey(this.tableName, this.foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.tableName, this.foreignKey);

    await queryRunner.dropColumn(this.tableName, this.column);

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'provider',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
