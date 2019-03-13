import { IInitOptions, init } from '../../lib/commands/init'
import { defaultConfigFileName } from '../../lib/DriftConfig'

import colors from 'colors'

export const command = 'init [dir]'

export const desc = 'Initialize configuration and directory for database scripts'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    demandOption: false,
    describe: 'Name of the configuration file to create relative to the current working directory'
  },
  dir: {
    alias: ['d'],
    default: '.',
    demandOption: false,
    describe: 'Base directory for script files'
  },
  provider: {
    alias: ['p'],
    array: true,
    choices: ['mssql', 'postgres'],
    default: ['mssql'],
    demandOption: false,
    describe: 'List of database providers that can be used with the project'
  }
}

export async function handler(argv: IInitOptions) {
  try {
    const configPath = await init(argv)
    console.log(`Drift configuration file created at ${colors.green(configPath)}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
