import { DomainEvent, DomainEventDAO } from '@core/domain-event';
import { <%= classify(name) %> } from './<%= name %>.event';

describe('<%= classify(name) %> ', () => {
  it('should be defined', () => {
    // Arrange
    const dao: DomainEventDAO<null> = {
      event_id: '1-2-3-4-5',
      entity_type: 'Any',
      entity_id: '2-2-3-2-2',
      event_data: null,
      event_date: 3600,
      event_type: '<%= classify(name) %>',
    };

    // Act
    const sut = DomainEvent.From(dao);

    // Assert
    expect(sut).toBeInstanceOf(<%= classify(name) %>);
  });
});
   
