import { Except } from 'type-fest';

import { DeepOmit, Timestampify } from './utils';

export interface IBaseProperties {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type OmitBaseProperties<T extends IBaseProperties> = Except<
  T,
  keyof IBaseProperties
>;

export type DeepOmitBaseProperties<T extends IBaseProperties> = DeepOmit<
  T,
  keyof IBaseProperties
>;

export interface IBasePaginationQuery {
  page: number;
  limit?: number;
}

export type IBaseEntityData = Timestampify<IBaseProperties>;

export interface IPaginationOptions {
  count?: number;
  total?: number;
  perPage?: number;
  currentPage?: number;
  totalPages?: number;
  searchParams?: Record<string, unknown>;
}

export interface IPaginationData<T> {
  readonly items: Array<T>;
  readonly meta: IPaginationOptions;
}

export interface IErrorBaseResponse<T = undefined> {
  success: false;
  error: {
    type: string;
    additional?: T;
  };
}

export interface IArrayPayload<T extends Array<unknown> = Array<unknown>> {
  data: T;
  meta: IPaginationOptions;
}

export interface IPayload<T> {
  data: T;
}

export interface ISuccessBaseResponse<T> {
  success: true;
  payload: T extends Array<unknown> ? IArrayPayload<T> : IPayload<T>;
}

export type BaseResponse<T = undefined> =
  | ISuccessBaseResponse<T>
  | IErrorBaseResponse<T>;
