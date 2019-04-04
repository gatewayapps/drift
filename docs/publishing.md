# Publishing a Drift Project
The publish process is the main feature of Drift. 

## Table of Contents

- [Publish Process Overview](#publish-process-overview)
  - [Object Dependencies](#object-dependencies)
  - [Publish Failures](#publish-failures)
- [Publishing via CLI](#publish-via-cli)
- [Publishing via Node](#publish-via-node)
- [Advanced: Publishing Object Dependencies](#advanced-publishing-object-dependencies)

## Publish Process Overview
The publish process perform the following steps agains the database

1. Creates the database if it does not exist on the server
2. Ensures the ```__Migrations``` and ```__MigrationsLog``` tables are in the target database
3. Runs the ```config.scrips.migrations``` on the database. Migrations that run successfully create a record in the ```__Migrations``` table
4. Runs all the ```.sql``` files located in ```{config.rootDir}/{provider}/functions```, ```{config.rootDir}/{provider}/procedures```, and ```{config.rootDir}/{provider}/views``` on the database
5. Runs the ```config.scripts.postDeploy``` scripts on the database
6. Logs migrations status to the ```__MigrationsLog``` table

### Object Dependencies
When running the functions, procedures, and views scripts during the publish, it attempts to resolve dependencies between the scripts and order them to run so dependent objects are created first. To make this possible, it relies on conventions in the scripts. Each script in the ```functions```, ```procedures``` or ```views``` folder should begin with one of the following (case insensitive):

```
CREATE PROCEDURE <ObjectName>

CREATE FUNCTION <ObjectName>

CREATE VIEW <ObjectName>

where <ObjectName> is one of the following
  objectName
  schema.objectName
  [objectName]
  [schema].[objectName]
  "objectName"
  "public"."objectName"
```

These patterns are used to determine the object names that are being created. These object names are then check in other scripts to determine the dependencies between the objects being created. The name checking is case insensitive and while not required, it is preferred that all object names be wrapped in square brackets [] (mssql) or "" (postgres).

### Publish Failures
Steps 3 thru 5, are performed inside a database transaction. Should one of the steps encouter an error, the transaction is rolled back reverting the database to the previous state. Details on the cause of the publish error are written to the ```__MigrationsLog``` table including the script that errored and full javascript error as a JSON string.

## Publishing via CLI
From the CLI you will run `publish` command. The command will report progress and errors to the console.

```
drift publish <provider> [options]

Options:

  -c, --config             Configuration file to use (default ./drift.yml)
  -h, --host               Address to server hosting the database (default 'localhost')
  --port                   Optional port if the database server is using a port different than the default for the provider
  -i, --instance           Instance name for the database server only used by mssql provider (default 'MSSQLSERVER')
  -d, --database           (required) Name of the database
  --domain                 Domain name for Windows authentication only used by mssql provider
  -u, --user               (required) User for connecting to the database server
  -p, --password           (required) User password
  -v, --verbose            Prints SQL commands being executed to the console
  -r, --replacements       Custom replacements to be merged with the default replacements. Should be in the format `key=value`
                           May be specified multiple times to pass an array of custom replacements
  -f, --force              Forces the migration to publish even if the hash of the migration files matches the last successful execution

Simple Example:

  drift publish mssql -h 127.0.0.1 -d my-test-database -u sa -p SecurePassword

Example with replacements:

  drift publish postgres -d my-test-database -u postgres -p SecurePassword -r SpecialName=Awesome -r AnotherValue=100
```

## Publishing via Node
To use the Node API to publish a database, you will import the `createPublisher` method. This is a factory method that will create a Publisher instance for the provider you are publishing to. The Publisher is an event emitter that will provide events for progress updates, completion and errors. Call the `start()` method on the returned publisher to begin applying the update.

```javascript
import { createPublisher } from '@gatewayapps/drift'

const publishOptions = {
  configFile: './drift.yml',
  database: {
    provider: 'mssql',
    host: 'localhost',
    databaseName: 'my-test-database',
    username: 'sa',
    password: 'my-Secure-Password'
  },
  replacements: {
    SpecialValue: 100
  }
}

const publisher = createPublisher(publishOptions)

publisher.on('progress', (progress) => {
  // handle progress update
})

publisher.on('error', (error, result) => {
  // handle publish error
})

publisher.on('complete', (result) => {
  // handle completion
})

await publisher.start()
```

### Publish Options

- **configFile** - string path to the `drift.yml` file relative to the current working directory
- **database**
  - **provider** - **required** string mssql or postgres
  - **host** - **required** Address to server hosting the database
  - **instanceName** - Instance name for the database server only used by mssql
  - **databaseName** - **required** Name of the database
  - **domain** - Domain name for Windows authentication only used by mssql provider
  - **username** - **required** User for connecting to the database server
  - **password** - **required** User password
  - **port** - Optional port if the database server is using a port different than the default for the provider
  - **logging** - Prints SQL commands being executed to the console
- **force** - boolean to instruct Drift to publish to the database even if it is up to date
- **replacements** - map of key value pairs of custom replacement values to use in the publish

### Publisher

#### Events

- `complete` - emitted when the publish has successfully completed
  - **result**: [PublishResult](#publish-result)
- `error` - emitted when the publish terminates with an error
  - **error**: Error
  - **result**: [PublishResult](#publish-result)
- `progress` - emitted throughout the publish to report progress/status changes
  - **progress**: [PublishProgress](#publish-progress)

#### Methods

- `start(): Promise<PublishResult>` - Starts the publish process. This method can be awaited and does not resolve until the publish has either completed or errored.

### Publish Result

- **error** - error object if the result was not successful
- **migrationLog** - record from `__MigrationsLog` table for this publish
- **status** - numeric status result
  - 0 = Success
  - 1 = Already Applied
  - 2 = Failed
- **statusDesc** - string description of the status code

### Publish Progress

- **task** - Name of current publish task that is being executed
- **status** - Status message for the current task
- **complete** - Indicates if the task has been completed 
- **completedSteps** - The number of steps for the current task that have been completed
- **totalSteps** - The total number of steps to complete the current task
