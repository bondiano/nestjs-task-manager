import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { Column } from 'typeorm';

import { BaseEntity } from '@api/lib/base-entity';

export class AuthEntity extends BaseEntity {
  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;
}
