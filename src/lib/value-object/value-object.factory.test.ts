import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ValueObjectOptions } from './value-object.schema';

const valueObject = `import { Result } from '@core/result';
import { ValueObject } from '@core/value-object';

declare const nameType: unique symbol;

export class Foo extends ValueObject<string> {
  
  [nameType]: void; // Отмена структурной типизации

  public static Create(value: string): Resilt<Foo> {
    if (typeof data !== 'string') {
      return Result.failure('Значение должно быть строкой'); // Задайте ограничения
    }
    value = value.trim(); // Задайте трансформации
    return Result.success(new Foo(value));
  }
}
`;

const valueObjectSpec = `import { Foo } from './foo.value-object';

describe('Foo', () => {
  it('should be defined', () => {
    // Arrange
    const dao: string = "string"; // Ваше значение

    // Act
    const sut = Foo.Create(dao);

    // Assert
    expect(sut.isFailure).toBeFalsy();
    expect(sut.value).toBeInstanceOf(Foo);
  });
});
`;

describe('ValueObject Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: ValueObjectOptions = {
      name: '/identity/user/foo',
      skipImport: true,
      spec: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('value-object', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find(
        (filename) => filename === '/context/identity/user/value-object/foo.ts',
      ),
    ).toBeDefined();
    expect(
      files.find(
        (filename) =>
          filename === '/context/identity/user/value-object/foo.spec.ts',
      ),
    ).toBeDefined();
    expect(
      tree.readContent('/context/identity/user/value-object/foo.ts'),
    ).toEqual(valueObject);
    expect(
      tree.readContent('/context/identity/user/value-object/foo.spec.ts'),
    ).toEqual(valueObjectSpec);
  });
});
