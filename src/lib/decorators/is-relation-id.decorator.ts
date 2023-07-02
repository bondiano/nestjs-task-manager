import { IsInt, Min, type ValidationOptions } from 'class-validator';

import { applyDecorators } from '@nestjs/common';

export function IsRelationId(options?: ValidationOptions) {
  return applyDecorators(IsInt(options), Min(1, options));
}
