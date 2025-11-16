import * as vscode from 'vscode';
import { CommitBuilder, FormData } from './commitBuilder';
import { SchemaManager, CommitSchema } from './schemaManager';

/**
 * Interface untuk message yang dikirim antara extension dan webview
 * Menggunakan command pattern untuk structured communication
 */
export interface Message {
    /** Command identifier untuk routing */
    command: string;
    /** Optional data payload untuk message */
    data?: unknown;
}

/**
 * Message types sebagai string literals untuk type safety
 * 
 * Design Decision: Menggunakan union type untuk ensure type safety
 * dan autocomplete support saat handling messages.
 * 
 * Message flow:
 * - webviewReady: Webview → Extension (webview initialization complete)
 * - loadSchema: Webview → Extension (request schema data)
 * - submitForm: Webview → Extension (user submitted form)
 * - schemaData: Extension → Webview (send schema to populate dropdown)
 * - commitResult: Extension → Webview (send generated commit message)
 * - error: Extension → Webview (send error message)
 */
export type MessageCommand = 
    | 'webviewReady'    // Webview ready to receive data
    | 'loadSchema'      // Request to load schema
    | 'submitForm'      // Form submission with data
    | 'schemaData'      // Schema data response
    | 'commitResult'    // Commit message result
    | 'error';          // Error message

/**
 * Class untuk menangani komunikasi postMessage antara extension dan webview
 * Bertanggung jawab untuk routing messages dan koordinasi antara komponen
 * 
 * Design Decision: Centralized message handling untuk maintain single source
 * of truth untuk communication logic. Semua messages di-route melalui class ini
 * untuk consistent error handling dan logging.
 * 
 * Architecture: MessageHandler acts as mediator between webview dan business logic
 * (CommitBuilder, SchemaManager), implementing mediator pattern untuk loose coupling.
 */
export class MessageHandler {
    private panel: vscode.WebviewPanel;
    private commitBuilder: CommitBuilder;
    private schemaManager: SchemaManager;
    private outputChannel: vscode.OutputChannel;

    /**
     * Constructor untuk MessageHandler
     * @param panel Webview panel untuk sending messages
     * @param commitBuilder Builder untuk generate commit messages
     * @param schemaManager Manager untuk load schema data
     * @param outputChannel Output channel untuk logging
     */
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
     * Main entry point untuk message processing dari webview
     * 
     * Design Decision: Menggunakan switch statement untuk routing karena
     * lebih readable dan maintainable dibanding if-else chains atau
     * command pattern dengan registry.
     * 
     * @param message Message object dari webview
     */
    public handleMessage(message: Message): void {
        try {
            // Validasi message format sebelum processing
            // Type guard untuk ensure message structure valid
            if (!message || typeof message !== 'object' || !message.command) {
                this.outputChannel.appendLine('Error: Invalid message format received');
                this.sendToWebview('error', 'Format message tidak valid');
                return;
            }

            this.outputChannel.appendLine(`Received message: ${message.command}`);

            // Route berdasarkan command ke handler yang sesuai
            // Each handler is responsible untuk specific message type
            switch (message.command) {
                case 'webviewReady':
                    // Webview initialization complete, send schema data
                    this.handleWebviewReady();
                    break;

                case 'loadSchema':
                    // Explicit request untuk load schema (e.g., retry)
                    this.handleLoadSchema();
                    break;

                case 'submitForm':
                    // User submitted form, generate commit message
                    this.handleSubmitForm(message.data);
                    break;

                default:
                    // Unknown command, log warning tapi tidak error
                    // Ini memungkinkan forward compatibility dengan new commands
                    this.outputChannel.appendLine(`Warning: Unknown command: ${message.command}`);
                    break;
            }
        } catch (error) {
            // Error handling dengan logging untuk debugging
            // Catch-all untuk prevent extension crash dari unexpected errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error handling message: ${errorMessage}`);
            this.sendToWebview('error', `Terjadi kesalahan: ${errorMessage}`);
        }
    }

