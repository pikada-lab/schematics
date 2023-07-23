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
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { ValueObjectOptions } from './value-object.schema';

const ELEMENT_METADATA = 'events';
const ELEMENT_TYPE = 'event';

export function main(options: ValueObjectOptions): Rule {
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

function transform(source: ValueObjectOptions): ValueObjectOptions {
  const target: ValueObjectOptions = Object.assign({}, source);
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

  target.path = join('context' as Path, target.path as Path, 'value-object');
  return target;
}

function generate(options: ValueObjectOptions) {
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
