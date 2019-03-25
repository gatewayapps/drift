import { IPublishOptions } from '../interfaces/IPublishOptions'
import { IReplacements } from '../interfaces/IReplacements'

export function buildReplacements(options: IPublishOptions): IReplacements {
  const replacements = {
    DatabaseName: options.database.databaseName,
    Provider: options.database.provider,
    PublisherUsername: options.database.username
  }
  if (options.replacements) {
    Object.assign(replacements, options.replacements)
  }
  return replacements
}
