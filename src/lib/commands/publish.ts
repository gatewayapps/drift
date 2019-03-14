import { loadConfiguration } from '../DriftConfig'
import { createDatabaseConnection, IDatabaseOptions, tryCreateDatabase } from '../utils/database'
import { ILogger, noLogger } from '../utils/logging'
import { createMigrationHash } from '../utils/migration'

export interface IPublishOptions {
  configFile?: string
  database: IDatabaseOptions
  force?: boolean
  replacements?: {
    [key: string]: any
  }
  logger?: ILogger
}

console.log()

export async function publish(options: IPublishOptions) {
  const config = await loadConfiguration(options.configFile)
  const replacements = buildReplacements(options)
  const logger = options.logger || noLogger

  // Create database if it does not exist
  const dbConn = createDatabaseConnection(options.database)
  try {
    await dbConn.authenticate()
    logger.status(`Connected to database ${options.database.databaseName}`)
  } catch (err) {
    // Database may not exist so try to create it
    logger.status(`Creating database ${options.database.databaseName}`)
    await tryCreateDatabase(options.database)
    // Try to authenticate again a failure here means we cannot go futher
    await dbConn.authenticate()
    logger.status(`Connected to database ${options.database.databaseName}`)
  }

  // Register

  // Generate migration hash
  const migrationHash = await createMigrationHash(config, options.database.provider)

  // Check if migration needs to be applied
  // Create transaction
  // Run migrations
  // Run database objects
  // Run post deploy scripts
  // Record successful migration
  // Commit transaction

  // ON ERROR
  // Rollback transaction
  // Record failed migration
}

function buildReplacements(options: IPublishOptions): any {
  const replacements = {
    DatabaseName: options.database.databaseName,
    Provider: options.database.provider,
    PublisherUsername: options.database.username
  }
  if (options.replacements) {
    Object.assign(replacements, options.replacements)
  }
  return replacements
}
