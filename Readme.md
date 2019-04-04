# Drift
Drift is a development tool for building and publishing relational databases. With Drift, you can define you data structure and logic, migrate your data structure as it changes over time, and publish changes to multiple database providers. Drift leverages [Sequelize](http://docs.sequelizejs.com) to provide support for publishing to multiple database providers.

## Table of Contents
- [Supported Databases](#supported-databases)
- [Installation](#installation)
- [Documentation](#documentation)

## Supported Databases
- Microsoft SQL Server
- Postgres
- MySQL (Coming Soon!!!)
- SQLite (Coming Soon!!!)

## Installation

```bash
$ npm install --save-dev @gatewayapps/drift

# And one (or more) of the following
$ npm install --save tedious # Microsoft SQL Server
$ npm install --save pg pg-hstore # Postgres
```

## Documentation

- [Quick Start for Microsoft SQL Server](/docs/quick-start/mssql.md)
- [Quick Start for PostgreSQL](/docs/quick-start/postgres.md)
- [Guides](/docs/index.md)
