import * as vscode from 'vscode';

/**
 * Extension activation function
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Conventional Commit Helper extension is now active');

    // Register the command
    const disposable = vscode.commands.registerCommand('conventionalCommit.buat', () => {
        vscode.window.showInformationMessage('Conventional Commit Helper activated!');
    });

    context.subscriptions.push(disposable);
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate() {
    // Cleanup resources if needed
}
