import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

import { AuthEntity } from './auth.entity';
import { IIamModuleOptions } from './iam-module-options.interface';
import { IAM_MODULE_OPTIONS_KEY } from './iam.constants';

@Injectable()
export class RefreshTokenIdsStorage<T extends AuthEntity> {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis,
    @Inject(IAM_MODULE_OPTIONS_KEY)
    private readonly options: IIamModuleOptions<T>
  ) {}

  async insert(userId: number, tokenId: string) {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string) {
    const storedTokenId = await this.redisClient.get(this.getKey(userId));

    return storedTokenId === tokenId;
  }

  async invalidate(userId: number) {
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number) {
    return [this.options.key, userId].join(':');
  }
}
