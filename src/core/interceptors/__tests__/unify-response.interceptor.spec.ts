import { of } from 'rxjs';

import { BaseEntityResponse } from '@api/lib/base-response/base-entity-response';
import { PaginationResponse } from '@api/lib/base-response/pagination-response';

import { UnifyHttpResponse } from '../unify-response.interceptor';

describe('Unified HTTP Response', () => {
  let interceptor: UnifyHttpResponse;

  beforeAll(() => {
    interceptor = new UnifyHttpResponse();
  });

  it('should intercept http response', (done) => {
    const responseObserver = interceptor.intercept({} as never, {
      handle: () => of('test data'),
    });

    responseObserver.subscribe({
      next: (value) => {
        expect(value).toEqual({
          success: true,
          payload: { data: 'test data' },
        });
      },
      complete: () => {
        done();
      },
    });
  });

  it('should intercept http response with pagination', (done) => {
    const userResponse = BaseEntityResponse.fromArray([{ test: 'test data' }]);

    const response = new PaginationResponse(userResponse, {
      count: 1,
      total: 1,
      perPage: 1,
      currentPage: 1,
    });

    const responseObserver = interceptor.intercept({} as never, {
      handle: () => of(response),
    });

    responseObserver.subscribe({
      next: (value) => {
        expect(value).toEqual({
          success: true,
          payload: {
            data: [{ test: 'test data' }],
            meta: {
              count: 1,
              total: 1,
              perPage: 1,
              currentPage: 1,
              totalPages: 1,
              searchParams: expect.any(Object),
            },
          },
        });
      },
      complete: () => {
        done();
      },
    });
  });
});
