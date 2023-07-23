import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting';
import { Location, NameParser } from '../../utils/name.parser';
import { mergeSourceRoot } from '../../utils/source-root.helpers';
import { CommandOptions } from './command.schema';

const ELEMENT_METADATA = 'events';
const ELEMENT_TYPE = 'event';

export function main(options: CommandOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([mergeSourceRoot(options), mergeWith(generate(options))]),
    )(tree, context);
  };
}

function transform(source: CommandOptions): CommandOptions {
  const target: CommandOptions = Object.assign({}, source);
  target.metadata = ELEMENT_METADATA;
  target.type = ELEMENT_TYPE;

  const location: Location = new NameParser().parse(target);
  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.aggregate = normalizeToKebabOrSnakeCase(
    target.path.split('/').reverse()[0],
  );
  target.path = join('context' as Path, target.path as Path, 'commands');
  return target;
}

function generate(options: CommandOptions) {
  return (context: SchematicContext) =>
    apply(url('./files' as Path), [
      template({
        ...strings,
        ...options,
      }),
      move(options.path),
    ])(context);
}
