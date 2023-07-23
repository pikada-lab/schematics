import { <%= classify(name) %> } from './<%= name %>';

describe('<%= classify(name) %>', () => {
  it('should be defined', () => {
    // Arrange
    const dao: string = "string"; // Ваше значение

    // Act
    const sut = <%= classify(name) %>.Create(dao);

    // Assert
    expect(sut.isFailure).toBeFalsy();
    expect(sut.value).toBeInstanceOf(<%= classify(name) %>);
  });
});
