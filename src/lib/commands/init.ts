import yaml from 'js-yaml'
import path from 'path'
import { defaultConfigFileName, initializeConfig } from '../DriftConfig'
import { exists, writeFile } from '../utils/fileHelper'

export interface IInitOptions {
  dir: string
  provider: string[]
}

export async function init(options: IInitOptions): Promise<string> {
  const config = initializeConfig(options.dir, options.provider)
  const configPath = path.resolve(process.cwd(), defaultConfigFileName)
  if (exists(configPath)) {
    throw new Error(`Drift configuration file already exists at "${configPath}"`)
  }
  await writeFile(configPath, yaml.safeDump(config))
  return configPath
}
