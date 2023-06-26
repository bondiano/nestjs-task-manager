import { createMock } from '@golevelup/ts-jest';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { lastValueFrom, of } from 'rxjs';

import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BaseError, BaseErrorsType } from '@api/lib/base-http-errors';

import { EitherInterceptor, HttpExceptionEither } from '../either.interceptor';

// Mocks
class MockCallHandler implements CallHandler<HttpExceptionEither<unknown>> {
  handle() {
    return of(E.right('Success'));
  }
}

class MockError extends BaseError {
  constructor(protected readonly baseType: BaseErrorsType) {
    super();
  }
}

describe('EitherInterceptor', () => {
  let interceptor: EitherInterceptor;
  let callHandler: CallHandler<HttpExceptionEither<unknown>>;
  let context: ExecutionContext;

  beforeEach(async () => {
    const moduleReference = await Test.createTestingModule({
      providers: [EitherInterceptor],
    }).compile();

    interceptor = moduleReference.get<EitherInterceptor>(EitherInterceptor);
    callHandler = new MockCallHandler();
    context = createMock<ExecutionContext>();
  });

  it('should handle right either', async () => {
    jest
      .spyOn(callHandler, 'handle')
      .mockReturnValueOnce(of(E.right('Success')));

    const result$ = interceptor.intercept(context, callHandler);

    await expect(lastValueFrom(result$)).resolves.toBe('Success');
  });

  it('should handle left either', async () => {
    const error = new MockError(BaseErrorsType.INCORRECT_DATA);
    jest.spyOn(callHandler, 'handle').mockReturnValueOnce(of(E.left(error)));

    const result$ = interceptor.intercept(context, callHandler);

    await expect(lastValueFrom(result$)).rejects.toThrow(error);
  });

  it('should handle right taskEither', async () => {
    jest
      .spyOn(callHandler, 'handle')
      .mockReturnValueOnce(of(TE.right('Success')));

    const result$ = interceptor.intercept(context, callHandler);

    await expect(lastValueFrom(result$)).resolves.toBe('Success');
  });

  it('should handle left taskEither', async () => {
    const error = new MockError(BaseErrorsType.INCORRECT_DATA);
    jest.spyOn(callHandler, 'handle').mockReturnValueOnce(of(TE.left(error)));

    const result$ = interceptor.intercept(context, callHandler);

    await expect(lastValueFrom(result$)).rejects.toThrow(error);
  });
});
