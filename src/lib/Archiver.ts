import archiver from 'archiver'
import EventEmitter from 'events'
import fs from 'fs-extra'
import upath from 'upath'
import { ArchiverEvents } from './constants'
import { getConfigurationPath, loadConfiguration } from './DriftConfig'
import { IArchiveOptions } from './interfaces/IArchiveOptions'
import { IArchiveResult } from './interfaces/IArchiveResult'

/**
 * Class for generating a compressed zip archive of a Drift project
 */
export class Archiver extends EventEmitter {
  private options: IArchiveOptions

  constructor(options: IArchiveOptions) {
    super()
    this.options = options
  }

  /**
   * Begins creating the zip archive of the project. This method will emit events for ```warning```,
   * ```error``` and ```complete``` to report back progess.
   * @returns Results object for the archive on success
   */
  public start(): Promise<IArchiveResult> {
    return new Promise<IArchiveResult>(async (resolve, reject) => {
      const configPath = getConfigurationPath(this.options.config)
      const config = await loadConfiguration(configPath)

      // Initialize the zip archive
      const zip = archiver('zip')
      zip.on('warning', this.onWarning)
      zip.on('error', (err) => {
        this.onError(err)
        reject(err)
      })

      const outputFile = upath.resolve(this.options.out)
      const output = fs.createWriteStream(outputFile, { flags: 'w' })
      output.on('close', () => {
        const result: IArchiveResult = {
          fileName: outputFile,
          size: zip.pointer()
        }
        this.onComplete(result)
        resolve(result)
      })

      zip.pipe(output)

      zip.directory(config.rootDir, upath.relative(upath.dirname(configPath), config.rootDir))
      zip.file(this.options.config, { name: upath.basename(this.options.config) })

      zip.finalize()
    })
  }

  private onComplete(result: IArchiveResult) {
    this.emit(ArchiverEvents.Complete, result)
  }

  private onError(err: Error) {
    this.emit(ArchiverEvents.Error, err)
  }

  private onWarning(err: Error) {
    this.emit(ArchiverEvents.Warning, err)
  }
}
