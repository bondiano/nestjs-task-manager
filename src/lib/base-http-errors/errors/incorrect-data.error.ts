import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

export class IncorrectDataError<T extends string> extends BaseError<unknown> {
  override baseType = BaseErrorsType.INCORRECT_DATA;

  constructor(protected override readonly domainType: T) {
    super();
  }
}
