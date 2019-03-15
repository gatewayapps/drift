import Sequelize, { Options } from 'sequelize'
import { ProviderType } from '../DriftConfig'

export interface IDatabaseOptions {
  provider: ProviderType
  host?: string
  instanceName?: string
  databaseName: string
  username?: string
  password?: string
  logging?: boolean
}

export function createDatabaseConnection(options: IDatabaseOptions, databaseNameOverride?: string): Sequelize.Sequelize {
  const dbName = databaseNameOverride || options.databaseName
  const dbUsername = options.username || ''
  const dbPassword = options.password || ''

  const sequelizeConfig: Options = {
    define: {
      timestamps: false
    },
    dialect: options.provider,
    host: options.host,
    logging: options.logging || false,
    pool: {
      idle: 10000,
      max: 5,
      min: 1
    },
    retry: {
      max: 3
    }
  }

  switch (options.provider) {
    case 'mssql':
      sequelizeConfig.dialectOptions = {
        encrypt: false,
        instanceName: options.instanceName && options.instanceName.toUpperCase() !== 'MSSQLSERVER' ? options.instanceName : undefined,
        requestTimeout: 30000
      }
      break
  }

  const instance = new Sequelize(dbName, dbUsername, dbPassword, sequelizeConfig)
  return instance
}

export async function tryCreateDatabase(options: IDatabaseOptions): Promise<void> {
  let masterDbName = ''
  let createCommand = ''
  switch (options.provider) {
    case 'mssql':
      masterDbName = 'master'
      createCommand = `CREATE DATABASE [${options.databaseName}]; ALTER DATABASE [${options.databaseName}] SET RECOVERY SIMPLE;`
      break

    case 'postgres':
      masterDbName = 'postgres'
      createCommand = `CREATE DATABASE "${options.databaseName}";`
      break
  }
  if (!masterDbName) {
    return
  }

  const masterContext = createDatabaseConnection(options, masterDbName)
  await masterContext.authenticate()
  await masterContext.query(createCommand, { type: Sequelize.QueryTypes.RAW })
}
