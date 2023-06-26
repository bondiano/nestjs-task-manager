import { ValidationError as ClassValidatorError } from '@nestjs/common';

import { BaseErrorsType } from './base-error.enum';
import { BaseError } from './base.error';

interface IValidationErrorConstraintsAdditional {
  property: string;
  constraints?: Record<string, unknown> | Array<unknown>;
}

export interface IValidationErrorAdditional {
  validationErrors?: Array<IValidationErrorConstraintsAdditional>;
}

export type ValidationErrorsParameters = Array<ClassValidatorError>;

export class ValidationError extends BaseError<IValidationErrorAdditional> {
  private static buildAdditionalClassValidatorAdditional(
    error: Array<ClassValidatorError>
  ) {
    return error.map((error): IValidationErrorConstraintsAdditional => {
      const { property, children } = error;
      const { constraints } = error;

      if (children && children.length > 0) {
        return {
          property,
          constraints:
            ValidationError.buildAdditionalClassValidatorAdditional(children),
        };
      }

      return {
        property,
        constraints,
      };
    });
  }

  static buildAdditional(
    errors: ValidationErrorsParameters
  ): IValidationErrorAdditional {
    if (!errors || errors.length === 0) {
      return {};
    }

    return {
      validationErrors: ValidationError.buildAdditionalClassValidatorAdditional(
        errors as Array<ClassValidatorError>
      ),
    };
  }

  override baseType = BaseErrorsType.INCORRECT_DATA;

  constructor(errors: ValidationErrorsParameters) {
    super();

    this.additional = ValidationError.buildAdditional(errors);
  }
}
