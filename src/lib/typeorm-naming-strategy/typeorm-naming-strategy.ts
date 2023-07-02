import * as pluralize from 'pluralize';
import * as StringUtils from 'typeorm/util/StringUtils';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export class TypeormNamingStrategy extends SnakeNamingStrategy {
  tableName(className: string, customName?: string): string {
    if (customName && customName.trim() !== '') {
      return customName;
    }

    const words = StringUtils.snakeCase(className).split('_');
    words[words.length - 1] = pluralize.plural(words.at(-1) ?? '');
    return words.join('_');
  }
}
