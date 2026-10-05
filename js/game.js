/**
 * game.js — logika inti game (STEP 1 MVP)
 *
 * Fitur STEP 1:
 * - pilih level
 * - 5 soal per sesi (acak)
 * - cek jawaban
 * - skor dasar
 * - unlock level berikutnya
 * - tampil hasil
 *
 * Belum aktif di STEP 1 (disiapkan di STEP 2/3):
 * - timer
 * - pengurangan nyawa saat salah
 * - streak bonus
 * - leaderboard
 */

const LEVEL_INFO = [
  { level: 1, nama: "Kenali Angka", poin: 10 },
  { level: 2, nama: "Hitung Cepat", poin: 15 },
  { level: 3, nama: "Selisih Data", poin: 20 },
  { level: 4, nama: "Persentase", poin: 25 },
  { level: 5, nama: "Benar atau Salah", poin: 30 },
  { level: 6, nama: "Logika Data", poin: 35 },
  { level: 7, nama: "Pengetahuan Statistik", poin: 40 },
  { level: 8, nama: "Pengetahuan BPS", poin: 50 },
];

const QUESTIONS_PER_ROUND = 5;
const MAX_LIVES = 3;
const STORAGE_UNLOCK_KEY = "sc_unlocked_level";
const STORAGE_NICKNAME_KEY = "sc_nickname";

const Game = {
  nickname: "Pemain",
  unlockedLevel: 1,

  currentLevel: 1,
  questions: [],
  index: 0,
  score: 0,
  correct: 0,
  wrong: 0,
  lives: MAX_LIVES,
  answering: false,
  streak: 0,
  bestStreak: 0,
  timeLimit: 20,
  gameOver: false,

  getTimeLimit() {
    if (this.currentLevel <= 2) return 20;
    if (this.currentLevel <= 4) return 15;
    if (this.currentLevel <= 6) return 12;
    return 10;
  },


  /** Baca progress unlock & nickname dari localStorage */
  loadProgress() {
    const savedUnlock = Number(localStorage.getItem(STORAGE_UNLOCK_KEY));
    this.unlockedLevel =
      Number.isFinite(savedUnlock) && savedUnlock >= 1 ? savedUnlock : 1;

    const savedName = localStorage.getItem(STORAGE_NICKNAME_KEY);
    if (savedName) {
      this.nickname = savedName;
    }
  },

  saveNickname(name) {
    const clean = String(name || "").trim().slice(0, 16) || "Pemain";
    this.nickname = clean;
    localStorage.setItem(STORAGE_NICKNAME_KEY, clean);
    return clean;
  },

  saveUnlock(level) {
    if (level > this.unlockedLevel) {
      this.unlockedLevel = level;
      localStorage.setItem(STORAGE_UNLOCK_KEY, String(level));
    }
  },

  isUnlocked(level) {
    return level <= this.unlockedLevel;
  },

  /**
   * Mulai sesi permainan di level tertentu.
   * Mengembalikan true jika berhasil.
   */
  start(level) {
    if (!this.isUnlocked(level)) {
      return false;
    }

    this.currentLevel = level;
    this.questions = Questions.pickRandom(level, QUESTIONS_PER_ROUND);
    this.index = 0;
    this.score = 0;
    this.correct = 0;
    this.wrong = 0;
    this.lives = MAX_LIVES;
    this.answering = false;
    this.streak = 0;
    this.bestStreak = 0;
    this.timeLimit = this.getTimeLimit();
    this.gameOver = false;


    if (this.questions.length === 0) {
      return false;
    }

    return true;
  },

  getCurrentQuestion() {
    return this.questions[this.index] || null;
  },

  getProgressText() {
    return "Soal " + (this.index + 1) + "/" + this.questions.length;
  },

  /**
   * Proses jawaban pemain.
   * @returns {{ correct: boolean, correctKey: string, points: number, finished: boolean }}
   */
  answer(selectedKey) {
    if (this.answering || this.gameOver) return null;

    const question = this.getCurrentQuestion();
    if (!question) return null;

    this.answering = true;
    const correctKey = String(question.jawaban).toUpperCase();
    const timedOut = selectedKey === null;
    const isCorrect = !timedOut && String(selectedKey).toUpperCase() === correctKey;
    let points = 0;

    if (isCorrect) {
      points = Number(question.poin) || LEVEL_INFO[this.currentLevel - 1].poin;
      this.score += points;
      this.correct += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.wrong += 1;
      this.lives = Math.max(0, this.lives - 1);
      this.streak = 0;
    }

    const gameOver = this.lives === 0;
    const finished = gameOver || this.index >= this.questions.length - 1;
    this.gameOver = gameOver;

    if (finished && !gameOver && this.correct > 0 && this.currentLevel < 8) {
      this.saveUnlock(this.currentLevel + 1);
    }

    return { correct: isCorrect, timedOut, correctKey, points, finished, gameOver, streak: this.streak };
  },

  /** Lanjut ke soal berikutnya. Return false jika sudah habis. */
  next() {
    if (this.index >= this.questions.length - 1) {
      this.answering = false;
      return false;
    }

    this.index += 1;
    this.answering = false;
    return true;
  },

  getResult() {
    return {
      score: this.score,
      correct: this.correct,
      wrong: this.wrong,
      level: this.currentLevel,
      nickname: this.nickname,
      bestStreak: this.bestStreak,
      gameOver: this.gameOver,

    };
  },
};
