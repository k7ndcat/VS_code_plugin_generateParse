# Input Code Generator

Расширение Visual Studio Code генерирует программу C++17 для чтения входных данных олимпиадной задачи. Пользователь задаёт схему переменных и одномерных массивов, а расширение открывает новый несохранённый документ с заголовками, main и операциями std::cin.

Версия: **0.0.2**. Команда: **Input Generator: Generate C++ Input**. ID: `inputGenerator.generate`.

## Содержание

- [Назначение и пример](#purpose)
- [Правила схемы и ограничения](#schema)
- [Установка зависимостей и сборка через терминал](#build)
- [Установка в VS Code](#install)
- [Как вызвать расширение](#invoke)
- [Примеры работы и ошибки](#examples)
- [Структура проекта](#structure)
- [Модель данных](#model)
- [Документация функций](#functions)
- [Проверки и история изменений](#checks)

<a id="purpose"></a>
## Назначение и пример

Для схемы:

```text
n int; a int[n]; x double
```

создаётся:

```cpp
#include <iostream>
#include <vector>

int main() {
    int n;
    std::cin >> n;

    std::vector<int> a(n);
    for (int i0 = 0; i0 < n; ++i0) {
        std::cin >> a[i0];
    }

    double x;
    std::cin >> x;

    return 0;
}
```

При запуске этой C++ программы можно ввести `5`, затем `1 2 3 45 5`, затем `2.5`. Первая переменная получает размер, вектор — пять элементов, x — последнее число. Расширение создаёт код ввода; алгоритм задачи и вывод нужно дописать перед return 0.

<a id="schema"></a>
## Правила схемы и ограничения

- Записи разделены `;`.
- Обычная переменная: `имя тип`, например `count int`.
- Одномерный массив: `имя тип[размер]`, например `a int[count]`.
- Между именем и типом требуется один или несколько обычных пробелов.
- Пробелы вокруг записей и одна завершающая `;` разрешены.
- Внутри `int[count]` пробелы не используются. Табуляция не заменяет разделяющий пробел.
- Поддерживаются int, double, string; массивы становятся std::vector соответствующего типа.
- Размер массива — имя ранее объявленной обычной переменной int, а не число и не выражение.
- Имена уникальны, регистр различается. Начало имени — латинская буква или _, далее также цифры.
- Ключевые слова C++, служебные std/main/EOF/NULL и зарезервированные сочетания подчёркиваний запрещены.
- Строковые значения читаются через >> до ближайшего пробельного символа.
- Настоящие входные данные C++ предполагаются корректными, размеры массивов — неотрицательными.

Пустой Enter считается ошибкой. Escape отменяет операцию без создания документа. При ошибке прекращается генерация, показывается одно сообщение:

```text
Не удалось создать программу C++. Проверьте схему ввода: n int; a int[n].
```

<a id="build"></a>
## Установка зависимостей и сборка через терминал

Понадобятся Node.js с npm и VS Code 1.140.0 или новее в ветке 1.x. Для проверки созданного C++ нужен clang++ либо другой компилятор C++17; для самой команды генерации компилятор не требуется.

Открой Terminal → New Terminal в VS Code. Перейди в папку, где находится package.json. После клонирования репозитория:

```sh
git clone https://github.com/k7ndcat/VS_code_plugin_generateParse.git
cd VS_code_plugin_generateParse
npm install
npm run compile
```

Если репозиторий уже открыт, повторно клонировать его не нужно: выполни последние две команды из его корня. compile последовательно запускает проверку типов, ESLint и esbuild; результат — dist/extension.js.

Установи официальный упаковщик один раз:

```sh
npm install -g @vscode/vsce
```

Из корня проекта создай пакет:

```sh
vsce package --skip-license --out releases/input-code-generator-0.0.2.vsix
```

Упаковщик сам вызовет vscode:prepublish → npm run package и соберёт production bundle. Флаг skip-license пропускает запрос о LICENSE, которого пока нет в учебном проекте. Команда package создаёт локальный файл и не публикует расширение в Marketplace.

Для следующих версий меняй version в package.json и имя выходного файла согласованно. Исходники, .vscode и node_modules в VSIX не включаются; точка входа dist/extension.js включается обязательно.

<a id="install"></a>
## Установка в VS Code

Готовый пакет находится в [releases/input-code-generator-0.0.2.vsix](releases/input-code-generator-0.0.2.vsix). Его можно скачать из репозитория либо собрать по инструкции выше.

**Через интерфейс редактора:**

1. Открой Extensions: Cmd+Shift+X на Mac или Ctrl+Shift+X на Windows/Linux.
2. Нажми «…» в заголовке панели.
3. Выбери Install from VSIX… / Установить из VSIX….
4. Выбери пакет версии 0.0.2 и подтверди установку или замену предыдущей версии.
5. Если требуется, выполни Developer: Reload Window из палитры команд.

**Через терминал**, если команда code добавлена в PATH:

```sh
code --install-extension ./releases/input-code-generator-0.0.2.vsix --force
```

На macOS команду code можно добавить через палитру: Shell Command: Install 'code' command in PATH. Для установки через интерфейс это не требуется.

Если терминал отвечает `zsh: command not found: code`, можно сразу использовать полный путь к CLI установленного редактора:

```sh
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension ./releases/input-code-generator-0.0.2.vsix --force
```

<a id="invoke"></a>
## Как вызвать расширение

### Палитра команд VS Code

Это командная консоль самого редактора:

1. Нажми Cmd+Shift+P на Mac или Ctrl+Shift+P на Windows/Linux.
2. Введи Input Generator: Generate C++ Input.
3. Выбери команду, введи схему и нажми Enter.
4. Сохрани созданную вкладку через Cmd+S или Ctrl+S как .cpp.

Терминальные команды выше собирают и устанавливают пакет. Обработчик inputGenerator.generate запускается внутри VS Code через палитру или горячие клавиши.

### Горячие клавиши

- **macOS:** нажми **Cmd+Shift+/**, отпусти все клавиши, затем нажми **G без модификаторов**.
- **Windows/Linux:** нажми **Ctrl+Shift+/**, отпусти клавиши, затем **G**.

Это последовательность из двух нажатий. Вторую клавишу нажимай сразу после первой: VS Code ограничивает время ожидания продолжения. Нажимается физическая клавиша Slash рядом с правым Shift, затем физическая G. В манифесте используются scan codes:

```json
"keybindings": [
  {
    "command": "inputGenerator.generate",
    "key": "ctrl+shift+[Slash] [KeyG]",
    "mac": "cmd+shift+[Slash] [KeyG]"
  }
]
```

Привязка рассчитана на физические клавиши. Она проверена в VS Code 1.141.0 при русской раскладке: редактор может отображать первую часть как ⇧⌘., поскольку на клавише Slash в этой раскладке находится точка. Нажимай ту же физическую клавишу рядом с правым Shift. Пользовательские keybindings или системные сочетания могут переопределить её; в таком случае команда остаётся доступна через палитру. Для диагностики открой Keyboard Shortcuts и найди inputGenerator.generate.

### Запуск во время разработки

Открой корень проекта в VS Code, нажми F5 / Fn+F5 и выбери Run Extension. Команду выполняй в новом окне Extension Development Host. При запросе неизвестного $esbuild-watch установи рекомендованный connor4312.esbuild-problem-matchers из .vscode/extensions.json.

<a id="examples"></a>
## Примеры работы и ошибки

| Схема или действие | Результат |
| --- | --- |
| `x int; y double` | Только iostream, объявления и чтение x/y |
| `word string` | iostream и string, чтение одного слова |
| `n int; a int[n]` | iostream и vector, чтение n и n элементов |
| `n int; words string[n]` | iostream, string, vector; массив строк |
| `n int; a int[n]; i0 int` | Индекс массива i1: i0 занят пользователем |
| `n   int ; a int[n] ;` | Допустимы пробелы и одна завершающая ; |
| `a int[n]; n int` | Ошибка: размер объявлен позже |
| `n double; a int[n]` | Ошибка: размер не int |
| `n int; a int[n]; b int[a]` | Ошибка: размер сам является массивом |
| `n int; n double` | Ошибка: повторное имя |
| `for int` или `x float` | Ошибка: имя или тип запрещены |
| `n int;;x int`, `n:int`, `a int[]` | Ошибка формата |
| Пустой Enter | Сообщение об ошибке, без нового документа |
| Escape | Отмена без сообщения |

Все ошибки схемы приводят к одинаковому уведомлению. Отрицательное числовое значение n относится к входу запущенной C++ программы, а не к схеме; его проверка не входит в текущую версию.

<a id="structure"></a>
## Структура проекта

```text
VS_code_plugin_generateParse/
├── src/
│   ├── extension.ts          # Команда, поле ввода, показ C++ документа
│   ├── parser.ts             # Разбор и проверки схемы
│   ├── generator.ts          # Сначала include, затем строки ввода
│   ├── model.ts              # InputType и Declaration
│   ├── names.ts              # Ключевые слова и допустимость имени
│   └── test/extension.test.ts # Демонстрационный тест каркаса Yeoman
├── test/logic.test.cjs        # Функциональные проверки логики и C++
├── releases/
│   └── input-code-generator-0.0.2.vsix
├── .vscode/
│   ├── launch.json           # Запуск Extension Development Host
│   ├── tasks.json            # Проверка типов и сборка перед F5
│   ├── extensions.json       # Рекомендации для разработчика
│   └── settings.json         # Настройки редактора проекта
├── .vscode-test.mjs           # Поиск тестов каркаса
├── package.json              # Команда, клавиши, зависимости и npm-сценарии
├── package-lock.json         # Зафиксированные версии зависимостей
├── tsconfig.json             # Настройки TypeScript
├── esbuild.js                # Сборка dist/extension.js
├── eslint.config.mjs         # Правила оформления TypeScript
├── .gitignore                # Исключения Git, кроме пакета в releases
├── .vscodeignore             # Исключения установочного пакета
├── README.md                 # Использование и документация функций
├── CHANGELOG.md              # Изменения версий
└── vsc-extension-quickstart.md
```

node_modules, dist и out создаются локально и не хранятся в Git. Готовый VSIX в releases хранится в репозитории. Отчёт лабораторной находится отдельно и не включается в Git или VSIX.

<a id="model"></a>
## Модель данных и связь функций

```ts
type InputType = 'int' | 'double' | 'string';

type Declaration =
    | { kind: 'scalar'; name: string; type: InputType }
    | { kind: 'array'; name: string; type: InputType; size: string };
```

kind различает обычную переменную и массив, size хранит имя размера. Типы служат проверке TypeScript при сборке, поэтому строка пользователя проверяется отдельными условиями парсера.

```text
activate → регистрирует generateInput
                         ↓ при вызове команды
                   showInputBox
                         ↓ строка схемы
                   parseSchema → isValidName
                         ↓ Declaration[]
                   generateCpp
                         ↓ текст C++
                   openTextDocument → showTextDocument
```

Парсер хранит порядок в массиве и предыдущие объявления в Map. Генератор первым проходом собирает массив зависимостей без повторений, заранее создаёт include, вторым — объявления и чтение. Отдельный Set занятых имён нужен только для выбора счётчиков.

<a id="functions"></a>
## Документация функций

<a id="names.isValidName"></a>
### names.isValidName

```ts
export function isValidName(name: string): boolean
```

Проверяет форму имени, зарезервированные сочетания подчёркиваний, ключевые слова C++ и служебные имена генератора. Дубликаты здесь не проверяются: это обязанность парсера.

**Arguments**:

- `name` _string_ — имя переменной или другого проверяемого идентификатора.

**Returns**:

- `boolean` — true, если имя разрешено; иначе false.

**Example**:

```ts
isValidName('count'); // true
isValidName('for');   // false
isValidName('2a');    // false
```

<a id="parser.parseSchema"></a>
### parser.parseSchema

```ts
export function parseSchema(schema: string): Declaration[]
```

Делит схему по ;, каждую запись по пробелам, описание типа — по [. Проверяет формат, уникальность имён, тип и ссылку массива на ранее объявленный scalar/int. Объект добавляется в Map и результат только после проверок.

**Arguments**:

- `schema` _string_ — строка записей, например n int; a int[n].

**Returns**:

- `Declaration[]` — проверенные описания в исходном порядке.

**Throws**:

- `Error('Ошибка ввода')` — любое нарушение схемы. Частичный результат не возвращается.

**Example**:

```ts
parseSchema('n int; a int[n]');
```

**Returns**:

```ts
[
  { kind: 'scalar', name: 'n', type: 'int' },
  { kind: 'array', name: 'a', type: 'int', size: 'n' }
]
```

**Example with error**:

```ts
parseSchema('n double; a int[n]'); // Error: Ошибка ввода
```

<a id="generator.generateCpp"></a>
### generator.generateCpp

```ts
export function generateCpp(declarations: readonly Declaration[]): string
```

Создаёт исходный код C++17. Первый проход собирает headers как массив iostream/string/vector и сразу формирует include. Основной проход использует kind/type для выбора строк, не меняя зависимости. Счётчики i0, i1 и далее не совпадают с пользовательскими именами. В конце добавляются return 0 и закрытие main; комментарий-заготовка не вставляется.

**Arguments**:

- `declarations` _readonly Declaration[]_ — проверенные объекты из parseSchema. Функция не меняет состав массива.

**Returns**:

- `string` — полная программа C++ с заголовками и вводом.

**Example**:

```ts
generateCpp(parseSchema('x int'));
```

**Returns**:

```cpp
#include <iostream>

int main() {
    int x;
    std::cin >> x;

    return 0;
}
```

<a id="extension.generateInput"></a>
### extension.generateInput

```ts
export async function generateInput(): Promise<void>
```

Обработчик пользовательской команды. Открывает одно поле showInputBox и ожидает схему. При undefined завершает отмену, пустую строку передаёт парсеру. После parseSchema и generateCpp создаёт документ языка cpp и показывает его. catch преобразует любую ошибку в общее уведомление.

**Arguments**:

- Нет аргументов. Ответ пользователя получается через API редактора.

**Returns**:

- `Promise<void>` — завершение асинхронной команды без полезного значения.

**Example**:

```ts
await vscode.commands.executeCommand('inputGenerator.generate');
```

Вызов выполняется внутри Extension Host VS Code, например из другого обработчика. В палитре пользователь выбирает видимое название Input Generator: Generate C++ Input. Обычный node не предоставляет модуль vscode.

**Result**:

- Корректная схема — новая несохранённая вкладка C++.
- Escape — завершение без вкладки.
- Ошибка — одно уведомление, генерация не продолжается.

<a id="extension.activate"></a>
### extension.activate

```ts
export function activate(context: vscode.ExtensionContext): void
```

Вызывается самим VS Code при активации расширения. Регистрирует generateInput под ID inputGenerator.generate, сохраняет Disposable в context.subscriptions для очистки при деактивации.

**Arguments**:

- `context` _vscode.ExtensionContext_ — контекст, предоставляемый редактором.

**Returns**:

- `void` — полезного возвращаемого значения нет.

**Example**:

```ts
activate(context); // этот вызов выполняет VS Code
```

generateInput передаётся в registerCommand без (), поскольку нужен обработчик для будущего вызова. Отдельная deactivate не требуется: регистрацию освобождает редактор.

<a id="build.main"></a>
### esbuild.main

```ts
async function main(): Promise<void>
```

Служебная функция esbuild.js, запускаемая Node.js при сборке. Создаёт контекст с entryPoints src/extension.ts, форматом cjs и выходом dist/extension.js. В режиме watch наблюдает за изменениями; при разовой сборке выполняет rebuild и dispose. Модуль vscode исключён из bundle, его предоставляет редактор.

**Arguments**:

- Нет. Режимы --production и --watch читаются из process.argv.

**Returns**:

- `Promise<void>` — завершение сборки либо подготовка watch-режима.

**Example**:

```sh
node esbuild.js
node esbuild.js --production
```

Для обычной разработки используй npm run compile: перед esbuild он также проверяет типы и стиль.

<a id="checks"></a>
## Проверки и история изменений

Дополнительные проверки разработчика:

```sh
npm run test:logic
```

Проверяются схемы, ошибки, уникальность заголовков, свободные счётчики и обработчик с подменой API. При установленном clang++ временные C++ программы компилируются и запускаются. Подмена API не заменяет ручной запуск в VS Code. src/test/extension.test.ts — оставшийся демонстрационный тест каркаса с indexOf, его успех не проверяет генератор.

Первый коммит: `dbbf018` — add input code generator extension. Изменения версий перечислены в [CHANGELOG.md](CHANGELOG.md). Актуальная история main доступна в [GitHub](https://github.com/k7ndcat/VS_code_plugin_generateParse/commits/main/).
