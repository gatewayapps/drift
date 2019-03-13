import colors from 'colors'
import { createView } from '../../../lib/commands/create'
import { defaultConfigFileName } from '../../../lib/DriftConfig'

export const command = 'view <name>'

export const desc = 'Create a new view script'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  name: {
    description: 'Name of the view'
  }
}

export async function handler(argv: any) {
  try {
    const results = await createView(argv.name, argv.config)
    console.log(`Created file: ${results.join('\n' + ' '.repeat(14))}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
