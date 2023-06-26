import { EmptyObject } from 'type-fest';

import { IPaginationOptions } from '@api/lib/types/response';

interface IArrayPayload<T> {
  data: Array<T>;
  meta: IPaginationOptions;
}

interface IPayload<T> {
  data: T;
}

export interface IHttpResponse<T> {
  success: true;
  payload: IArrayPayload<T> | IPayload<T> | EmptyObject;
}
