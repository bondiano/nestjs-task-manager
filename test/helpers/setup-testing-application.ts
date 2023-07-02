import { DataSource } from 'typeorm';

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';

import { DomainExceptionFilter } from '@api/core/filters/domain-exceptions.filter';
import { EitherInterceptor } from '@api/core/interceptors/either.interceptor';
import { ErrorInterceptor } from '@api/core/interceptors/error.interceptor';
import { UnifyHttpResponse } from '@api/core/interceptors/unify-response.interceptor';
import { AdvancedValidationPipe } from '@api/core/pipes/advanced-validation.pipe';
import { ValidationError } from '@api/lib/base-http-errors';

import {
  IBuildTestingModuleOptions,
  buildTestingModule,
} from './setup-testing-module';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBuildTestingApplicationOptions
  extends IBuildTestingModuleOptions {}

@Module({
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
export class CoreTestingModule {}

export const buildTestingApplication = async (
  dataSource: DataSource,
  options?: IBuildTestingApplicationOptions
) => {
  const testModule = await buildTestingModule(dataSource, {
    ...options,
    imports: [CoreTestingModule, ...(options?.imports ?? [])],
  });

  const app = testModule.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter()
  );

  await app.init();

  return app;
};
