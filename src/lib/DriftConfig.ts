export const defaultConfigFileName = 'drift.yml'

export interface IDriftConfig {
  providers: string[]
  rootDir?: string
  scripts: {
    preDeploy: string[]
    postDeploy: string[]
    migrations: string[]
  }
}

const defaultConfig: IDriftConfig = {
  providers: ['mssql'],
  rootDir: '.',
  scripts: {
    migrations: [],
    postDeploy: [],
    preDeploy: []
  }
}

export function initializeConfig(rootDir: string | undefined, providers: string[] | undefined): IDriftConfig {
  return Object.assign(
    {},
    {
      ...defaultConfig,
      providers: providers || defaultConfig.providers,
      rootDir: rootDir || defaultConfig.rootDir
    }
  )
}
