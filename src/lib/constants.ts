export enum MigrationStatus {
  Success = 0,
  AlreadyApplied = 1,
  Failed = 2
}

export enum ProviderType {
  MsSql = 'mssql',
  Postgres = 'postgres'
}

export interface IProvider {
  defaultSchema: string
  key: string
}

export interface IProvidersMap {
  [key: string]: IProvider
}

export const Providers = {
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
