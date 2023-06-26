import { ApiProperty } from '@nestjs/swagger';

import { BaseEntityResponse } from '../base-entity-response';
import { PaginationResponse } from '../pagination-response';

describe('PaginationResponse', () => {
  class PostResponse extends BaseEntityResponse<{ title: string }> {
    @ApiProperty()
    title: string;
  }

  it('should build correct schema', () => {
    const schema = PaginationResponse.buildOpenApiSchema(PostResponse);

    expect(schema).toMatchSnapshot();
  });

  it('should define correct properties', () => {
    const paginationResponse = new PaginationResponse([], {});

    expect(paginationResponse).toHaveProperty('items');
    expect(paginationResponse).toHaveProperty('meta');

    expect(paginationResponse.meta.count).toBe(0);
    expect(paginationResponse.meta.total).toBe(0);
    expect(paginationResponse.meta.perPage).toBe(0);
    expect(paginationResponse.meta.currentPage).toBe(1);
    expect(paginationResponse.meta.totalPages).toBe(1);
  });

  it('should work with BaseResponse', () => {
    const paginationResponse = new PaginationResponse<{ title: string }>(
      PostResponse.fromArray([{ title: 'title' }]),
      {
        count: 1,
        total: 1,
        perPage: 1,
        currentPage: 1,
      }
    );

    expect(paginationResponse).toHaveProperty('items');
    expect(paginationResponse).toHaveProperty('meta');
    expect(paginationResponse.meta.totalPages).toBe(1);
  });

  it('should build correct options', () => {
    const posts = PostResponse.fromArray([
      { title: 'test2' },
      { title: 'test1' },
      { title: 'test' },
    ]);

    const paginationResponse = new PaginationResponse(
      posts,
      PaginationResponse.buildPagerOptions(posts, 101, {
        page: 1,
        limit: 3,
        searchParams: {},
      })
    );

    expect(paginationResponse).toHaveProperty('items');
    expect(paginationResponse).toHaveProperty('meta');
    expect(paginationResponse.meta.totalPages).toBe(34);
    expect(paginationResponse.meta.count).toBe(3);
    expect(paginationResponse.meta.total).toBe(101);
  });
});
