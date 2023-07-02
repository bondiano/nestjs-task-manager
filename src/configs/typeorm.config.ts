import {
  IsBoolean,
  IsNumber,
  IsPositive,
  IsString,
  IsEnum,
} from 'class-validator';

import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Environment } from '@api/lib/constants';
import { TypeormNamingStrategy } from '@api/lib/typeorm-naming-strategy';

export class TypeOrmEnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @IsPositive()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsBoolean()
  DB_SYNCHRONIZE: boolean;
}

const developmentOptions = {
  logger: 'advanced-console',
  logging: 'all',
  loggerLevel: 'debug',

  ssl: false,
  extra: {},
} satisfies TypeOrmModuleOptions;

export const typeOrmConfig = registerAs('typeorm', () => {
  const isDevelopment = process.env.NODE_ENV === Environment.Development;

  const config = Object.assign(
    {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      namingStrategy: new TypeormNamingStrategy(),
      dropSchema: false,
      autoLoadEntities: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    } satisfies TypeOrmModuleOptions,
    isDevelopment ? developmentOptions : {}
  );

  return config as TypeOrmModuleOptions;
});

export type TypeOrmConfiguration = ConfigType<typeof typeOrmConfig>;

export const InjectTypeOrmConfig = () => Inject(typeOrmConfig.KEY);
