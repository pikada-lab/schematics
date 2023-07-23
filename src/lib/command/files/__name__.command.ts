import { <%= classify(aggregate) %>Command } from './command';

export interface <%= classify(name) %>Props {
  // Your props
}

export class <%= classify(name) %> extends <%= classify(aggregate) %>Command<<%= classify(name) %>Props> {}
