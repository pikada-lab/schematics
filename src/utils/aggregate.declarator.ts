import { Path } from '@angular-devkit/core';
import { capitalize, classify } from '@angular-devkit/core/src/utils/strings';
import { AggregateImportDeclarator } from './aggregate-import.declarator';
import { AggregateMetadataDeclarator } from './aggregate-metadata.declarator';

export interface DeclarationOptions {
  name: string;
  aggregate?: string;
  context?: string;
  metadata: string;
  type?: string;
  className?: string;
  path: Path;
  module: Path;
  symbol?: string;
  staticOptions?: {
    name: string;
    value: Record<string, any>;
  };
}

export class AggregateDeclarator {
  constructor(
    private imports: AggregateImportDeclarator = new AggregateImportDeclarator(),
    private metadata: AggregateMetadataDeclarator = new AggregateMetadataDeclarator(),
  ) {}

  public declareCommand(content: string, options: DeclarationOptions): string {
    options = this.computeSymbol(options);
    content = this.imports.declare(content, options);
    content = this.metadata.declareCommand(content, options);
    return content;
  }

  private computeSymbol(options: DeclarationOptions): DeclarationOptions {
    const target = Object.assign({}, options);
    if (options.className) {
      target.symbol = options.className;
    } else if (options.type !== undefined) {
      target.symbol = classify(options.name).concat(capitalize(options.type));
    } else {
      target.symbol = classify(options.name);
    }
    return target;
  }
}