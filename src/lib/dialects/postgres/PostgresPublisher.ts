import { IPublishOptions } from '../../interfaces/IPublishOptions'
import { Publisher } from '../abstract/Publisher'

export class PostgresPublisher extends Publisher {
  protected verifyOptions(options: IPublishOptions): void {
    super.verifyOptions(options)
    if (!options.database.host) {
      throw new Error('options.database.host is required to publish to mssql')
    }

    if (!options.database.username) {
      throw new Error('options.database.username is required to publish to mssql')
    }

    if (!options.database.password) {
      throw new Error('options.database.password is required to publish to mssql')
    }
  }
}
