export class MigrationError extends Error {
  public script?: string
  public rootError?: Error

  constructor(message: string, script?: string, rootError?: Error) {
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = 'MigrationError'
    this.message = message
    this.script = script
    this.rootError = rootError
  }
}
