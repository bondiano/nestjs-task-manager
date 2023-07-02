import { IsEmail, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { EmailTransformer } from '@api/lib/decorators/email-transformer.decorator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @EmailTransformer()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;
}
