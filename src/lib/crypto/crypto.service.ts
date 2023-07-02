import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { MAX_CODE_LENGTH } from './crypto.constants';
import { ICryptoModuleOptions } from './crypto.interface';
import { MODULE_OPTIONS_TOKEN } from './crypto.module-definition';

type BufferOrString = Buffer | string;

@Injectable()
export class CryptoService {
  private salt?: Buffer;
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) public readonly options: ICryptoModuleOptions
  ) {
    this.salt = options.salt ? Buffer.from(options.salt) : undefined;

    if (!this.salt) {
      this.logger.warn(`No salt provided. This is not recommended.`);
    }
  }

  hash(plain: BufferOrString): Promise<string> {
    return argon2.hash(plain, { salt: this.salt });
  }

  verify(hash: string, plain: BufferOrString) {
    return argon2.verify(hash, plain, { salt: this.salt });
  }

  generateRandomString(bytes: number) {
    return randomBytes(bytes).toString('base64');
  }

  generateRandomCode(length: number) {
    if (length > MAX_CODE_LENGTH) {
      throw new RangeError(
        `Length must be not greater than ${MAX_CODE_LENGTH}`
      );
    }

    return Math.floor(Math.random() * 10 ** length).toString();
  }
}
