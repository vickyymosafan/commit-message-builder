/**
 * Interface untuk data form commit yang dikirim dari webview
 */
export interface FormData {
    type: string;      // Required: commit type (feat, fix, dll)
    scope: string;     // Optional: commit scope
    subject: string;   // Required: commit subject (max 72 chars)
    body: string;      // Optional: commit body
}

/**
 * Class untuk menyusun commit message berdasarkan format Conventional Commits
 */
export class CommitBuilder {
    /**
     * Menyusun commit message lengkap dari form data
     * @param formData Data dari form webview
     * @returns String commit message yang sudah diformat
     */
    public buildCommitMessage(formData: FormData): string {
        const header = this.formatHeader(formData.type, formData.scope, formData.subject);
        
        // Jika body tidak kosong, tambahkan dengan separator baris kosong
        if (formData.body && formData.body.trim()) {
            const body = this.formatBody(formData.body);
            return `${header}\n\n${body}`;
        }
        
        return header;
    }

    /**
     * Format header commit message
     * @param type Commit type (feat, fix, dll)
     * @param scope Commit scope (optional)
     * @param subject Commit subject
     * @returns Formatted header string
     */
    private formatHeader(type: string, scope: string, subject: string): string {
        // Trim whitespace dan lowercase untuk type
        const cleanType = type.trim().toLowerCase();
        const cleanScope = scope.trim();
        const cleanSubject = subject.trim();
        
        // Format dengan scope jika ada, tanpa scope jika kosong
        if (cleanScope) {
            return `${cleanType}(${cleanScope}): ${cleanSubject}`;
        }
        
        return `${cleanType}: ${cleanSubject}`;
    }

    /**
     * Format body commit message
     * @param body Commit body text
     * @returns Formatted body string dengan line breaks preserved
     */
    private formatBody(body: string): string {
        // Trim whitespace di awal dan akhir, preserve line breaks
        return body.trim();
    }
}
