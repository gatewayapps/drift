import yaml from 'js-yaml'
import upath from 'upath'
import { ProviderType } from './constants'
import { IDriftConfig } from './interfaces/IDriftConfig'
import { readFile, writeFile } from './utils/fileHelper'

/**
 * @hidden
 */
export const defaultConfigFileName = 'drift.yml'

const defaultConfig: IDriftConfig = {
  providers: [ProviderType.MsSql],
  rootDir: '.',
  scripts: {
    migrations: [],
    postDeploy: []
  }
}

/**
 * Initializes a new Drift configuration object
 * @param rootDir Path to use as the root for storing scripts and objects
 * @param providers Array of database providers that the will be supported
 * @returns A new drift configuration object
 */
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

/**
 * Resolves a path relative to the process current working directory
 * @param configPath Path to be resolved. Defaults to './drift.yml'
 * @returns Fully resovled path to the configuration file
 */
export function getConfigurationPath(configPath: string = defaultConfigFileName): string {
  return upath.isAbsolute(configPath) ? configPath : upath.resolve(process.cwd(), configPath)
}

/**
 * Writes a configuration object to disk
 * @param config Configuration object to be saved
 * @param configFileName Path relative to the current working directory to write the file to
 * @returns Fully resolved path to the configuration file that was written
 */
export async function writeConfiguration(config: IDriftConfig, configFileName: string = defaultConfigFileName): Promise<string> {
  const configFile = upath.resolve(process.cwd(), configFileName)
  await writeFile(configFile, yaml.safeDump(unresolvePaths(config, configFile)))
  return configFile
}

/**
 * Reads a configuration yml file from disk
 * @param configPath Path relative to the current working directory of the drift confiuration file. Defaults to './drift.yml'
 * @returns Drift configuration object
 */
export async function loadConfiguration(configPath: string = defaultConfigFileName): Promise<IDriftConfig> {
  const fullPath = getConfigurationPath(configPath)
  const configContents = await readFile(fullPath)
  const config = yaml.safeLoad(configContents) as IDriftConfig
  return resolvePaths(config, fullPath)
}

/**
 * Translates the rootDir of a configuration object to a full absolute path
 * @param config Drift configuration object to be translated
 * @param configPath The file path where the configuration object is stored on disk
 * @returns Drift configuration object with absolute path for the rootDir
 */
function resolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const configDir = upath.dirname(upath.resolve(configPath))
  config.rootDir = upath.resolve(upath.join(configDir, config.rootDir))
  return config
}

/**
 * Translatest the rootDir of a configuration object to a path relative to the location of the configuration file
 * @param config Drift configuration file to be translated
 * @param configPath The file path where the configuration object is stored on disk
 * @returns Drift configuration object with relative path for the rootDir
 */
function unresolvePaths(config: IDriftConfig, configPath: string): IDriftConfig {
  const newConfig: IDriftConfig = Object.assign({}, config)
  const configDir = upath.dirname(upath.resolve(configPath))
  newConfig.rootDir = upath.normalize(upath.relative(configDir, config.rootDir))
  return newConfig
}
