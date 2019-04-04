export enum MigrationStatus {
  Success = 0,
  AlreadyApplied = 1,
  Failed = 2
}

export enum ProviderType {
  MsSql = 'mssql',
  Postgres = 'postgres'
}

/**
 * @hidden
 */
export interface IProvider {
  defaultSchema: string
  key: string
}

/**
 * @hidden
 */
export interface IProvidersMap {
  [key: string]: IProvider
}

/**
 * Default values for each database provider
 * @hidden
 */
export const Providers: IProvidersMap = {
  [ProviderType.MsSql]: {
    defaultSchema: 'dbo',
    key: ProviderType.MsSql
  },
  [ProviderType.Postgres]: {
    defaultSchema: 'public',
    key: ProviderType.Postgres
  }
}

export enum PublisherEvents {
  Complete = 'complete',
  Error = 'error',
  Progress = 'progress'
}

export enum ArchiverEvents {
  Complete = 'complete',
  Error = 'error',
  Warning = 'warning'
}

export enum DatabasePublishStatus {
  MissingMigrations = 'missingMigrations',
  SignatureMismatch = 'signatureMismatch',
  UpToDate = 'upToDate'
}
