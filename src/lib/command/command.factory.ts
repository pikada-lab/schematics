import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain, filter,
  mergeWith,
  move, noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting';
import {
  mergeSourceRoot,
  Location,
  NameParser,
  AggregateFinder,
  AggregateDeclarator,
  DeclarationOptions,
} from '../../utils';
import { CommandOptions } from './command.schema';

const ELEMENT_METADATA = 'command';
const ELEMENT_TYPE = 'command';

export function main(options: CommandOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        mergeWith(generate(options)),
        addDeclarationToAggregate(options),
      ]),
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

function addDeclarationToAggregate(options: CommandOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new AggregateFinder(tree).find({
      aggregate: options.aggregate,
      path: options.path as Path,
    });
    if (!options.module) {
      return tree;
    }
    options.className = strings.classify(options.name);
    const content = tree.read(options.module).toString();
    const declarator: AggregateDeclarator = new AggregateDeclarator();
    tree.overwrite(
      options.module,
      declarator.declareCommand(content, options as DeclarationOptions),
    );
    return tree;
  };
}