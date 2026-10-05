/**
 * app.js — navigasi layar & menghubungkan UI dengan Game
 */

let timerId = null;
let timeLeft = 0;

const screens = {

  home: document.getElementById("screen-home"),
  levels: document.getElementById("screen-levels"),
  game: document.getElementById("screen-game"),
  result: document.getElementById("screen-result"),
};

function showScreen(name) {
  Object.keys(screens).forEach((key) => {
    screens[key].classList.toggle("active", key === name);
  });
}

function renderLevelList() {
  const list = document.getElementById("level-list");
  list.innerHTML = "";

  LEVEL_INFO.forEach((info) => {
    const unlocked = Game.isUnlocked(info.level);
    const card = document.createElement("article");
    card.className = "level-card" + (unlocked ? "" : " locked");

    card.innerHTML =
      "<div>" +
      "<h3>LEVEL " + info.level + "</h3>" +
      "<p>" + info.nama + " · " + info.poin + " poin/soal</p>" +
      "</div>";

    if (unlocked) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary";
      btn.textContent = "MAIN";
      btn.addEventListener("click", () => startLevel(info.level));
      card.appendChild(btn);
    } else {
      const lock = document.createElement("span");
      lock.className = "lock-badge";
      lock.textContent = "TERKUNCI";
      card.appendChild(lock);
    }

    list.appendChild(card);
  });

  document.getElementById("levels-player").textContent =
    "Pemain: " + Game.nickname;
}

function renderLives() {
  const hearts = [];
  for (let i = 0; i < MAX_LIVES; i++) {
    hearts.push(i < Game.lives ? "❤️" : "🖤");
  }
  document.getElementById("game-lives").textContent = hearts.join(" ");
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
}

function renderTimer() {
  const fill = document.getElementById("timer-fill");
  const text = document.getElementById("timer-text");
  timeLeft = Game.getTimeLimit();
  text.textContent = timeLeft + "s";
  fill.style.width = "100%";
  stopTimer();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    text.textContent = Math.max(0, timeLeft) + "s";
    fill.style.width = Math.max(0, (timeLeft / Game.getTimeLimit()) * 100) + "%";
    if (timeLeft <= 0) {
      stopTimer();
      handleAnswer(null, null);
    }
  }, 1000);
}


function renderQuestion() {
  const q = Game.getCurrentQuestion();
  if (!q) {
    return;
  }

  document.getElementById("game-level-label").textContent =
    "LEVEL " + Game.currentLevel;
  document.getElementById("game-progress").textContent = Game.getProgressText();
  document.getElementById("game-score").textContent = String(Game.score);
  document.getElementById("question-category").textContent = q.kategori;
  document.getElementById("question-text").textContent = q.pertanyaan;

  renderLives();

  renderTimer();
  document.getElementById("game-streak").textContent = "STREAK x" + Math.max(1, Game.streak);


  const feedback = document.getElementById("feedback");
  feedback.className = "feedback hidden";
  feedback.textContent = "";

  const options = document.getElementById("options");
  options.innerHTML = "";

  const keys = ["A", "B", "C", "D"];
  keys.forEach((key) => {
    const value = q["opsi_" + key.toLowerCase()];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-option";
    btn.innerHTML =
      '<span class="opt-key">' + key + "</span>" +
      "<span>" + value + "</span>";
    btn.addEventListener("click", () => handleAnswer(key, btn));
    options.appendChild(btn);
  });
}

function handleAnswer(selectedKey, clickedBtn) {
  const result = Game.answer(selectedKey);
  if (!result) {
    return;
  }

  // Nonaktifkan semua opsi
  const buttons = document.querySelectorAll("#options .btn-option");
  buttons.forEach((btn) => {
    btn.disabled = true;
    const keyLabel = btn.querySelector(".opt-key").textContent;
    if (keyLabel === result.correctKey) {
      btn.classList.add("correct");
    }
  });

  if (!result.correct && clickedBtn) {
    clickedBtn.classList.add("wrong");
  }
  renderLives();


  const feedback = document.getElementById("feedback");
  feedback.classList.remove("hidden");

  if (result.correct) {
    feedback.className = "feedback ok";
    feedback.innerHTML = "✓ BENAR!<br />+" + result.points + " POIN" + (result.streak > 1 ? "<br />STREAK x" + result.streak : "");
  } else {
    feedback.className = "feedback bad";
    feedback.innerHTML = (result.timedOut ? "⌛ WAKTU HABIS!" : "✕ SALAH!") + "<br />Jawaban yang benar: " + result.correctKey;
  }

  if (result.gameOver) {
    feedback.innerHTML += "<br /><strong>GAME OVER — NYAWA HABIS</strong>";
  }


  document.getElementById("game-score").textContent = String(Game.score);

  // Jeda singkat supaya pemain sempat baca feedback
  setTimeout(() => {
    stopTimer();
    if (result.finished) {
      showResult();
    } else {

      Game.next();
      renderQuestion();
    }
  }, 1100);
}

function startLevel(level) {
  const ok = Game.start(level);
  if (!ok) {
    alert("Soal untuk level ini belum tersedia.");
    return;
  }

  showScreen("game");
  renderQuestion();
}

function showResult() {
  const data = Game.getResult();

  document.getElementById("result-title").textContent = "GAME SELESAI!";
  document.getElementById("result-score").textContent = String(data.score);
  document.getElementById("result-correct").textContent = String(data.correct);
  document.getElementById("result-wrong").textContent = String(data.wrong);
  document.getElementById("result-level").textContent = String(data.level);
  document.getElementById("result-streak").textContent = String(data.bestStreak);
  document.getElementById("result-title").textContent = data.gameOver ? "GAME OVER" : "GAME SELESAI!";
  Game.saveRecord(data);
  renderTrackRecord();


  showScreen("result");
}

function goHome() {
  stopTimer();
  showScreen("home");
}


function renderTrackRecord() {
  const container = document.getElementById("track-record");
  if (!container) return;

  container.innerHTML = LEVEL_INFO.map((info) => {
    const record = Game.getRecord(info.level);
    const status = record.attempts === 0 ? "Belum dimainkan" : record.successes > 0 ? "Berhasil" : "Belum berhasil";
    return `<article class="record-row">
      <h3>${info.name}</h3>
      <p>Attempts: ${record.attempts}</p>
      <p>Successes: ${record.successes}</p>
      <p>Status: ${status}</p>
    </article>`;
  }).join("");
}

function bindEvents() {
  document.getElementById("btn-start").addEventListener("click", () => {
    const input = document.getElementById("input-nickname");
    Game.saveNickname(input.value);
    goLevels();
  });

  document.getElementById("btn-levels-back").addEventListener("click", goHome);

  document.getElementById("btn-play-again").addEventListener("click", () => {
    startLevel(Game.currentLevel);
  });

  document.getElementById("btn-to-levels").addEventListener("click", goLevels);
  document.getElementById("btn-to-home").addEventListener("click", goHome);
}

async function init() {
  try {
    await Questions.load();
  } catch (err) {
    alert(
      "Gagal memuat soal.\nPastikan server berjalan dan file data/questions.json ada."
    );
    console.error(err);
    return;
  }

  Game.loadProgress();

  const nickInput = document.getElementById("input-nickname");
  nickInput.value = Game.nickname === "Pemain" ? "" : Game.nickname;

  bindEvents();
  showScreen("home");
}

init();
