import { FastifyReply } from 'fastify';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { isFunction } from 'lodash';
import { map } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import {
  REFRESH_TOKEN_COOKIE_NAME,
  AUTHENTICATION_COOKIE_NAME,
} from './iam.constants';

@Injectable()
export class RemoveTokensInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data: TE.TaskEither<unknown, void>) => {
        if (!isFunction(data)) {
          return data;
        }

        return pipe(
          data,
          TE.tap(() => {
            response
              .clearCookie(AUTHENTICATION_COOKIE_NAME)
              .clearCookie(REFRESH_TOKEN_COOKIE_NAME);

            return TE.right(undefined);
          })
        );
      })
    );
  }
}
