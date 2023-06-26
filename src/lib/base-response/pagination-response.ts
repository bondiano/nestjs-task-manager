import { Constructor } from 'type-fest';

import {
  ApiProperty,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';

import { IPaginationOptions, IPaginationData } from '../types/response';

export class PageMetaDto implements IPaginationOptions {
  @ApiProperty()
  public readonly count: number;

  @ApiProperty()
  public readonly total: number;

  @ApiProperty()
  public readonly perPage: number;

  @ApiProperty()
  public readonly currentPage: number;

  @ApiProperty()
  public readonly totalPages: number;

  @ApiProperty()
  public readonly searchParams: Record<string, unknown>;

  constructor(options: IPaginationOptions) {
    this.count = options.count ?? 0;
    this.total = options.total ?? 0;
    this.perPage = options.perPage ?? 0;
    this.currentPage = options.currentPage ?? 1;
    this.totalPages = options.totalPages ?? 1;
    this.searchParams = options.searchParams ?? {};
  }
}

export class PaginationResponse<Data> implements IPaginationData<Data> {
  /**
   * Takes ApiModel or [ApiModel] (class with swagger-decorated properties).
   * Returns compiled SchemaObject for array.
   * Don't forget to add @ApiExtraModels(ClassName) to controller.
   */
  static buildOpenApiSchema<T extends string | Constructor<unknown>>(
    entity: T
  ): ApiResponseSchemaHost['schema'] {
    return {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
        },
        payload: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(entity),
              },
            },
            meta: {
              $ref: getSchemaPath(PageMetaDto),
            },
          },
        },
      },
    };
  }

  static buildPagerOptions<T>(
    items: Array<unknown>,
    total: number,
    pager?: {
      page?: number;
      limit?: number;
      searchParams?: Partial<Record<keyof T, unknown>>;
    }
  ): Required<IPaginationOptions> {
    const _pager = {
      page: pager?.page ?? 1,
      limit: pager?.limit ?? items.length,
    };

    const totalPages = Math.ceil(total / _pager.limit);

    return {
      total,
      totalPages: Number.isNaN(totalPages) ? 1 : totalPages,
      count: items.length,
      perPage: _pager.limit,
      currentPage: _pager.page,
      searchParams: pager?.searchParams ?? {},
    };
  }

  @ApiProperty({
    type: [],
  })
  public readonly items: Array<Data>;

  @ApiProperty()
  public readonly meta: PageMetaDto;

  constructor(items: Array<Data>, options: IPaginationOptions) {
    this.items = items;
    this.meta = new PageMetaDto(options);
  }
}
