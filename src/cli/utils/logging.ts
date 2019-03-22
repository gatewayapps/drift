import colors from 'colors'

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

function getTimestamp(): string {
  return new Date().toISOString()
}
