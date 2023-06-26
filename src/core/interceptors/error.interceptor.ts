import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import {
  BaseError,
  UnknownError,
  SeveralError,
  HTTPError,
} from '@api/lib/base-http-errors';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: HTTPError | Array<BaseError>) => {
        if (Array.isArray(error)) {
          return throwError(() => new SeveralError(error));
        }

        if (error instanceof BaseError) {
          return throwError(() => error);
        }

        Logger.error(error);

        return throwError(() => new UnknownError());
      })
    );
  }
}
