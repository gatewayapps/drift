import fs from 'fs-extra'

export function exists(filePath: string) {
  return fs.existsSync(filePath)
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
