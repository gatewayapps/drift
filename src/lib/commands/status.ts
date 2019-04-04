import { IStatusOptions } from '../interfaces/IStatusOptions'
import { IStatusResult } from '../interfaces/IStatusResult'
import { createPublisher } from './publish'

export async function checkPublishStatus(options: IStatusOptions): Promise<IStatusResult> {
  const publisher = createPublisher(options)
  const result = await publisher.checkStatus()
  return result
}
