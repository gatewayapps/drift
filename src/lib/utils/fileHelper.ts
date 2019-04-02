import fs from 'fs-extra'
import upath from 'upath'

export function exists(filePath: string) {
  return fs.existsSync(filePath)
}

export function moveDirOrFile(src: string, dest: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!fs.existsSync(src)) {
      return resolve()
    }

    fs.move(src, dest, { overwrite: true }, (err) => {
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
    const fullDir = upath.resolve(dir)

    if (!fs.existsSync(fullDir)) {
      return resolve(filesList)
    }

    fs.readdir(fullDir, async (err, files) => {
      if (err) {
        return reject(err)
      }

      try {
        for (const file of files) {
          const filePath = upath.join(fullDir, file)
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
    fs.ensureDir(upath.dirname(filePath), (dirErr) => {
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
