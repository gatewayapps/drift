import { IDatabaseOptions } from './IDatabaseOptions'
import { IReplacements } from './IReplacements'

export interface IPublishOptions {
  configFile?: string
  database: IDatabaseOptions
  force?: boolean
  replacements?: IReplacements
}
