import { pipe } from 'fp-ts/function';
import { isObject } from 'lodash';

import { Timestampify } from '../types/utils';

export const timestampify = <T extends object>(object: T) => {
  if (!isObject(object)) {
    return object;
  }

  return pipe(
    Object.entries(object),
    (entries: Array<[string, T]>) =>
      entries.map(([key, value]): [string, unknown] => {
        if (Array.isArray(value)) {
          const _value = value.map((value_) => timestampify(value_));

          return [key, _value];
        }

        if (value instanceof Date) {
          return [key, value.getTime()];
        }

        if (isObject(value)) {
          return [key, timestampify(value)];
        }

        return [key, value];
      }),
    Object.fromEntries
  ) as Timestampify<T>;
};
