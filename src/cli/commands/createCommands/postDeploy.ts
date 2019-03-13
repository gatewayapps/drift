import colors from 'colors'
import { createPostDeploy } from '../../../lib/commands/create'
import { defaultConfigFileName } from '../../../lib/DriftConfig'

export const command = 'postDeploy <name>'

export const aliases = ['post', 'post-deploy', 'postdeploy']

export const desc = 'Creates a new post-deployment script'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  name: {
    description: 'Name of the post-deployment script'
  }
}

export async function handler(argv: any) {
  try {
    const scriptFile = await createPostDeploy(argv.name, argv.config)
    console.log(`Created file: ${scriptFile}`)
  } catch (err) {
    console.log(colors.red(err.message))
  }
}
