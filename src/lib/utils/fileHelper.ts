import fs from 'fs-extra'
import path from 'path'

export function exists(filePath: string) {
  return fs.existsSync(filePath)
}

export function move(src: string, dest: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.move(src, dest, (err) => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}

export function readDirRecursive(dir: string): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const filesList: string[] = []
    const fullDir = path.resolve(dir)
    fs.readdir(fullDir, async (err, files) => {
      if (err) {
        return reject(err)
      }

      try {
        for (const file of files) {
          const filePath = path.join(fullDir, file)
          if (fs.statSync(filePath).isDirectory()) {
            const subDirFiles = await readDirRecursive(filePath)
            filesList.push(...subDirFiles)
          } else {
            filesList.push(filePath)
          }
        }
        return resolve(filesList)
      } catch (err2) {
        return reject(err2)
      }
    })
  })
}

export function readFile(filePath: string): Promise<string> {
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

export function writeFile(filePath: string, content: string): Promise<void> {
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
