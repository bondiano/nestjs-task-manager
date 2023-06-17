import { IsEnum, IsPort, IsString } from 'class-validator';

import { Inject } from '@nestjs/common';
import { registerAs, ConfigType } from '@nestjs/config';

import { Environment } from '@api/lib/constants';

export class AppEnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsPort()
  APP_PORT: number;

  @IsString()
  APP_HOST: string;
}

export const appConfig = registerAs('app', () => ({
  host: process.env.APP_HOST,
  port: Number.parseInt(process.env.APP_PORT ?? '3000', 10),
  env: process.env.NODE_ENV,
}));

export type AppConfiguration = ConfigType<typeof appConfig>;

export const InjectAppConfig = () => Inject(appConfig.KEY);
