import Sequelize from 'sequelize'

export interface IMigration {
  migration: string
  timestamp: Date
}

export default function(connection: Sequelize.Sequelize): Sequelize.Model<{}, IMigration> {
  return connection.define<{}, IMigration>(
    'migration',
    {
      migration: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(1000)
      },
      timestamp: {
        allowNull: false,
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      }
    },
    {
      tableName: '__Migrations'
    }
  )
}
