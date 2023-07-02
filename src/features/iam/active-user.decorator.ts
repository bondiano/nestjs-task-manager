import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { REQUEST_USER_KEY } from './iam.constants';
import { IActiveUserData } from './interfaces/active-user.interface';

/**
 * Decorator factory to extracts the active user from the request.
 */
export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUserData | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  }
);
