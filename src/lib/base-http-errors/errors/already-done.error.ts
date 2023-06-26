import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class AlreadyDoneError<T extends string> extends BaseError {
  protected override readonly baseType = BaseErrorsType.ALREADY_DONE;

  constructor(protected override readonly domainType: T) {
    super();
  }
}
