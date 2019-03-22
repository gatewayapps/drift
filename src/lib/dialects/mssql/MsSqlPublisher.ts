import { DbContext } from '../../DbContext'
import { IDatabaseObject } from '../../interfaces/IDatabaseObject'
import { Publisher } from '../abstract/Publisher'

export class MsSqlPublisher extends Publisher {
  protected async preApplyDatabaseObject(dbContext: DbContext, databaseObject: IDatabaseObject): Promise<void> {
    let createCmd = ''
    const fullQualifiedName = `[${databaseObject.schemaName}].[${databaseObject.objectName}]`
    switch (databaseObject.type.toUpperCase()) {
      case 'PROCEDURE':
        createCmd = `CREATE PROCEDURE ${fullQualifiedName} AS SET NOCOUNT ON;`
        break
      case 'FUNCTION':
        createCmd = `CREATE FUNCTION ${fullQualifiedName}() RETURNS INT AS BEGIN RETURN 1 END;`
        break
      case 'VIEW':
        createCmd = `CREATE VIEW ${fullQualifiedName} AS SELECT 1 AS Val;`
        break
    }
    if (!createCmd) {
      return
    }
    const ensureObjectCmd = `
      IF OBJECT_ID('${fullQualifiedName}') IS NULL
      BEGIN
        EXECUTE('${createCmd}');
      END
    `
    await dbContext.runRawQuery(ensureObjectCmd)
  }
}
