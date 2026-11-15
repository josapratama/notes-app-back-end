# Bookshelf & Notes RESTful API 📚

> Proyek RESTful API Bookshelf compliant dengan seluruh Kriteria Pengujian Dicoding Indonesia (Backend Developer Path).

---

## 🛠️ Tech Stack & Spesifikasi

- **Runtime**: Node.js v20+ / Bun
- **Framework**: [@hapi/hapi](https://hapi.dev/) v21
- **Identifier**: [nanoid](https://github.com/ai/nanoid)
- **Port**: `5000` (atau sesuai konfigurasi `process.env.PORT`)
- **CORS**: Enabled (`*`)

---

## 📋 Fitur & Kriteria API

1. **Menyimpan Buku (`POST /books`)**:
   - Validasi nama buku (`400 Bad Request` bila properti `name` kosong).
   - Validasi halaman baca (`400 Bad Request` jika `readPage > pageCount`).
   - Penentuan otomatis status `finished` (`pageCount === readPage`).
2. **Menampilkan Seluruh Buku (`GET /books`)**:
   - Menampilkan ringkasan buku (`id`, `name`, `publisher`).
   - Mendukung filter pencarian nama `?name=dicoding` (case-insensitive).
   - Mendukung filter status membaca `?reading=0` atau `?reading=1`.
   - Mendukung filter status selesai dibaca `?finished=0` atau `?finished=1`.
3. **Menampilkan Detail Buku (`GET /books/{bookId}`)**:
   - Menampilkan seluruh properti lengkap buku yang dicari.
   - Mengembalikan `404 Not Found` jika buku tidak ditemukan.
4. **Memperbarui Data Buku (`PUT /books/{bookId}`)**:
   - Memperbarui data buku dengan validasi `name` dan `readPage`.
   - Mengembalikan `404 Not Found` jika `bookId` tidak terdaftar.
5. **Menghapus Buku (`DELETE /books/{bookId}`)**:
   - Menghapus buku dari memory store.
   - Mengembalikan `404 Not Found` jika `bookId` tidak ditemukan.
6. **Health Check (`GET /health`)**:
   - Uptime, status server, dan total buku tersimpan.

---

## 🚀 Menjalankan Server

```bash
# Install dependencies
bun install
# atau
npm install

# Mode Development (auto-reload)
bun run start:dev

# Mode Production
bun run start:prod
```
