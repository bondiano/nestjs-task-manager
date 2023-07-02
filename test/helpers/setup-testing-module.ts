import { getRedisToken } from '@liaoliaots/nestjs-redis';
import { DataSource } from 'typeorm';

import { Global, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { CryptoModule } from '@api/lib/crypto';

import { RedisMock } from '../mocks/redis.mock';

export interface IBuildTestingModuleOptions extends ModuleMetadata {
  entities?: Array<EntityClassOrSchema>;
}

export const buildTestingModule = async (
  dataSource: DataSource,
  options?: IBuildTestingModuleOptions
) => {
  const {
    entities = [],
    providers = [],
    imports = [],
    ..._options
  } = options ?? {};

  const repositoryProviders = entities.map((entity) => ({
    provide: getRepositoryToken(entity),
    useValue: dataSource.getRepository(entity),
  }));

  @Module({
    providers: [
      {
        provide: DataSource,
        useValue: dataSource,
      },
      ...repositoryProviders,
    ],
    exports: [DataSource, ...repositoryProviders],
  })
  @Global()
  class DataSourceModule {}

  return await Test.createTestingModule({
    ..._options,
    imports: [
      CryptoModule.forRoot({ salt: '' }),
      ConfigModule,
      DataSourceModule,
      ...imports,
    ],
    providers: [
      {
        provide: getRedisToken('default'),
        useClass: RedisMock,
      },
      ...repositoryProviders,
      ...providers,
    ],
  }).compile();
};
