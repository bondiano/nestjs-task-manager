import { fastifyCookie } from '@fastify/cookie';
import { fastifyHelmet } from '@fastify/helmet';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';
import { Logger as LoggerPino } from 'nestjs-pino';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app/app.module';

const GLOBAL_PREFIX = 'api';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    ignoreTrailingSlash: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCookie);
  await app.register(fastifyHelmet);

  app.useLogger(app.get(LoggerPino));
  app.enableShutdownHooks();

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'X-Requested-With',
      'Authorization',
    ],
    credentials: true,
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);

  setupGracefulShutdown({ app });

  const port = configService.get('APP_PORT');
  const host = configService.get('APP_HOST');

  await app.listen(port, host);

  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${GLOBAL_PREFIX}`
  );
}

bootstrap();
