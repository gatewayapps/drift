import { ProviderType } from '../constants'

export interface IDriftConfig {
  typescript?: boolean
  providers: ProviderType[]
  rootDir: string
  scripts: {
    migrations: string[]
    postDeploy: string[]
  }
}
