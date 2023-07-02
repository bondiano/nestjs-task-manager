import { TypeormNamingStrategy } from '../typeorm-naming-strategy';

describe('tableName', () => {
  let strategy: TypeormNamingStrategy;

  beforeAll(() => {
    strategy = new TypeormNamingStrategy();
  });

  it('should return pluralized table name in snake format when custom name was not set', () => {
    const testTableName = 'TestTableName';

    const result = strategy.tableName(testTableName, '');

    expect(result).toBe('test_table_names');
  });

  it('should return table name as customName when custom name was set', () => {
    const testTableName = 'TestTableName';
    const customTableName = 'CustomTableName';

    const result = strategy.tableName(testTableName, customTableName);

    expect(result).toBe(customTableName);
  });
});
