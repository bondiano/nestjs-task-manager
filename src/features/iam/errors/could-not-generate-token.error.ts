import { ForbiddenError } from '@api/lib/base-http-errors';

import { AuthError } from '../enums/auth-error.enum';

export class CouldNotGenerateToken extends ForbiddenError<AuthError.COULD_NOT_GENERATE_TOKEN> {
  constructor() {
    super(AuthError.COULD_NOT_GENERATE_TOKEN);
  }
}
