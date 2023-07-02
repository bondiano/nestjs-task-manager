import { IsString } from 'class-validator';

import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export class CryptoEnvironmentVariables {
  @IsString()
  SALT: string;
}

export const cryptoConfig = registerAs('crypto', () => ({
  salt: process.env.SALT,
}));

export type CryptoConfiguration = ConfigType<typeof cryptoConfig>;

export const InjectCryptoConfig = () => Inject(cryptoConfig.KEY);
