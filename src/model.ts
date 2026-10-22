//создаем типы для удобства хранения
export type InputType = 'int' | 'double' | 'string';

/**
 * Одна запись схемы: обычная переменная или одномерный массив.
 * Поле kind позволяет отличить варианты; размер size есть только у массива.
 * size хранит имя переменной размера, например 'n', а не число элементов.
 */
export type Declaration =
    | { kind: 'scalar'; name: string; type: InputType }
    | { kind: 'array'; name: string; type: InputType; size: string };
//размер массива обязателен, не используем одну общую структуру, для удобства парсера