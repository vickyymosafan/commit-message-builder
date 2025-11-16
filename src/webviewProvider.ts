import * as vscode from 'vscode';
import { SchemaManager } from './schemaManager';
import { MessageHandler } from './messageHandler';
import { CommitBuilder } from './commitBuilder';

/**
 * Class untuk mengelola Webview Panel lifecycle
 * Bertanggung jawab untuk membuat webview, generate HTML content, dan setup message handling
 */
export class WebviewProvider {
    private context: vscode.ExtensionContext;
    private schemaManager: SchemaManager;
    private panel: vscode.WebviewPanel | undefined;
    private messageHandler: MessageHandler | undefined;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext, schemaManager: SchemaManager) {
        this.context = context;
        this.schemaManager = schemaManager;
        this.outputChannel = vscode.window.createOutputChannel('Conventional Commit');
    }

    /**
     * Buat dan tampilkan Webview Panel
     * Configure webview options dan setup message handling
     */
    public createWebview(): void {
        // Buat WebviewPanel dengan vscode.window.createWebviewPanel()
        this.panel = vscode.window.createWebviewPanel(
            'conventionalCommit', // View type identifier
            'Buat Conventional Commit', // Panel title
            vscode.ViewColumn.One, // Show in editor column one
            {
                // Webview options
                enableScripts: true, // Enable JavaScript dalam webview
                retainContextWhenHidden: true, // Retain context saat webview hidden
                localResourceRoots: [this.context.extensionUri] // Restrict resource access
            }
        );

        // Set HTML content dengan memanggil getHtmlContent()
        this.panel.webview.html = this.getHtmlContent(this.panel.webview);

        // Setup message handling dengan memanggil setupMessageHandling()
        this.setupMessageHandling(this.panel);

        // Handle panel disposal
        this.panel.onDidDispose(() => {
            this.dispose();
        });

        this.outputChannel.appendLine('Webview created successfully');
    }

    /**
     * Generate HTML content untuk webview
     * Include CSP, CSS styling, dan JavaScript untuk form handling
     * @param webview Webview instance untuk CSP source
     * @returns HTML string lengkap
     */
    private getHtmlContent(webview: vscode.Webview): string {
        // Generate nonce untuk CSP
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Buat Conventional Commit</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
        }

        h1 {
            color: var(--vscode-foreground);
            font-size: 24px;
            margin-bottom: 20px;
        }

        h2 {
            color: var(--vscode-foreground);
            font-size: 18px;
            margin-top: 30px;
            margin-bottom: 15px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }

        input[type="text"],
        select,
        textarea {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            box-sizing: border-box;
        }

        input[type="text"]:focus,
        select:focus,
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .char-count {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .char-count.warning {
            color: var(--vscode-editorWarning-foreground);
        }

        button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: 600;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button:active {
            background-color: var(--vscode-button-hoverBackground);
            opacity: 0.9;
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        #result {
            margin-top: 30px;
            padding: 20px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }

        #result.hidden {
            display: none;
        }

        #commitMessage {
            background-color: var(--vscode-textCodeBlock-background);
            color: var(--vscode-textPreformat-foreground);
            padding: 12px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 15px 0;
            border: 1px solid var(--vscode-panel-border);
        }

        #copyButton {
            margin-right: 10px;
        }

        #copyFeedback {
            color: var(--vscode-testing-iconPassed);
            font-weight: 600;
        }

        #copyFeedback.hidden {
            display: none;
        }

        .error-message {
            padding: 12px;
            background-color: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
            margin-top: 15px;
        }

        .error-message.hidden {
            display: none;
        }

        .required {
            color: var(--vscode-errorForeground);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Buat Conventional Commit</h1>
        
        <form id="commitForm">
            <div class="form-group">
                <label for="type">Type <span class="required">*</span></label>
                <select id="type" required>
                    <option value="">Pilih type commit...</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="scope">Scope</label>
                <input type="text" id="scope" placeholder="contoh: api, ui, auth">
            </div>
            
            <div class="form-group">
                <label for="subject">Subject <span class="required">*</span></label>
                <input type="text" id="subject" maxlength="72" required placeholder="Deskripsi singkat perubahan">
                <span class="char-count" id="charCount">0/72</span>
            </div>
            
            <div class="form-group">
                <label for="body">Body</label>
                <textarea id="body" rows="5" placeholder="Deskripsi detail perubahan (opsional)"></textarea>
            </div>
            
            <button type="submit">Buat Commit</button>
        </form>
        
        <div id="result" class="hidden">
            <h2>Hasil Commit Message</h2>
            <pre id="commitMessage"></pre>
            <button id="copyButton">Salin Commit</button>
            <span id="copyFeedback" class="hidden">✓ Tersalin!</span>
        </div>
        
        <div id="error" class="error-message hidden"></div>
    </div>

    <script nonce="${nonce}">
        (function() {
            const vscode = acquireVsCodeApi();
            
            // Get form elements
            const form = document.getElementById('commitForm');
            const typeSelect = document.getElementById('type');
            const scopeInput = document.getElementById('scope');
            const subjectInput = document.getElementById('subject');
            const bodyTextarea = document.getElementById('body');
            const charCount = document.getElementById('charCount');
            const resultDiv = document.getElementById('result');
            const commitMessagePre = document.getElementById('commitMessage');
            const copyButton = document.getElementById('copyButton');
            const copyFeedback = document.getElementById('copyFeedback');
            const errorDiv = document.getElementById('error');

            // Kirim message 'webviewReady' saat DOM loaded
            vscode.postMessage({ command: 'webviewReady' });

            // Setup message listener untuk menerima data dari extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'schemaData':
                        handleSchemaData(message.data);
                        break;
                    case 'commitResult':
                        handleCommitResult(message.data);
                        break;
                    case 'error':
                        handleError(message.data);
                        break;
                }
            });

            // Handler untuk message 'schemaData': populate dropdown
            function handleSchemaData(schema) {
                if (!schema || !schema.types || !Array.isArray(schema.types)) {
                    showError('Format schema tidak valid');
                    return;
                }

                // Clear existing options except first
                typeSelect.innerHTML = '<option value="">Pilih type commit...</option>';
                
                // Populate dropdown dengan types dari schema
                schema.types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.label;
                    typeSelect.appendChild(option);
                });
            }

            // Handler untuk message 'commitResult': display result
            function handleCommitResult(commitMessage) {
                commitMessagePre.textContent = commitMessage;
                resultDiv.classList.remove('hidden');
                errorDiv.classList.add('hidden');
                
                // Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Handler untuk message 'error': display error
            function handleError(errorMessage) {
                showError(errorMessage);
            }

            // Setup form submit event listener
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validasi type tidak kosong
                if (!typeSelect.value) {
                    showError('Silakan pilih type commit');
                    return;
                }
                
                // Validasi subject tidak kosong
                if (!subjectInput.value.trim()) {
                    showError('Subject tidak boleh kosong');
                    return;
                }
                
                // Hide error dan result
                errorDiv.classList.add('hidden');
                resultDiv.classList.add('hidden');
                
                // Kumpulkan form data
                const formData = {
                    type: typeSelect.value,
                    scope: scopeInput.value,
                    subject: subjectInput.value,
                    body: bodyTextarea.value
                };
                
                // Kirim message 'submitForm' dengan form data
                vscode.postMessage({
                    command: 'submitForm',
                    data: formData
                });
            });

            // Setup character counter untuk subject
            subjectInput.addEventListener('input', () => {
                const length = subjectInput.value.length;
                charCount.textContent = length + '/72';
                
                // Change color jika mendekati limit (>60 chars)
                if (length > 60) {
                    charCount.classList.add('warning');
                } else {
                    charCount.classList.remove('warning');
                }
            });

            // Setup copy to clipboard functionality
            copyButton.addEventListener('click', async () => {
                try {
                    const text = commitMessagePre.textContent;
                    await navigator.clipboard.writeText(text);
                    
                    // Display success feedback selama 3 detik
                    copyFeedback.classList.remove('hidden');
                    setTimeout(() => {
                        copyFeedback.classList.add('hidden');
                    }, 3000);
                } catch (error) {
                    showError('Gagal menyalin ke clipboard. Silakan copy manual.');
                }
            });

            // Helper function untuk display error
            function showError(message) {
                errorDiv.textContent = '❌ ' + message;
                errorDiv.classList.remove('hidden');
                
                // Auto-hide error setelah 5 detik
                setTimeout(() => {
                    errorDiv.classList.add('hidden');
                }, 5000);
            }
        })();
    </script>
