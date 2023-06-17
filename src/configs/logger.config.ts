import { IsEnum } from 'class-validator';
import { Params } from 'nestjs-pino';

import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

import { Environment } from '@api/lib/constants';

export class LoggerEnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;
}

export const loggerConfig = registerAs('logger', () => {
  const isDevelopment = process.env.NODE_ENV === Environment.Development;
  const config: Params = {
    pinoHttp: {},
  } satisfies Params;

  if (isDevelopment) {
    config.pinoHttp = {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'UTC:mm/dd/yyyy h:MM:ss TT Z',
          ignore: 'pid,hostname',
        },
      },
      useLevel: 'debug',
      level: 'debug',
    };
  }

  return config;
});

export type LoggerConfiguration = ConfigType<typeof loggerConfig>;

export const InjectLoggerConfig = () => Inject(loggerConfig.KEY);
