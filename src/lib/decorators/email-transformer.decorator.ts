import { Transform } from 'class-transformer';

export function EmailTransformer() {
  return Transform(({ value }) => {
    return value.trim().toLowerCase();
  });
}
