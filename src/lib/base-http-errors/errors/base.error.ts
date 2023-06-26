import { BaseErrorsType } from './base-error.enum';

export abstract class BaseError<A = undefined> extends Error {
  protected baseType: BaseErrorsType;
  protected domainType?: string;
  protected additional?: A;

  getDomainType(): string | undefined {
    return this.domainType;
  }

  getBaseType() {
    return this.baseType;
  }

  getAdditional() {
    return this.additional ?? undefined;
  }
}
