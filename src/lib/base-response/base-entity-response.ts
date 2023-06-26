import { ApiProperty } from '@nestjs/swagger';

import { IBaseEntityData } from '../types/response';

import { BaseResponse } from './base-response';

export class BaseEntityResponse<Data>
  extends BaseResponse<Data>
  implements IBaseEntityData
{
  @ApiProperty({ format: 'int32', required: true })
  id: number;

  @ApiProperty({ required: true })
  createdAt: number;

  @ApiProperty({ required: true })
  updatedAt: number;

  @ApiProperty({ required: false })
  deletedAt: number | null;

  constructor(data: Data) {
    super(data);
  }
}
