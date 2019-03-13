import { loadConfiguration, ProviderType } from '../DriftConfig'
import { ILogger, noLogger } from '../utils/logging'

export interface IPublishOptions {
  configFile?: string
  database: {
    provider: ProviderType
    host?: string
    instanceName?: string
    databaseName?: string
    username?: string
    password?: string
    logging?: boolean
  }
  force?: boolean
  replacements?: {
    [key: string]: any
  }
  logger?: ILogger
}

console.log()

export async function publish(options: IPublishOptions) {
  const config = loadConfiguration(options.configFile)
  const replacements = buildReplacements(options)
  const logger = options.logger || noLogger

  // Create database if it does not exist
  // Generate migration hash
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
