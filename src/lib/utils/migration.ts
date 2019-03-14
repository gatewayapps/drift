import crypto from 'crypto'
import folderHash from 'folder-hash'
import fs from 'fs-extra'
import path from 'path'
import { IDriftConfig, ProviderType } from '../DriftConfig'

const HASH_ALGO = 'sha256'
const HASH_ENCODING = 'base64'

export async function createMigrationHash(config: IDriftConfig, provider: ProviderType) {
  const paths = ['migrations', `${provider}/functions`, `${provider}/procedures`, `${provider}/views`, 'postDeploy']

  const hash = crypto.createHash(HASH_ALGO)

  for (const p of paths) {
    const fullPath = path.resolve(config.rootDir, p)
    if (fs.existsSync(fullPath)) {
      const childHash = await folderHash.hashElement(fullPath, { algo: HASH_ALGO, encoding: HASH_ENCODING })
      hash.write(childHash)
    }
  }

  return hash.digest(HASH_ENCODING)
}
