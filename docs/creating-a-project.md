# Creating a Drift Project
To create a new Drift Project, you will run the `init` command from the CLI typically in the root directory of your project.

## Syntax
```
drift init [dir] [options]

Options:

  -c, --config       Name of the configuration file to create relative to the current working directory (default './drift.yml')
  -d, --dir          Base directory for script files (default './.drift')
  -p, --provider     List of database providers that can be used with the project (default: 'mssql')
```

## Examples

### Initialize Default Project

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

### Custom Directory and Provider

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

### Multiple Providers

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
