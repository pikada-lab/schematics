import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { CommandOptions } from './command.schema';

const commandClass = `import { UUID } from 'crypto';
import { Command } from '@core/command';

export class UserCommand<DATA> extends Command<DATA> {
  constructor(data: DATA, id: UUID) {
    super(data, 'User', id);
  }
}
`;

const fooClass = `import { UserCommand } from './command';

export interface FooProps {
  // Your props
}

export class Foo extends UserCommand<FooProps> {}
`;
 
describe('command Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: CommandOptions = {
      name: '/identity/user/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('command', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find(
        (filename) =>
          filename === '/context/identity/user/commands/foo.command.ts',
      ),
    ).toBeDefined();
    expect(
      tree.readContent('/context/identity/user/commands/foo.command.ts'),
    ).toEqual(fooClass);
  });
  it('should manage name has a path', async () => {
    const options: CommandOptions = {
      name: '/identity/user/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('command', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find(
        (filename) =>
          filename === '/context/identity/user/commands/foo.command.ts',
      ),
    ).toBeDefined();
    expect(
      files.find(
        (filename) => filename === '/context/identity/user/commands/command.ts',
      ),
    ).toBeDefined();
    expect(
      tree.readContent('/context/identity/user/commands/foo.command.ts'),
    ).toEqual(fooClass);
    expect(
      tree.readContent('/context/identity/user/commands/command.ts'),
    ).toEqual(commandClass);
  });
});
