import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class ForbiddenError<T extends string> extends BaseError {
  override baseType = BaseErrorsType.FORBIDDEN;

  constructor(protected override readonly domainType: T) {
    super();
  }
}
