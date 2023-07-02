import { ForbiddenError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class InvalidCredentials extends ForbiddenError<AuthError.INVALID_CREDENTIALS> {
  constructor() {
    super(AuthError.INVALID_CREDENTIALS);
  }
}
