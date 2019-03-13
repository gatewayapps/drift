import handlebars, { TemplateDelegate } from 'handlebars'
import path from 'path'
import { IDriftConfig, loadConfiguration, writeConfiguration } from '../DriftConfig'
import { readFile, writeFile } from '../utils/fileHelper'

export async function createMigration(name: string, configFilePath: string) {
  const config = await loadConfiguration(configFilePath)
  const scriptName = `${Date.now()}-${name}`
  const content = await generateScript(scriptName, 'Migration', config)
  const filePath = path.join(config.rootDir, `/migrations/${scriptName}.${config.typescript ? 'ts' : 'js'}`)
  await writeFile(filePath, content)
  config.scripts.migrations.push(scriptName)
  await writeConfiguration(config, configFilePath)
  return filePath
}

export async function createPostDeploy(name: string, configFilePath: string) {
  const config = await loadConfiguration(configFilePath)
  const scriptName = `${Date.now()}-${name}`
  const content = await generateScript(scriptName, 'PostDeploy', config)
  const filePath = path.join(config.rootDir, `/postDeploy/${scriptName}.${config.typescript ? 'ts' : 'js'}`)
  await writeFile(filePath, content)
  config.scripts.postDeploy.push(scriptName)
  await writeConfiguration(config, configFilePath)
  return filePath
}

async function generateScript(scriptName: string, scriptType: string, config: IDriftConfig): Promise<string> {
  const templateFn = await loadTemplate(path.resolve(__dirname, `../../../assets/templates/script.${config.typescript ? 'ts' : 'js'}.handlebars`))
  const content = templateFn({ ScriptName: scriptName, ScriptType: scriptType })
  return content
}

async function loadTemplate(templatePath: string): Promise<TemplateDelegate<any>> {
  const template = await readFile(templatePath)
  const fn = handlebars.compile(template)
  return fn
}
