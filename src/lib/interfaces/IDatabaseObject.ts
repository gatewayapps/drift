import { IObjectName } from './IObjectName'

export interface IDatabaseObject {
  dependencies: IObjectName[]
  filePath: string
  objectName: string
  schemaName: string
  text: string
  type: string
}
