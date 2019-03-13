import yaml from 'js-yaml'
import path from 'path'
import { readFile, writeFile } from './utils/fileHelper'

export const defaultConfigFileName = 'drift.yml'

export type ProviderType = 'mssql' | 'postgres'

export type MigrationScriptType = 'js' | 'ts'

export interface IDriftConfig {
  migrationScriptType?: MigrationScriptType
  providers: ProviderType[]
  rootDir: string
  scripts: {
    preDeploy: string[]
    postDeploy: string[]
    migrations: string[]
  }
}

const defaultConfig: IDriftConfig = {
  providers: ['mssql'],
  rootDir: '.',
  scripts: {
    migrations: [],
    postDeploy: [],
    preDeploy: []
  }
}

export function initializeConfig(rootDir: string | undefined, providers: ProviderType[] | undefined): IDriftConfig {
  return Object.assign(
    {},
    {
      ...defaultConfig,
      providers: providers || defaultConfig.providers,
      rootDir: rootDir || defaultConfig.rootDir
    }
  )
}

export async function writeConfiguration(config: IDriftConfig, configFileName: string = defaultConfigFileName): Promise<string> {
  const configFile = path.resolve(process.cwd(), configFileName)
  await writeFile(configFile, yaml.safeDump(unresolvePaths(config, configFile)))
  return configFile
}

export async function loadConfiguration(configPath: string = defaultConfigFileName): Promise<IDriftConfig> {
  const fullPath = path.resolve(process.cwd(), configPath)
  const configContents = await readFile(fullPath)
  const config = yaml.safeLoad(configContents) as IDriftConfig
  return resolvePaths(config, fullPath)
}

function resolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const configDir = path.dirname(path.resolve(configPath))
  config.rootDir = path.resolve(path.join(configDir, config.rootDir))
  return config
}

function unresolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const newConfig: IDriftConfig = Object.assign({}, config)
  const configDir = path.dirname(path.resolve(configPath))
  newConfig.rootDir = path.relative(configDir, config.rootDir)
  return newConfig
}
