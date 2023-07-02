import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { REFRESH_TOKEN_COOKIE_NAME } from './iam.constants';

export const RefreshToken = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  }
);
