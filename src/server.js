const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "books.json");

function loadBooksFromFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content) || [];
    }
  } catch (err) {
    console.error("Error reading books data file, fallback to empty array", err);
  }
  return [];
}

function saveBooksToFile(books) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving books to file", err);
  }
}

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  let books = loadBooksFromFile();

  server.route({
    method: "GET",
    path: "/",
    handler: () => {
      return {
        message: "Bookshelf REST API Server",
        status: "online",
        documentation: "/docs",
        endpoints: {
          books: "/books",
          health: "/health",
        },
      };
    },
  });

  server.route({
    method: "GET",
    path: "/health",
    handler: () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        totalBooks: books.length,
        persistence: "active",
      };
    },
  });

  server.route({
    method: "GET",
    path: "/docs",
    handler: (request, h) => {
      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bookshelf API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
    .container { max-width: 900px; margin: auto; }
    h1 { color: #38bdf8; margin-bottom: 8px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-right: 8px; }
    .get { background: #0284c7; color: white; }
    .post { background: #16a34a; color: white; }
    .put { background: #d97706; color: white; }
    .delete { background: #dc2626; color: white; }
    pre { background: #0f172a; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; color: #a5f3fc; }
    .desc { color: #94a3b8; font-size: 14px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 Bookshelf REST API Documentation</h1>
    <p style="color: #94a3b8; margin-bottom: 24px;">Dicoding Indonesia Backend Developer Submission Compliant API</p>

    <div class="card">
      <span class="badge post">POST</span> <strong>/books</strong>
      <p class="desc">Menyimpan data buku baru.</p>
      <pre>Payload: { "name": "Buku A", "year": 2020, "author": "John", "summary": "Deskripsi", "publisher": "Gramedia", "pageCount": 100, "readPage": 50, "reading": false }</pre>
    </div>

    <div class="card">
      <span class="badge get">GET</span> <strong>/books</strong>
      <p class="desc">Mengambil seluruh ringkasan buku. Mendukung query filter:</p>
      <pre>Query parameters: ?name=dicoding &reading=1 &finished=0</pre>
    </div>

    <div class="card">
      <span class="badge get">GET</span> <strong>/books/{bookId}</strong>
      <p class="desc">Mengambil rincian detail satu buku berdasarkan ID.</p>
    </div>

    <div class="card">
      <span class="badge put">PUT</span> <strong>/books/{bookId}</strong>
      <p class="desc">Memperbarui data buku berdasarkan ID.</p>
    </div>

    <div class="card">
      <span class="badge delete">DELETE</span> <strong>/books/{bookId}</strong>
      <p class="desc">Menghapus data buku berdasarkan ID.</p>
    </div>

    <div class="card">
      <span class="badge get">GET</span> <strong>/health</strong>
      <p class="desc">Server uptime and database status check.</p>
    </div>
  </div>
</body>
</html>`;
      return h.response(html).type("text/html");
    },
  });

  // Kriteria 3: Menyimpan buku
  server.route({
    method: "POST",
    path: "/books",
    handler: (request, h) => {
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload || {};

      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal menambahkan buku. Mohon isi nama buku",
          })
          .code(400);
      }

      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      const id = nanoid();
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year: Number(year),
        author,
        summary,
        publisher,
        pageCount: Number(pageCount),
        readPage: Number(readPage),
        finished,
        reading: Boolean(reading),
        insertedAt,
        updatedAt,
      };

      books.push(newBook);
      saveBooksToFile(books);

      return h
        .response({
          status: "success",
          message: "Buku berhasil ditambahkan",
          data: {
            bookId: id,
          },
        })
        .code(201);
    },
  });

  // Kriteria 4: Menampilkan seluruh buku (mendukung query name, reading, finished)
  server.route({
    method: "GET",
    path: "/books",
    handler: (request, h) => {
      const { name, reading, finished } = request.query;

      let filteredBooks = books;

      if (name !== undefined) {
        filteredBooks = filteredBooks.filter((book) =>
          book.name.toLowerCase().includes(name.toLowerCase())
        );
      }

      if (reading !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => Number(book.reading) === Number(reading)
        );
      }

      if (finished !== undefined) {
        filteredBooks = filteredBooks.filter(
          (book) => Number(book.finished) === Number(finished)
        );
      }

      const booksOverview = filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));

      return h
        .response({
          status: "success",
          data: {
            books: booksOverview,
          },
        })
        .code(200);
    },
  });

  // Kriteria 5: Menampilkan detail buku
  server.route({
    method: "GET",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h
          .response({
            status: "fail",
            message: "Buku tidak ditemukan",
          })
          .code(404);
      }

      return h
        .response({
          status: "success",
          data: {
            book,
          },
        })
        .code(200);
    },
  });

  // Kriteria 6: Mengubah data buku
  server.route({
    method: "PUT",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
      } = request.payload || {};

      if (!name) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
          .code(400);
      }

      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }

      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
          .code(404);
      }

      const updatedAt = new Date().toISOString();
      books[index] = {
        ...books[index],
        name,
        year: Number(year),
        author,
        summary,
        publisher,
        pageCount: Number(pageCount),
        readPage: Number(readPage),
        reading: Boolean(reading),
        updatedAt,
        finished: pageCount === readPage,
      };

      saveBooksToFile(books);

      return h
        .response({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
        .code(200);
    },
  });

  // Kriteria 7: Menghapus buku
  server.route({
    method: "DELETE",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const { bookId } = request.params;
      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }

      books.splice(index, 1);
      saveBooksToFile(books);

      return h
        .response({
          status: "success",
          message: "Buku berhasil dihapus",
        })
        .code(200);
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
