// Проверяем учебный формат без запуска окна VS Code: Node.js предоставляет test/assert.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseSchema } = require('../out/parser');
const { generateCpp } = require('../out/generator');
const { CPP_KEYWORDS, SERVICE_NAMES } = require('../out/names');

test('Манифест связывает команду с новой последовательностью клавиш', () => {
    const manifest = require('../package.json');
    const binding = manifest.contributes.keybindings.find(item => item.command === 'inputGenerator.generate');
    assert.ok(manifest.contributes.commands.some(item => item.command === binding.command));
    assert.equal(binding.mac, 'cmd+shift+[Slash] [KeyG]');
    assert.equal(binding.key, 'ctrl+shift+[Slash] [KeyG]');
});

test('Простой разбор сохраняет типы, размер и порядок', () => {
    assert.deepEqual(parseSchema('n int; a int[n]; x double; word string'), [
        { kind: 'scalar', name: 'n', type: 'int' },
        { kind: 'array', name: 'a', type: 'int', size: 'n' },
        { kind: 'scalar', name: 'x', type: 'double' },
        { kind: 'scalar', name: 'word', type: 'string' }
    ]);
});
test('Пробелы вокруг записей, несколько обычных пробелов и одна завершающая ;', () => {
    assert.equal(parseSchema(' n   int ; words string[n]; ').length, 2);
});

const invalid = [
    '', '   ', ';', 'n int;;', ';n int', 'n int;;x int',
    'n', 'n int extra', 'n:int', 'n\tint',
    'n float', 'n INT', '1n int', 'имя int', 'a-b int',
    'n int;n double', 'a int[n];n int', 'a int[a]', 'a int[5]',
    'n double;a int[n]', 'n string;a int[n]', 'n int;a int[n];b int[a]',
    'n int;a int[]', 'n int;a int[n', 'n int;a int[n]]',
    'n int;a int[n][n]', 'n int;a int[n]junk', 'n int;a int[ n ]',
    'n int;a int[n+1]', 'a int]', 'n int;a int[[n]', '__x int', '_Name int'
];
for (const schema of invalid) {
    test(`Единая ошибка: ${JSON.stringify(schema)}`, () => {
        assert.throws(() => parseSchema(schema), { name: 'Error', message: 'Ошибка ввода' });
    });
}
test('Все ключевые слова и служебные имена запрещены', () => {
    for (const name of [...CPP_KEYWORDS, ...SERVICE_NAMES]) {
        assert.throws(() => parseSchema(`${name} int`), { message: 'Ошибка ввода' });
    }
});
test('Заголовки минимальны и не повторяются, индексы не конфликтуют с именами', () => {
    const scalar = generateCpp(parseSchema('x int;y double'));
    assert.deepEqual(scalar.match(/#include <[^>]+>/g), ['#include <iostream>']);
    const arrays = generateCpp(parseSchema('n int;a int[n];b double[n]'));
    assert.deepEqual(arrays.match(/#include <[^>]+>/g), ['#include <iostream>', '#include <vector>']);
    const strings = generateCpp(parseSchema('a string;b string'));
    assert.deepEqual(strings.match(/#include <[^>]+>/g), ['#include <iostream>', '#include <string>']);
    const code = generateCpp(parseSchema('n int;a string[n];i0 int;i1 int;b double[n]'));
    assert.deepEqual(code.match(/#include <[^>]+>/g), [
        '#include <iostream>', '#include <string>', '#include <vector>'
    ]);
    assert.match(code, /for \(int i2 = 0;/);
    assert.match(code, /for \(int i3 = 0;/);
    assert.ok(code.indexOf('std::cin >> n') < code.indexOf('std::vector<std::string> a'));
    assert.ok(code.lastIndexOf('#include') < code.indexOf('int main()'));
    assert.doesNotMatch(code, /TODO/);
});
test('Команда спрашивает один раз: Escape, пустая схема, ошибка, успех', async () => {
    let schema;
    let handler;
    let inputCount = 0;
    const documents = [];
    const errors = [];
    const fake = {
        commands: { registerCommand(id, callback) {
            assert.equal(id, 'inputGenerator.generate');
            handler = callback;
            return { dispose() {} };
        } },
        window: {
            async showInputBox() { inputCount++; return schema; },
            async showErrorMessage(message) { errors.push(message); },
            async showTextDocument(document) { assert.equal(document, documents.at(-1)); }
        },
        workspace: { async openTextDocument(document) { documents.push(document); return document; } }
    };
    // Подменяем только API vscode: алгоритмы и обработчик исполняются настоящие.
    const originalLoad = Module._load;
    let extension;
    try {
        Module._load = function(id, ...args) {
            return id === 'vscode' ? fake : originalLoad.call(this, id, ...args);
        };
        extension = require('../out/extension');
    } finally {
        Module._load = originalLoad;
    }
    const context = { subscriptions: [] };
    extension.activate(context);
    assert.equal(context.subscriptions.length, 1);
    await handler();
    assert.deepEqual(errors, []);
    assert.equal(documents.length, 0);
    schema = '';
    await handler();
    schema = 'n int;a float[n]';
    await handler();
    const message = 'Не удалось создать программу C++. Проверьте схему ввода: n int; a int[n].';
    assert.deepEqual(errors, [message, message]);
    assert.equal(documents.length, 0);
    schema = 'n int;a int[n]';
    await handler();
    assert.equal(documents.length, 1);
    assert.equal(documents[0].language, 'cpp');
    assert.match(documents[0].content, /std::vector<int> a\(n\)/);
    assert.equal(inputCount, 4);
});

const compilerAvailable = spawnSync('clang++', ['--version']).status === 0;
test('Созданный C++17 компилируется и читает числа, строки и пустые массивы', {
    skip: !compilerAvailable
}, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'simple-input-generator-'));
    try {
        const fixtures = [
            ['n int;a int[n];x double', '5 1 2 3 45 5 2.5', 'std::cout << a[3] << ":" << x;', '45:2.5'],
            ['n int;a int[n];x double', '0 7.5', 'std::cout << a.size() << ":" << x;', '0:7.5'],
            ['n int;a string[n];b double[n]', '2 red blue 1.5 2.5', 'std::cout << a[1] << ":" << b[0];', 'blue:1.5'],
            ['n int;a int[n];i0 int;i1 int;b int[n]', '2 10 20 30 40 50 60', 'std::cout << a[1] << ":" << i0 << ":" << b[1];', '20:30:60']
        ];
        for (const [schema, input, algorithm, expected] of fixtures) {
            const source = path.join(directory, 'solution.cpp');
            const binary = path.join(directory, 'solution');
            const code = generateCpp(parseSchema(schema)).replace('    return 0;', `    ${algorithm}\n    return 0;`);
            fs.writeFileSync(source, code);
            const build = spawnSync('clang++', ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-pedantic-errors', source, '-o', binary], { encoding: 'utf8' });
            assert.equal(build.status, 0, build.stderr);
            const run = spawnSync(binary, [], { input, encoding: 'utf8', timeout: 3000 });
            assert.equal(run.status, 0, run.stderr);
            assert.equal(run.stdout, expected);
        }
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
