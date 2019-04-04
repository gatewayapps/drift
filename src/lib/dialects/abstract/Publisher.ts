import EventEmitter from 'events'
import _ from 'lodash'
import { Sequelize } from 'sequelize'
import { DatabasePublishStatus, MigrationStatus, ProviderType, PublisherEvents } from '../../constants'
import { DbContext } from '../../DbContext'
import { loadConfiguration } from '../../DriftConfig'
import { IDatabaseObject } from '../../interfaces/IDatabaseObject'
import { IDatabaseOptions } from '../../interfaces/IDatabaseOptions'
import { IDriftConfig } from '../../interfaces/IDriftConfig'
import { IPublishOptions } from '../../interfaces/IPublishOptions'
import { IPublishProgress } from '../../interfaces/IPublishProgress'
import { IPublishResult } from '../../interfaces/IPublishResult'
import { IReplacements } from '../../interfaces/IReplacements'
import { IStatusResult } from '../../interfaces/IStatusResult'
import { MigrationError } from '../../MigrationError'
import { Migration } from '../../models/Migration'
import { MigrationsLog } from '../../models/MigrationsLog'
import { createDatabaseConnection, tryCreateDatabase } from '../../utils/database'
import { loadDatabaseObjects, resolveDependencies } from '../../utils/databaseObjects'
import { createMigrationHash, getMigrationsToApply, isMigrationRequired, loadMigrationScript, loadPostDeploymentScript } from '../../utils/migration'
import { buildReplacements } from '../../utils/publish'

export abstract class Publisher extends EventEmitter {
  private options: IPublishOptions

  constructor(options: Partial<IPublishOptions>) {
    super()
    this.options = this.prepareOptions(options)
  }

