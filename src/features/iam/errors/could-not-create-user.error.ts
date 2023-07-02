import { ForbiddenError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class CouldNotCreateUser extends ForbiddenError<AuthError.COULD_NOT_CREATE_USER> {
  constructor() {
    super(AuthError.COULD_NOT_CREATE_USER);
  }
}
