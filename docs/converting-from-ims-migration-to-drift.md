# Converting from IMS Migration to Drift
Use the `convert` command to take an existing [ims-migration](https://github.com/gatewayapps/ims-migration) project and turn it into a Drift project.

```
drift convert [options]

Options:

  -d, --dir   Root directory where Drift should store its scripts and SQL files (default './.drift')
  -i, --in    Path to the ims-migration configuration file (default './migration.yml')
  -o, --out   Path where the new drift configuration file should be created (default './drift.yml')
```

This command will do the following:

1. Initialize a new Drift project
2. Convert migration and post deployment SQL files from ims-migration in corresponding Drift Javascript files
3. Copy the functions, procedures and views script and remove the `IF EXISTS ... DROP` checks leaving on the `CREATE` commands
4. Move the old the ims-migration files into a backup folder at './ims-migration.backup.{timestamp}'
