import { HttpStatus } from '@nestjs/common';

import { BaseErrorsType } from './errors/base-error.enum';
import { BaseError } from './errors/base.error';

const errorTypeToHttpMapping: Record<BaseErrorsType, HttpStatus> = {
  [BaseErrorsType.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [BaseErrorsType.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [BaseErrorsType.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [BaseErrorsType.INCORRECT_DATA]: HttpStatus.BAD_REQUEST,
  [BaseErrorsType.UNKNOWN]: HttpStatus.INTERNAL_SERVER_ERROR,
  [BaseErrorsType.ALREADY_DONE]: HttpStatus.FORBIDDEN,
  [BaseErrorsType.RETRY_LATER]: HttpStatus.TOO_MANY_REQUESTS,
} as const;

export const getHttpCodeByException = (exception: BaseError): number => {
  const type = exception.getBaseType();

  return errorTypeToHttpMapping[type];
};
