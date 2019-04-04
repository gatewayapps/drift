# Quick Start Guide for PostgreSQL

## Table of Contents

- [Initialize Project](#initialize-project)
- [Creating Your First Migration](#creating-your-first-migration)
- [Creating Objects (Functions, Procedures or Views)](#creating-objects)
- [Publishing](#publishing)

## Initialize Project
The first thing you will want to do is create a `drift.yml` configuration file for your project. This is really simple all you need to do is run the following command.

```bash
$ drift init
```

This will create the `drift.yml` file in the current directory and configure it to use `postgres` and store your script and object files in the `./.drift` folder. The basic folder structure that will be used by Drift in your project would look something like this.

```
my-project
├── .drift
│   ├── migrations
│   ├── postgres
│   │   ├── functions
│   │   ├── procedures
│   │   └── views
│   └── postDeploy
└── drift.yml
```

For a more in-depth look at the options when creating a new project, take a look at the [Creating a Project](/docs/creating-a-project.md) Guide.

## Creating Your First Migration
Now it is time to create your first migration script. Migrations are used to define the structure of your database for things like schemas, tables and indexes. To create a new migration script you just need to run Drift's create migration command.

```bash
$ drift create migration my-first-migration
Created File: postgres: C:/repos/my-project/.drift/migrations/1552675076196-my-first-migration.js
```

Drift migration scripts are written in Javascript. This command will create a template script file for you. For an in-depth look at creating migrations, take a look at the [Writing Migration and Post Deployment Scripts](/docs/writing-migration-and-post-deployment-scripts.md) Guide.

Below is an example of the migration script that would create a simple *Person* table.

```javascript
/******************************************************************************
 * Migration: 1552675076196-my-first-migration
 *****************************************************************************/
async function exec(context, Sequelize, provider, replacements) {
  await context.createTable('Person', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      allowNull: false,
      type: Sequelize.STRING(100)
    },
    lastName: {
      allowNull: false,
      type: Sequelize.STRING(100)
    }
  })
}

exports.exec = exec
```

## Creating Objects
In Drift, database objects for Functions, Procedures and Views are written in SQL files. Additionally, a separate SQL file is created for each database provider used in a project. An object SQL file should contain the command to create a single object.

For PostgreSQL, you should write the commands using `CREATE OR REPLACE`.

Drift provides several commands that will generate placeholder object SQL files for you.

```bash
# Create a scalar function
$ drift create function my-cool-scalar-function
Created file: postgres: E:/repos/drift-test/.drift/postgres/functions/my-cool-scalar-function.sql

# Create a table valued function
$ drift create function my-table-function --table
Created file: postgres: E:/repos/drift-test/.drift/postgres/functions/my-table-function.sql

# Create a stored procedure
$ drift create procedure my-awesome-procedure
Created file: postgres: E:/repos/drift-test/.drift/postgres/procedures/my-awesome-procedure.sql

# Create a view
$ drift create view my-nifty-view
Created file: postgres: E:/repos/drift-test/.drift/postgres/views/my-nifty-view.sql
```

For an in-depth look at creating objects, take a look at the [Creating Functions, Procedures, and Views](/docs/creating-functions-procedures-and-views.md) Guide.

## Publishing
Drift provides a publish command that will apply the scripts and objects you have created to a database server. If the database does not exist, the user will need to have permissions to create the database. Otherwise, the user only needs be the `db_owner` of the database.

```bash
$ drift publish postgres -h localhost -d MyProjectDb -u my-user -p my-super-secure-password
```

For an overview of publishing process and an advanced look at the publishing options, see the [Publishing](/docs/publishing.md) Guide.
