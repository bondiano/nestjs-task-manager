import 'reflect-metadata';

import { Type, plainToClass } from 'class-transformer';
import { IsString, ValidateNested, validate } from 'class-validator';

import { ValidationError } from '../errors/validation.error';

describe('ValidationError', () => {
  class TestDto {
    @IsString()
    test: string;
  }

  it('should be define', () => {
    const error = new ValidationError([]);

    expect(error).toBeDefined();
  });

  it('should correctly build additional', async () => {
    const validated = await validate(plainToClass(TestDto, { test: 1 }));
    const error = new ValidationError(validated);

    const additional = error.getAdditional();

    expect(error).toBeInstanceOf(ValidationError);
    expect(additional).toBeDefined();
    expect(additional).toHaveProperty('validationErrors');
    expect(additional?.validationErrors).toHaveLength(1);
  });

  it('should correctly build additional with nested', async () => {
    class NestedDto {
      @IsString()
      test: string;

      @ValidateNested()
      @Type(() => TestDto)
      nested: TestDto;
    }

    const validated = await validate(
      plainToClass(NestedDto, { test: 1, nested: { test: 1 } })
    );

    const error = new ValidationError(validated);
    const additional = error.getAdditional();

    expect(error).toBeInstanceOf(ValidationError);
    expect(additional).toBeDefined();
    expect(additional).toHaveProperty('validationErrors');
    expect(additional?.validationErrors).toHaveLength(2);
  });
});
