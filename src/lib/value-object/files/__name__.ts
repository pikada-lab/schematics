import { Result } from '@core/result';
import { ValueObject } from '@core/value-object';

declare const nameType: unique symbol;

export class <%= classify(name) %> extends ValueObject<string> {
  
  [nameType]: void; // Отмена структурной типизации

  public static Create(value: string): Resilt<<%= classify(name) %>> {
    if (typeof data !== 'string') {
      return Result.failure('Значение должно быть строкой'); // Задайте ограничения
    }
    value = value.trim(); // Задайте трансформации
    return Result.success(new <%= classify(name) %>(value));
  }
}
