import colors from 'colors'
import ProgressBar from 'progress'
import { createPublisher } from '../../lib/commands/publish'
import { status } from '../../lib/commands/status'
import { DatabasePublishStatus, MigrationStatus, PublisherEvents } from '../../lib/constants'
import { IPublishOptions } from '../../lib/interfaces/IPublishOptions'
import { IPublishProgress } from '../../lib/interfaces/IPublishProgress'
import { IPublishResult } from '../../lib/interfaces/IPublishResult'
import { IReplacements } from '../../lib/interfaces/IReplacements'
import { IStatusOptions } from '../../lib/interfaces/IStatusOptions'
import { getTimestamp, logger } from '../utils/logging'

export const command = 'status <provider>'

export const desc = 'Checks a database to determine if it needs to be updated'

export const builder = {
  config: {
    alias: ['c'],
    default: 'drift.yml'
  },
  database: {
    alias: ['d'],
    demandOption: true
  },
  host: {
    alias: ['h'],
    default: 'localhost'
  },
  instance: {
    alias: ['i'],
    default: 'MSSQLSERVER'
  },
  password: {
    alias: ['p'],
    demandOption: true,
    implies: 'user'
  },
  port: {
    type: 'number'
  },
  provider: {
    choices: ['mssql', 'postgres'],
    demandOption: true,
    describe: 'Database provider that the publish is targeting'
  },
  user: {
    alias: ['u'],
    demandOption: true
  }
}

export async function handler(argv: any) {
  try {
    const statusOptions: IStatusOptions = {
      configFile: argv.config,
      database: {
        databaseName: argv.database,
        host: argv.host,
        instanceName: argv.instanceName,
        logging: false,
        password: argv.password,
        port: argv.port,
        provider: argv.provider,
        username: argv.user
      }
    }
    const result = await status(statusOptions)
    if (result.status === DatabasePublishStatus.UpToDate) {
      logger.success('Up to date!')
    } else if (result.migrations.length > 0) {
      logger.warning('Out of date: The following migrations need to be applied:')
      result.migrations.forEach((migration, index) => {
        const isLast = index === result.migrations.length - 1
        logger.warning(`${isLast ? '└' : '├'}─ ${migration}`)
      })
    } else {
      logger.warning('Out of date: Project signature does match the signature of the publish')
    }
    process.exit(0)
  } catch (err) {
    logger.error('Status check failed', err)
    process.exit(2)
  }
}
