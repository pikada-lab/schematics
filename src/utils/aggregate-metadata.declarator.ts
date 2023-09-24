import { MetadataManager } from './metadata.manager';
import { DeclarationOptions } from './aggregate.declarator';

export class AggregateMetadataDeclarator {
  public declareCommand(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insertCommandToProcess(
      options.metadata,
      options.symbol,
    );
    const insertedFn = manager.insertProcessFunction(
      options.metadata,
      options.symbol,
      {
        name: options.aggregate,
        value: options,
      }
    );
    if (inserted.isFailure) {
      console.log(inserted.error);
    }
    if (insertedFn.isFailure) {
      console.log(insertedFn.error);
    }
    return insertedFn.isFailure && inserted.isFailure ? content : manager.getContent();
  }

  public declareEvent(content: string, options: DeclarationOptions): string {
    const manager = new MetadataManager(content);
    const inserted = manager.insertEventToApply(
      options.metadata,
      options.symbol,
    );
    const insertedFn = manager.insertApplyFunction(
      options.metadata,
      options.symbol,
    );
    if (inserted.isFailure) {
      console.log(inserted.error);
    }
    if (insertedFn.isFailure) {
      console.log(insertedFn.error);
    }
    return insertedFn.isFailure && inserted.isFailure ? content : manager.getContent();
  }
}