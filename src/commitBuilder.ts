/**
 * Interface untuk data form commit yang dikirim dari webview
 * Merepresentasikan input user dari form webview
 */
export interface FormData {
    /** Required: commit type (feat, fix, dll) */
    type: string;
    /** Optional: commit scope (e.g., api, ui, auth) */
    scope: string;
    /** Required: commit subject (max 72 chars) */
    subject: string;
    /** Optional: commit body untuk deskripsi detail */
    body: string;
}

/**
 * Class untuk menyusun commit message berdasarkan format Conventional Commits
 * 
 * Design Decision: Menggunakan dedicated builder class untuk separation of concerns.
 * Commit message formatting logic terpisah dari UI dan communication logic,
 * making it easier to test dan maintain.
 * 
 * Format yang dihasilkan mengikuti Conventional Commits specification:
 * type(scope): subject
 * 
 * body
 */
export class CommitBuilder {
    /**
     * Menyusun commit message lengkap dari form data
     * Main entry point untuk commit message generation
     * 
     * @param formData Data dari form webview
     * @returns String commit message yang sudah diformat sesuai Conventional Commits
     */
    public buildCommitMessage(formData: FormData): string {
        // Format header (type, scope, subject)
        const header = this.formatHeader(formData.type, formData.scope, formData.subject);
        
        // Jika body tidak kosong, tambahkan dengan separator baris kosong
        // Conventional Commits spec requires blank line between header and body
        if (formData.body && formData.body.trim()) {
            const body = this.formatBody(formData.body);
            // Double newline creates blank line separator
            return `${header}\n\n${body}`;
        }
        
        // Return header only jika body kosong
        return header;
    }

    /**
     * Format header commit message
     * Menghasilkan first line dari commit message sesuai Conventional Commits format
     * 
     * Format:
     * - Dengan scope: type(scope): subject
     * - Tanpa scope: type: subject
     * 
     * @param type Commit type (feat, fix, dll)
     * @param scope Commit scope (optional)
     * @param subject Commit subject
     * @returns Formatted header string
     */
    private formatHeader(type: string, scope: string, subject: string): string {
        // Trim whitespace dan lowercase untuk type
        // Type harus lowercase sesuai Conventional Commits convention
        const cleanType = type.trim().toLowerCase();
        const cleanScope = scope.trim();
        const cleanSubject = subject.trim();
        
        // Format dengan scope jika ada, tanpa scope jika kosong
        // Scope ditulis dalam parentheses setelah type
        if (cleanScope) {
            return `${cleanType}(${cleanScope}): ${cleanSubject}`;
        }
        
        // Format tanpa scope jika scope kosong
        return `${cleanType}: ${cleanSubject}`;
    }

    /**
     * Format body commit message
     * Memproses body text dengan minimal formatting
     * 
     * Design Decision: Preserve line breaks dan formatting dari user input
     * karena body sering berisi bullet points, paragraphs, atau code snippets
     * yang memerlukan formatting khusus.
     * 
     * @param body Commit body text
     * @returns Formatted body string dengan line breaks preserved
     */
    private formatBody(body: string): string {
        // Trim whitespace di awal dan akhir, preserve line breaks di tengah
        // Ini menghilangkan extra whitespace tanpa merusak formatting user
        return body.trim();
    }
}
