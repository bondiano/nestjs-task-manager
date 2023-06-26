import _ from 'lodash';

import { Injectable, ValidationPipe } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';

@Injectable()
export class AdvancedValidationPipe extends ValidationPipe {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.parseNestedQuery(value);
    return await super.transform(result, metadata);
  }

  parseNestedQuery(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const result = {};

    for (const [key, _value] of Object.entries(value)) {
      let path = key.split(/\[|]\[|]/);
      if (path.at(-1) === '') {
        path = path.slice(0, -1);
      }

      _.set(result, path, _value);
    }

    return result;
  }
}
