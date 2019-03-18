import crypto from 'crypto'
import folderHash from 'folder-hash'
import fs from 'fs-extra'
import path from 'path'
import { Sequelize } from 'sequelize'
import { DbContext } from '../DbContext'
import { IDriftConfig, ProviderType } from '../DriftConfig'
import { MigrationError } from '../MigrationError'
import { Migration } from '../models/Migration'
import { ILogger } from './logging'

const HASH_ALGO = 'sha256'
const HASH_ENCODING = 'base64'

export interface IReplacements {
  [key: string]: any
}

export interface IScriptModule {
  exec: (context: DbContext, sequelize: typeof Sequelize, provider: ProviderType, replacements: IReplacements) => Promise<void>
}

export async function createMigrationHash(config: IDriftConfig, provider: ProviderType) {
  const paths = ['migrations', `${provider}/functions`, `${provider}/procedures`, `${provider}/views`, 'postDeploy']

  const hash = crypto.createHash(HASH_ALGO)

  for (const p of paths) {
    const fullPath = path.resolve(config.rootDir, p)
    if (fs.existsSync(fullPath)) {
      const childHash = await folderHash.hashElement(fullPath, { algo: HASH_ALGO, encoding: HASH_ENCODING })
      if (childHash.hash) {
        hash.write(childHash.hash)
      }
    }
  }

  return hash.digest(HASH_ENCODING)
}

export async function runMigrations(dbContext: DbContext, config: IDriftConfig, provider: ProviderType, replacements: IReplacements, logger: ILogger): Promise<void> {
  if (!Array.isArray(config.scripts.migrations) || config.scripts.migrations.length === 0) {
    return
  }

  const migrationsToApply = await getMigrationsToApply(config.scripts.migrations)

  if (migrationsToApply.length === 0) {
    logger.status('No new migrations to apply')
    return
  }

  for (const migration of migrationsToApply) {
    try {
      const fullPath = path.join(config.rootDir, 'migrations', migration)
      const migrationScript = (await import(fullPath)) as IScriptModule
      logger.status(`Applying migration script: ${migration}`)
      await migrationScript.exec(dbContext, Sequelize, provider, replacements)
      await Migration.create({ migration }, { transaction: dbContext.transaction })
    } catch (err) {
      throw new MigrationError(err.message, migration, err)
    }
  }
}

export async function runPostDeploy(dbContext: DbContext, config: IDriftConfig, provider: ProviderType, replacements: IReplacements, logger: ILogger): Promise<void> {
  if (!Array.isArray(config.scripts.postDeploy) || config.scripts.postDeploy.length === 0) {
    return
  }

  for (const postDeploy of config.scripts.postDeploy) {
    try {
      const fullPath = path.join(config.rootDir, 'postDeploy', postDeploy)
      const migrationScript = (await import(fullPath)) as IScriptModule
      logger.status(`Applying post deploy script: ${postDeploy}`)
      await migrationScript.exec(dbContext, Sequelize, provider, replacements)
    } catch (err) {
      throw new MigrationError(err.message, postDeploy, err)
    }
  }
}

async function getMigrationsToApply(migrations: string[]): Promise<string[]> {
  const appliedMigrations = await Migration.findAll()
  return migrations.filter((migration) => !appliedMigrations.some((applied) => applied.migration === migration))
}
