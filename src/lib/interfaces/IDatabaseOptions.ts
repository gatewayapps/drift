import { ProviderType } from '../constants'

export interface IDatabaseOptions {
  provider: ProviderType
  host?: string
  instanceName?: string
  databaseName: string
  username?: string
  password?: string
  port?: number
  logging?: boolean
}
