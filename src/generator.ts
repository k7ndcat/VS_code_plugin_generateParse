import { Declaration, InputType } from './model';

// Таблица переводит тип схемы в запись типа C++; все имена стандартной библиотеки
// используем с std::, поэтому пользовательская переменная cin им не помешает.
const CPP_TYPES: Record<InputType, string> = {
    int: 'int',
    double: 'double',
    string: 'std::string'
};
//InputType в шаблоне разрешённые ключи: 'int', 'double', 'string'; таблица

/** Создаёт C++17 из проверенной схемы; входные значения программы считаются корректными. */
export function generateCpp(declarations: readonly Declaration[]): string {
    // Set хранит уникальные значения: один заголовок не добавится дважды.
    const headers = new Set<string>(['iostream']);
    // возвращает массив всех имен, повторения уберутся
    const usedNames = new Set(declarations.map(declaration => declaration.name));
    const lines: string[] = [];
    let nextIndex = 0;

    for (const declaration of declarations) {
        const { name, type } = declaration;
        const cppType = CPP_TYPES[type];
        if (type === 'string') {
            headers.add('string');
        }

        if (declaration.kind === 'scalar') {
            lines.push(`    ${cppType} ${name};`, `    std::cin >> ${name};`, '');
        } else {
            headers.add('vector');
            let index: string;
            // Пробуем i0, i1, ... до первого свободного имени счётчика., делаем do чтобы индекс сам обновился
            do {
                index = `i${nextIndex++}`;
            } while (usedNames.has(index));
            usedNames.add(index);
            lines.push(
                `    std::vector<${cppType}> ${name}(${declaration.size});`,
                `    for (int ${index} = 0; ${index} < ${declaration.size}; ++${index}) {`,
                `        std::cin >> ${name}[${index}];`,
                '    }', ''
            );
        }
    }

    // Сначала заголовки, затем main и ввод, в конце — место для алгоритма.
    // \n в исходнике TypeScript обозначает перенос строки в готовом тексте C++.
    return [...headers].map(header => `#include <${header}>`).join('\n') +
        '\n\nint main() {\n' + lines.join('\n') +
        '\n    // TODO: напиши алгоритм задачи здесь.\n\n    return 0;\n}\n';
}
