# Creating Functions, Procedures and Views
In Drift, database object (functions, procedures and views) are created as separate SQL script files for each database provider. This is primarily because there are differences between the way these things are created in different providers and the providers have different built-in function that you may want to use.

These SQL scripts are applied each time you publish a database to that provider.

## Table of Contents

- [Creating Objects](#creating-objects)
  - [Using Schemas](#using-schemas)
- [Writing Objects](#writing-objects)
  - [Best Practices](#best-practices)

## Creating Objects
Object scripts are created using the `create {objectType}` command. The command will create a template script to create the object.

```bash
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

### Using Schemas
Microsoft SQL Server and PostgreSQL support placing objects into schemas in the database. You can also do this with Drift by appending the schema name to the object name separated by a period when running the create commands. Schemas are actually always there for these providers Drift just defaults the schema to `dbo` in Microsoft SQL Server and `public` in PostgreSQL when it .

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

## Writing Objects
Writing the objects is basically the same as if you were creating the objects in the editor for that database provider. There are a few recommended best practices for writing object scripts.

### Best Practices
- Each SQL script file should contain the create statement for a single object
- **Microsoft SQL Server**
  - Write the statement as a `CREATE`. The Drift publisher will translate it to an `ALTER` statement if the object already exists
- **PostgreSQL**
  - Write the statement as a `CREATE OR REPLACE`
