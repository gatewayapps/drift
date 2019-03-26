import { Archiver } from '../Archiver'
import { IArchiveOptions } from '../interfaces/IArchiveOptions'

export function createArchiver(options: IArchiveOptions): Archiver {
  return new Archiver(options)
}
