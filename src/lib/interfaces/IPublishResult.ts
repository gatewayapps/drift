import { MigrationStatus } from '../constants'
import { IMigrationsLog } from '../models/MigrationsLog'

export interface IPublishResult {
  error?: Error
  migrationsLog?: IMigrationsLog
  status: MigrationStatus
  statusDesc: string
}
