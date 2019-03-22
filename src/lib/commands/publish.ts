import { ProviderType } from '../constants'
import { Publisher } from '../dialects/abstract/Publisher'
import { MsSqlPublisher } from '../dialects/mssql/MsSqlPublisher'
import { PostgresPublisher } from '../dialects/postgres/PostgresPublisher'
import { IPublishOptions } from '../interfaces/IPublishOptions'
import { MigrationError } from '../MigrationError'

export function createPublisher(options: IPublishOptions): Publisher {
  switch (options.database.provider) {
    case ProviderType.MsSql:
      return new MsSqlPublisher(options)
    case ProviderType.Postgres:
      return new PostgresPublisher(options)
    default:
      throw new MigrationError(`Publisher not implemented for provider ${options.database.provider}`)
  }
}
