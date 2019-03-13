import colors from 'colors'
import { createProcedure } from '../../../lib/commands/create'
import { defaultConfigFileName } from '../../../lib/DriftConfig'

export const command = 'procedure <name>'

export const desc = 'Create a new procedure script'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  name: {
    description: 'Name of the procedure'
  }
}

export async function handler(argv: any) {
  try {
    const results = await createProcedure(argv.name, argv.config)
    console.log(`Created file: ${results.join('\n' + ' '.repeat(14))}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
