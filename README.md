# WhatsApp Baileys Automation

Aplikasi untuk mengirim pesan WhatsApp otomatis menggunakan Baileys library.

## Fitur

- 🔗 Koneksi ke WhatsApp Web menggunakan QR Code
- 📱 Interface web yang user-friendly
- 💬 Kirim pesan ke nomor target
- 💾 Session tersimpan otomatis
- 🔄 Auto-reconnect jika terputus
- 🚪 Logout dan clear session

## Instalasi

1. Clone atau download project ini
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Jalankan server:
   \`\`\`bash
   npm start
   \`\`\`

4. Buka browser dan akses: `http://localhost:3000`

## Cara Penggunaan

1. **Koneksi WhatsApp:**
   - Jalankan aplikasi
   - Scan QR Code yang muncul dengan WhatsApp di HP
   - Tunggu hingga status berubah menjadi "Terhubung"

2. **Kirim Pesan:**
   - Masukkan nomor target (format: 08xxx atau 628xxx)
   - Tulis pesan yang ingin dikirim
   - Klik "Kirim Pesan"

3. **Logout:**
   - Klik tombol "Logout" untuk memutus koneksi
   - Session akan dihapus dan perlu scan QR Code lagi

## Struktur Folder

\`\`\`
├── server.js          # Server utama dengan Baileys
├── public/
│   └── index.html     # Interface web
├── sessions/          # Folder session (auto-generated)
├── package.json       # Dependencies
└── README.md         # Dokumentasi
\`\`\`

## API Endpoints

- `GET /api/status` - Cek status koneksi dan QR Code
- `POST /api/send-message` - Kirim pesan
- `POST /api/logout` - Logout dan clear session

## Catatan

- Session akan tersimpan di folder `sessions/`
- Aplikasi akan auto-reconnect jika koneksi terputus
- Format nomor otomatis disesuaikan (menambah kode negara 62)
- QR Code akan refresh otomatis jika expired