</body>
</html>`;
    }

    /**
     * Generate random nonce untuk CSP
     * @returns Random nonce string
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Setup message handling untuk komunikasi dengan webview
     * Buat MessageHandler dan setup listener untuk incoming messages
     * @param panel WebviewPanel instance
     */
    private setupMessageHandling(panel: vscode.WebviewPanel): void {
        // Buat instance CommitBuilder
        const commitBuilder = new CommitBuilder();

        // Buat instance MessageHandler dengan panel, CommitBuilder, dan SchemaManager
        this.messageHandler = new MessageHandler(
            panel,
            commitBuilder,
            this.schemaManager,
            this.outputChannel
        );

        // Setup webview.onDidReceiveMessage listener
        panel.webview.onDidReceiveMessage(
            message => {
                // Pass received messages ke MessageHandler.handleMessage()
                this.messageHandler?.handleMessage(message);
            },
            undefined,
            this.context.subscriptions
        );

        this.outputChannel.appendLine('Message handling setup complete');
    }

    /**
     * Dispose webview dan cleanup resources
     * Dipanggil ketika webview ditutup atau extension deactivate
     */
    public dispose(): void {
        this.outputChannel.appendLine('Disposing webview...');

        // Dispose WebviewPanel
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        // Cleanup MessageHandler reference
        this.messageHandler = undefined;

        this.outputChannel.appendLine('Webview disposed successfully');
    }
}
