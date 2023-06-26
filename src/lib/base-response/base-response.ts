import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

import { IBasePaginationQuery } from '../types/response';
import { MapStructure, PartialTaskEither } from '../types/utils';

import { PaginationResponse } from './pagination-response';

export class BaseResponse<Data> {
  public static fromArray<C extends typeof BaseResponse<D>, D>(
    this: C,
    data: Array<D>
  ) {
    return data.map((item) => new this(item) as InstanceType<C>);
  }

  public static fromEither<
    C extends typeof BaseResponse<D>,
    D,
    R extends D | Array<D>
  >(this: C, data: E.Either<Error, R>) {
    if (E.isLeft(data)) {
      throw data.left;
    }

    if (Array.isArray(data.right)) {
      return this.fromArray(data.right as Array<D>) as MapStructure<
        R,
        InstanceType<C>
      >;
    }

    return new this(data.right as D) as MapStructure<R, InstanceType<C>>;
  }

  public static async fromTaskEither<
    C extends typeof BaseResponse<D>,
    D,
    E extends D | Array<D>
  >(this: C, data: TE.TaskEither<Error, E>) {
    const result = await data();
    return this.fromEither(result);
  }

  public static fromEitherWithCount<
    C extends typeof BaseResponse<D>,
    D,
    R extends [Array<D>, number]
  >(this: C, data: E.Either<Error, R>) {
    if (E.isLeft(data)) {
      throw data.left;
    }

    const [items, count] = data.right;

    return {
      items: this.fromArray(items as Array<D>) as MapStructure<
        R,
        InstanceType<C>
      >,
      count,
    };
  }

  public static async fromTaskEitherWithCount<
    C extends typeof BaseResponse<D>,
    D,
    E extends [Array<D>, number]
  >(this: C, data: TE.TaskEither<Error, E>) {
    const result = await data();
    return this.fromEitherWithCount(result);
  }

  public static async fromPartialTaskEither<
    C extends typeof BaseResponse<D>,
    D extends object,
    R extends PartialTaskEither<D>
  >(this: C, data: R) {
    const tasks = Object.entries(data);

    const eithers = await Promise.all(
      tasks.map(async ([key, value]) => {
        const _value = this.isTask(value) ? await value() : value;
        return [key, _value];
      })
    );

    const entries = eithers.map(([key, value]) => {
      const _value = this.isEither(value)
        ? BaseResponse.fromEither(value)
        : value;
      return [key, _value];
    });

    const _data = Object.fromEntries(entries) as D;
    return new this(_data) as InstanceType<C>;
  }

  public static buildPaginationResponse<C extends typeof BaseResponse<D>, D>(
    this: C,
    items: Array<D>,
    count: number,
    query: IBasePaginationQuery
  ) {
    const responseItems = this.fromArray(items);

    return new PaginationResponse(
      responseItems,
      PaginationResponse.buildPagerOptions(responseItems, count, {
        page: query.page,
        limit: query.limit,
      })
    );
  }

  protected static isTask<P>(value: P | T.Task<P>): value is T.Task<P> {
    return value instanceof Function;
  }

  protected static isEither<T, Error = never>(
    value: T | E.Either<Error, T>
  ): value is E.Either<Error, T> {
    return Boolean(
      typeof value === 'object' &&
        value !== null &&
        '_tag' in value &&
        ((value._tag === 'Right' && 'right' in value) ||
          (value._tag === 'Left' && 'left' in value))
    );
  }

  constructor(data: Data) {
    Object.assign(this, data);
  }
}
