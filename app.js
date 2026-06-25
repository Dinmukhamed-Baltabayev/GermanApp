(function () {
  const words = Array.isArray(window.VOCAB_WORDS) ? [...window.VOCAB_WORDS] : [];

  const card = document.getElementById("flashcard");
  const frontText = document.getElementById("frontText");
  const backText = document.getElementById("backText");
  const progressText = document.getElementById("progressText");
  const speedRange = document.getElementById("speedRange");
  const speedValue = document.getElementById("speedValue");

  const againBtn = document.getElementById("againBtn");
  const learnedBtn = document.getElementById("learnedBtn");
  const flipBtn = document.getElementById("flipBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");

  let index = 0;
  let shownCount = 0;
  let isFlipping = false;
  let angle = 0;
  let spinDurationMs = Number(speedRange.value) || 900;
  let audioCtx = null;

  if (!words.length) {
    frontText.textContent = "No words";
    backText.textContent = "Add items in vocab.js";
    progressText.textContent = "0 / 0";
    return;
  }

  function loadCard() {
    const item = words[index % words.length];
    frontText.textContent = item.de;
    backText.textContent = item.en;
    progressText.textContent = `${Math.min(shownCount + 1, words.length)} / ${words.length}`;
  }

  function updateSpeedLabel() {
    speedValue.textContent = `${spinDurationMs} ms`;
  }

  function playFlyAwaySound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const duration = 0.2;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + duration);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(420, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Always rotate 360deg forward. Back side is visible mid-spin, then next word appears.
  function spinToNextWord() {
    if (isFlipping) {
      return;
    }
    isFlipping = true;
    playFlyAwaySound();

    const nextAngle = angle + 360;
    const swapDelayMs = Math.round(spinDurationMs * 0.75);

    // One linear transition keeps angular speed constant for the full spin.
    card.style.transition = `transform ${spinDurationMs}ms linear`;
    card.style.transform = `rotateY(${nextAngle}deg)`;

    setTimeout(function () {
      // Swap while edge-on so text change is not seen as a pop.
      index = (index + 1) % words.length;
      shownCount += 1;
      loadCard();
    }, swapDelayMs);

    setTimeout(function () {
      angle = nextAngle % 360;
      card.style.transition = "none";
      card.style.transform = `rotateY(${angle}deg)`;
      void card.getBoundingClientRect();
      isFlipping = false;
    }, spinDurationMs + 30);
  }

  function shuffle() {
    if (isFlipping) {
      return;
    }
    for (let i = words.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    index = 0;
    shownCount = 0;
    angle = 0;
    card.style.transition = "none";
    card.style.transform = "rotateY(0deg)";
    loadCard();
  }

  card.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      spinToNextWord();
    }
  });

  card.addEventListener("click", spinToNextWord);
  againBtn.addEventListener("click", spinToNextWord);
  learnedBtn.addEventListener("click", spinToNextWord);
  flipBtn.addEventListener("click", spinToNextWord);
  shuffleBtn.addEventListener("click", shuffle);
  speedRange.addEventListener("input", function () {
    spinDurationMs = Number(speedRange.value) || 900;
    updateSpeedLabel();
  });

  updateSpeedLabel();
  loadCard();
})();
