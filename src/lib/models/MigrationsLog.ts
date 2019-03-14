import Sequelize from 'sequelize'

export interface IMigrationsLog {
  logId: number
  timestamp: Date
  status: number
  message: string
  migration?: string
  details?: string
}

export default function(connection: Sequelize.Sequelize): Sequelize.Model<{}, IMigrationsLog> {
  return connection.define<{}, IMigrationsLog>(
    'migration',
    {
      logId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        allowNull: false,
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },
      /* tslint:disable-next-line:object-literal-sort-keys */
      status: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      message: {
        allowNull: false,
        type: Sequelize.STRING(1000)
      },
      migration: {
        allowNull: true,
        type: Sequelize.STRING(1000)
      },
      details: {
        allowNull: true,
        type: Sequelize.STRING(2000)
      }
    },
    {
      tableName: '__MigrationsLog'
    }
  )
}
