import { SetMetadata } from '@nestjs/common';

import { AuthType } from '../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../iam.constants';

export const Auth = (...authTypes: Array<AuthType>) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
