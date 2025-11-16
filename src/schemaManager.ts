import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface untuk tipe commit individual
 * Merepresentasikan satu commit type dalam schema (e.g., feat, fix, docs)
 */
export interface CommitType {
  /** Identifier unik untuk commit type (digunakan dalam commit message) */
  id: string;
  /** Label yang ditampilkan di UI (bisa include emoji) */
  label: string;
}

/**
 * Interface untuk schema commit yang berisi array types
 * Top-level structure untuk commit types configuration
 */
export interface CommitSchema {
  /** Array of available commit types */
  types: CommitType[];
}

/**
 * Class untuk mengelola JSON schema commit types
 * Bertanggung jawab untuk loading, validasi, dan fallback schema
 * 
 * Design Decision: Menggunakan cascading fallback strategy untuk schema loading:
 * 1. Workspace-level schema (.vscode/commit-types.json)
 * 2. Extension-level schema (resources/commit-types.json)
 * 3. Hardcoded default schema
 * 
 * Ini memberikan fleksibilitas untuk project-specific configuration sambil
 * memastikan extension selalu berfungsi dengan default values.
 */
export class SchemaManager {
  private context: vscode.ExtensionContext;

  /**
   * Constructor untuk SchemaManager
   * @param context - Extension context untuk akses ke extension path
   */
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Load schema dari workspace atau extension resources
   * Menggunakan cascading fallback strategy untuk reliability
   * 
   * @returns CommitSchema object yang valid
   */
  public loadSchema(): CommitSchema {
    try {
      // Coba baca dari workspace path terlebih dahulu
      // Ini memungkinkan setiap project memiliki custom commit types
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        // Gunakan workspace folder pertama sebagai root
        const workspacePath = workspaceFolders[0].uri.fsPath;
        const schemaPath = path.join(workspacePath, '.vscode', 'commit-types.json');
        
        // Check file existence sebelum read untuk avoid ENOENT error
        if (fs.existsSync(schemaPath)) {
          const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
          const schema = JSON.parse(schemaContent) as CommitSchema;
          
          // Validasi schema sebelum return untuk ensure data integrity
          if (this.validateSchema(schema)) {
            return schema;
          }
        }
      }

      // Fallback ke extension resources jika workspace schema tidak ada atau invalid
      // Extension resources adalah default schema yang di-bundle dengan extension
      const extensionSchemaPath = path.join(this.context.extensionPath, 'resources', 'commit-types.json');
      if (fs.existsSync(extensionSchemaPath)) {
        const schemaContent = fs.readFileSync(extensionSchemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent) as CommitSchema;
        
        if (this.validateSchema(schema)) {
          return schema;
        }
      }
    } catch (error) {
      // Catch semua errors (file read, JSON parse, dll) dan fallback ke default
      // Ini memastikan extension tidak crash karena schema issues
      console.error('Error loading schema:', error);
    }

    // Jika semua gagal, gunakan default schema
    // Default schema adalah hardcoded fallback yang selalu tersedia
    return this.getDefaultSchema();
  }

  /**
   * Validasi struktur schema
   * Memastikan schema memiliki format yang benar sebelum digunakan
   * 
   * Design Decision: Menggunakan runtime validation karena schema di-load
   * dari external files yang bisa dimodifikasi user. Validation mencegah
   * runtime errors dari malformed schema.
   * 
   * @param schema - Schema object yang akan divalidasi
   * @returns boolean hasil validasi (true jika valid, false jika invalid)
   */
  public validateSchema(schema: unknown): boolean {
    // Validasi bahwa schema memiliki properti types yang berupa array
    // Type guard untuk ensure schema adalah object
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    // Cast ke Record untuk safe property access
    const schemaObj = schema as Record<string, unknown>;
    
    // Check bahwa types property exists dan berupa array
    if (!Array.isArray(schemaObj.types)) {
      return false;
    }

    // Validasi setiap CommitType memiliki id dan label
    // Iterate semua types untuk ensure data integrity
    for (const type of schemaObj.types) {
      // Type guard untuk ensure type adalah object
      if (!type || typeof type !== 'object') {
        return false;
      }
      const typeObj = type as Record<string, unknown>;
      
      // Validate required properties: id dan label harus string
      if (!typeObj.id || typeof typeObj.id !== 'string') {
        return false;
      }
      if (!typeObj.label || typeof typeObj.label !== 'string') {
        return false;
      }
    }

    // Semua validasi passed
    return true;
  }

  /**
   * Buat default schema dengan types standar
   * Digunakan sebagai fallback ketika custom schema tidak tersedia atau invalid
   * 
   * Design Decision: Default types mengikuti Conventional Commits standard
   * dengan label dalam Bahasa Indonesia dan emoji untuk visual clarity.
   * 
   * @returns CommitSchema dengan default types yang hardcoded
   */
  public getDefaultSchema(): CommitSchema {
    return {
      types: [
        { id: 'feat', label: '✨ Fitur Baru' },        // New features
        { id: 'fix', label: '🐛 Perbaikan Bug' },      // Bug fixes
        { id: 'docs', label: '📝 Dokumentasi' },       // Documentation changes
        { id: 'style', label: '💄 Styling' },          // Code style changes (formatting, etc)
        { id: 'refactor', label: '♻️ Refactoring' },   // Code refactoring
        { id: 'test', label: '✅ Testing' },           // Adding or updating tests
        { id: 'chore', label: '🔧 Chore' }             // Build process, tools, etc
      ]
    };
  }
}
