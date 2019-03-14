import Bluebird from 'bluebird'
import { Model, QueryTypes, Sequelize } from 'sequelize'
import Migration, { IMigration } from './models/Migration'
import MigrationsLog, { IMigrationsLog } from './models/MigrationsLog'

export class DbContext {
  public Migration: Model<{}, IMigration>
  public MigrationLog: Model<{}, IMigrationsLog>
  private connection: Sequelize

  constructor(conn: Sequelize) {
    this.connection = conn

    this.Migration = Migration(this.connection)
    this.MigrationLog = MigrationsLog(this.connection)
  }

  public runRawQuery(queryText: string): Bluebird<any> {
    return this.connection.query(queryText, { type: QueryTypes.RAW })
  }
}
