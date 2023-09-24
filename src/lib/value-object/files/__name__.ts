import { Result } from '@core/result';
import { ValueObject } from '@core/value-object';

// Отмена структурной типизации
declare const nameType: unique symbol;

export class <%= classify(name) %> extends ValueObject<string> {
  [nameType]: void;

  public static Create(value: any): Result<<%= classify(name) %>> {
    if (typeof value !== 'string') {
      return Result.failure('Значение должно быть строкой'); // Задайте ограничения
    }
    value = value.trim(); // Задайте трансформации
    return Result.success(new <%= classify(name) %>(value));
  }
}
