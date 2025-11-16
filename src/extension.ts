import * as vscode from 'vscode';
import { SchemaManager } from './schemaManager';
import { WebviewProvider } from './webviewProvider';

/**
 * Output channel untuk logging extension activities
 * Digunakan untuk debugging dan monitoring extension behavior
 */
let outputChannel: vscode.OutputChannel;

/**
 * Extension activation function
 * Called when the extension is activated by VS Code
 * 
 * Design Decision: Menggunakan lazy activation dengan onCommand event
 * untuk menghindari overhead saat VS Code startup. Extension hanya
 * diaktifkan ketika user menjalankan command.
 * 
 * @param context - Extension context yang menyediakan akses ke extension API
 */
export function activate(context: vscode.ExtensionContext) {
    // Buat output channel untuk logging
    // Output channel membantu debugging dengan menampilkan log di VS Code Output panel
    outputChannel = vscode.window.createOutputChannel('Conventional Commit');
    outputChannel.appendLine('Conventional Commit Helper extension is now active');

    // Buat instance SchemaManager untuk mengelola commit types schema
    // SchemaManager di-instantiate di sini agar bisa di-reuse untuk multiple webview instances
    const schemaManager = new SchemaManager(context);

    // Register command 'conventionalCommit.buat'
    // Command ini akan muncul di Command Palette dan bisa dipanggil oleh user
    const disposable = vscode.commands.registerCommand('conventionalCommit.buat', () => {
        try {
            outputChannel.appendLine('Command "conventionalCommit.buat" executed');
            
            // Buat instance WebviewProvider dan panggil createWebview()
            // Design Decision: Buat instance baru setiap kali command dipanggil
            // untuk memastikan state yang clean dan menghindari memory leaks
            const webviewProvider = new WebviewProvider(context, schemaManager);
            webviewProvider.createWebview();
            
            outputChannel.appendLine('Webview created successfully');
        } catch (error) {
            // Error handling: Display VS Code error notification
            // Gunakan type guard untuk safely extract error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const fullErrorMessage = `Gagal membuat webview: ${errorMessage}`;
            
            // Display error notification ke user
            // Menggunakan showErrorMessage untuk memberikan feedback langsung ke user
            vscode.window.showErrorMessage(fullErrorMessage);
            
            // Log error ke console dan output channel untuk debugging
            console.error('Error creating webview:', error);
            outputChannel.appendLine(`Error: ${fullErrorMessage}`);
            
            // Include stack trace jika tersedia untuk detailed debugging
            if (error instanceof Error && error.stack) {
                outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }
    });

    // Push command ke context.subscriptions
    // Ini memastikan command akan di-dispose ketika extension deactivate
    context.subscriptions.push(disposable);
    
    outputChannel.appendLine('Extension activation complete');
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated (VS Code shutdown, extension disable, dll)
 * 
 * Design Decision: Cleanup minimal karena VS Code akan otomatis dispose
 * semua resources yang di-register via context.subscriptions. Kita hanya
 * perlu cleanup resources yang dibuat di luar subscription system.
 */
export function deactivate(): void {
    // Cleanup resources yang tidak di-manage oleh context.subscriptions
    if (outputChannel) {
        outputChannel.appendLine('Extension deactivating...');
        // Dispose output channel untuk free memory
        outputChannel.dispose();
    }
    
    // Return undefined untuk indicate cleanup complete
    // VS Code extension API mengharapkan void atau Promise<void>
    return undefined;
}
