declare module 'folder-hash' {
  interface IHashElementOptions {
    algo?: string
    encoding?: string
    excludes?: string[]
    match?: {
      basename?: boolean
      path?: boolean
    }
  }
  type HashElementCallbackFn = (err?: Error, hash?: string) => void

  function hashElement(filename: string, folderPath: string, options?: IHashElementOptions, callback?: HashElementCallbackFn): Promise<string>
  function hashElement(path: string, options?: IHashElementOptions, callback?: HashElementCallbackFn): Promise<string>
}
