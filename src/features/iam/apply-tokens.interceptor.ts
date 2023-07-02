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
import { ITokens } from './interfaces/tokens.interface';

@Injectable()
export class ApplyTokensInterceptor implements NestInterceptor {
  private readonly TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    path: '/',
  };

  intercept(context: ExecutionContext, next: CallHandler) {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data: TE.TaskEither<unknown, { tokens: ITokens }>) => {
        if (!isFunction(data)) {
          return data;
        }

        return pipe(
          data,
          TE.map(({ tokens, ..._data }) => {
            const { accessToken, refreshToken } = tokens;

            response
              .setCookie(
                AUTHENTICATION_COOKIE_NAME,
                accessToken,
                this.TOKEN_COOKIE_OPTIONS
              )
              .setCookie(
                REFRESH_TOKEN_COOKIE_NAME,
                refreshToken,
                this.TOKEN_COOKIE_OPTIONS
              );

            return _data;
          })
        );
      })
    );
  }
}
