import * as vscode from 'vscode';
import { CommitBuilder, FormData } from './commitBuilder';
import { SchemaManager, CommitSchema } from './schemaManager';

/**
 * Interface untuk message yang dikirim antara extension dan webview
 */
export interface Message {
    command: string;
    data?: unknown;
}

/**
 * Message types sebagai string literals untuk type safety
 */
export type MessageCommand = 
    | 'webviewReady'
    | 'loadSchema'
    | 'submitForm'
    | 'schemaData'
    | 'commitResult'
    | 'error';

/**
 * Class untuk menangani komunikasi postMessage antara extension dan webview
 * Bertanggung jawab untuk routing messages dan koordinasi antara komponen
 */
export class MessageHandler {
    private panel: vscode.WebviewPanel;
    private commitBuilder: CommitBuilder;
    private schemaManager: SchemaManager;
    private outputChannel: vscode.OutputChannel;

    constructor(
        panel: vscode.WebviewPanel,
        commitBuilder: CommitBuilder,
        schemaManager: SchemaManager,
        outputChannel: vscode.OutputChannel
    ) {
        this.panel = panel;
        this.commitBuilder = commitBuilder;
        this.schemaManager = schemaManager;
        this.outputChannel = outputChannel;
    }

    /**
     * Handle incoming messages dari webview dan route ke handler yang sesuai
     * @param message Message object dari webview
     */
    public handleMessage(message: Message): void {
        try {
            // Validasi message format
            if (!message || typeof message !== 'object' || !message.command) {
                this.outputChannel.appendLine('Error: Invalid message format received');
                this.sendToWebview('error', 'Format message tidak valid');
                return;
            }

            this.outputChannel.appendLine(`Received message: ${message.command}`);

            // Route berdasarkan command
            switch (message.command) {
                case 'webviewReady':
                    this.handleWebviewReady();
                    break;

                case 'loadSchema':
                    this.handleLoadSchema();
                    break;

                case 'submitForm':
                    this.handleSubmitForm(message.data);
                    break;

                default:
                    this.outputChannel.appendLine(`Warning: Unknown command: ${message.command}`);
                    break;
            }
        } catch (error) {
            // Error handling dengan logging
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error handling message: ${errorMessage}`);
            this.sendToWebview('error', `Terjadi kesalahan: ${errorMessage}`);
        }
    }

    /**
     * Kirim message ke webview
     * @param command Command type untuk message
     * @param data Data yang akan dikirim (optional)
     */
    public sendToWebview(command: string, data?: unknown): void {
        try {
            // Check jika webview sudah disposed
            if (!this.panel || !this.panel.webview) {
                this.outputChannel.appendLine('Error: Cannot send message, webview is disposed');
                return;
            }

            // Bungkus dalam Message object
            const message: Message = {
                command,
                data
            };

            // Kirim via postMessage
            this.panel.webview.postMessage(message);
            this.outputChannel.appendLine(`Sent message: ${command}`);
        } catch (error) {
            // Handle error jika webview sudah disposed atau error lainnya
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error sending message to webview: ${errorMessage}`);
        }
    }

    /**
     * Handle webviewReady command - trigger pengiriman schema data
     */
    private handleWebviewReady(): void {
        try {
            this.outputChannel.appendLine('Webview ready, loading schema...');
            this.handleLoadSchema();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error in handleWebviewReady: ${errorMessage}`);
            this.sendToWebview('error', 'Gagal memuat schema');
        }
    }

    /**
     * Handle loadSchema command - request schema dari SchemaManager
     */
    private handleLoadSchema(): void {
        try {
            const schema: CommitSchema = this.schemaManager.loadSchema();
            this.outputChannel.appendLine(`Schema loaded with ${schema.types.length} types`);
            this.sendToWebview('schemaData', schema);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error loading schema: ${errorMessage}`);
            this.sendToWebview('error', 'Gagal memuat daftar type commit');
        }
    }

    /**
     * Handle submitForm command - validasi data dan panggil CommitBuilder
     * @param data FormData dari webview
     */
    private handleSubmitForm(data: unknown): void {
        try {
            // Validasi data
            if (!data || typeof data !== 'object') {
                this.outputChannel.appendLine('Error: Invalid form data');
                this.sendToWebview('error', 'Data form tidak valid');
                return;
            }

            const formData = data as FormData;

            // Validasi required fields
            if (!formData.type || !formData.type.trim()) {
                this.outputChannel.appendLine('Error: Type is required');
                this.sendToWebview('error', 'Type commit harus diisi');
                return;
            }

            if (!formData.subject || !formData.subject.trim()) {
                this.outputChannel.appendLine('Error: Subject is required');
                this.sendToWebview('error', 'Subject commit harus diisi');
                return;
            }

            // Build commit message
            this.outputChannel.appendLine('Building commit message...');
            const commitMessage = this.commitBuilder.buildCommitMessage(formData);
            
            this.outputChannel.appendLine(`Commit message created:\n${commitMessage}`);
            this.sendToWebview('commitResult', commitMessage);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error in handleSubmitForm: ${errorMessage}`);
            this.sendToWebview('error', 'Gagal membuat commit message');
        }
    }
}
