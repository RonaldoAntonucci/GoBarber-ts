import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAvatarFieldToUsers1587569751757 implements MigrationInterface {
  private tableName = 'users';

  private avatarColumn = new TableColumn({
    name: 'avatar',
    type: 'varchar',
    isNullable: true,
  });

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumn(this.tableName, this.avatarColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumn(this.tableName, this.avatarColumn);
  }
}
