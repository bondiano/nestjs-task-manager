import { instanceToPlain } from 'class-transformer';
import { map, Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { PaginationResponse } from '@api/lib/base-response/pagination-response';

import { IHttpResponse } from './http-response.interface';

const unifyHttpResponse = <T>(data: Array<T> | T): IHttpResponse<T> => {
  if (!data) {
    return {
      success: true,
      payload: {},
    };
  }

  if (data instanceof PaginationResponse) {
    return {
      success: true,
      payload: {
        data: data.items.map((element) => <T>instanceToPlain(element)),
        meta: data.meta,
      },
    };
  }

  return {
    success: true,
    payload: {
      data: <T>instanceToPlain(data),
    },
  };
};

@Injectable()
export class UnifyHttpResponse implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<IHttpResponse<unknown>> {
    return next.handle().pipe(map(unifyHttpResponse));
  }
}
