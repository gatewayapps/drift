import upath from 'upath'
import { initializeConfig, writeConfiguration } from '../DriftConfig'
import { IInitOptions } from '../interfaces/IInitOptions'
import { exists } from '../utils/fileHelper'

export async function init(options: IInitOptions): Promise<string> {
  const config = initializeConfig(options.dir, options.provider)
  const configPath = upath.resolve(process.cwd(), options.config)
  if (exists(configPath)) {
    throw new Error(`Drift configuration file already exists at "${configPath}"`)
  }
  await writeConfiguration(config, configPath)
  return configPath
}
