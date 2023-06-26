import { BaseError } from './errors/base.error';

export interface ISeveralErrorAdditional {
  errors: Array<{
    baseType: string;
    domainType?: string;
    additional?: unknown;
  }>;
}

export class SeveralError extends BaseError<ISeveralErrorAdditional> {
  constructor(errors: Array<BaseError>) {
    super();

    this.baseType = errors[0].getBaseType();
    this.domainType = errors[0].getDomainType();
    const additionalErrors = errors.map((error) => ({
      baseType: error.getBaseType(),
      domainType: error.getDomainType(),
      additional: error.getAdditional(),
    }));

    this.additional = {
      errors: additionalErrors,
    };
  }
}
