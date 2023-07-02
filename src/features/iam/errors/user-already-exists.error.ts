import { ForbiddenError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class UserAlreadyExists extends ForbiddenError<AuthError.USER_ALREADY_EXISTS> {
  constructor() {
    super(AuthError.USER_ALREADY_EXISTS);
  }
}
