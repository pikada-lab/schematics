import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting';
import { Location, NameParser, mergeSourceRoot } from '../../utils';
import { EventOptions } from './event.schema';

const ELEMENT_METADATA = 'events';
const ELEMENT_TYPE = 'event';

export function main(options: EventOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        mergeWith(generate(options)),
        // addDeclarationToModule(options),
      ]),
    )(tree, context);
  };
}

function transform(source: EventOptions): EventOptions {
  const target: EventOptions = Object.assign({}, source);
  target.metadata = ELEMENT_METADATA;
  target.type = ELEMENT_TYPE;

  const location: Location = new NameParser().parse(target);
  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);

  target.aggregate = normalizeToKebabOrSnakeCase(
    target.path.split('/').reverse()[0],
  );

  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    source.specFileSuffix || 'spec',
  );

  target.path = join('context' as Path, target.path as Path, 'events');
  return target;
}

function generate(options: EventOptions) {
  return (context: SchematicContext) =>
    apply(url('./files' as Path), [
      options.spec
        ? noop()
        : filter((path) => {
            const suffix = `.__specFileSuffix__.ts`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
