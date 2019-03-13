import handlebars, { TemplateDelegate } from 'handlebars'
import path from 'path'
import { loadConfiguration, writeConfiguration } from '../DriftConfig'
import { readFile, writeFile } from '../utils/fileHelper'

export async function createMigration(name: string, configFilePath: string): Promise<string> {
  const config = await loadConfiguration(configFilePath)
  const scriptName = `${Date.now()}-${name}`
  const templatePath = path.resolve(__dirname, `../../../assets/templates/script.${config.typescript ? 'ts' : 'js'}.handlebars`)
  const templateContext = { ScriptName: scriptName, ScriptType: 'Migration' }
  const filePath = path.join(config.rootDir, `/migrations/${scriptName}.${config.typescript ? 'ts' : 'js'}`)
  if (!(await generateScript(templatePath, filePath, templateContext))) {
    throw new Error(`Unable to create migration`)
  }
  config.scripts.migrations.push(scriptName)
  await writeConfiguration(config, configFilePath)
  return filePath
}

export async function createPostDeploy(name: string, configFilePath: string) {
  const config = await loadConfiguration(configFilePath)
  const scriptName = `${Date.now()}-${name}`
  const templatePath = path.resolve(__dirname, `../../../assets/templates/script.${config.typescript ? 'ts' : 'js'}.handlebars`)
  const templateContext = { ScriptName: scriptName, ScriptType: 'PostDeploy' }
  const filePath = path.join(config.rootDir, `/postDeploy/${scriptName}.${config.typescript ? 'ts' : 'js'}`)
  if (!(await generateScript(templatePath, filePath, templateContext))) {
    throw new Error(`Unable to create migration`)
  }
  config.scripts.postDeploy.push(scriptName)
  await writeConfiguration(config, configFilePath)
  return filePath
}

export async function createProcedure(name: string, configFilePath: string): Promise<string[]> {
  const config = await loadConfiguration(configFilePath)
  const nameObj = parseName(name)
  const results: string[] = []
  for (const provider of config.providers) {
    const templatePath = path.resolve(__dirname, `../../../assets/templates/${provider}/procedure.handlebars`)
    const destinationPath = path.join(config.rootDir, `/${provider}/procedures/${name}.sql`)
    const context = { ObjectName: nameObj.objectName, SchemaName: nameObj.schemaName }

    if (await generateScript(templatePath, destinationPath, context)) {
      results.push(`${provider}: ${destinationPath}`)
    } else {
      results.push(`${provider}: Procedures are not supported`)
    }
  }
  return results
}

export async function createScalarFunction(name: string, configFilePath: string): Promise<string[]> {
  const config = await loadConfiguration(configFilePath)
  const nameObj = parseName(name)
  const results: string[] = []
  for (const provider of config.providers) {
    const templatePath = path.resolve(__dirname, `../../../assets/templates/${provider}/function-scalar.handlebars`)
    const destinationPath = path.join(config.rootDir, `/${provider}/functions/${name}.sql`)
    const context = { ObjectName: nameObj.objectName, SchemaName: nameObj.schemaName }

    if (await generateScript(templatePath, destinationPath, context)) {
      results.push(`${provider}: ${destinationPath}`)
    } else {
      results.push(`${provider}: Scalar functions are not supported`)
    }
  }
  return results
}

export async function createTableFunction(name: string, configFilePath: string): Promise<string[]> {
  const config = await loadConfiguration(configFilePath)
  const nameObj = parseName(name)
  const results: string[] = []
  for (const provider of config.providers) {
    const templatePath = path.resolve(__dirname, `../../../assets/templates/${provider}/function-table.handlebars`)
    const destinationPath = path.join(config.rootDir, `/${provider}/functions/${name}.sql`)
    const context = { ObjectName: nameObj.objectName, SchemaName: nameObj.schemaName }

    if (await generateScript(templatePath, destinationPath, context)) {
      results.push(`${provider}: ${destinationPath}`)
    } else {
      results.push(`${provider}: Table functions are not supported`)
    }
  }
  return results
}

export async function createView(name: string, configFilePath: string): Promise<string[]> {
  const config = await loadConfiguration(configFilePath)
  const nameObj = parseName(name)
  const results: string[] = []
  for (const provider of config.providers) {
    const templatePath = path.resolve(__dirname, `../../../assets/templates/${provider}/view.handlebars`)
    const destinationPath = path.join(config.rootDir, `/${provider}/views/${name}.sql`)
    const context = { ObjectName: nameObj.objectName, SchemaName: nameObj.schemaName }

    if (await generateScript(templatePath, destinationPath, context)) {
      results.push(`${provider}: ${destinationPath}`)
    } else {
      results.push(`${provider}: Views are not supported`)
    }
  }
  return results
}

async function generateScript(templatePath: string, destinationPath: string, context: any): Promise<boolean> {
  let templateFn: TemplateDelegate<any> | undefined
  try {
    console.log(templatePath)
    templateFn = await loadTemplate(templatePath)
  } catch (err) {
    return false
  }
  if (!templateFn) {
    return false
  }
  const content = templateFn(context)
  await writeFile(destinationPath, content)
  return true
}

async function loadTemplate(templatePath: string): Promise<TemplateDelegate<any>> {
  const template = await readFile(templatePath)
  const fn = handlebars.compile(template)
  return fn
}

function parseName(name: string): { objectName: string; schemaName?: string } {
  const parts = name.split('.')
  const schemaName = parts.length > 1 ? parts.shift() : undefined
  const objectName = parts.join('.')
  return {
    objectName,
    schemaName
  }
}
