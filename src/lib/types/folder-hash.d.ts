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
  interface IHashedFile {
    hash: string
    name: string
  }
  interface IHashedFolder {
    children: IHashedFile[]
    hash: string
    name: string
  }

  function hashElement(path: string, options?: IHashElementOptions, callback?: HashElementCallbackFn): Promise<IHashedFolder>
}
