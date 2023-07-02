import { ApiProperty } from '@nestjs/swagger';

import { IsRelationId } from '@api/lib/decorators/is-relation-id.decorator';

export class SignOutDto {
  @ApiProperty()
  @IsRelationId()
  userId: number;
}
