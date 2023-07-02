import { createMock } from '@golevelup/ts-jest';
import * as TE from 'fp-ts/TaskEither';
import { of } from 'rxjs';

import { ExecutionContext } from '@nestjs/common';

import { ApplyTokensInterceptor } from '../apply-tokens.interceptor';

describe('ApplyTokensInterceptor', () => {
  let interceptor: ApplyTokensInterceptor;

  beforeAll(() => {
    interceptor = new ApplyTokensInterceptor();
  });

  it('should intercept http response', (done) => {
    const mockExecutionContext = createMock<ExecutionContext>();

    const responseObserver = interceptor.intercept(mockExecutionContext, {
      handle: () =>
        of(TE.right({ tokens: { accessToken: '', refreshToken: '' } })),
    });

    responseObserver.subscribe({
      next: (value) => {
        expect(value).toBeTruthy();
      },
      complete: () => {
        done();
      },
    });
  });
});
