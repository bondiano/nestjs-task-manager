import { Type } from '@nestjs/common';

import { AuthEntity } from './auth.entity';

export interface IIamModuleOptions<T extends AuthEntity> {
  key: string;
  entity: Type<T>;
}
