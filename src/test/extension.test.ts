import * as assert from 'assert';

// Это демонстрационный тест каркаса: он проверяет indexOf, а не наш генератор.
// Здесь можно импортировать API редактора и добавить проверки команд.
import * as vscode from 'vscode';
// Для тестирования экспортов расширения: import * as extension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