  public async checkStatus(): Promise<IStatusResult> {
    const config = await loadConfiguration(this.options.configFile)
    const dbContext = await this.createContext(this.options.database)
    const migrationHash = await createMigrationHash(config, this.options.database.provider)

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

  public async start(): Promise<IPublishResult> {
    const options = this.options
    const config = await loadConfiguration(options.configFile)
    const replacements = buildReplacements(options)

    // 1. Connect to the database and create DbContext
    const dbContext = await this.createContext(options.database, true)

    // 2. Determine if a migration needs to be applied
    const migrationHash = await createMigrationHash(config, options.database.provider)
    if (!options.force && !(await isMigrationRequired(migrationHash))) {
      const result: IPublishResult = {
        status: MigrationStatus.AlreadyApplied,
        statusDesc: MigrationStatus[MigrationStatus.AlreadyApplied]
      }
      this.onComplete(result)
      return result
    }

    // 3. Start a transaction for the migration
    const trx = await dbContext.beginTransaction()

    try {
      // 4. Apply migrations
      await this.applyMigrations(dbContext, config, options.database.provider, replacements)

      // 5. Apply database objects
      await this.applyDatabaseObjects(dbContext, config, options.database.provider, replacements)

      // 6. Apply post deployment scripts
      await this.applyPostDeploy(dbContext, config, options.database.provider, replacements)

      // 7. Record successful migration
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

      // 8. Commit the migration transaction
      await dbContext.commitTransaction()

      // 9. Return the result
      const result: IPublishResult = {
        migrationsLog,
        status: MigrationStatus.Success,
        statusDesc: MigrationStatus[MigrationStatus.Success]
      }
      this.onComplete(result)
      return result
    } catch (err) {
      await dbContext.rollbackTransaction()
      const migrationsLog = await MigrationsLog.create({
        details: JSON.stringify(err),
        message: err.message,
        migration: err.scriptName,
        status: MigrationStatus.Failed
      })
      const result: IPublishResult = {
        error: err,
        migrationsLog,
        status: MigrationStatus.Failed,
        statusDesc: MigrationStatus[MigrationStatus.Failed]
      }
      this.onError(err, result)
      return result
    }
  }

  protected onProgress(progress: IPublishProgress): void {
    this.emit(PublisherEvents.Progress, progress)
  }

  protected onError(error: Error, result?: IPublishResult) {
    this.emit(PublisherEvents.Error, error, result)
  }

  protected onComplete(result: IPublishResult) {
    this.emit(PublisherEvents.Complete, result)
  }

  protected preApplyDatabaseObject(dbContext: DbContext, databaseObject: IDatabaseObject): Promise<void> {
    return Promise.resolve()
  }

  protected postApplyDatabaseObject(dbContext: DbContext, databaseObject: IDatabaseObject): Promise<void> {
    return Promise.resolve()
  }

  protected verifyOptions(options: IPublishOptions): void {
    if (!options.configFile) {
      throw new Error('options.configFile is required')
    }

    if (!options.database) {
      throw new Error('options.database is required')
    }

    if (!options.database.provider) {
      throw new Error('options.database.provider is required')
    }

    if (!options.database.databaseName) {
      throw new Error('options.database.databaseName is required')
    }
  }

  private async createContext(dbOptions: IDatabaseOptions, attemptCreate: boolean = false) {
    const task = 'Connecting'
    this.onProgress({ task, status: 'Checking database connection', complete: false })
    // Create database if it does not exist
    const dbConn = createDatabaseConnection(dbOptions)
    try {
      await dbConn.authenticate()
    } catch (err) {
      if (!attemptCreate) {
        throw err
      }
      // Database may not exist so try to create it
      this.onProgress({ task, status: `Attempting to create database ${dbOptions.databaseName}`, complete: false })
      await tryCreateDatabase(dbOptions)
      // Try to authenticate again a failure here means we cannot go futher
      await dbConn.authenticate()
    }

    this.onProgress({ task, status: `Connected to database ${dbOptions.databaseName}`, complete: true })

    const dbContext = new DbContext(dbConn)
    await dbContext.sync()
    return dbContext
  }

  private async applyDatabaseObjects(dbContext: DbContext, config: IDriftConfig, provider: ProviderType, replacements: IReplacements): Promise<void> {
    const task = 'Applying Database Objects'
    this.onProgress({ task, status: 'Loading database objects', complete: false })
    const dbObjects = await loadDatabaseObjects(config, provider, replacements)

    this.onProgress({ task, status: 'Resolving object dependencies', complete: false })
    const sortedDbObjects = resolveDependencies(dbObjects, provider)

    const totalSteps = sortedDbObjects.length
    let completedSteps = 0

    for (const obj of sortedDbObjects) {
      try {
        this.onProgress({ task, status: `Applying database object: ${obj.type.toUpperCase()} ${obj.schemaName}.${obj.objectName}`, complete: false, completedSteps, totalSteps })
        await this.preApplyDatabaseObject(dbContext, obj)
        await dbContext.runRawQuery(obj.text)
        await this.postApplyDatabaseObject(dbContext, obj)
        completedSteps++
      } catch (err) {
        throw new MigrationError(err.message, obj.filePath, err)
      }
    }

    this.onProgress({ task, status: 'All database objects have been applied', complete: true, completedSteps, totalSteps })
  }

  private async applyMigrations(dbContext: DbContext, config: IDriftConfig, provider: ProviderType, replacements: IReplacements): Promise<void> {
    const task = 'Applying Migration Scripts'

    this.onProgress({ task, status: 'Determining migration scripts to apply', complete: false })
    const migrationsToApply = await getMigrationsToApply(config.scripts.migrations)

    if (migrationsToApply.length === 0) {
      this.onProgress({ task, status: 'No migrations to apply', complete: true })
      return
    }

    const totalSteps = migrationsToApply.length
    let completedSteps = 0

    for (const migration of migrationsToApply) {
      try {
        this.onProgress({ task, status: `Applying migration script: ${migration}`, complete: false, completedSteps, totalSteps })
        const migrationScript = await loadMigrationScript(config.rootDir, migration)
        await migrationScript.exec(dbContext, Sequelize, provider, replacements)
        await Migration.create({ migration }, { transaction: dbContext.transaction })
        completedSteps++
      } catch (err) {
        throw new MigrationError(err.message, migration, err)
      }
    }

    this.onProgress({ task, status: 'All migrations have been applied', complete: true, completedSteps, totalSteps })
  }

  private async applyPostDeploy(dbContext: DbContext, config: IDriftConfig, provider: ProviderType, replacements: IReplacements): Promise<void> {
    const task = 'Applying Post Deployment Scripts'

    if (config.scripts.postDeploy.length === 0) {
      return
    }

    const totalSteps = config.scripts.postDeploy.length
    let completedSteps = 0

    for (const postDeploy of config.scripts.postDeploy) {
      try {
        this.onProgress({ task, status: `Applying post deployment script: ${postDeploy}`, complete: false, completedSteps, totalSteps })
        const postDeployScript = await loadPostDeploymentScript(config.rootDir, postDeploy)
        await postDeployScript.exec(dbContext, Sequelize, provider, replacements)
        completedSteps++
      } catch (err) {
        throw new MigrationError(err.message, postDeploy, err)
      }
    }

    this.onProgress({ task, status: 'All post deployment scripts have been applied', complete: true, completedSteps, totalSteps })
  }

  private prepareOptions(options: Partial<IPublishOptions>): IPublishOptions {
    const defaultOptions: IPublishOptions = {
      configFile: './drift.yml',
      database: {
        databaseName: '',
        logging: false,
        provider: ProviderType.MsSql
      },
      force: false,
      replacements: {}
    }

    const mergedOptions: IPublishOptions = _.merge({}, defaultOptions, options)
    this.verifyOptions(mergedOptions)
    return mergedOptions
  }
}
