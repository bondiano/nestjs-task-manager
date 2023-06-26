import { timestampify } from '../timestampify';

describe('timestampify', () => {
  it('should transform all Date properties to numbers', () => {
    const object = {
      name: 'John',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(timestampify(object)).toEqual({
      name: object.name,
      createdAt: object.createdAt.getTime(),
      updatedAt: object.updatedAt.getTime(),
    });
  });

  it('should transform all Date properties to numbers in nested arrays', () => {
    const object = {
      name: 'John',
      createdAt: new Date(),
      updatedAt: new Date(),
      nested: [
        {
          name: 'John',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    expect(timestampify(object)).toEqual({
      name: object.name,
      createdAt: object.createdAt.getTime(),
      updatedAt: object.updatedAt.getTime(),
      nested: [
        {
          name: 'John',
          createdAt: object.nested[0].createdAt.getTime(),
          updatedAt: object.nested[0].updatedAt.getTime(),
        },
      ],
    });
  });

  it('should transform all Date properties to numbers in nested objects', () => {
    const object = {
      name: 'John',
      createdAt: new Date(),
      updatedAt: new Date(),
      nested: {
        name: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    expect(timestampify(object)).toEqual({
      name: object.name,
      createdAt: object.createdAt.getTime(),
      updatedAt: object.updatedAt.getTime(),
      nested: {
        name: 'John',
        createdAt: object.nested.createdAt.getTime(),
        updatedAt: object.nested.updatedAt.getTime(),
      },
    });
  });
});
