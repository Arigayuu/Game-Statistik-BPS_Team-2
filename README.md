# STATISTIK CHALLENGE

**Seberapa Jago Kamu Membaca Data?**

Web game sederhana untuk pengunjung yang menunggu pelayanan di **BPS Kota Palu**.

Game dijalankan di **1 laptop/PC kantor sebagai server lokal**. Perangkat lain (HP, tablet, laptop) yang terhubung ke **Wi-Fi kantor yang sama** dapat bermain lewat browser.

- Tidak butuh internet saat bermain
- Tidak butuh hosting / domain
- Tidak butuh database online
- Tidak butuh login

> Angka dalam soal adalah **data ilustrasi untuk game/prototype**, bukan data resmi BPS Kota Palu.

---

## Struktur Project

```text
statistik-challenge/
├── index.html
├── server.js
├── package.json
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── game.js
│   └── questions.js
├── data/
│   └── questions.json
└── assets/
```

---

## Cara Menjalankan (Laptop Server)

### 1. Pastikan Node.js sudah terpasang

Cek di terminal:

```bash
node -v
```

Jika belum ada, install Node.js LTS dari situs resmi Node.js.

### 2. Masuk ke folder project

```bash
cd statistik-challenge
```

### 3. Jalankan server

```bash
npm start
```

atau:

```bash
node server.js
```

Tidak perlu `npm install` karena server memakai modul bawaan Node.js saja.

### 4. Buka di laptop server

```text
http://localhost:3000
```

---

## Cara Akses dari HP (Wi-Fi Kantor)

### Prinsip

```text
HP Pengunjung
     |
     | Wi-Fi kantor
     v
Router Wi-Fi
     |
     v
Laptop/PC Server  →  http://IP-LAPTOP:3000
```

### 1. Pastikan semua perangkat di Wi-Fi yang sama

Laptop server dan HP pengunjung harus terhubung ke **SSID Wi-Fi yang sama**.

### 2. Cari IP laptop server (Windows)

Buka Command Prompt / PowerShell, lalu ketik:

```bash
ipconfig
```

Cari baris:

```text
IPv4 Address . . . . . . . . . . : 192.168.x.x
```

Contoh:

```text
192.168.1.10
```

Saat `npm start` dijalankan, IP lokal juga ditampilkan otomatis di terminal.

### 3. Buka dari HP

Di browser HP, ketik:

```text
http://192.168.1.10:3000
```

Ganti `192.168.1.10` dengan IP laptop server Anda.

---

## Troubleshooting

### HP tidak bisa membuka website

Cek satu per satu:

1. Server sudah berjalan? (`npm start`)
2. HP dan laptop berada di Wi-Fi yang sama?
3. URL memakai `http://` (bukan `https://`)?
4. IP laptop masih benar? (IP bisa berubah setelah reconnect Wi-Fi)
5. Firewall Windows memblokir port 3000?

### Firewall Windows

Jika dari HP tidak bisa akses, izinkan port 3000:

1. Buka **Windows Defender Firewall**
2. Pilih **Advanced settings**
3. **Inbound Rules** → **New Rule**
4. Pilih **Port** → **TCP** → **3000**
5. Allow the connection
6. Beri nama misalnya: `Statistik Challenge`

Atau (PowerShell sebagai Administrator):

```powershell
New-NetFirewallRule -DisplayName "Statistik Challenge" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### IP berubah

Setiap kali laptop reconnect ke Wi-Fi, IP bisa berubah. Jalankan ulang `ipconfig` atau lihat output `npm start`.

### Port tidak dapat diakses / sudah dipakai

Ganti port di `server.js` (variabel `PORT`), lalu restart server.

### Server belum berjalan

Kalau terminal ditutup, server ikut berhenti. Jalankan lagi `npm start`.

---

## Alur Game (STEP 1 — MVP)

```text
Home → Pilih Level → Jawab Soal → Hasil
```

Yang sudah aktif:

- 8 level + unlock bertahap
- 50 soal di `data/questions.json`
- 5 soal acak per sesi
- skor dasar
- feedback benar/salah
- nickname + progress unlock di `localStorage`

Yang akan ditambahkan di tahap berikutnya:

- timer
- nyawa berkurang saat salah
- streak bonus
- leaderboard lokal
- polishing UI

---

## Catatan Tim (3 Developer)

| Developer | Fokus |
|-----------|--------|
| Dev 1 | UI/UX, HTML, CSS, responsive |
| Dev 2 | Game logic, server lokal, Wi-Fi testing |
| Dev 3 | Question bank, QA, README |

---

## Mengganti / Menambah Soal

Edit file:

```text
data/questions.json
```

Format tiap soal:

```json
{
  "id": 1,
  "level": 1,
  "kategori": "Kenali Angka",
  "pertanyaan": "Manakah angka yang paling besar?",
  "opsi_a": "125",
  "opsi_b": "215",
  "opsi_c": "152",
  "opsi_d": "251",
  "jawaban": "D",
  "poin": 10
}
```
Simpan file, lalu refresh browser. Tidak perlu database.

