/**
 * questions.js — loader & helper dataset soal
 * Sumber data: data/questions.json (lokal, offline)
 */

const Questions = {
  all: [],
  ready: false,

  /**
   * Muat soal dari file JSON lokal.
   * Harus dipanggil sekali saat aplikasi mulai.
   */
  async load() {
    const response = await fetch("data/questions.json");

    if (!response.ok) {
      throw new Error("Gagal memuat data/questions.json");
    }

    this.all = await response.json();
    this.ready = true;
    return this.all;
  },

  /** Ambil semua soal untuk level tertentu */
  byLevel(level) {
    return this.all.filter((q) => q.level === level);
  },

  /**
   * Ambil N soal acak dari level tertentu.
   * Tidak mengulang soal dalam satu sesi selama stok masih cukup.
   */
  pickRandom(level, count) {
    const pool = [...this.byLevel(level)];

    // Fisher–Yates shuffle (sederhana & jelas)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }

    return pool.slice(0, Math.min(count, pool.length));
  },
};
