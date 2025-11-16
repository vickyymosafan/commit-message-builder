import * as vscode from 'vscode';
import { SchemaManager } from './schemaManager';
import { WebviewProvider } from './webviewProvider';

/**
 * Output channel untuk logging extension activities
 */
let outputChannel: vscode.OutputChannel;

/**
 * Extension activation function
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    // Buat output channel untuk logging
    outputChannel = vscode.window.createOutputChannel('Conventional Commit');
    outputChannel.appendLine('Conventional Commit Helper extension is now active');

    // Buat instance SchemaManager
    const schemaManager = new SchemaManager(context);

    // Register command 'conventionalCommit.buat'
    const disposable = vscode.commands.registerCommand('conventionalCommit.buat', () => {
        try {
            outputChannel.appendLine('Command "conventionalCommit.buat" executed');
            
            // Buat instance WebviewProvider dan panggil createWebview()
            const webviewProvider = new WebviewProvider(context, schemaManager);
            webviewProvider.createWebview();
            
            outputChannel.appendLine('Webview created successfully');
        } catch (error) {
            // Error handling: Display VS Code error notification
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const fullErrorMessage = `Gagal membuat webview: ${errorMessage}`;
            
            // Display error notification ke user
            vscode.window.showErrorMessage(fullErrorMessage);
            
            // Log error ke console dan output channel
            console.error('Error creating webview:', error);
            outputChannel.appendLine(`Error: ${fullErrorMessage}`);
            
            if (error instanceof Error && error.stack) {
                outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }
    });

    // Push command ke context.subscriptions
    context.subscriptions.push(disposable);
    
    outputChannel.appendLine('Extension activation complete');
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate(): void {
    // Cleanup resources
    if (outputChannel) {
        outputChannel.appendLine('Extension deactivating...');
        outputChannel.dispose();
    }
    
    // Return undefined untuk indicate cleanup complete
    return undefined;
}
