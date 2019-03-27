import { DatabasePublishStatus } from '../constants'

export interface IStatusResult {
  migrations: string[]
  status: DatabasePublishStatus
}
