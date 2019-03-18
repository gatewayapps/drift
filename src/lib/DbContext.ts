import Bluebird from 'bluebird'
import { DataType, ModelAttributeColumnOptions, ModelAttributes, QueryTypes, Transaction } from 'sequelize'
import { Model, Sequelize } from 'sequelize-typescript'
import { Migration } from './models/Migration'
import { MigrationsLog } from './models/MigrationsLog'

export class DbContext {
  public connection: Sequelize
  public Migration: Migration
  public MigrationsLog: MigrationsLog
  public transaction: Transaction | undefined

  constructor(conn: Sequelize) {
    this.connection = conn

    this.connection.addModels([Migration, MigrationsLog])
  }

  public async beginTransaction(): Promise<Transaction | undefined> {
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

  public async addColumn(tableName: string | { tableName?: string; schema?: string }, key: string, attribute: ModelAttributeColumnOptions | DataType): Promise<void> {
    await this.connection.getQueryInterface().addColumn(tableName, key, attribute, {
      transaction: this.transaction
    })
  }

  public async addIndex(tableName: string, attributes: string[], rawTablename?: string): Promise<void> {
    await this.connection.getQueryInterface().addIndex(tableName, attributes, { transaction: this.transaction }, rawTablename)
  }

  public async changeColumn(tableName: string | { schema?: string; tableName?: string }, attributeName: string, dataTypeOrOptions?: DataType | ModelAttributeColumnOptions): Promise<void> {
    await this.connection.getQueryInterface().changeColumn(tableName, attributeName, dataTypeOrOptions, {
      transaction: this.transaction
    })
  }

  public async createSchema(schema?: string): Promise<void> {
    await this.connection.getQueryInterface().createSchema(schema, {
      transaction: this.transaction
    })
  }

  public async createTable(tableName: string | { schema?: string; tableName?: string }, attributes: ModelAttributes): Promise<void> {
    await this.connection.getQueryInterface().createTable(tableName, attributes, {
      transaction: this.transaction
    })
  }

  public async dropSchema(schema?: string): Promise<void> {
    await this.connection.getQueryInterface().dropSchema(schema, {
      transaction: this.transaction
    })
  }

  public async dropTable(tableName: string): Promise<void> {
    await this.connection.getQueryInterface().dropTable(tableName, {
      transaction: this.transaction
    })
  }

  public async removeColumn(tableName: string | { tableName?: string; schema?: string }, attribute: string): Promise<void> {
    await this.connection.getQueryInterface().removeColumn(tableName, attribute, {
      transaction: this.transaction
    })
  }

  public async removeIndex(tableName: string, indexName: string): Promise<void> {
    await this.connection.getQueryInterface().removeIndex(tableName, indexName, {
      transaction: this.transaction
    })
  }

  public async renameColumn(tableName: string | { schema?: string; tableName?: string }, attrNameBefore: string, attrNameAfter: string): Promise<void> {
    await this.connection.getQueryInterface().renameColumn(tableName, attrNameBefore, attrNameAfter, {
      transaction: this.transaction
    })
  }

  public async renameTable(before: string, after: string): Promise<void> {
    await this.connection.getQueryInterface().renameTable(before, after, {
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
    return this.connection.query(queryText, { type: QueryTypes.RAW, transaction: this.transaction })
  }

  public sync(): Bluebird<any> {
    return this.connection.sync()
  }
}
