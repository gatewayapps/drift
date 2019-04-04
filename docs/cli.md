# CLI
Drift comes with a command line interface for performing the following actions:

- [init](#init) - Initializes a new Drift project
- [create](#create) - Creates a new migration, post deployment, function, procedure, or view in the project
- [publish](#publish) - Deploys the Drift project to a Database server
- [archive](#archive) - Creates a zip file of the Drift project
- [status](#status) - Tells you if an existing database is up to date with the project 
- [convert](#convert) - Transforms an existing [IMS Migration](https://github.com/gatewayapps/ims-migration) project into a Drift project

## Init
Initializes a new Drift project. Typically, you would run this command in the root directory of your project.

```
drift init [dir] [options]

Options:

  -c, --config       Name of the configuration file to create relative to the current working directory (default './drift.yml')
  -d, --dir          Base directory for script files (default './.drift')
  -p, --provider     List of database providers that can be used with the project (default: 'mssql')
```

### Examples

#### Initialize Default Project

```bash
$ drift init
```

Resulting project structure:

```
├── .drift
│   ├── migrations
│   ├── mssql
│   │   ├── functions
│   │   ├── procedures
│   │   └── views
│   └── postDeploy
└── drift.yml
```

#### Custom Directory and Provider

```bash
$ drift init ./src/database -p postgres
```

Resulting project structure:

```
├── src
│   └──database
│      ├── migrations
│      ├── postDeploy
│      └── postgres
│          ├── functions
│          ├── procedures
│          └── views
└── drift.yml
```

#### Multiple Providers

```bash
$ drift init -p postgres -p mssql
```

Resulting project structure:

```
├── .drift
│   ├── migrations
│   ├── mssql
│   │   ├── functions
│   │   ├── procedures
│   │   └── views
│   ├── postDeploy
│   └── postgres
│       ├── functions
│       ├── procedures
│       └── views
└── drift.yml
```

## Create
Creates a new migration, post deployment, function, procedure, or view in the project

### Basic Usage

```bash
# Creates a migration script
$ drift create migration my-first-migration
Created file: E:/repos/drift-test/.drift/migrations/1554380701490-my-first-migration.js

# Create a post deployment script
$ drift create postDeploy my-first-post-deploy
Created file: E:/repos/drift-test/.drift/postDeploy/1554380701500-my-first-post-deploy.js

# Create a scalar function (for each defined Provider in the project)
$ drift create function my-cool-scalar-function
Created file: mssql: E:/repos/drift-test/.drift/mssql/functions/my-cool-scalar-function.sql
              postgres: E:/repos/drift-test/.drift/postgres/functions/my-cool-scalar-function.sql

# Create a table valued function (for each defined Provider in the project)
$ drift create function my-table-function --table
Created file: mssql: E:/repos/drift-test/.drift/mssql/functions/my-table-function.sql
              postgres: E:/repos/drift-test/.drift/postgres/functions/my-table-function.sql

# Create a stored procedure (for each defined Provider in the project)
$ drift create procedure my-awesome-procedure
Created file: mssql: E:/repos/drift-test/.drift/mssql/procedures/my-awesome-procedure.sql
              postgres: E:/repos/drift-test/.drift/postgres/procedures/my-awesome-procedure.sql

# Create a view (for each defined Provider in the project)
$ drift create view my-nifty-view
Created file: mssql: E:/repos/drift-test/.drift/mssql/views/my-nifty-view.sql
              postgres: E:/repos/drift-test/.drift/postgres/views/my-nifty-view.sql
```

### Schema Support for Objects
Some providers support placing functions, procedures, and views into schemas in the database. You can also do this with drift by appending the schema name when running the create commands.

```bash
# Create a scalar function (for each defined Provider in the project)
$ drift create function sales.my-cool-scalar-function
Created file: mssql: E:/repos/drift-test/.drift/mssql/functions/sales.my-cool-scalar-function.sql
              postgres: E:/repos/drift-test/.drift/postgres/functions/sales.my-cool-scalar-function.sql

# Create a table valued function (for each defined Provider in the project)
$ drift create function sales.my-table-function --table
Created file: mssql: E:/repos/drift-test/.drift/mssql/functions/sales.my-table-function.sql
              postgres: E:/repos/drift-test/.drift/postgres/functions/sales.my-table-function.sql

# Create a stored procedure (for each defined Provider in the project)
$ drift create procedure sales.my-awesome-procedure
Created file: mssql: E:/repos/drift-test/.drift/mssql/procedures/sales.my-awesome-procedure.sql
              postgres: E:/repos/drift-test/.drift/postgres/procedures/sales.my-awesome-procedure.sql

# Create a view (for each defined Provider in the project)
$ drift create view sales.my-nifty-view
Created file: mssql: E:/repos/drift-test/.drift/mssql/views/sales.my-nifty-view.sql
              postgres: E:/repos/drift-test/.drift/postgres/views/sales.my-nifty-view.sql
```

## Publish
Deploys the Drift project to a Database server. If the database does not exist, it will attempt to create the database.

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

### Publish Overview
The publish process perform the following steps agains the database

1. Creates the database if it does not exist on the server
2. Ensures the ```__Migrations``` and ```__MigrationsLog``` tables are in the target database
3. Runs the ```config.scrips.migrations``` on the database. Migrations that run successfully create a record in the ```__Migrations``` table
4. Runs all the ```.sql``` files located in ```{config.rootDir}/{provider}/functions```, ```{config.rootDir}/{provider}/procedures```, and ```{config.rootDir}/{provider}/views``` on the database
5. Runs the ```config.scripts.postDeploy``` scripts on the database
6. Logs migrations status to the ```__MigrationsLog``` table

#### Publish Dependencies
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

#### Publish Failures
Steps 3 thru 5, are performed inside a database transaction. Should one of the steps encouter an error, the transaction is rolled back reverting the database to the previous state. Details on the cause of the publish error are written to the ```__MigrationsLog``` table including the script that errored and full javascript error as a JSON string.

## Archive
Creates a zip file of the Drift project

## Status
Tells you if an existing database is up to date with the project 

## Convert
Transforms an existing [IMS Migration](https://github.com/gatewayapps/ims-migration) project into a Drift project
