import * as vscode from 'vscode';
import { parseSchema } from './parser';
import { generateCpp } from './generator';


export async function generateInput(): Promise<void> {
    try {
        // await ждёт ответа пользователя, не блокируя работу редактора.
        const schema = await vscode.window.showInputBox({
            title: 'Input Code Generator',
            prompt: 'Введите схему: имя тип или имя тип[размер]. Типы: int, double, string',
            placeHolder: 'n int; a int[n]; x double',
            ignoreFocusOut: true
        });

        // Escape lдаёт undefined. Пустую строку после Enter проверит парсер;
        if (schema === undefined) {
            return;
        }

        const declarations = parseSchema(schema);
        const content = generateCpp(declarations);

        // Создать документ и показать его — два разных действия.
        // Без пути к файлу документ будет новым и несохранённым.
        const document = await vscode.workspace.openTextDocument({
            language: 'cpp',
            content
        });
        await vscode.window.showTextDocument(document);
    } catch {
        await vscode.window.showErrorMessage(
        'Не удалось создать программу C++. Проверьте схему ввода: n int; a int[n].'
    );}

}

/** VS Code вызывает activate при активации расширения, а не на каждый ввод схемы. */
export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand(
        'inputGenerator.generate', // Точно такой же ID объявлен в package.json.
        generateInput // Передаём функцию без (), чтобы вызвать её позднее.
    );
    // При деактивации VS Code освободит регистрацию из этого списка.
    context.subscriptions.push(disposable);
}
