import { DatabasePublishStatus } from '../constants'
import { DbContext } from '../DbContext'
import { loadConfiguration } from '../DriftConfig'
import { IDatabaseOptions } from '../interfaces/IDatabaseOptions'
import { IStatusOptions } from '../interfaces/IStatusOptions'
import { IStatusResult } from '../interfaces/IStatusResult'
import { createDatabaseConnection } from '../utils/database'
import { createMigrationHash, getMigrationsToApply, isMigrationRequired } from '../utils/migration'

export async function status(options: IStatusOptions): Promise<IStatusResult> {
  const config = await loadConfiguration(options.configFile)
  const dbContext = await createContext(options.database)
  const migrationHash = await createMigrationHash(config, options.database.provider)

  if (!(await isMigrationRequired(migrationHash))) {
    return {
      migrations: [],
      status: DatabasePublishStatus.UpToDate
    }
  }

  const missingMigrations = await getMigrationsToApply(config.scripts.migrations)
  return {
    migrations: missingMigrations,
    status: missingMigrations.length === 0 ? DatabasePublishStatus.SignatureMismatch : DatabasePublishStatus.MissingMigrations
  }
}

async function createContext(dbOptions: IDatabaseOptions): Promise<DbContext> {
  const dbConn = createDatabaseConnection(dbOptions)
  await dbConn.authenticate()
  const dbContext = new DbContext(dbConn)
  return dbContext
}
