import colors from 'colors'
import { format } from 'date-fns'

export const logger = {
  error(message?: any, ...optionalParams: any[]): void {
    console.log(`[${colors.red(getTimestamp())}]: ${message}`, ...optionalParams)
  },
  status(message?: any, ...optionalParams: any[]): void {
    console.log(`[${colors.blue(getTimestamp())}]: ${message}`, ...optionalParams)
  },
  success(message?: any, ...optionalParams: any[]): void {
    console.log(`[${colors.green(getTimestamp())}]: ${message}`, ...optionalParams)
  },
  warning(message?: any, ...optionalParams: any[]): void {
    console.log(`[${colors.yellow(getTimestamp())}]: ${message}`, ...optionalParams)
  }
}

export function getTimestamp(): string {
  return format(new Date(), 'hh:mm:ss A')
}
