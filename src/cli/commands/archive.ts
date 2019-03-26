import { createArchiver } from '../../lib/commands/archive'
import { ArchiverEvents } from '../../lib/constants'
import { defaultConfigFileName } from '../../lib/DriftConfig'
import { IArchiveResult } from '../../lib/interfaces/IArchiveResult'
import { logger } from '../utils/logging'

export const command = 'archive [out]'

export const desc = 'Compresses all scripts and mirgrations into a single zip file'

export const builder = {
  config: {
    alias: ['c'],
    default: defaultConfigFileName,
    description: 'Path to the drift configuration file relative to the current working directory'
  },
  out: {
    alias: ['o'],
    default: 'drift.zip',
    demandOption: true,
    description: 'The path where the archived zip file will be written'
  }
}

export async function handler(argv: any) {
  try {
    const archiver = await createArchiver(argv)
    archiver.on(ArchiverEvents.Warning, (error: Error) => {
      logger.warning(error.message, error)
    })
    archiver.on(ArchiverEvents.Error, (error: Error) => {
      logger.error('Archive failed', error)
      process.exit(2)
    })
    archiver.on(ArchiverEvents.Complete, (result: IArchiveResult) => {
      logger.success(`Archived ${result.size} bytes to ${result.fileName}`)
      process.exit(0)
    })
    archiver.start()
  } catch (err) {
    logger.error('Archive failed', err)
    process.exit(2)
  }
}
