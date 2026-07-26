<div align="center">

# 🩺 Medical Mentor

**Turn every wrong practice question into a board-exam win.**

Mistake tracking, weak-area analytics, and spaced-repetition flashcards — built for medical students preparing for UWorld, NBME, and board exams.

[Live Demo](#) · [Report an Issue](../../issues) · [Request a Feature](../../issues)

</div>

---

## Overview

Most students study the same way and get the same result: they re-read mistakes without fixing the underlying gap, and don't actually know which subject is failing them. Medical Mentor replaces that guesswork with a structured system:

- **Log every mistake** with the concept it tested, why you missed it, and a takeaway in your own words
- **See your weak areas ranked automatically** by a weighted score (error count × error rate) — not a feeling
- **Review flashcards on a real spaced-repetition schedule** (SM-2 algorithm), so time goes to what you're actually forgetting
- **Get AI-mentor guidance** — targeted quiz vignettes, study plans, and mistake-pattern breakdowns

This repository contains the public website: a marketing landing page, a live interactive product demo, and an admin panel for posting updates without touching code.

---

## Features

| Area | What it does |
|---|---|
| 🏠 **Landing page** | Marketing site with a waitlist signup, used to validate demand before the native app launches |
| 📊 **Live demo** | The full product experience — mistake log, weak-area analytics, flashcards, AI mentor chat |
| 🔐 **Admin panel** | Restricted to one approved account; lets the team post updates and study materials that appear on the site instantly |
| 📇 **Spaced repetition** | Flashcard scheduling implements the SM-2 algorithm (ease factor, interval, repetition count) |
| 📈 **Weakness scoring** | Systems are ranked live as mistakes are logged: `score = incorrect × (1 − accuracy)` |

---

## Tech stack

- **[React 18](https://react.dev/)** + **[Vite](https://vitejs.dev/)** — UI and build tooling
- **[Tailwind CSS](https://tailwindcss.com/)** — styling
- **[Firebase](https://firebase.google.com/)** (Firestore + Authentication) — live updates, admin login, waitlist storage
- **[Lucide](https://lucide.dev/)** — icons
- **GitHub Actions + GitHub Pages** — CI/CD and free static hosting

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- A free [Firebase](https://console.firebase.google.com/) project (for admin login and live updates)

### Local development

```bash
git clone https://github.com/farhanalikalyani/medical-mentor.git
cd medical-mentor
npm install
npm run dev
```

The app runs with demo content immediately. Admin login and live updates require Firebase — see [`src/firebase.js`](./src/firebase.js) and fill in your project's config.

### Build for production

```bash
npm run build
```

Output is written to `dist/`.

---

## Deployment

This repo auto-deploys to **GitHub Pages** on every push to `main` via the workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml). No hosting cost, no domain required.

If you fork this project, update `base` in [`vite.config.js`](./vite.config.js) to match your repository name, then enable **Settings → Pages → Source: GitHub Actions**.

---

## Project structure

```
medical-mentor/
├── src/
│   ├── App.jsx                 # Hash-based routing: landing / demo / admin
│   ├── firebase.js             # Firebase config + admin email gate
│   ├── mockData.js             # Demo content for the live product demo
│   └── components/
│       ├── Landing.jsx         # Marketing site + waitlist form
│       ├── MedicalMentorApp.jsx# Full product demo (mistake log, flashcards, etc.)
│       └── AdminPanel.jsx      # Gated admin login + content management
├── firestore.rules             # Recommended Firestore security rules
└── .github/workflows/deploy.yml
```

---

## Security notes

- The Firebase web config in `src/firebase.js` is safe to be public — Firebase API keys identify a project, they don't authorize access on their own
- Actual access control lives in [`firestore.rules`](./firestore.rules): only the approved admin account can write updates or read waitlist signups; everyone else has read-only or write-only access as appropriate

---

## Roadmap

- [ ] Replace scripted AI mentor responses with a live model
- [ ] Per-user accounts so mistake logs and flashcard decks persist per student
- [ ] Native mobile app (React Native / Expo)

---

## License

This project is currently private/unlicensed pending launch. All rights reserved.

<div align="center">

Built for medical students, by medical students. 🇵🇰

</div>
