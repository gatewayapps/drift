import handlebars from 'handlebars'
import path from 'path'
import { Providers, ProviderType } from '../constants'
import { IDatabaseObject } from '../interfaces/IDatabaseObject'
import { IDriftConfig } from '../interfaces/IDriftConfig'
import { IObjectName } from '../interfaces/IObjectName'
import { IReplacements } from '../interfaces/IReplacements'
import { readDirRecursive, readFile } from './fileHelper'

const CREATEABLE_NAME_PATTERN = /(FUNCTION|PROCEDURE|VIEW)\s+(\[.+\]|".+"|[\w.]+\b)/

export async function loadDatabaseObjects(config: IDriftConfig, provider: ProviderType, replacements: IReplacements): Promise<IDatabaseObject[]> {
  const objectFiles = await readDirRecursive(path.join(config.rootDir, provider))
  const databaseObjects = await Promise.all(
    objectFiles.map(
      async (filePath): Promise<IDatabaseObject> => {
        const scriptText = await readFile(filePath)
        let objectName = ''
        let schemaName = ''
        let type = ''

        // Extract creatable objectName from scriptText
        const re = new RegExp(CREATEABLE_NAME_PATTERN, 'i')
        const match = re.exec(scriptText)
        if (match && match.length >= 3) {
          type = match[1].toUpperCase()
          const nameParts = match[2].replace(/["\[\]]/g, '').split('.')
          objectName = nameParts.pop() || ''
          schemaName = nameParts.pop() || Providers[provider].defaultSchema
        }

        const templateFn = handlebars.compile(scriptText)
        const text = templateFn(replacements)
        return { dependencies: [], filePath, objectName, schemaName, text, type }
      }
    )
  )
  return databaseObjects.filter((obj) => obj.objectName)
}

export function resolveDependencies(databaseObjects: IDatabaseObject[], provider: ProviderType): IDatabaseObject[] {
  const objectNames = databaseObjects.map(
    (obj): IObjectName => ({
      objectName: obj.objectName,
      schemaName: obj.schemaName
    })
  )
  const objectsWithDependencies = databaseObjects.map(
    (obj): IDatabaseObject => {
      const dependencies = objectNames.filter((oName) => {
        if (obj.objectName === oName.objectName) {
          return false
        }

        if (oName.schemaName && oName.schemaName.toLowerCase() !== Providers[provider].defaultSchema) {
          return new RegExp(`\\b${oName.schemaName}\\]*\\.\\[*${oName.objectName}\\b`, 'i').test(obj.text)
        } else {
          return new RegExp(`\\b${oName.objectName}\\b`, 'i').test(obj.text)
        }
      })
      return { ...obj, dependencies }
    }
  )

  return sortObjects(objectsWithDependencies)
}

function sortObjects(inputObjects: IDatabaseObject[], orderedScripts: IDatabaseObject[] = []): IDatabaseObject[] {
  if (inputObjects.length === 0) {
    return orderedScripts
  }

  const initialValue = {
    ordered: orderedScripts,
    remaining: [] as IDatabaseObject[]
  }

  const result = inputObjects.reduce((r, obj) => {
    // Compile a list of ordered scripts. Once ALL the dependencies for a script are already in the orderedScripts
    // then the script can be added to the ordered scripts.
    if (allScriptDependenciesInArray(r.ordered, obj.dependencies)) {
      r.ordered.push(obj)
    } else {
      r.remaining.push(obj)
    }
    return r
  }, initialValue)

  return sortObjects(result.remaining, result.ordered)
}

function allScriptDependenciesInArray(array: IDatabaseObject[], dependencies: IObjectName[]) {
  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return true
  }

  return dependencies.every((dep) => array.some((s) => s.schemaName === dep.schemaName && s.objectName === dep.objectName))
}
