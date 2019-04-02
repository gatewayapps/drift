import handlebars, { TemplateDelegate } from 'handlebars'
import { readFile } from './fileHelper'

export async function loadTemplate(templatePath: string): Promise<TemplateDelegate<any>> {
  const template = await readFile(templatePath)
  const fn = handlebars.compile(template)
  return fn
}
