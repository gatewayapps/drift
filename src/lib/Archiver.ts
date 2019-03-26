import archiver from 'archiver'
import EventEmitter from 'events'
import fs from 'fs-extra'
import path from 'path'
import { ArchiverEvents } from './constants'
import { getConfigurationPath, loadConfiguration } from './DriftConfig'
import { IArchiveOptions } from './interfaces/IArchiveOptions'
import { IArchiveResult } from './interfaces/IArchiveResult'

export class Archiver extends EventEmitter {
  private options: IArchiveOptions

  constructor(options: IArchiveOptions) {
    super()
    this.options = options
  }

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

      const outputFile = path.resolve(this.options.out)
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

      zip.directory(config.rootDir, path.relative(path.dirname(configPath), config.rootDir))
      zip.file(this.options.config, { name: path.basename(this.options.config) })

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