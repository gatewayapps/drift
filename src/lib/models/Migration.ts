import { Column, Model, Table } from 'sequelize-typescript'

export interface IMigration {
  migration: string
  timestamp?: Date
}

@Table({ tableName: '__Migrations' })
export class Migration extends Model<Migration> {
  @Column({ primaryKey: true })
  public migration: string

  @Column({ allowNull: false, defaultValue: Date.now })
  public timestamp: Date
}
