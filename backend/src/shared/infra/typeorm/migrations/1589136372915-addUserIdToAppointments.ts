import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class addUserIdToAppointments1589136372915
  implements MigrationInterface {
  private tableName = 'appointments';

  private userIdColumn = new TableColumn({
    name: 'user_id',
    type: 'uuid',
    isNullable: true,
  });

  private appointmentUserFK = new TableForeignKey({
    name: 'AppointmentUser',
    columnNames: ['user_id'],
    referencedColumnNames: ['id'],
    referencedTableName: 'users',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(this.tableName, this.userIdColumn);
    await queryRunner.createForeignKey(this.tableName, this.appointmentUserFK);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.tableName, this.appointmentUserFK);
    await queryRunner.dropColumn(this.tableName, this.userIdColumn);
  }
}
