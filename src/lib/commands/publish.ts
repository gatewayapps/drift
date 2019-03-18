import { MigrationStatus } from '../constants'
import { DbContext } from '../DbContext'
import { loadConfiguration } from '../DriftConfig'
import { IMigrationsLog, MigrationsLog } from '../models/MigrationsLog'
import { createDatabaseConnection, IDatabaseOptions, tryCreateDatabase } from '../utils/database'
import { ILogger, noLogger } from '../utils/logging'
import { createMigrationHash, IReplacements, runMigrations, runPostDeploy } from '../utils/migration'

export interface IPublishOptions {
  configFile?: string
  database: IDatabaseOptions
  force?: boolean
  replacements?: IReplacements
  logger?: ILogger
}

export interface IPublishResult {
  error?: Error
  migrationsLog: IMigrationsLog
  status: MigrationStatus
  statusDesc: string
}

export async function publish(options: IPublishOptions): Promise<IPublishResult> {
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

  // Create context and sync
  const dbContext = new DbContext(dbConn)
  await dbContext.sync()

  // Check if migration needs to be applied
  const migrationHash = await createMigrationHash(config, options.database.provider)
  const lastSuccess = await MigrationsLog.findOne({
    order: [['logId', 'DESC']],
    where: { status: MigrationStatus.Success }
  })
  if (!options.force && lastSuccess && lastSuccess.migration === migrationHash) {
    return {
      migrationsLog: lastSuccess.toJSON() as IMigrationsLog,
      status: MigrationStatus.AlreadyApplied,
      statusDesc: MigrationStatus[MigrationStatus.AlreadyApplied]
    }
  }

  // Create database transaction
  const trx = await dbContext.beginTransaction()

  try {
    // Run migrations
    await runMigrations(dbContext, config, options.database.provider, replacements, logger)

    // Run database objects

    // Run post deploy scripts
    await runPostDeploy(dbContext, config, options.database.provider, replacements, logger)

    // Record successful migration
    const migrationsLog = await MigrationsLog.create(
      {
        message: 'Migration completed successfully.',
        migration: migrationHash,
        status: MigrationStatus.Success
      },
      {
        transaction: trx
      }
    )

    // Commit transaction
    await dbContext.commitTransaction()

    return {
      migrationsLog,
      status: MigrationStatus.Success,
      statusDesc: MigrationStatus[MigrationStatus.Success]
    }
  } catch (err) {
    await dbContext.rollbackTransaction()
    const migrationsLog = await MigrationsLog.create({
      details: JSON.stringify(err),
      message: err.message,
      migration: err.scriptName,
      status: MigrationStatus.Failed
    })
    return {
      error: err,
      migrationsLog,
      status: MigrationStatus.Failed,
      statusDesc: MigrationStatus[MigrationStatus.Failed]
    }
  }
}

function buildReplacements(options: IPublishOptions): IReplacements {
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
