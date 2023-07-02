import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export const orNothing = <T, R, E>(
  value: T | null | undefined,
  function_: (value: T) => TE.TaskEither<E, R>
) =>
  pipe(
    value,
    O.fromNullable,
    O.matchW(
      () => TE.right(undefined),
      (value) => function_(value)
    )
  );
