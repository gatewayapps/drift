import Bluebird from 'bluebird'
import sequelize from 'sequelize'
import Migration, { IMigration, MigrationInstance } from './models/Migration'
import MigrationsLog, { IMigrationsLog, MigrationsLogInstance } from './models/MigrationsLog'

export class DbContext {
  public connection: sequelize.Sequelize
  public Migration: sequelize.Model<MigrationInstance, IMigration>
  public MigrationLog: sequelize.Model<MigrationsLogInstance, IMigrationsLog>
  public transaction: sequelize.Transaction | undefined

  constructor(conn: sequelize.Sequelize) {
    this.connection = conn

    this.Migration = Migration(this.connection)
    this.MigrationLog = MigrationsLog(this.connection)
  }

  public async beginTransaction(): Promise<sequelize.Transaction> {
    if (!this.transaction) {
      this.transaction = await this.connection.transaction()
    }
    return this.transaction
  }

  public async commitTransaction(): Promise<void> {
    if (!this.transaction) {
      return
    }
    await this.transaction.commit()
    this.transaction = undefined
  }

  public async addColumn(tableName: string | { tableName?: string; schema?: string }, key: string, attribute: sequelize.DefineAttributeColumnOptions | sequelize.DataTypeAbstract): Promise<void> {
    this.connection.getQueryInterface().addColumn(tableName, key, attribute, {
      transaction: this.transaction
    })
  }

  public async changeColumn(tableName: string | { schema?: string; tableName?: string }, attributeName: string, dataTypeOrOptions?: string | sequelize.DataTypeAbstract | sequelize.DefineAttributeColumnOptions): Promise<void> {
    this.connection.getQueryInterface().changeColumn(tableName, attributeName, dataTypeOrOptions, {
      transaction: this.transaction
    })
  }

  public async createSchema(schema?: string): Promise<void> {
    this.connection.getQueryInterface().createSchema(schema, {
      transaction: this.transaction
    })
  }

  public async createTable(tableName: string | { schema?: string; tableName?: string }, attributes: sequelize.DefineAttributes): Promise<void> {
    this.connection.getQueryInterface().createTable(tableName, attributes, {
      transaction: this.transaction
    })
  }

  public async dropSchema(schema?: string): Promise<void> {
    this.connection.getQueryInterface().dropSchema(schema, {
      transaction: this.transaction
    })
  }

  public async dropTable(tableName: string): Promise<void> {
    this.connection.getQueryInterface().dropTable(tableName, {
      transaction: this.transaction
    })
  }

  public async removeColumn(tableName: string | { tableName?: string; schema?: string }, attribute: string): Promise<void> {
    this.connection.getQueryInterface().removeColumn(tableName, attribute, {
      transaction: this.transaction
    })
  }

  public async renameColumn(tableName: string | { schema?: string; tableName?: string }, attrNameBefore: string, attrNameAfter: string): Promise<void> {
    this.connection.getQueryInterface().renameColumn(tableName, attrNameBefore, attrNameAfter, {
      transaction: this.transaction
    })
  }

  public async renameTable(before: string, after: string): Promise<void> {
    this.connection.getQueryInterface().renameTable(before, after, {
      transaction: this.transaction
    })
  }

  public async rollbackTransaction(): Promise<void> {
    if (!this.transaction) {
      return
    }
    await this.transaction.rollback()
    this.transaction = undefined
  }

  public runRawQuery(queryText: string): Bluebird<any> {
    return this.connection.query(queryText, { type: sequelize.QueryTypes.RAW, transaction: this.transaction })
  }

  public sync(): Bluebird<any> {
    return this.connection.sync()
  }
}
