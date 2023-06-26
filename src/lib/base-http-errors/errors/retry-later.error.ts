import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class RetryLaterError<T extends string> extends BaseError {
  override baseType = BaseErrorsType.RETRY_LATER;

  constructor(protected override readonly domainType: T) {
    super();
  }
}
