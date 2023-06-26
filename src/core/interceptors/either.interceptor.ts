import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { isFunction } from 'lodash';
import { from, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

import { BaseError } from '@api/lib/base-http-errors';

export type HttpExceptionEither<T> =
  | E.Either<BaseError, T>
  | TE.TaskEither<BaseError, T>;

export class EitherInterceptor implements NestInterceptor {
  intercept<T>(
    _context: ExecutionContext,
    next: CallHandler<HttpExceptionEither<T>>
  ) {
    return next
      .handle()
      .pipe(
        mergeMap((response) => {
          if (isFunction(response)) {
            return from(response());
          }

          return of(response);
        })
      )
      .pipe(
        map((response) => {
          if (E.isLeft(response)) {
            throw response.left;
          }

          if (E.isRight(response)) {
            return response.right;
          }

          return response;
        })
      );
  }
}
