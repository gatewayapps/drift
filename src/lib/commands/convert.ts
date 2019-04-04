import fs from 'fs-extra'
import { TemplateDelegate } from 'handlebars'
import yaml from 'js-yaml'
import upath from 'upath'
import { ProviderType } from '../constants'
import { initializeConfig, writeConfiguration } from '../DriftConfig'
import { IConvertOptions } from '../interfaces/IConvertOptions'
import { moveDirOrFile, readDirRecursive, readFile, writeFile } from '../utils/fileHelper'
import { loadTemplate } from '../utils/templateHelper'

interface IImsMigrationConfig {
  paths: {
    functions: string
    postDeploy: string
    preDeploy: string
    procedures: string
    migrations: string
    views: string
  }
  preDeploy: string[]
  postDeploy: string[]
  migrations: string[]
}

export async function convert(options: IConvertOptions): Promise<string> {
  // 1. Read the 'in' file
  const imsMigrationConfigFilename = upath.resolve(process.cwd(), options.in)
  const imsMigrationConfigPath = upath.dirname(imsMigrationConfigFilename)
  const imsMigrationConfig = await loadImsMigrationConfig(imsMigrationConfigFilename)

  // 2. Initialize the new drift configuration
  const driftConfigFilename = upath.resolve(process.cwd(), options.out)
  const driftConfig = await initializeConfig(options.dir, [ProviderType.MsSql])

  // 3. Create temporary directory for drift files
  const tempDriftDir = createTempDir()

  const templatePath = upath.resolve(__dirname, `../../../assets/templates/script.js.handlebars`)
  const templateFn = await loadTemplate(templatePath)

  // 4. Convert the migrations
  for (const migration of imsMigrationConfig.migrations) {
    const inputFile = upath.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.migrations, `${migration}.sql`)
    const outputFile = upath.resolve(tempDriftDir, 'migrations', `${migration}.js`)
    await convertScript(inputFile, outputFile, templateFn, 'Migration')
    driftConfig.scripts.migrations.push(migration)
  }

  // 5. Convert the post deploy
  for (const postDeploy of imsMigrationConfig.postDeploy) {
    const inputFile = upath.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.postDeploy, `${postDeploy}.sql`)
    const outputFile = upath.resolve(tempDriftDir, 'postDeploy', `${postDeploy}.js`)
    await convertScript(inputFile, outputFile, templateFn, 'Post Deploy')
    driftConfig.scripts.postDeploy.push(postDeploy)
  }

  // 6. Convert the functions
  const baseFuncDir = upath.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.functions)
  const functionPaths = await readDirRecursive(baseFuncDir)
  for (const funcFullPath of functionPaths) {
    const relativeFilePath = upath.relative(baseFuncDir, funcFullPath)
    const outputFile = upath.join(tempDriftDir, ProviderType.MsSql, 'functions', relativeFilePath)
    await convertObject(funcFullPath, outputFile)
  }

  // 7. Convert the procedures
  const baseProcedureDir = upath.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.procedures)
  const procedurePaths = await readDirRecursive(baseProcedureDir)
  for (const procFullPath of procedurePaths) {
    const relativeFilePath = upath.relative(baseProcedureDir, procFullPath)
    const outputFile = upath.join(tempDriftDir, ProviderType.MsSql, 'procedures', relativeFilePath)
    await convertObject(procFullPath, outputFile)
  }

  // 8. Convert the views
  const baseViewDir = upath.resolve(imsMigrationConfigPath, imsMigrationConfig.paths.views)
  const viewPaths = await readDirRecursive(baseViewDir)
  for (const viewFullPath of viewPaths) {
    const relativeFilePath = upath.relative(baseViewDir, viewFullPath)
    const outputFile = upath.join(tempDriftDir, ProviderType.MsSql, 'views', relativeFilePath)
    await convertObject(viewFullPath, outputFile)
  }

  // 9. Move the old files and config into a backup directory and rewrite the paths in 'in' file
  await backupImsMigrationFiles(imsMigrationConfig, imsMigrationConfigPath, imsMigrationConfigFilename)

  // 10. Move the drift temp directory to the final path
  await moveDirOrFile(tempDriftDir, upath.resolve(process.cwd(), options.dir))

  // 10. Write the 'out' drift configuration
  await writeConfiguration(driftConfig, driftConfigFilename)
  return driftConfigFilename
}

async function backupImsMigrationFiles(imsMigrationConfig: IImsMigrationConfig, configPath: string, configFileName: string): Promise<void> {
  const imsMigrationBackupDir = upath.resolve(process.cwd(), `ims-migration.backup.${Date.now()}`)
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.functions), upath.join(imsMigrationBackupDir, 'functions'))
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.migrations), upath.join(imsMigrationBackupDir, 'migrations'))
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.postDeploy), upath.join(imsMigrationBackupDir, 'postDeploy'))
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.preDeploy), upath.join(imsMigrationBackupDir, 'preDeploy'))
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.procedures), upath.join(imsMigrationBackupDir, 'procedures'))
  await moveDirOrFile(upath.join(configPath, imsMigrationConfig.paths.views), upath.join(imsMigrationBackupDir, 'views'))
  const newImsMigrationConfig = Object.assign({}, imsMigrationConfig, {
    paths: {
      functions: 'functions',
      migrations: 'migrations',
      postDeploy: 'postDeploy',
      preDeploy: 'preDeploy',
      procedures: 'procedures',
      views: 'views'
    }
  })
  await writeFile(upath.join(imsMigrationBackupDir, upath.basename(configFileName)), yaml.safeDump(newImsMigrationConfig))
  await fs.unlinkSync(configFileName)
}

async function loadImsMigrationConfig(filename: string): Promise<IImsMigrationConfig> {
  const imsMigrationFile = await readFile(filename)
  const imsMigrationConfig = yaml.safeLoad(imsMigrationFile) as IImsMigrationConfig
  return imsMigrationConfig
}

function createTempDir(): string {
  const tempDriftDir = upath.resolve(process.cwd(), '.driftTemp')
  fs.emptyDirSync(tempDriftDir)
  return tempDriftDir
}

async function convertObject(inputFile: string, outputFile: string): Promise<void> {
  const inputText = await readFile(inputFile)
  const batches = splitBatches(inputText).filter((batch) => /^CREATE/i.test(batch))
  await writeFile(outputFile, batches.join('\nGO\n'))
}

async function convertScript(inputFile: string, outputFile: string, templateFn: TemplateDelegate<any>, scriptType: string): Promise<void> {
  const inputText = await readFile(inputFile)
  const batches = splitBatches(inputText)
  const body = batches
    .map(
      (batch) => `
  await context.runRawQuery(\`
${batch}
  \`)
`
    )
    .join('')
  const scriptName = upath.basename(inputFile, upath.extname(inputFile))
  const templateContext = { ScriptName: scriptName, ScriptType: scriptType, body }
  const outputText = templateFn(templateContext)
  await writeFile(outputFile, outputText)
}

function splitBatches(scriptText: string) {
  return scriptText
    .split(/\nGO|go\b/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
}
