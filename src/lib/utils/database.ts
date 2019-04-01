import { QueryTypes } from 'sequelize'
import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { IDatabaseOptions } from '../interfaces/IDatabaseOptions'

export function createDatabaseConnection(options: IDatabaseOptions, databaseNameOverride?: string): Sequelize {
  const dbName = databaseNameOverride || options.databaseName
  const dbUsername = options.username || ''
  const dbPassword = options.password || ''

  const sequelizeConfig: SequelizeOptions = {
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
      let port: number | undefined
      let instanceName: string | undefined
      let authentication: any
      if (options.port) {
        port = options.port
      } else if (options.instanceName && options.instanceName.toUpperCase() !== 'MSSQLSERVER') {
        instanceName = options.instanceName
      } else {
        port = 1433
      }
      if (options.domain) {
        authentication = {
          options: {
            domain: options.domain,
            password: options.password,
            userName: options.username
          },
          type: 'ntlm'
        }
      }
      sequelizeConfig.dialectOptions = {
        authentication,
        options: {
          encrypt: false,
          instanceName,
          port,
          requestTimeout: 30000
        }
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
  await masterContext.query(createCommand, { type: QueryTypes.RAW })
}
