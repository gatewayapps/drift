import { DbContext } from '../../DbContext'
import { IDatabaseObject } from '../../interfaces/IDatabaseObject'
import { IPublishOptions } from '../../interfaces/IPublishOptions'
import { Publisher } from '../abstract/Publisher'

export class MsSqlPublisher extends Publisher {
  protected async preApplyDatabaseObject(dbContext: DbContext, databaseObject: IDatabaseObject): Promise<void> {
    const fullQualifiedName = `[${databaseObject.schemaName}].[${databaseObject.objectName}]`
    const [result] = await dbContext.runRawQuery(`SELECT OBJECT_ID('${fullQualifiedName}') AS objectId`)
    if (Array.isArray(result) && result.length > 0 && result[0].objectId !== null) {
      databaseObject.text = databaseObject.text.replace(/^CREATE/i, 'ALTER')
    }
  }

  protected verifyOptions(options: IPublishOptions): void {
    super.verifyOptions(options)
    if (!options.database.host) {
      throw new Error('options.database.host is required to publish to mssql')
    }

    if (!options.database.username) {
      throw new Error('options.database.username is required to publish to mssql')
    }

    if (!options.database.password) {
      throw new Error('options.database.password is required to publish to mssql')
    }
  }
}
