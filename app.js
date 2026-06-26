(function () {
  const words = Array.isArray(window.VOCAB_WORDS) ? [...window.VOCAB_WORDS] : [];

  const appShell = document.getElementById("appShell");
  const card = document.getElementById("flashcard");
  const frontText = document.getElementById("frontText");
  const backText = document.getElementById("backText");
  const progressText = document.getElementById("progressText");
  const speedRange = document.getElementById("speedRange");
  const speedValue = document.getElementById("speedValue");

  const spinToggleBtn = document.getElementById("spinToggleBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");

  let index = 0;
  let shownCount = 0;
  let isFlipping = false;
  let angle = 0;
  let spinDurationMs = Number(speedRange.value) || 150;
  let audioCtx = null;
  let isAutoSpinning = false;
  let autoSpinTimer = null;

  if (!words.length) {
    frontText.textContent = "No words";
    backText.textContent = "Add items in vocab.js";
    progressText.textContent = "0 / 0";
    spinToggleBtn.disabled = true;
    shuffleBtn.disabled = true;
    speedRange.disabled = true;
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

  function playCardFlipSound(isClosing) {
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
    const duration = isClosing ? 0.16 : 0.2;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "triangle";
    if (isClosing) {
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + duration);
    } else {
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + duration);
    }

    filter.type = "highpass";
    filter.frequency.setValueAtTime(isClosing ? 460 : 380, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(isClosing ? 0.05 : 0.07, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  function flipCard(advanceWord) {
    if (isFlipping) {
      return;
    }
    isFlipping = true;

    const onBackBeforeFlip = angle % 360 === 180;
    playCardFlipSound(onBackBeforeFlip);
    const nextAngle = angle + 180;
    const swapDelayMs = Math.round(spinDurationMs * 0.5);

    card.style.transition = `transform ${spinDurationMs}ms linear`;
    card.style.transform = `rotateY(${nextAngle}deg)`;

    if (advanceWord && onBackBeforeFlip) {
      setTimeout(function () {
        index = (index + 1) % words.length;
        shownCount += 1;
        loadCard();
      }, swapDelayMs);
    }

    setTimeout(function () {
      angle = nextAngle % 360;
      const stableAngle = angle === 180 ? 179.9 : angle;
      card.style.transition = "none";
      card.style.transform = `rotateY(${stableAngle}deg)`;
      void card.getBoundingClientRect();
      isFlipping = false;
    }, spinDurationMs + 20);
  }

  function scheduleAutoSpin() {
    if (!isAutoSpinning) {
      return;
    }

    flipCard(false);
    autoSpinTimer = setTimeout(function () {
      scheduleAutoSpin();
    }, spinDurationMs + 40);
  }

  function setSpinMode(enabled) {
    isAutoSpinning = enabled;

    if (enabled) {
      appShell.classList.add("is-spinning");
      spinToggleBtn.textContent = "Stop Spinning";
      spinToggleBtn.setAttribute("aria-label", "Stop spinning");
      speedRange.disabled = true;
      shuffleBtn.disabled = true;
      scheduleAutoSpin();
      return;
    }

    clearTimeout(autoSpinTimer);
    autoSpinTimer = null;
    appShell.classList.remove("is-spinning");
    spinToggleBtn.textContent = "Spin to Learn";
    spinToggleBtn.setAttribute("aria-label", "Start spinning");
    speedRange.disabled = false;
    shuffleBtn.disabled = false;
  }

  function shuffle() {
    if (isFlipping || isAutoSpinning) {
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
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    if (isAutoSpinning) {
      return;
    }
    flipCard(true);
  });

  card.addEventListener("click", function () {
    if (isAutoSpinning) {
      return;
    }
    flipCard(true);
  });

  spinToggleBtn.addEventListener("click", function () {
    setSpinMode(!isAutoSpinning);
  });

  shuffleBtn.addEventListener("click", shuffle);

  speedRange.addEventListener("input", function () {
    if (isAutoSpinning) {
      return;
    }
    spinDurationMs = Number(speedRange.value) || 150;
    updateSpeedLabel();
  });

  updateSpeedLabel();
  loadCard();
})();

