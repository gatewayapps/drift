import { Column, DataType, Model, Table } from 'sequelize-typescript'

export interface IMigrationsLog {
  logId?: number
  timestamp?: Date
  status: number
  message: string
  migration?: string
  details?: string
}

@Table({ tableName: '__MigrationsLog' })
export class MigrationsLog extends Model<MigrationsLog> {
  @Column({ primaryKey: true, autoIncrement: true })
  public logId: number

  @Column({ allowNull: false, defaultValue: Date.now })
  public timestamp: Date

  @Column({ allowNull: false })
  public status: number

  @Column({ allowNull: false, type: DataType.STRING(1000) })
  public message: string

  @Column({ allowNull: true, type: DataType.STRING(1000) })
  public migration?: string

  @Column({ allowNull: true, type: DataType.STRING(2000) })
  public details?: string
}
