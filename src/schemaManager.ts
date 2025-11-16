import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface untuk tipe commit individual
 */
export interface CommitType {
  id: string;
  label: string;
}

/**
 * Interface untuk schema commit yang berisi array types
 */
export interface CommitSchema {
  types: CommitType[];
}

/**
 * Class untuk mengelola JSON schema commit types
 * Bertanggung jawab untuk loading, validasi, dan fallback schema
 */
export class SchemaManager {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Load schema dari workspace atau extension resources
   * @returns CommitSchema object
   */
  public loadSchema(): CommitSchema {
    try {
      // Coba baca dari workspace path
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const workspacePath = workspaceFolders[0].uri.fsPath;
        const schemaPath = path.join(workspacePath, '.vscode', 'commit-types.json');
        
        if (fs.existsSync(schemaPath)) {
          const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
          const schema = JSON.parse(schemaContent) as CommitSchema;
          
          if (this.validateSchema(schema)) {
            return schema;
          }
        }
      }

      // Fallback ke extension resources
      const extensionSchemaPath = path.join(this.context.extensionPath, 'resources', 'commit-types.json');
      if (fs.existsSync(extensionSchemaPath)) {
        const schemaContent = fs.readFileSync(extensionSchemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent) as CommitSchema;
        
        if (this.validateSchema(schema)) {
          return schema;
        }
      }
    } catch (error) {
      console.error('Error loading schema:', error);
    }

    // Jika semua gagal, gunakan default schema
    return this.getDefaultSchema();
  }

  /**
   * Validasi struktur schema
   * @param schema - Schema object yang akan divalidasi
   * @returns boolean hasil validasi
   */
  public validateSchema(schema: unknown): boolean {
    // Validasi bahwa schema memiliki properti types yang berupa array
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    const schemaObj = schema as Record<string, unknown>;
    
    if (!Array.isArray(schemaObj.types)) {
      return false;
    }

    // Validasi setiap CommitType memiliki id dan label
    for (const type of schemaObj.types) {
      if (!type || typeof type !== 'object') {
        return false;
      }
      const typeObj = type as Record<string, unknown>;
      if (!typeObj.id || typeof typeObj.id !== 'string') {
        return false;
      }
      if (!typeObj.label || typeof typeObj.label !== 'string') {
        return false;
      }
    }

    return true;
  }

  /**
   * Buat default schema dengan types standar
   * @returns CommitSchema dengan default types
   */
  public getDefaultSchema(): CommitSchema {
    return {
      types: [
        { id: 'feat', label: '✨ Fitur Baru' },
        { id: 'fix', label: '🐛 Perbaikan Bug' },
        { id: 'docs', label: '📝 Dokumentasi' },
        { id: 'style', label: '💄 Styling' },
        { id: 'refactor', label: '♻️ Refactoring' },
        { id: 'test', label: '✅ Testing' },
        { id: 'chore', label: '🔧 Chore' }
      ]
    };
  }
}
