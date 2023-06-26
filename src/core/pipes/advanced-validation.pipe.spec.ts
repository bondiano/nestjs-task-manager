import { AdvancedValidationPipe } from './advanced-validation.pipe';

describe('AdvancedValidationPipe', () => {
  it('should transform nested query params', () => {
    const input = {
      value: true,
      'nested[value]': 1,
      'nested[property]': 'property',
      'deeply[nested][value]': 'value',
    };

    const pipe = new AdvancedValidationPipe();
    const output = pipe.parseNestedQuery(input);

    expect(output).toEqual({
      value: true,
      nested: {
        value: 1,
        property: 'property',
      },
      deeply: {
        nested: {
          value: 'value',
        },
      },
    });
  });
});
