import colors from 'colors'
import { createScalarFunction, createTableFunction } from '../../../lib/commands/create'
import { defaultConfigFileName } from '../../../lib/DriftConfig'

export const command = 'function <name>'

export const desc = 'Create a new function script'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  name: {
    description: 'Name of the function'
  },
  table: {
    alias: ['t'],
    default: false,
    demandOption: false,
    type: 'boolean'
  }
}

export async function handler(argv: any) {
  try {
    const results = argv.table ? await createTableFunction(argv.name, argv.config) : await createScalarFunction(argv.name, argv.config)
    console.log(`Created file: ${results.join('\n' + ' '.repeat(14))}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
