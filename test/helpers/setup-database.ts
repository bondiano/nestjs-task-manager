import * as glob from 'fast-glob';
import path from 'node:path';
import { DataType, IBackup, newDb } from 'pg-mem';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  runSeeders,
  SeederConstructor,
  setDataSource,
} from 'typeorm-extension';
import { v4 } from 'uuid';

import { TypeormNamingStrategy } from '@api/lib/typeorm-naming-strategy';

interface ITypeORMSetupOptions {
  seeds?: Array<SeederConstructor>;
  entities?: Array<unknown>;
}

/* eslint-disable unicorn/prefer-module */

export const loadEntities = () => {
  const featuresPath = path.resolve(__dirname, '../../src/features');

  const paths = glob.sync('**/*.entity{.ts,.js}', {
    cwd: featuresPath,
  });

  return paths
    .map((_path) => require(path.resolve(featuresPath, _path)))
    .flatMap((module) => {
      return Object.values(module);
    });
};

/* eslint-enable unicorn/prefer-module */

export interface IDatabase {
  dataSource: DataSource;
  backup: IBackup;
}

export const buildDataSource = async ({
  seeds,
  entities,
  ...options
}: ITypeORMSetupOptions = {}): Promise<IDatabase> => {
  const database = newDb({
    // 👉 Recommended when using Typeorm .synchronize(), which creates foreign keys but not indices !
    autoCreateForeignKeyIndices: true,
  });

  database.public.registerFunction({
    name: 'current_database',
    args: [],
    returns: DataType.text,
    implementation: String,
  });

  database.public.registerFunction({
    name: 'version',
    args: [],
    returns: DataType.text,
    implementation: String,
  });

  database.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: v4,
      impure: true,
    });
  });

  const _entities = loadEntities();

  const databaseOptions = {
    type: 'postgres',
    namingStrategy: new TypeormNamingStrategy(),
    entities: [..._entities, ...(entities ?? [])],
    ...options,
  } as DataSourceOptions;

  const dataSource: DataSource =
    await database.adapters.createTypeormDataSource(databaseOptions);

  try {
    await dataSource.initialize();
    await dataSource.synchronize();

    setDataSource(dataSource);

    await runSeeders(dataSource, {
      factories: ['**/*.factory{.ts,.js}'],
      seeds,
    });
  } catch {
    // do not forget to close the connection once done...
    // ... typeorm stores connections in a static object,
    // and does not like opening 'default connections.
    await dataSource.destroy();
  } finally {
    const backup = database.backup();
    return { dataSource, backup };
  }
};
