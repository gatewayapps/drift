import { Archiver } from '../Archiver'
import { IArchiveOptions } from '../interfaces/IArchiveOptions'

/**
 * Creates an instance of an Archiver class with the provided options
 * @param options Options to be provided to the archiver
 * @returns An instance of an archiver
 */
export function createArchiver(options: IArchiveOptions): Archiver {
  return new Archiver(options)
}
