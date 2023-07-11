import { normalize } from '@angular-devkit/core';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { ApplicationOptions } from '../application/application.schema';
import { ModuleOptions } from '../module/module.schema';
import { EventOptions } from './event.schema';

const fooClass = `import { UUID } from 'crypto';
import { AggregateEvent } from './event';
import { DomainEvent } from '@core/domain-event';

export interface FooDS {
    // declare here
}

export class Foo extends AggregateEvent<FooDS> {
  static Create(details: FooDS, id: UUID): Foo {
    return super.CreateDomainEvent(details, id, 'Foo');
  }
}

DomainEvent.CONSTRUCTORS.set('Foo', Foo);
`;

const fooBarClass = `import { UUID } from 'crypto';
import { AggregateEvent } from './event';
import { DomainEvent } from '@core/domain-event';

export interface FooBarDS {
    // declare here
}

export class FooBar extends AggregateEvent<FooBarDS> {
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
      name: 'foo',
      skipImport: true,
      spec: false,
      flat: false,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/foo/foo.event.spec.ts'),
    ).not.toBeDefined();
    expect(tree.readContent('/foo/foo.event.ts')).toEqual(fooClass);
  });
  it('should manage name has a path', async () => {
    const options: EventOptions = {
      name: 'bar/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/bar/foo/foo.event.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo/foo.event.ts')).toEqual(fooClass);
  });
  it('should manage name and path', async () => {
    const options: EventOptions = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar/foo/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/bar/foo/foo.event.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/bar/foo/foo.event.ts')).toEqual(fooClass);
  });
  it('should manage name to normalize', async () => {
    const options: EventOptions = {
      name: 'fooBar',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/foo-bar/foo-bar.event.ts'),
    ).toBeDefined();
    expect(
      files.find(
        (filename) => filename === '/foo-bar/foo-bar.event.spec.ts',
      ),
    ).toBeDefined();
    expect(tree.readContent('/foo-bar/foo-bar.event.ts')).toEqual(fooBarClass);
  });
  it('manage keep underscores in path', async () => {
    const options: EventOptions = {
      name: '_bar/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/_bar/foo/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find((filename) => filename === '/_bar/foo/foo.event.spec.ts'),
    ).toBeDefined();
    expect(tree.readContent('/_bar/foo/foo.event.ts')).toEqual(fooClass);
  });
  it("should keep underscores in event's path and file name", async () => {
    const options: EventOptions = {
      name: 'barBaz/foo',
      skipImport: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;
    expect(
      files.find((filename) => filename === '/bar-baz/foo/foo.event.ts'),
    ).toBeDefined();
    expect(
      files.find(
        (filename) => filename === '/bar-baz/foo/foo.event.spec.ts',
      ),
    ).toBeDefined();
    expect(tree.readContent('/bar-baz/foo/foo.event.ts')).toEqual(fooClass);
  }); 
  it('should create a spec file', async () => {
    const options: EventOptions = {
      name: 'foo',
      spec: true,
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.event.spec.ts'),
    ).not.toBeUndefined();
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: EventOptions = {
      name: 'foo',
      spec: true,
      specFileSuffix: 'test',
      flat: true,
    };
    const tree: UnitTestTree = await runner
      .runSchematicAsync('event', options)
      .toPromise();
    const files: string[] = tree.files;

    expect(
      files.find((filename) => filename === '/foo.event.spec.ts'),
    ).toBeUndefined();
    expect(
      files.find((filename) => filename === '/foo.event.test.ts'),
    ).not.toBeUndefined();
  });
});
