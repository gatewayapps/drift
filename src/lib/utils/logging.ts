import colors from 'colors'

export interface ILogger {
  error(message?: any, ...optionalParams: any[]): void
  status(message?: any, ...optionalParams: any[]): void
  success(message?: any, ...optionalParams: any[]): void
}

export const logger = {
  error(message?: any, ...optionalParams: any[]): void {
    console.log(`${colors.red(getTimestamp())}: ${message}`, ...optionalParams)
  },
  status(message?: any, ...optionalParams: any[]): void {
    console.log(`${colors.blue(getTimestamp())}: ${message}`, ...optionalParams)
  },
  success(message?: any, ...optionalParams: any[]): void {
    console.log(`${colors.green(getTimestamp())}: ${message}`, ...optionalParams)
  }
}

/* tslint:disable:no-empty */
export const noLogger = {
  error(message?: any, ...optionalParams: any[]): void {},
  status(message?: any, ...optionalParams: any[]): void {},
  success(message?: any, ...optionalParams: any[]): void {}
}
/* tslint:enable:no-empty */

function getTimestamp() {
  return new Date().toISOString()
}
