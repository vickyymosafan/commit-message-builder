# Conventional Commit Helper

Extension VS Code yang membantu developer membuat Conventional Commit message melalui antarmuka Webview yang interaktif dan mudah digunakan.

## 📋 Overview

Conventional Commit Helper adalah extension VS Code yang menyediakan form interaktif untuk membuat commit message yang sesuai dengan standar [Conventional Commits](https://www.conventionalcommits.org/). Extension ini memudahkan developer untuk membuat commit message yang konsisten dan terstruktur tanpa perlu mengingat format atau aturan penulisan.

### Fitur Utama

- ✨ **Form Interaktif**: Antarmuka webview yang user-friendly untuk input commit message
- 🎨 **Terintegrasi dengan VS Code Theme**: Otomatis menyesuaikan dengan tema VS Code (light/dark)
- 📝 **Konfigurasi Fleksibel**: Mendukung custom commit types melalui JSON schema
- 🔄 **Real-time Validation**: Validasi input secara langsung dengan feedback yang jelas
- 📊 **Character Counter**: Menampilkan jumlah karakter subject dengan warning saat mendekati limit
- 📋 **Copy to Clipboard**: Salin commit message dengan satu klik
- 🌐 **Bahasa Indonesia**: Semua label dan pesan dalam Bahasa Indonesia

## 🚀 Instalasi

### Dari VSIX File

1. Download file VSIX dari release terbaru atau build sendiri (lihat bagian Build)
2. Buka VS Code
3. Tekan `Ctrl+Shift+P` (Windows/Linux) atau `Cmd+Shift+P` (Mac)
4. Ketik "Extensions: Install from VSIX"
5. Pilih file `conventional-commit-webview-0.0.1.vsix`
6. Restart VS Code jika diminta

### Instalasi via Command Line

```bash
code --install-extension conventional-commit-webview-0.0.1.vsix
```

## 📖 Cara Menggunakan

### Langkah-langkah Dasar

1. **Buka Command Palette**
   - Tekan `Ctrl+Shift+P` (Windows/Linux) atau `Cmd+Shift+P` (Mac)
   - Atau klik menu `View` → `Command Palette`

2. **Jalankan Command**
   - Ketik "Buat Conventional Commit"
   - Tekan Enter

3. **Isi Form Commit**
   - **Type** (Required): Pilih jenis commit dari dropdown
     - feat: Fitur baru
     - fix: Perbaikan bug
     - docs: Perubahan dokumentasi
     - style: Perubahan styling (formatting, whitespace, dll)
     - refactor: Refactoring code
     - test: Menambah atau memperbaiki test
     - chore: Perubahan build process atau tools
   
   - **Scope** (Optional): Komponen atau modul yang diubah
     - Contoh: `api`, `ui`, `auth`, `database`
   
   - **Subject** (Required): Deskripsi singkat perubahan (max 72 karakter)
     - Gunakan kalimat imperatif: "tambah" bukan "menambahkan"
     - Tidak perlu diakhiri dengan titik
     - Contoh: `tambah login dengan Google OAuth`
   
   - **Body** (Optional): Deskripsi detail perubahan
     - Jelaskan apa dan mengapa, bukan bagaimana
     - Bisa multi-line
     - Contoh: `Implementasi OAuth 2.0 flow untuk login dengan akun Google`

4. **Buat Commit Message**
   - Klik tombol "Buat Commit"
   - Hasil commit message akan ditampilkan di bawah form

5. **Salin Commit Message**
   - Klik tombol "Salin Commit"
   - Commit message sudah tersalin ke clipboard
   - Gunakan di terminal: `git commit -m "<paste>"`

### Contoh Penggunaan

#### Contoh 1: Commit dengan Scope
**Input:**
- Type: `feat`
- Scope: `auth`
- Subject: `tambah login dengan Google OAuth`
- Body: `Implementasi OAuth 2.0 flow untuk login dengan akun Google`

**Output:**
```
feat(auth): tambah login dengan Google OAuth

Implementasi OAuth 2.0 flow untuk login dengan akun Google
```

#### Contoh 2: Commit tanpa Scope
**Input:**
- Type: `fix`
- Scope: _(kosong)_
- Subject: `perbaiki error saat submit form kosong`
- Body: _(kosong)_

**Output:**
```
fix: perbaiki error saat submit form kosong
```

#### Contoh 3: Commit dengan Body Multi-line
**Input:**
- Type: `refactor`
- Scope: `api`
- Subject: `ubah struktur response API`
- Body:
  ```
  Mengubah format response API untuk konsistensi.
  
  - Tambah field status dan message
  - Wrap data dalam field data
  - Tambah error handling yang lebih baik
  ```

**Output:**
```
refactor(api): ubah struktur response API

Mengubah format response API untuk konsistensi.

- Tambah field status dan message
- Wrap data dalam field data
- Tambah error handling yang lebih baik
```

## ⚙️ Konfigurasi Custom Commit Types

Extension mendukung konfigurasi custom commit types melalui file JSON schema. Anda dapat mendefinisikan commit types sendiri sesuai kebutuhan project.

### Lokasi File Schema

Extension akan mencari file schema di lokasi berikut (berurutan):

1. **Workspace Level**: `.vscode/commit-types.json` (di root project)
2. **Extension Level**: `resources/commit-types.json` (default dari extension)

### Format File Schema

Buat file `.vscode/commit-types.json` di root project Anda dengan format berikut:

```json
{
  "types": [
    {
      "id": "feat",
      "label": "✨ Fitur Baru"
    },
    {
      "id": "fix",
      "label": "🐛 Perbaikan Bug"
    },
    {
      "id": "docs",
      "label": "📝 Dokumentasi"
    },
    {
      "id": "style",
      "label": "💄 Styling"
    },
    {
      "id": "refactor",
      "label": "♻️ Refactoring"
    },
    {
      "id": "test",
      "label": "✅ Testing"
    },
    {
      "id": "chore",
      "label": "🔧 Chore"
    },
    {
      "id": "perf",
      "label": "⚡ Performance"
    },
    {
      "id": "ci",
      "label": "👷 CI/CD"
    },
    {
      "id": "build",
      "label": "📦 Build"
    },
    {
      "id": "revert",
      "label": "⏪ Revert"
    }
  ]
}
```

### Properti Schema

- **id** (string, required): Identifier untuk commit type yang akan digunakan dalam commit message
- **label** (string, required): Label yang ditampilkan di dropdown UI (bisa menggunakan emoji)

### Contoh Custom Schema

Untuk project dengan kebutuhan khusus:

```json
{
  "types": [
    {
      "id": "feature",
      "label": "🎉 Feature Baru"
    },
    {
      "id": "bugfix",
      "label": "🔧 Bug Fix"
    },
    {
      "id": "hotfix",
      "label": "🚑 Hotfix"
    },
    {
      "id": "wip",
      "label": "🚧 Work in Progress"
    },
    {
      "id": "release",
      "label": "🚀 Release"
    }
  ]
}
```

## 🔄 Alur Kerja Extension

Berikut adalah alur kerja lengkap extension dari command activation hingga copy result:

```
1. User Activation
   └─> User menjalankan command "Buat Conventional Commit"
       └─> Extension System mengaktifkan extension

2. Webview Creation
   └─> WebviewProvider membuat Webview Panel
       └─> Generate HTML content dengan form
       └─> Setup message handling untuk komunikasi

3. Schema Loading
   └─> Webview mengirim message 'webviewReady'
       └─> SchemaManager membaca JSON schema
           ├─> Coba baca dari .vscode/commit-types.json
           ├─> Fallback ke resources/commit-types.json
           └─> Fallback ke default schema jika gagal
       └─> Extension mengirim schema data ke Webview
       └─> Webview populate dropdown dengan commit types

4. User Input
   └─> User mengisi form (type, scope, subject, body)
       └─> Real-time validation dan character counter
       └─> User klik tombol "Buat Commit"

5. Form Submission
   └─> Webview validasi input (type dan subject required)
       └─> Webview mengirim form data ke Extension via postMessage
           └─> MessageHandler menerima dan route message

6. Commit Message Generation
   └─> CommitBuilder menyusun commit message
       ├─> Format header: type(scope): subject
       ├─> Tambah body jika ada (dengan separator baris kosong)
       └─> Return formatted commit message

7. Result Display
   └─> Extension mengirim commit message ke Webview
       └─> Webview menampilkan hasil dalam code block
       └─> Webview menampilkan tombol "Salin Commit"

8. Copy to Clipboard
   └─> User klik tombol "Salin Commit"
       └─> Webview copy commit message ke clipboard
       └─> Display feedback "✓ Tersalin!" selama 3 detik
       └─> User dapat paste di terminal untuk commit
```

## 🔧 Troubleshooting

### Extension Tidak Muncul di Command Palette

**Penyebab**: Extension belum terinstall dengan benar atau VS Code perlu restart

**Solusi**:
1. Pastikan file VSIX sudah terinstall: `code --list-extensions | grep conventional-commit`
2. Restart VS Code
3. Coba install ulang extension

### Dropdown Type Commit Kosong

**Penyebab**: Schema tidak berhasil dimuat atau format schema tidak valid

**Solusi**:
1. Periksa file `.vscode/commit-types.json` jika ada
2. Pastikan format JSON valid (gunakan JSON validator)
3. Periksa VS Code Output Channel "Conventional Commit" untuk error log
4. Hapus file custom schema untuk menggunakan default schema

### Error "Gagal membuat webview"

**Penyebab**: Extension error saat membuat webview panel

**Solusi**:
1. Periksa VS Code Output Channel "Conventional Commit" untuk detail error
2. Pastikan VS Code versi 1.80.0 atau lebih tinggi
3. Coba reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
4. Reinstall extension

### Tombol "Salin Commit" Tidak Berfungsi

**Penyebab**: Clipboard API tidak tersedia atau browser security policy

**Solusi**:
1. Pastikan VS Code memiliki permission untuk akses clipboard
2. Coba copy manual dengan select text dan `Ctrl+C`
3. Update VS Code ke versi terbaru

### Character Counter Tidak Update

**Penyebab**: JavaScript error di webview

**Solusi**:
1. Reload webview dengan close dan buka ulang
2. Periksa browser console di webview: `Ctrl+Shift+P` → "Developer: Open Webview Developer Tools"
3. Report issue jika masalah persisten

### Custom Schema Tidak Terbaca

**Penyebab**: File path salah atau format schema tidak valid

**Solusi**:
1. Pastikan file berada di `.vscode/commit-types.json` (relative ke workspace root)
2. Validasi format JSON:
   ```json
   {
     "types": [
       { "id": "feat", "label": "Feature" }
     ]
   }
   ```
3. Periksa bahwa setiap type memiliki `id` dan `label`
4. Restart extension atau reload window setelah mengubah schema

### Extension Lambat atau Hang

**Penyebab**: Resource issue atau infinite loop

**Solusi**:
1. Close webview yang tidak digunakan
2. Periksa VS Code performance: `Ctrl+Shift+P` → "Developer: Show Running Extensions"
3. Disable extension lain yang mungkin conflict
4. Restart VS Code

## 🛠️ Development

### Prerequisites

- Node.js 18.x atau lebih tinggi
- npm 9.x atau lebih tinggi
- Visual Studio Code 1.80.x atau lebih tinggi
- TypeScript 5.x

### Build dari Source

```bash
# Clone repository
git clone <repository-url>
cd conventional-commit-webview

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode untuk development
npm run watch
```

### Package Extension

```bash
# Install vsce jika belum
npm install -g vsce

# Package menjadi VSIX
npm run package

# Output: conventional-commit-webview-0.0.1.vsix
```

### Testing

```bash
# Run linter
npm run lint

# Run tests (jika ada)
npm test
```

## 📝 Format Conventional Commits

Extension ini mengikuti standar [Conventional Commits](https://www.conventionalcommits.org/) dengan format:

```
<type>(<scope>): <subject>

<body>
```

### Type

Kategori perubahan yang dilakukan:

- **feat**: Fitur baru untuk user
- **fix**: Bug fix untuk user
- **docs**: Perubahan dokumentasi
- **style**: Perubahan formatting, whitespace, dll (tidak mengubah code logic)
- **refactor**: Refactoring code (tidak menambah fitur atau fix bug)
- **test**: Menambah atau memperbaiki test
- **chore**: Perubahan build process, tools, dependencies, dll

### Scope

Komponen atau modul yang diubah (optional):

- Contoh: `api`, `ui`, `auth`, `database`, `config`
- Gunakan nama yang konsisten dalam satu project

### Subject

Deskripsi singkat perubahan (max 72 karakter):

- Gunakan kalimat imperatif: "tambah" bukan "menambahkan"
- Tidak perlu huruf kapital di awal
- Tidak perlu diakhiri dengan titik
- Fokus pada **apa** yang berubah, bukan **bagaimana**

### Body

Deskripsi detail perubahan (optional):

- Jelaskan **apa** dan **mengapa**, bukan **bagaimana**
- Bisa multi-line
- Pisahkan dari subject dengan satu baris kosong
- Bisa include bullet points atau numbered list

## 📄 License

[Sesuaikan dengan license project Anda]

## 🤝 Contributing

[Sesuaikan dengan contribution guidelines project Anda]

## 📧 Support

Jika mengalami masalah atau memiliki pertanyaan:

1. Periksa bagian Troubleshooting di atas
2. Periksa VS Code Output Channel "Conventional Commit" untuk error log
3. [Buat issue di repository]

## 🎯 Roadmap

Fitur yang direncanakan untuk versi mendatang:

- [ ] Git integration untuk langsung commit
- [ ] History commit messages
- [ ] Template custom commit message
- [ ] Support multi-language
- [ ] Scope suggestions berdasarkan changed files
- [ ] Breaking changes field
- [ ] Co-authors support

---

**Dibuat dengan ❤️ untuk developer Indonesia**
