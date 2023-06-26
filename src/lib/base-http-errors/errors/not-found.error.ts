import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class NotFoundError<T extends string> extends BaseError {
  override baseType = BaseErrorsType.NOT_FOUND;

  constructor(protected override readonly domainType: T) {
    super();
  }
}
