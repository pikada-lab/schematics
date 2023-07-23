import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { EventOptions } from './event.schema';

const eventClass = `import { DomainEvent } from '@core/domain-event';
import { UUID } from 'crypto';

export class UserEvent<DATA> extends DomainEvent<DATA> {
  static CreateDomainEvent<DATA>(
    data: DATA,
    entity_id: UUID,
    event_type: string,
  ): UserEvent<DATA> {
    return super.CreateBaseDomainEvent(data, event_type, 'User', entity_id);
  }
}
`

const fooClass = `import { UUID } from 'crypto';
import { UserEvent } from './event';
import { DomainEvent } from '@core/domain-event';

export interface FooDS {
    // declare here
}

export class Foo extends UserEvent<FooDS> {
  static Create(details: FooDS, id: UUID): Foo {
    return super.CreateDomainEvent(details, id, 'Foo');
  }
}

DomainEvent.CONSTRUCTORS.set('Foo', Foo);
`;

const fooBarClass = `import { UUID } from 'crypto';
import { UserEvent } from './event';
import { DomainEvent } from '@core/domain-event';

export interface FooBarDS {
    // declare here
}

export class FooBar extends UserEvent<FooBarDS> {
  static Create(details: FooBarDS, id: UUID): FooBar {
    return super.CreateDomainEvent(details, id, 'FooBar');
  }
}

DomainEvent.CONSTRUCTORS.set('FooBar', FooBar);
`;
describe('Event Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: EventOptions = {
      name: '/identity/user/foo',
      skipImport: true,
      spec: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.spec.ts'),
    ).not.toBeDefined();
    expect(tree.readContent('/context/identity/user/events/foo.event.ts')).toEqual(fooClass);
  });
  it('should manage name has a path', async () => {
    const options: EventOptions = {
      name: 'bar/identity/user/foo',
      context: 'identity',
      aggregate: 'user',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/context/bar/identity/user/events/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/context/bar/identity/user/events/foo.event.spec.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/context/bar/identity/user/events/event.ts'),
    ).toBeDefined();
    expect(tree.readContent('/context/bar/identity/user/events/foo.event.ts')).toEqual(fooClass);
    expect(tree.readContent('/context/bar/identity/user/events/event.ts')).toEqual(eventClass);
  });
  it('should manage name and path', async () => {
    const options: EventOptions = {
      name: 'foo',
      path: 'identity/user',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/context/identity/user/events/foo.event.ts')).toEqual(fooClass);
  });
  it('should manage name to normalize', async () => {
    const options: EventOptions = {
      name: '/identity/user/fooBar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo-bar.event.ts'),
    ).toBeDefined();
    expect(
      files.find(
        (filename) => filename === '/context/identity/user/events/foo-bar.event.spec.ts',
      ),
    ).toBeDefined();
    expect(tree.readContent('/context/identity/user/events/foo-bar.event.ts')).toEqual(fooBarClass);
  });
  it('manage keep underscores in path', async () => {
    const options: EventOptions = {
      name: '_bar/identity/user/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/context/_bar/identity/user/events/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/context/_bar/identity/user/events/foo.event.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/context/_bar/identity/user/events/foo.event.ts')).toEqual(fooClass);
  });
  it('should create a spec file', async () => {
    const options: EventOptions = {
      name: '/identity/user/foo',
      spec: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: EventOptions = {
      name: '/identity/user/foo',
      spec: true,
      specFileSuffix: 'test',
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/context/identity/user/events/foo.event.test.ts'),
    ).not.toBeUndefined();
  });
});
