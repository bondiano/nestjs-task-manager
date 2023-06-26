/* eslint-disable @typescript-eslint/no-explicit-any */
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { Primitive } from 'type-fest';

export type Timestampify<T extends object> = {
  [K in keyof T]: Extract<T[K], Date> extends never
    ? Exclude<T[K], Primitive> extends object
      ? Timestampify<Exclude<T[K], Primitive>> | Extract<T[K], Primitive>
      : T[K]
    : number | Exclude<T[K], Date>;
};

/** Deeply omit members of an array of interface or array of type. */
export type DeepOmitArray<T extends Array<any>, K extends keyof any> = {
  [P in keyof T]: DeepOmit<T[P], K>;
};

/** Deeply omit members of an interface or type. */
export type DeepOmit<T, K extends keyof any> = T extends Primitive
  ? T
  : {
      [P in Exclude<keyof T, K>]: T[P] extends infer TP // distribute over unions
        ? TP extends Primitive
          ? TP // leave primitives and functions alone
          : TP extends Array<any>
          ? DeepOmitArray<TP, K> // Array special handling
          : DeepOmit<TP, K>
        : never;
    };

export type PartialTaskEither<T extends object> = {
  [K in keyof T]: T[K] | E.Either<Error, T[K]> | TE.TaskEither<Error, T[K]>;
};

export type MapStructure<T, R> = T extends Array<unknown> ? Array<R> : R;
