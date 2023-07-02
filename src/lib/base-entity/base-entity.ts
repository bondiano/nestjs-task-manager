import {
  BaseEntity as TypeOrmBaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Custom base entity
 */
export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('identity', {
    comment: 'Entity primary key, used as a unique identifier',
  })
  readonly id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Creation date',
  })
  readonly createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: 'Latest update date',
  })
  readonly updatedAt: Date;

  @DeleteDateColumn({
    comment: 'Soft delete date',
  })
  readonly deletedAt: Date | null;
}
