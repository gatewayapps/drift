import crypto from 'crypto'
import folderHash from 'folder-hash'
import fs from 'fs-extra'
import upath from 'upath'
import { MigrationStatus, ProviderType } from '../constants'
import { IDriftConfig } from '../interfaces/IDriftConfig'
import { IScriptModule } from '../interfaces/IScriptModule'
import { Migration } from '../models/Migration'
import { MigrationsLog } from '../models/MigrationsLog'

const HASH_ALGO = 'sha256'
const HASH_ENCODING = 'base64'

export async function createMigrationHash(config: IDriftConfig, provider: ProviderType) {
  const paths = ['migrations', `${provider}/functions`, `${provider}/procedures`, `${provider}/views`, 'postDeploy']

  const hash = crypto.createHash(HASH_ALGO)

  for (const p of paths) {
    const fullPath = upath.resolve(config.rootDir, p)
    if (fs.existsSync(fullPath)) {
      const childHash = await folderHash.hashElement(fullPath, { algo: HASH_ALGO, encoding: HASH_ENCODING })
      if (childHash.hash) {
        hash.write(childHash.hash)
      }
    }
  }

  return hash.digest(HASH_ENCODING)
}

export async function getMigrationsToApply(migrations: string[]): Promise<string[]> {
  if (migrations.length === 0) {
    return []
  }

  const appliedMigrations = await Migration.findAll()
  return migrations.filter((migration) => !appliedMigrations.some((applied) => applied.migration === migration))
}

export async function isMigrationRequired(migrationHash: string): Promise<boolean> {
  const lastSuccess = await MigrationsLog.findOne({
    order: [['logId', 'DESC']],
    where: { status: MigrationStatus.Success }
  })
  return !lastSuccess || lastSuccess.migration !== migrationHash
}

export async function loadMigrationScript(rootDir: string, migration: string): Promise<IScriptModule> {
  const fullPath = upath.join(rootDir, 'migrations', migration)
  const migrationScript = (await import(fullPath)) as IScriptModule
  return migrationScript
}

export async function loadPostDeploymentScript(rootDir: string, postDeploy: string): Promise<IScriptModule> {
  const fullPath = upath.join(rootDir, 'postDeploy', postDeploy)
  const postDeployScript = (await import(fullPath)) as IScriptModule
  return postDeployScript
}
