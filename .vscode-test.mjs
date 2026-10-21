// VS Code Test CLI запускает скомпилированные тесты из out/test.
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
});
