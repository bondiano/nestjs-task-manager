import { isLeft, Either } from 'fp-ts/Either';

export const getRightValue = <T>(either: Either<unknown, T>): T => {
  if (isLeft(either)) {
    throw either.left;
  }
  return either.right;
};
