# Быстрый запуск Input Code Generator

1. Открой папку с package.json и .vscode этого расширения.
2. Установи зависимости: `npm install`.
3. Собери: `npm run compile`.
4. При необходимости установи рекомендованный обработчик сообщений esbuild из .vscode/extensions.json.
5. Нажми F5 и дождись Extension Development Host.
6. Во втором окне вызови **Input Generator: Generate C++ Input** через палитру команд.
7. Введи `n int; a int[n]` и проверь новую вкладку C++.

Для отладки поставь точку останова в parser.ts или generator.ts и вызови команду снова. После правок сохрани файлы и перезапусти отладку. Не редактируй результат сборки в dist вручную.

`npm run compile-tests` создаёт out; `npm test` запускает тестовый редактор. Текущий тест src/test — пример каркаса. Наши функциональные проверки запускаются командой npm run test:logic.

Пошаговый разбор: user-version/TUTORIAL.md. Объяснение всех файлов: user-version/FILES_EXPLAINED.md. Для упаковки сначала согласуй engines.vscode и @types/vscode, затем используй vsce package.
