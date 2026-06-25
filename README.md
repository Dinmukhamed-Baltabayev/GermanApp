# German Flashcard App

A personal, mobile-first vocabulary flashcard web app with swipe gestures.

## Features

- Minimal modern UI
- Swipe left/right on cards
- Tap card to flip (German/English)
- Hard-coded vocabulary in one file
- No backend and no build tools required

## Project Structure

- `index.html` - app layout
- `styles.css` - visual design
- `app.js` - flashcard and swipe logic
- `vocab.js` - vocabulary list (hard-coded)

## Run

1. Open `index.html` in your browser.
2. Best on phone: use browser "Add to Home Screen".

## Edit Vocabulary

Update `vocab.js`:

```js
window.VOCAB_WORDS = [
  { de: "der Apfel", en: "apple", ex: "Ich esse einen Apfel." }
];
```

Fields:

- `de`: German word or phrase
- `en`: English translation
- `ex`: Example sentence (optional)
