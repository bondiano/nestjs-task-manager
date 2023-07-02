import { RetryLaterError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class CouldNotUpdatePassword extends RetryLaterError<AuthError.COULD_NOT_UPDATE_PASSWORD> {
  constructor() {
    super(AuthError.COULD_NOT_UPDATE_PASSWORD);
  }
}
