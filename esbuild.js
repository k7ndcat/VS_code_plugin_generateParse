// Сборщик объединяет исходники и преобразует TypeScript в JavaScript.
const esbuild = require("esbuild");

// Флаги передаются npm-скриптами package и watch:esbuild.
const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
// Формат сообщений согласован с $esbuild-watch в tasks.json.
// Строки [watch] оставляем как есть: по ним отладчик узнаёт о завершении сборки.
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

// В режиме watch процесс остаётся активным и пересобирает изменённый код.
async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true, // Включить импортированные локальные модули в один файл.
		format: 'cjs', // Формат модуля для нашей точки входа Extension Host.
		minify: production, // Для установочного пакета уменьшаем код.
		sourcemap: !production, // Для отладки связываем JavaScript с исходным TypeScript.
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'], // API редактора загрузится из VS Code, не из bundle.
		logLevel: 'silent',
		plugins: [
			/* Обработчик сообщений сборки для панели Problems. */
			esbuildProblemMatcherPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose(); // После разовой сборки освобождаем контекст.
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
