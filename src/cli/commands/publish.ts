import colors from 'colors'
import ProgressBar from 'progress'
import { createPublisher } from '../../lib/commands/publish'
import { MigrationStatus, PublisherEvents } from '../../lib/constants'
import { IPublishOptions } from '../../lib/interfaces/IPublishOptions'
import { IPublishProgress } from '../../lib/interfaces/IPublishProgress'
import { IPublishResult } from '../../lib/interfaces/IPublishResult'
import { IReplacements } from '../../lib/interfaces/IReplacements'
import { getTimestamp, logger } from '../utils/logging'

export const command = 'publish <provider>'

export const desc = 'Runs a database migration against a database server'

export const builder = {
  config: {
    alias: ['c'],
    default: 'drift.yml'
  },
  database: {
    alias: ['d'],
    demandOption: true
  },
  domain: {
    demandOption: false
  },
  force: {
    alias: ['f'],
    boolean: true
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
  replacements: {
    alias: ['r'],
    array: true,
    desc: 'Custom replacement tokens should be provide in the format <key>=<value>'
  },
  user: {
    alias: ['u'],
    demandOption: true
  },
  verbose: {
    alias: ['v'],
    boolean: true
  }
}

export async function handler(argv: any) {
  try {
    const publishOptions: IPublishOptions = {
      configFile: argv.config,
      database: {
        databaseName: argv.database,
        domain: argv.domain,
        host: argv.host,
        instanceName: argv.instanceName,
        logging: argv.verbose,
        password: argv.password,
        port: argv.port,
        provider: argv.provider,
        username: argv.user
      },
      force: argv.force,
      replacements: prepareReplacements(argv.replacements)
    }

    const progressBars: { [name: string]: ProgressBar } = {}

    const publisher = await createPublisher(publishOptions)
    publisher.on(PublisherEvents.Progress, (progress: IPublishProgress) => {
      if (progress.totalSteps) {
        if (!progressBars[progress.task]) {
          progressBars[progress.task] = new ProgressBar('[:timestamp]: :task [:bar] :current/:total', {
            complete: colors.green('█'),
            incomplete: ' ',
            total: progress.totalSteps,
            width: 30
          })
        }
        const progressBar = progressBars[progress.task]
        const delta = (progress.completedSteps || progressBar.curr) - (progressBar.curr || 0)
        progressBar.interrupt(`[${colors.blue(getTimestamp())}]: ${progress.task}: ${progress.status}`)
        progressBar.tick(delta, {
          status: progress.status,
          task: progress.task.padEnd(35, ' '),
          timestamp: colors.blue(getTimestamp())
        })
      } else {
        logger.status(`${progress.task}: ${progress.status}`)
      }
    })
    publisher.on(PublisherEvents.Error, (error: Error, result: IPublishResult) => {
      logResult(result)
      process.exit(2)
    })
    publisher.on(PublisherEvents.Complete, (result: IPublishResult) => {
      logResult(result)
      process.exit(0)
    })
    await publisher.start()
  } catch (err) {
    logger.error('Migration failed', err)
    process.exit(2)
  }
}

function logResult(result: IPublishResult) {
  switch (result.status) {
    case MigrationStatus.AlreadyApplied:
      logger.success('No changes made, all migration files have previously been published to the database. Rerun with --force option to reapply the publish')
      break

    case MigrationStatus.Failed:
      logger.error('Migration failed:', result.error)
      break

    case MigrationStatus.Success:
      logger.success('Database migration complete')
      break
  }
}

function prepareReplacements(arrReplacements: string[]): IReplacements {
  if (!Array.isArray(arrReplacements)) {
    return {}
  }

  const replacements: IReplacements = arrReplacements.reduce(
    (result, replacement) => {
      const parts = replacement.split('=')
      const key = parts.shift()
      const value = parts.join('=')
      if (key) {
        result[key] = value || ''
      }
      return result
    },
    {} as IReplacements
  )

  return replacements
}
