import yaml from 'js-yaml'
import upath from 'upath'
import { ProviderType } from './constants'
import { IDriftConfig } from './interfaces/IDriftConfig'
import { readFile, writeFile } from './utils/fileHelper'

export const defaultConfigFileName = 'drift.yml'

const defaultConfig: IDriftConfig = {
  providers: [ProviderType.MsSql],
  rootDir: '.',
  scripts: {
    migrations: [],
    postDeploy: []
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

export function getConfigurationPath(configPath: string = defaultConfigFileName) {
  return upath.isAbsolute(configPath) ? configPath : upath.resolve(process.cwd(), configPath)
}

export async function writeConfiguration(config: IDriftConfig, configFileName: string = defaultConfigFileName): Promise<string> {
  const configFile = upath.resolve(process.cwd(), configFileName)
  await writeFile(configFile, yaml.safeDump(unresolvePaths(config, configFile)))
  return configFile
}

export async function loadConfiguration(configPath: string = defaultConfigFileName): Promise<IDriftConfig> {
  const fullPath = getConfigurationPath(configPath)
  const configContents = await readFile(fullPath)
  const config = yaml.safeLoad(configContents) as IDriftConfig
  return resolvePaths(config, fullPath)
}

function resolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const configDir = upath.dirname(upath.resolve(configPath))
  config.rootDir = upath.resolve(upath.join(configDir, config.rootDir))
  return config
}

function unresolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const newConfig: IDriftConfig = Object.assign({}, config)
  const configDir = upath.dirname(upath.resolve(configPath))
  newConfig.rootDir = upath.normalize(upath.relative(configDir, config.rootDir))
  return newConfig
}
