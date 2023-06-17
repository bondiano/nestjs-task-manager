import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  AppEnvironmentVariables,
  LoggerEnvironmentVariables,
  appConfig,
  loggerConfig,
  validate,
} from '@api/configs';

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    ConfigModule.forRoot({
      validate: validate(AppEnvironmentVariables, LoggerEnvironmentVariables),
      isGlobal: true,
      expandVariables: true,
      load: [appConfig, loggerConfig],
      cache: true,
    }),
    LoggerModule.forRootAsync(loggerConfig.asProvider()),
  ],
})
export class CoreModule {}
