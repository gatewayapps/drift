import { DbContext } from '../../DbContext'
import { IDatabaseObject } from '../../interfaces/IDatabaseObject'
import { Publisher } from '../abstract/Publisher'

export class MsSqlPublisher extends Publisher {
  protected async preApplyDatabaseObject(dbContext: DbContext, databaseObject: IDatabaseObject): Promise<void> {
    const fullQualifiedName = `[${databaseObject.schemaName}].[${databaseObject.objectName}]`
    const [result] = await dbContext.runRawQuery(`SELECT OBJECT_ID('${fullQualifiedName}') AS objectId`)
    if (Array.isArray(result) && result.length > 0 && result[0].objectId !== null) {
      databaseObject.text = databaseObject.text.replace(/^CREATE/i, 'ALTER')
    }
  }
}
