import { DataSource, DataSourceOptions } from 'typeorm';

import { TypeormNamingStrategy } from '@api/lib/typeorm-naming-strategy';

export const getEnvironmentVariable = (variableName: string) => {
  return process.env[variableName];
};

const isDevelopment = getEnvironmentVariable('NODE_ENV') === 'development';

const developmentOptions = {
  logger: 'advanced-console',
  logging: 'all',

  ssl: false,
  extra: {},
};

/**
 * This config is using inside docker image
 * */
export const options = Object.assign(
  {
    type: 'postgres',
    host: getEnvironmentVariable('DB_HOST'),
    port: Number(getEnvironmentVariable('DB_PORT')),
    username: getEnvironmentVariable('DB_USERNAME'),
    password: getEnvironmentVariable('DB_PASSWORD'),
    database: getEnvironmentVariable('DB_NAME'),
    namingStrategy: new TypeormNamingStrategy(),
    migrationsTableName: 'typeorm_migrations',
    migrations: ['./migrations/*.ts'],
    dropSchema: false,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
  isDevelopment ? developmentOptions : {}
) as DataSourceOptions;

export const AppDataSource = new DataSource(options);
