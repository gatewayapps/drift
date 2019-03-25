import { Sequelize } from 'sequelize'
import { ProviderType } from '../constants'
import { DbContext } from '../DbContext'
import { IReplacements } from './IReplacements'

export interface IScriptModule {
  exec: (context: DbContext, sequelize: typeof Sequelize, provider: ProviderType, replacements: IReplacements) => Promise<void>
}
