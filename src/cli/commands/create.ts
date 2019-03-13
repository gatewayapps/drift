import { Argv } from 'yargs'

export const command = 'create <command>'

export const desc = 'Create a new database script'

export function builder(yargs: Argv) {
  return yargs.commandDir('createCommands')
}

// tslint:disable-next-line:no-empty
export function handler(argv: any) {}
