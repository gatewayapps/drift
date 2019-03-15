import Sequelize from 'sequelize'

export interface IMigration {
  migration: string
  timestamp?: Date
}

export type MigrationInstance = Sequelize.Instance<IMigration> & IMigration

export default function(connection: Sequelize.Sequelize): Sequelize.Model<MigrationInstance, IMigration> {
  return connection.define<MigrationInstance, IMigration>(
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
