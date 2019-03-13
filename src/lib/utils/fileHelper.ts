import fs from 'fs-extra'
import path from 'path'

export function exists(filePath: string) {
  return fs.existsSync(filePath)
}

export async function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!exists(filePath)) {
      return reject(new Error(`File "${filePath}" does not exist`))
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(data.toString())
      }
    })
  })
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.ensureDir(path.dirname(filePath), (dirErr) => {
      if (dirErr) {
        return reject(dirErr)
      }

      fs.writeFile(filePath, content, (err) => {
        if (err) {
          return reject(err)
        } else {
          return resolve()
        }
      })
    })
  })
}
