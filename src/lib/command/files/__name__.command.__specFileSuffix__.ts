import { UUID } from 'crypto';
import { <%= classify(aggregate) %> } from '../<%= aggregate %>';
import { Create<%= classify(aggregate) %> } from './create-<%= aggregate %>.command';
import { <%= classify(name) %> } from './<%= name %>.command';

const id = '1-2-3-4-5' as UUID;
const createCommand = new Create<%= classify(aggregate) %>({
  // INIT PARAMS
}, id);

describe('<%= classify(aggregate) %> - command: <%= classify(name) %>', () => {
  it('should be executed without side effect', () => {
    const sut = new <%= classify(aggregate) %>();
    const result = sut.process(createCommand);
    expect(result.isFailure).toBeFalsy();
    result.value.forEach((e) => sut.apply(e));
    expect(sut.getVersion()).toBe(1);

    const <%= camelize(name) %> = new <%= classify(name) %>({}, id);
    const result<%= classify(name) %> = sut.process(<%= camelize(name) %>);

    expect(result<%= classify(name) %>.error).toEqual('');
    expect(result<%= classify(name) %>.isFailure).toBeFalsy();
    expect(sut.getVersion()).toBe(1);
    expect(Array.isArray(result<%= classify(name) %>.value)).toBeTruthy();
    // expect(result<%= classify(name) %>.value).toHaveLength(1);
    // expect(result<%= classify(name) %>.value[0]).toBeInstanceOf(PUSH_YOUR_EVENT_INSTANCE)
  });
});
