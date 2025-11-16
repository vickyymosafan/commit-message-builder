# Conventional Commit Helper

Extension VS Code untuk membuat Conventional Commit message dengan antarmuka Webview yang interaktif.

## Fitur

- Form interaktif untuk membuat commit message
- Dukungan untuk semua type commit standar (feat, fix, docs, dll)
- Konfigurasi custom commit types melalui JSON schema
- Copy commit message ke clipboard
- Semua teks dalam Bahasa Indonesia

## Instalasi

### Dari VSIX

1. Download file `.vsix` dari release
2. Buka VS Code
3. Jalankan command: `code --install-extension conventional-commit-webview-0.0.1.vsix`
4. Atau melalui VS Code: Extensions → ... → Install from VSIX

## Cara Menggunakan

1. Buka Command Palette (`Ctrl+Shift+P` atau `Cmd+Shift+P`)
2. Ketik "Buat Conventional Commit"
3. Isi form yang muncul:
   - **Type**: Pilih type commit (feat, fix, docs, dll)
   - **Scope**: (Opsional) Scope dari perubahan (contoh: api, ui, auth)
   - **Subject**: Deskripsi singkat perubahan (maksimal 72 karakter)
   - **Body**: (Opsional) Deskripsi detail perubahan
4. Klik "Buat Commit"
5. Salin hasil commit message dengan tombol "Salin Commit"

## Konfigurasi Custom Commit Types

Anda dapat mengkustomisasi daftar commit types dengan membuat file `.vscode/commit-types.json` di workspace Anda:

```json
{
  "types": [
    { "id": "feat", "label": "✨ Fitur Baru" },
    { "id": "fix", "label": "🐛 Perbaikan Bug" },
    { "id": "docs", "label": "📝 Dokumentasi" },
    { "id": "style", "label": "💄 Styling" },
    { "id": "refactor", "label": "♻️ Refactoring" },
    { "id": "test", "label": "✅ Testing" },
    { "id": "chore", "label": "🔧 Chore" }
  ]
}
```

## Format Commit Message

Extension ini menghasilkan commit message sesuai dengan standar [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body
```

Contoh:
```
feat(auth): tambah login dengan Google OAuth

Implementasi OAuth 2.0 flow untuk login dengan akun Google.

Menambahkan dependency google-auth-library dan konfigurasi client ID.
```

## Troubleshooting

### Webview tidak muncul
- Pastikan VS Code versi 1.80.0 atau lebih tinggi
- Coba reload window: `Developer: Reload Window`

### Dropdown type kosong
- Periksa file `.vscode/commit-types.json` jika menggunakan custom schema
- Pastikan format JSON valid
- Extension akan menggunakan default types jika schema tidak valid

### Copy to clipboard gagal
- Pastikan browser/VS Code memiliki permission untuk clipboard
- Gunakan manual copy jika auto-copy gagal

## Development

### Build dari Source

```bash
npm install
npm run compile
```

### Package Extension

```bash
npm run package
```

### Install Local

```bash
npm run install-extension
```

## Requirements

- VS Code 1.80.0 atau lebih tinggi
- Node.js 18.x atau lebih tinggi

## License

MIT

## Kontribusi

Kontribusi selalu diterima! Silakan buat issue atau pull request.
