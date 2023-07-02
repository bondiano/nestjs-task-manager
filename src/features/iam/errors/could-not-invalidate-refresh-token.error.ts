import { ForbiddenError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class CouldNotInvalidateRefreshToken extends ForbiddenError<AuthError.COULD_NOT_INVALIDATE_REFRESH_TOKEN> {
  constructor() {
    super(AuthError.COULD_NOT_INVALIDATE_REFRESH_TOKEN);
  }
}
