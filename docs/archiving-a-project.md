# Archiving a Drift Project
Creating a archive of your Drift project is useful build tool if you want to ship the drift scripts with your project to support automatic publishing by your project. The archive command will bundle all the Drift files into a single zip archive.

## Archiving via CLI

```
drift archive [out] <options>

Options:

  -c, --config    Path to the drift configuration file relative to the current working directory (defaults './drift.yml')
  -o, --out       The path where the archived zip file will be written (default './drift.zip')

```

## Archiving via Node

```javascript

import { createArchiver } from '@gatewayapps/drift'

const archiveOptions = {
  config: './drift.yml',
  out: './drift.zip'
}

const archiver = createArchiver(archiveOptions)

archiver.on('warning', (error) => {
  // handle warning
})

archiver.on('error', (error) => {
  // handle error
})

archiver.on('complete', (result) => {
  // handle completion
})

await archiver.start()
```

### Archive Options

### Archiver

- **config**: Path to the drift configuration file relative to the current working directory
- **out**: The path where the archived zip file will be written

#### Events

- `complete` - emitted when the archive has finished successfully
  - **result**: [ArchiveResult](#archive-result)
- `error` - emitted when an error causing the archive to fail is encountered
  - **error**: Error
- `warning` - emitted when a error that does not cause the archive to fail is encountered
  - **error**: Error

#### Methods

- `start(): Promise<ArchiveResult>` - Begin creating the zip file. This method can be awaited and does not result until the archive has either completed or errored.

### Archive Result

- **fileName** - full path to the archive file that was created
- **size** - size of the archive file in bytes
