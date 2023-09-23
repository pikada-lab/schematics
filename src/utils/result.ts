export interface R<T> {
  readonly isFailure: boolean;
  readonly error: string;
  value: T;
}

export class Result<T> implements R<T> {
  readonly isFailure: boolean;
  readonly error: string;

  private readonly result: T;

  get value(): T {
    if (this.isFailure) {
      throw new Error('Обращение к заведомо некорректному значению');
    }
    return this.result;
  }

  private constructor(value: T, isFailure = false, error = '') {
    this.result = value;
    this.isFailure = isFailure;
    this.error = error;
  }

  static success<T>(value: T): Result<T> {
    return new Result(value);
  }

  static failure<T>(error: string): Result<T> {
    return new Result(null, true, error);
  }

  static reFailure<A, B>(result: Result<A>): Result<B> {
    if (Result.isResultNoType<B>(result)) {
      return result;
    }
    throw new Error(
      'Неправильное использование функции, функция может оборачивать только неудачный результат',
    );
  }

  private static isResultNoType<T>(result): result is Result<T> {
    if (!result.isFailure) {
      return false;
    }
    return true;
  }
}
