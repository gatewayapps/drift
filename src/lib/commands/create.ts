import handlebars from 'handlebars'
import path from 'path'
import { IDriftConfig, writeConfiguration } from '../DriftConfig'
import { readFile, writeFile } from '../utils/fileHelper'

export async function createMigration(name: string, config: IDriftConfig) {
  const ts = Date.now()
  const scriptType = config.migrationScriptType === 'ts' ? 'ts' : 'js'
  const template = await readFile(path.resolve(__dirname, `../../../assets/templates/migration.${scriptType}.handlebars`))
  const fn = handlebars.compile(template)
  const scriptName = `${ts}-${name}`
  const filePath = path.join(config.rootDir, `/migrations/${scriptName}.${scriptType}`)
  const content = fn({ ScriptName: scriptName })
  await writeFile(filePath, content)
  config.scripts.migrations.push(scriptName)
  await writeConfiguration(config)
  return filePath
}
