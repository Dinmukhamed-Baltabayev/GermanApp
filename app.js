(function () {
  const words = Array.isArray(window.VOCAB_WORDS) ? [...window.VOCAB_WORDS] : [];

  const card = document.getElementById("flashcard");
  const frontText = document.getElementById("frontText");
  const backText = document.getElementById("backText");
  const exampleText = document.getElementById("exampleText");
  const progressText = document.getElementById("progressText");

  const againBtn = document.getElementById("againBtn");
  const learnedBtn = document.getElementById("learnedBtn");
  const flipBtn = document.getElementById("flipBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");

  let index = 0;
  let shownCount = 0;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  if (!words.length) {
    frontText.textContent = "No words";
    backText.textContent = "Add items in data/vocab.js";
    exampleText.textContent = "";
    progressText.textContent = "0 / 0";
    return;
  }

  function setCardData(item) {
    frontText.textContent = item.de;
    backText.textContent = item.en;
    exampleText.textContent = item.ex || "";
    progressText.textContent = `${Math.min(shownCount + 1, words.length)} / ${words.length}`;
    card.classList.remove("is-flipped");
  }

  function getCurrent() {
    return words[index % words.length];
  }

  function nextCard(moveRight) {
    card.classList.add(moveRight ? "swipe-right" : "swipe-left");

    setTimeout(function () {
      card.classList.remove("swipe-right", "swipe-left");
      index += 1;
      shownCount += 1;
      if (index >= words.length) {
        index = 0;
      }
      setCardData(getCurrent());
    }, 220);
  }

  function flipCard() {
    card.classList.toggle("is-flipped");
  }

  function shuffle() {
    for (let i = words.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    index = 0;
    shownCount = 0;
    setCardData(getCurrent());
  }

  function onPointerDown(event) {
    isDragging = true;
    startX = event.clientX;
    currentX = event.clientX;
    card.setPointerCapture(event.pointerId);
    card.style.transition = "none";
  }

  function onPointerMove(event) {
    if (!isDragging) {
      return;
    }
    currentX = event.clientX;
    const dx = currentX - startX;
    const tilt = dx / 16;
    card.style.transform = `translateX(${dx}px) rotate(${tilt}deg)`;
  }

  function onPointerUp(event) {
    if (!isDragging) {
      return;
    }

    const dx = currentX - startX;
    const threshold = 90;

    isDragging = false;
    card.releasePointerCapture(event.pointerId);
    card.style.transition = "transform 0.25s ease";

    if (Math.abs(dx) < threshold) {
      card.style.transform = "";
      setTimeout(function () {
        card.style.transition = "";
      }, 250);
      return;
    }

    card.style.transform = "";
    setTimeout(function () {
      card.style.transition = "";
      nextCard(dx > 0);
    }, 10);
  }

  card.addEventListener("click", flipCard);
  card.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipCard();
    }
  });

  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
  card.addEventListener("pointercancel", onPointerUp);

  againBtn.addEventListener("click", function () {
    nextCard(false);
  });

  learnedBtn.addEventListener("click", function () {
    nextCard(true);
  });

  flipBtn.addEventListener("click", flipCard);
  shuffleBtn.addEventListener("click", shuffle);

  setCardData(getCurrent());
})();
