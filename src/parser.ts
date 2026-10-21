import { Declaration } from './model';
import { isValidName } from './names';

/** Формат: имя тип; имя тип[размер]. Любая неверная схема даёт одну ошибку. */
export function parseSchema(schema: string): Declaration[] {
    // Сначала получаем отдельные записи; внутренние пустые записи не удаляем  ['n int', ' a int[n]']
    const records = schema.trim().split(';'); //проверка на дурака, забывшего пробел
    if (records.length > 1 && records[records.length - 1].trim() === '') {
        records.pop(); // Разрешаем одну завершающую точку с запятой.
    }

    const declarations: Declaration[] = [];
    const declared = new Map<string, Declaration>();

    for (const record of records) {
        const parts = record.trim().split(' ').filter(part => part !== ''); //['a', 'int[n]']
        if (parts.length !== 2) {
            throw new Error('Ошибка ввода');
        }
        const name = parts[0];
        const typeParts = parts[1].split('[');
        const type = typeParts[0];
        
        //name      = "a"
        //typeParts = ["int", "n]"]
        //type      = "int"

        if (!isValidName(name) || declared.has(name)) {
            throw new Error('Ошибка ввода');
        }
        if (type !== 'int' && type !== 'double' && type !== 'string') {
            throw new Error('Ошибка ввода');
        }

        let declaration: Declaration;
        if (typeParts.length === 1) {
            declaration = { kind: 'scalar', name, type };
        } else {
            // У массива должна быть закрывающая в конце
            if (typeParts.length !== 2 || !typeParts[1].endsWith(']')) {
                throw new Error('Ошибка ввода');
            }
            const size = typeParts[1].slice(0, -1); // Убираем последнюю ].
            const source = declared.get(size);
            // Неверное имя размера тоже не найдётся среди допустимых объявлений.
            if (!source || source.kind !== 'scalar' || source.type !== 'int') {
                throw new Error('Ошибка ввода');
            }
            declaration = { kind: 'array', name, type, size };
        }

        // Текущую запись добавляем после проверок, чтобы запретить ссылки вперёд.
        declared.set(name, declaration);
        declarations.push(declaration);
    }
    return declarations;
}
