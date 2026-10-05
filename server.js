/**
 * Server lokal sederhana untuk STATISTIK CHALLENGE
 * Binding ke 0.0.0.0 agar bisa diakses dari HP/laptop lain di Wi-Fi yang sama.
 * Tidak butuh internet / database / dependency eksternal.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3000;
const HOST = "0.0.0.0";
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  return ips;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - File tidak ditemukan");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Hapus query string, contoh: /index.html?x=1
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath === "/") {
    urlPath = "/index.html";
  }

  // Cegah path traversal (../../)
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 - Akses ditolak");
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  const ips = getLocalIPs();

  console.log("");
  console.log("========================================");
  console.log("  STATISTIK CHALLENGE — Server Lokal");
  console.log("========================================");
  console.log("");
  console.log("  Laptop server : http://localhost:" + PORT);
  console.log("");

  if (ips.length === 0) {
    console.log("  IP lokal tidak ditemukan.");
    console.log("  Pastikan laptop terhubung ke Wi-Fi.");
  } else {
    console.log("  Akses dari HP (Wi-Fi yang sama):");
    ips.forEach((ip) => {
      console.log("  → http://" + ip + ":" + PORT);
    });
  }

  console.log("");
  console.log("  Tekan Ctrl+C untuk menghentikan server.");
  console.log("========================================");
  console.log("");
});
