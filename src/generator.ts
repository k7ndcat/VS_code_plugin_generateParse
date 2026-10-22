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
    // Отдельный проход: собираем зависимости до генерации программы.
    const headers: string[] = ['iostream'];
    for (const declaration of declarations) {
        if (declaration.type === 'string' && !headers.includes('string')) {
            headers.push('string');
        }
        if (declaration.kind === 'array' && !headers.includes('vector')) {
            headers.push('vector');
        }
    }
    // Все include готовы заранее; в цикле генерации их больше не меняем.
    const includes = headers.map(header => `#include <${header}>`).join('\n');
    // возвращает массив всех имен, повторения уберутся
    const usedNames = new Set(declarations.map(declaration => declaration.name));
    const lines: string[] = [];
    let nextIndex = 0;

    for (const declaration of declarations) {
        const { name, type } = declaration;
        const cppType = CPP_TYPES[type];
        if (declaration.kind === 'scalar') {
            lines.push(`    ${cppType} ${name};`, `    std::cin >> ${name};`, '');
        } else {
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

    // Соединяем заранее готовые include, main и блок ввода.
    // \n в исходнике TypeScript обозначает перенос строки в готовом тексте C++.
    return includes +
        '\n\nint main() {\n' + lines.join('\n') +
        '\n    return 0;\n}\n';
}
