# Checking the Status of a Database
Drift provides a means for checking a database to determine if a database is up to date with the current Drift project.

## Checking Status via CLI

```
drift status <provider> [options]

Options:

  -c, --config             Configuration file to use (default ./drift.yml)
  -h, --host               Address to server hosting the database (default 'localhost')
  --port                   Optional port if the database server is using a port different than the default for the provider
  -i, --instance           Instance name for the database server only used by mssql provider (default 'MSSQLSERVER')
  -d, --database           (required) Name of the database
  --domain                 Domain name for Windows authentication only used by mssql provider
  -u, --user               (required) User for connecting to the database server
  -p, --password           (required) User password
  -f, --force              Forces the migration to publish even if the hash of the migration files matches the last successful execution
```

## Checking Status via Node

```javascript
import { checkPublishStatus } from '@gatewayapps/drift'

const statusOptions = {
  configFile: './drift.yml',
  database: {
    provider: 'mssql',
    host: 'localhost',
    databaseName: 'my-test-database',
    username: 'sa',
    password: 'my-Secure-Password'
  }
}

const result = await checkPublishStatus(statusOptions)

// Do something with result
```

### Status Options

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

### Status Result

- **status** - string representing the state of the database one of the following
  - **missingMigrations** - one or more migrations need to be applied see migrations property
  - **signatureMismatch** - all migration have been applied by some of the database objects are out of date
  - **upToDate** - the database is up to date
- **migrations** - array of the names of migrations that have not been applied to the database
