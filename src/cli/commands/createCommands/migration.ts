import colors from 'colors'
import { createMigration } from '../../../lib/commands/create'
import { defaultConfigFileName, loadConfiguration } from '../../../lib/DriftConfig'

export const command = 'migration <name>'

export const description = 'Create a new migration script'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  name: {
    description: 'Name of the migration script'
  }
}

export async function handler(argv: any) {
  try {
    const config = await loadConfiguration(argv.config)
    const scriptFile = await createMigration(argv.name, config)
    console.log(`Created file: ${scriptFile}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
