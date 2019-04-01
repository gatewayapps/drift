import fs from 'fs-extra'
import yaml from 'js-yaml'
import path from 'path'
import { ProviderType } from '../constants'
import { initializeConfig } from '../DriftConfig'
import { IConvertOptions } from '../interfaces/IConvertOptions'
import { readFile } from '../utils/fileHelper'

interface IImsMigrationConfig {
  paths: {
    functions: string
    postDeploy: string
    preDeploy: string
    procedures: string
    migrations: string
    views: string
  }
  preDeploy: string[]
  postDeploy: string[]
  migrations: string[]
}

export async function convert(options: IConvertOptions): Promise<string> {
  // 1. Read the 'in' file
  const imsMigrationConfigFilename = path.resolve(process.cwd(), options.in)
  const imsMigrationConfigPath = path.dirname(imsMigrationConfigFilename)
  const imsMigrationConfig = await loadImsMigrationConfig(imsMigrationConfigFilename)

  // 2. Initialize the new drift configuration
  const driftConfigFilename = path.resolve(process.cwd(), options.out)
  const driftConfig = await initializeConfig(options.dir, [ProviderType.MsSql])

  // 3. Create temporary directory for drift files
  const tempDriftDir = createTempDir()

  // 4. Convert the migrations
  for (const migration of imsMigrationConfig.migrations) {
    const inputFile = path.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.migrations, `${migration}.sql`)
    const outputFile = path.resolve(tempDriftDir, 'migrations', `${migration}.js`)
    await convertScript(inputFile, outputFile)
    driftConfig.scripts.migrations.push(migration)
  }

  // 5. Convert the post deploy

  // 6. Convert the functions

  // 7. Convert the procedures

  // 8. Convert the views

  // 9. Move the old files and config into a backup directory and rewrite the paths in 'in' file

  // 10. Write the 'out' drift configuration
  return ''
}

async function loadImsMigrationConfig(filename: string): Promise<IImsMigrationConfig> {
  const imsMigrationFile = await readFile(filename)
  const imsMigrationConfig = yaml.safeLoad(imsMigrationFile) as IImsMigrationConfig
  return imsMigrationConfig
}

function createTempDir(): string {
  const tempDriftDir = path.resolve(process.cwd(), '.driftTemp')
  fs.emptyDirSync(tempDriftDir)
  return tempDriftDir
}

async function convertScript(inputFile: string, outputFile: string): Promise<void> {
  const inputText = await readFile(inputFile)
  const batches = splitBatches(inputText)
}

function splitBatches(scriptText: string) {
  return scriptText
    .split(/\nGO|go\b/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
}
