import { Result } from './result';

describe('Проверка результата некоторых вычеслений (концепция)', () => {
  it('Должен быть положительный результат', () => {
    // Arragne
    const normal = 'Нормально';

    // Act
    const sut = Result.success(normal);

    // Assert
    expect(sut.isFailure).toBeFalsy();
    expect(sut.value).toBe(normal);
  });
  it('Должен быть отрицательный результат', () => {
    // Arragne
    const err = 'ошибка';

    // Act
    const sut = Result.failure(err);

    // Assert
    expect(sut.isFailure).toBeTruthy();
    expect(sut.error).toBe(err);
  });
  it('Должен менять тип', () => {
    // Arragne
    const err = 'ошибка';
    const result = Result.failure<string>(err);

    // Act
    const sut = Result.reFailure<string, number>(result);

    // Assert
    expect(sut.isFailure).toBeTruthy();
    expect(sut.error).toBe(err);
  });
  it('Должен Выдавать ошибку, когда конвертируют успешный результат', () => {
    // Arragne
    const value = 'ошибка';
    const result = Result.success<string>(value);

    // Act
    const sut = () => Result.reFailure<string, number>(result);

    // Assert
    expect(sut).toThrowError();
  });
  it('Должен Выдавать ошибку когда обращаются к значению неудачного результата', () => {
    // Arragne
    const value = 'ошибка';
    const result = Result.failure<string>(value);

    // Act
    const sut = () => result.value;

    // Assert
    expect(sut).toThrowError();
  });
});
