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
drift init [dir] <options>

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

## Publish
Deploys the Drift project to a Database server

## Archive
Creates a zip file of the Drift project

## Status
Tells you if an existing database is up to date with the project 

## Convert
Transforms an existing [IMS Migration](https://github.com/gatewayapps/ims-migration) project into a Drift project
