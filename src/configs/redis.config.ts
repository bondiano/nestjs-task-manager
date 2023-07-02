import { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

import { Inject } from '@nestjs/common';
import { registerAs, ConfigType } from '@nestjs/config';

export class RedisEnvironmentVariables {
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;
}

export const redisConfig = registerAs('redis', (): RedisModuleOptions => {
  const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

  return {
    config: {
      url,
    },
  };
});

export type RedisConfiguration = ConfigType<typeof redisConfig>;

export const InjectRedisConfig = () => Inject(redisConfig.KEY);
