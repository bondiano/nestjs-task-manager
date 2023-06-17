import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Constructor } from 'type-fest';

export const validate =
  (...validationClasses: Array<Constructor<unknown>>) =>
  (configuration: Record<string, unknown>) => {
    for (const Class of validationClasses) {
      const config = plainToInstance(Class, configuration, {
        enableImplicitConversion: true,
      }) as string;
      const error = validateSync(config, { skipMissingProperties: false });
      if (error.length > 0) {
        throw error;
      }
    }

    return configuration;
  };
