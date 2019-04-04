import Bluebird from 'bluebird'
import { DataType, ModelAttributeColumnOptions, ModelAttributes, QueryTypes, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { Migration } from './models/Migration'
import { MigrationsLog } from './models/MigrationsLog'

/**
 * Wrapper context for providing additional functionality to a Sequelize database connection.
 */
export class DbContext {
  public Migration: Migration
  public MigrationsLog: MigrationsLog
  public transaction: Transaction | undefined
  private connection: Sequelize

  /**
   * Creates a new instance of [[DbContext]]
   * @param conn The Sequelize connection to be wrapped
   */
  constructor(conn: Sequelize) {
    this.connection = conn

    this.connection.addModels([Migration, MigrationsLog])
  }

  /**
   * Starts a database transaction on the connnection. Once the transaction is started, it will be
   * automatically used by other method calls using this context until either the [[commitTransaction]]
   * or [[rollbackTransaction]] methods are called.
   */
  public async beginTransaction(): Promise<Transaction | undefined> {
    if (!this.transaction) {
      this.transaction = await this.connection.transaction()
    }
    return this.transaction
  }

  /**
   * Commits the changes in the current transaction if there is one open.
   */
  public async commitTransaction(): Promise<void> {
    if (!this.transaction) {
      return
    }
    await this.transaction.commit()
    this.transaction = undefined
  }

  /**
   * Adds a column to an existing table
   * @param tableName Identifies the table to be updated
   * @param key Identifies the name of the column to be added
   * @param attribute Describes the properties of the column that is being added
   */
  public async addColumn(tableName: string | { tableName?: string; schema?: string }, key: string, attribute: ModelAttributeColumnOptions | DataType): Promise<void> {
    await this.connection.getQueryInterface().addColumn(tableName, key, attribute, {
      transaction: this.transaction
    })
  }

  /**
   * Adds an index to an existing table
   * @param tableName Identifies the table to be updated
   * @param attributes List of the columns to be included in the index
   * @param rawTablename Identifies the raw table name
   */
  public async addIndex(tableName: string, attributes: string[], rawTablename?: string): Promise<void> {
    await this.connection.getQueryInterface().addIndex(tableName, attributes, { transaction: this.transaction }, rawTablename)
  }

  /**
   * Alter the definition of an exsting column
   * @param tableName Identifies the table to be updated
   * @param attributeName Identifes the name of the column to be updated
   * @param dataTypeOrOptions Describes the new properties the column should have
   */
  public async changeColumn(tableName: string | { schema?: string; tableName?: string }, attributeName: string, dataTypeOrOptions?: DataType | ModelAttributeColumnOptions): Promise<void> {
    await this.connection.getQueryInterface().changeColumn(tableName, attributeName, dataTypeOrOptions, {
      transaction: this.transaction
    })
  }

  /**
   * Creates a new schema
   * @param schema Identifies the name of the schema to be created
   */
  public async createSchema(schema?: string): Promise<void> {
    await this.connection.getQueryInterface().createSchema(schema, {
      transaction: this.transaction
    })
  }

  /**
   * Creates a new table
   * @param tableName Identifies the table to be created
   * @param attributes Describes the columns to be created on the table
   */
  public async createTable(tableName: string | { schema?: string; tableName?: string }, attributes: ModelAttributes): Promise<void> {
    await this.connection.getQueryInterface().createTable(tableName, attributes, {
      transaction: this.transaction
    })
  }

  /**
   * Drops an existing schema
   * @param schema Identifies the schema to be removed
   */
  public async dropSchema(schema?: string): Promise<void> {
    await this.connection.getQueryInterface().dropSchema(schema, {
      transaction: this.transaction
    })
  }

  /**
   * Drops an existing table
   * @param tableName Identifies the table to be removed
   */
  public async dropTable(tableName: string): Promise<void> {
    await this.connection.getQueryInterface().dropTable(tableName, {
      transaction: this.transaction
    })
  }

  /**
   * Drops an existing column from a table
   * @param tableName Identifies the table to be updated
   * @param attribute Identifies the name of the column to be removed
   */
  public async removeColumn(tableName: string | { tableName?: string; schema?: string }, attribute: string): Promise<void> {
    await this.connection.getQueryInterface().removeColumn(tableName, attribute, {
      transaction: this.transaction
    })
  }

  /**
   * Drops an existing index from a table
   * @param tableName Identifies the table to be updated
   * @param indexName Identifies the name of the index to be removed
   */
  public async removeIndex(tableName: string, indexName: string): Promise<void> {
    await this.connection.getQueryInterface().removeIndex(tableName, indexName, {
      transaction: this.transaction
    })
  }

  /**
   * Renames an exsting column on a table
   * @param tableName Identifies the table to be updated
   * @param attrNameBefore The original name of the column
   * @param attrNameAfter The new name of the column
   */
  public async renameColumn(tableName: string | { schema?: string; tableName?: string }, attrNameBefore: string, attrNameAfter: string): Promise<void> {
    await this.connection.getQueryInterface().renameColumn(tableName, attrNameBefore, attrNameAfter, {
      transaction: this.transaction
    })
  }

  /**
   * Renames an existing table
   * @param before The orginal name of the table
   * @param after The new name of the table
   */
  public async renameTable(before: string, after: string): Promise<void> {
    await this.connection.getQueryInterface().renameTable(before, after, {
      transaction: this.transaction
    })
  }

  /**
   * Rolls back the changes in the current transaction if there is one open.
   */
  public async rollbackTransaction(): Promise<void> {
    if (!this.transaction) {
      return
    }
    await this.transaction.rollback()
    this.transaction = undefined
  }

  /**
   * Executes the provided query text against the database.
   *
   * **CAUTION** - This text is directly executed on the database server. You are responsible for
   * sanitizing and making sure the text is compatable with the database provider.
   * @param queryText Text of the query to be executed
   */
  public async runRawQuery(queryText: string): Promise<any> {
    const result = await this.connection.query(queryText, { type: QueryTypes.RAW, transaction: this.transaction })
    return result
  }

  /**
   * Ensures that the Drift related tables have been created in the database.
   */
  public sync(): Bluebird<any> {
    return this.connection.sync()
  }
}