    /**
     * Kirim message ke webview
     * Wrapper untuk webview.postMessage dengan error handling
     * 
     * Design Decision: Centralized sending logic untuk consistent error handling
     * dan logging. Semua messages ke webview harus melalui method ini.
     * 
     * @param command Command type untuk message
     * @param data Data yang akan dikirim (optional)
     */
    public sendToWebview(command: string, data?: unknown): void {
        try {
            // Check jika webview sudah disposed
            // Webview bisa disposed jika user close panel atau extension deactivate
            if (!this.panel || !this.panel.webview) {
                this.outputChannel.appendLine('Error: Cannot send message, webview is disposed');
                return;
            }

            // Bungkus dalam Message object untuk consistent structure
            const message: Message = {
                command,
                data
            };

            // Kirim via postMessage API
            // postMessage adalah async tapi tidak return Promise, jadi tidak perlu await
            this.panel.webview.postMessage(message);
            this.outputChannel.appendLine(`Sent message: ${command}`);
        } catch (error) {
            // Handle error jika webview sudah disposed atau error lainnya
            // Graceful degradation: log error tapi tidak throw untuk avoid crash
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error sending message to webview: ${errorMessage}`);
        }
    }

    /**
     * Handle webviewReady command - trigger pengiriman schema data
     * Called ketika webview selesai initialize dan ready menerima data
     * 
     * Design Decision: Webview mengirim 'webviewReady' message untuk ensure
     * schema data dikirim setelah webview DOM ready. Ini prevent race condition
     * dimana data dikirim sebelum webview siap menerima.
     */
    private handleWebviewReady(): void {
        try {
            this.outputChannel.appendLine('Webview ready, loading schema...');
            // Delegate ke handleLoadSchema untuk load dan send schema
            this.handleLoadSchema();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error in handleWebviewReady: ${errorMessage}`);
            this.sendToWebview('error', 'Gagal memuat schema');
        }
    }

    /**
     * Handle loadSchema command - request schema dari SchemaManager
     * Load commit types schema dan send ke webview untuk populate dropdown
     */
    private handleLoadSchema(): void {
        try {
            // Load schema via SchemaManager (dengan fallback strategy)
            const schema: CommitSchema = this.schemaManager.loadSchema();
            this.outputChannel.appendLine(`Schema loaded with ${schema.types.length} types`);
            
            // Send schema data ke webview untuk populate dropdown
            this.sendToWebview('schemaData', schema);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error loading schema: ${errorMessage}`);
            // Send user-friendly error message dalam Bahasa Indonesia
            this.sendToWebview('error', 'Gagal memuat daftar type commit');
        }
    }

    /**
     * Handle submitForm command - validasi data dan panggil CommitBuilder
     * Process form submission dan generate commit message
     * 
     * Design Decision: Server-side validation sebagai defense in depth.
     * Meskipun webview sudah validasi, kita validate lagi di extension side
     * untuk ensure data integrity dan prevent malformed commit messages.
     * 
     * @param data FormData dari webview
     */
    private handleSubmitForm(data: unknown): void {
        try {
            // Validasi data structure
            // Type guard untuk ensure data adalah object
            if (!data || typeof data !== 'object') {
                this.outputChannel.appendLine('Error: Invalid form data');
                this.sendToWebview('error', 'Data form tidak valid');
                return;
            }

            // Cast ke FormData setelah validation
            const formData = data as FormData;

            // Validasi required fields: type
            // Type tidak boleh kosong karena required untuk commit message format
            if (!formData.type || !formData.type.trim()) {
                this.outputChannel.appendLine('Error: Type is required');
                this.sendToWebview('error', 'Type commit harus diisi');
                return;
            }

            // Validasi required fields: subject
            // Subject adalah deskripsi commit dan harus ada
            if (!formData.subject || !formData.subject.trim()) {
                this.outputChannel.appendLine('Error: Subject is required');
                this.sendToWebview('error', 'Subject commit harus diisi');
                return;
            }

            // Build commit message via CommitBuilder
            // CommitBuilder handles formatting logic
            this.outputChannel.appendLine('Building commit message...');
            const commitMessage = this.commitBuilder.buildCommitMessage(formData);
            
            // Log generated message untuk debugging
            this.outputChannel.appendLine(`Commit message created:\n${commitMessage}`);
            
            // Send result ke webview untuk display
            this.sendToWebview('commitResult', commitMessage);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.outputChannel.appendLine(`Error in handleSubmitForm: ${errorMessage}`);
            // Send user-friendly error message
            this.sendToWebview('error', 'Gagal membuat commit message');
        }
    }
}
