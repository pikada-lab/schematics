import { DomainEvent } from '@core/domain-event';
import { UUID } from 'crypto';

export class <%= classify(aggregate) %>Event<DATA> extends DomainEvent<DATA> {
  static CreateDomainEvent<DATA>(
    data: DATA,
    entity_id: UUID,
    event_type: string,
  ): <%= classify(aggregate) %>Event<DATA> {
    return super.CreateBaseDomainEvent(data, event_type, '<%= classify(aggregate) %>', entity_id);
  }
}
