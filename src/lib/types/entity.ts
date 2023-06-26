import { Except } from 'type-fest';

import { DeepOmit } from './utils';

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
