import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class UnknownError extends BaseError {
  override baseType = BaseErrorsType.UNKNOWN;

  constructor() {
    super();
  }
}
