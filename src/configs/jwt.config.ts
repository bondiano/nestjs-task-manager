import { IsString, IsPositive, IsInt } from 'class-validator';

import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export class JWTEnvironmentVariables {
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_TOKEN_AUDIENCE: string;

  @IsString()
  JWT_TOKEN_ISSUER: string;

  @IsInt()
  @IsPositive()
  JWT_TOKEN_EXPIRES_IN: number;

  @IsInt()
  @IsPositive()
  JWT_REFRESH_TOKEN_TTL: number;
}

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_TOKEN_AUDIENCE,
  issuer: process.env.JWT_TOKEN_ISSUER,
  accessTokenTtl: Number.parseInt(
    process.env.JWT_TOKEN_EXPIRES_IN ?? '3600',
    10
  ),
  refreshTokenTtl: Number.parseInt(
    process.env.JWT_REFRESH_TOKEN_TTL ?? '2592000',
    10
  ),
}));

export type JWTConfiguration = ConfigType<typeof jwtConfig>;

export const InjectJWTConfig = () => Inject(jwtConfig.KEY);
