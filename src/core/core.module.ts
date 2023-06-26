import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import {
  AppEnvironmentVariables,
  LoggerEnvironmentVariables,
  appConfig,
  loggerConfig,
  validate,
} from '@api/configs';
import { ValidationError } from '@api/lib/base-http-errors';

import { DomainExceptionFilter } from './filters/domain-exceptions.filter';
import { HealthModule } from './health/health.module';
import { EitherInterceptor } from './interceptors/either.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { UnifyHttpResponse } from './interceptors/unify-response.interceptor';
import { AdvancedValidationPipe } from './pipes/advanced-validation.pipe';

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
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UnifyHttpResponse,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EitherInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new AdvancedValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => new ValidationError(errors),
      }),
    },
  ],
})
export class CoreModule {}
