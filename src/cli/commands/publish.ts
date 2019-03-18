import { IPublishOptions, publish } from '../../lib/commands/publish'
import { MigrationStatus } from '../../lib/constants'
import { logger } from '../../lib/utils/logging'
import { IReplacements } from '../../lib/utils/migration'

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
        host: argv.host,
        instanceName: argv.instanceName,
        logging: argv.verbose,
        password: argv.password,
        port: argv.port,
        provider: argv.provider,
        username: argv.user
      },
      force: argv.force,
      logger,
      replacements: prepareReplacements(argv.replacements)
    }

    const result = await publish(publishOptions)

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
    process.exit(result.status === MigrationStatus.Failed ? 2 : 0)
  } catch (err) {
    logger.error('Migration failed', err)
    process.exit(2)
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
