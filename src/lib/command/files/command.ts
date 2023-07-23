import { UUID } from 'crypto';
import { Command } from '@core/command';

export class <%= classify(aggregate) %>Command<DATA> extends Command<DATA> {
  constructor(data: DATA, id: UUID) {
    super(data, '<%= classify(aggregate) %>', id);
  }
}
