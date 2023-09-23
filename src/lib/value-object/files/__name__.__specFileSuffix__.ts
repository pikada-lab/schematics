import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %>', () => {
  it('should be defined', () => {
    // Arrange
    const value: string = "string";

    // Act
    const sut = <%= classify(name) %>.Create(value);

    // Assert
    expect(sut.isFailure).toBeFalsy();
    expect(sut.value).toBeInstanceOf(<%= classify(name) %>);
  });
  it('should be failure', () => {
    // Arrange
    const value: string = "T_T";

    // Act
    const sut = <%= classify(name) %>.Create(value);

    // Assert
    expect(sut.error).toEqual('');
    expect(sut.isFailure).toBeTruthy();
  });
});
