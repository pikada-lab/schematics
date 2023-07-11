import { UUID } from 'crypto';
import { AggregateEvent } from './event';
import { DomainEvent } from '@core/domain-event';

export interface <%= classify(name) %>DS {
    // declare here
}

export class <%= classify(name) %> extends AggregateEvent<<%= classify(name) %>DS> {
  static Create(details: <%= classify(name) %>DS, id: UUID): <%= classify(name) %> {
    return super.CreateDomainEvent(details, id, '<%= classify(name) %>');
  }
}

DomainEvent.CONSTRUCTORS.set('<%= classify(name) %>', <%= classify(name) %>);
