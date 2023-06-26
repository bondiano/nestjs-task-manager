import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class Unauthorized<T extends string> extends BaseError {
  override baseType = BaseErrorsType.UNAUTHORIZED;

  constructor(protected override readonly domainType?: T) {
    super();
  }
}
