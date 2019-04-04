import colors from 'colors'
import { convert } from '../../lib/commands/convert'
import { defaultConfigFileName } from '../../lib/DriftConfig'
import { IConvertOptions } from '../../lib/interfaces/IConvertOptions'
import { logger } from '../utils/logging'

export const command = 'convert'

export const desc = 'Converts an existing ims-migration project to a drift project'

export const builder = {
  dir: {
    alias: ['d'],
    default: './.drift',
    demandOption: false,
    describe: 'Base directory where script files will be created'
  },
  in: {
    alias: ['i'],
    default: 'migration.yaml',
    demandOption: false,
    describe: 'Path to the ims-migration configuration file'
  },
  out: {
    alias: ['o'],
    default: defaultConfigFileName,
    demandOption: false,
    describe: 'Path to the new drift configuration file'
  }
}

export async function handler(argv: IConvertOptions) {
  try {
    const configPath = await convert(argv)
    logger.success(`Drift configuration file created at ${colors.green(configPath)}`)
  } catch (err) {
    logger.error(err)
  }
}
