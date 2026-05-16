# XMentor: The Tactical EdTech Hub 🚀

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Status: Production](https://img.shields.io/badge/Status-Production-success.svg)](#)

**XMentor** is a high-performance, full-stack educational platform built to bridge the gap between traditional classroom learning and professional software engineering. Designed for precision and speed, it provides teachers with a "Tactical HUD" to mentor students, automate grading, and foster real-time collaboration.

> Live: [xmentor.skramizraza.tech](https://xmentor.skramizraza.tech)

---

## 🌟 Vision
XMentor was built to empower educators by automating the mundane. From instant MCQ grading to secure, verified teacher onboarding, every feature is optimized to save time and maximize student impact.

---

## ✨ Core Modules

### 🛡️ Secure Teacher Ecosystem
- **Verified Onboarding**: Manual verification workflow for prospective teachers to ensure platform integrity.
- **Admin Command Center**: A dedicated operational dashboard for managing teacher credentials and system health.
- **Identity Guard**: Secure registration with mandatory WhatsApp contact for manual vetting.

### 📝 Strategic Assessment Engines

#### Tactical MCQ HUD
- Auto-graded multiple-choice exams with deterministic question shuffling per student (cheat-resistant).
- **Pause & Resume**: Students can save progress mid-test; `timeLeft`, answers, and question index are all restored exactly on resume.
- **Breach Tracking**: Tab-switch and fullscreen-exit violations are counted and persisted across pause/resume cycles. Sent to the backend on final submission.
- **Teacher Analytics Dashboard**: Splits results into Completed, In-Progress (paused), and Pending — cohort stats are calculated only from completed submissions.
- **Score Adjustment**: Teachers can manually override a student's final score with full authorization checks.
- **Reassign**: Teachers can reset a student's attempt and let them retake, with per-button loading state (no full-page flicker).

#### Subjective Hub
- Specialized grading interface for open-ended assignments, optimized for high-speed teacher review.

#### Bilingual Support
- Full support for English and Bengali (EN/BN) academic content.

### 💬 Neural Network (Community)
- **Real-time Uplink**: Socket.io-powered community chat rooms for instant collaboration.
- **Anonymous "Byte Knights"**: Professional alias system for school and engineering mastery hubs.
- **Priority Doubt Resolution**: A structured ticketing system for academic blockers.
- **Teacher Recruitment**: Teachers can invite students directly into community hubs.

### 🏆 Progress & Analytics
- **Global Leaderboards**: Weighted ranking system based on accuracy and participation.
- **Performance Metrics**: Visual tracking of student growth across subjects and boards.
- **Student Overview**: Teachers get a cross-test view of each student's completed tasks, pending tasks, and submission history.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, SCSS, Lucide Icons |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB (Mongoose ODM) |
| Validation | Zod (request schema validation on all mutating routes) |
| Security | JWT, bcryptjs, Helmet |
| Push Notifications | Web Push API (offline/mobile users) |
| Cloud Assets | ImageKit.io (optimized avatars) |
| PWA | Vite PWA Plugin, Workbox (offline support, installable) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance
- ImageKit.io free account

### Backend Setup
```bash
cd Backend
npm install
# Copy .env.example → .env and fill in your values
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
# Set VITE_API_URL in .env
npm run dev
```

---

## 🔐 Security & Privacy

- All passwords hashed with `bcryptjs`.
- JWT tokens with short expiry + refresh flow.
- Zod schema validation on every mutating route — invalid payloads are rejected before reaching service logic.
- MCQ breach counting validated and sanitized server-side (client input is never trusted).
- Admin operations protected by multi-layer middleware.

> [!IMPORTANT]
> Never commit your `.env` file. A `set-admin.js` script is provided for authorized owners to initialize administrative access.

---

## 📋 Recent Changes

### v1.1.0 — Virtual Economy & Perk System (May 2026)
- **Tactical Shop & Currency (`TacticalShop.jsx`)**: Implemented a fully gamified virtual economy where students earn `Pts` via Daily Login Bonuses (`+10 Pts`) and MCQ question completions (`+0.5 Pts` per correct answer).
- **Economy Rebalancing**: Adjusted default starting balance to `50 Pts` (down from 150 Pts) to maintain a challenging and rewarding gamification loop, with seamless database migration for existing users.
- **⚡ Emergency Pause Token**: Allows students to purchase and activate an extra exam pause. Includes strict consumption cooldown (`24h` between uses) and instructor override protection (cannot be used on exams configured with `pauseLimit === 0`).
- **📅 Deadline Extension Token**: Allows students to extend an expired assignment by 24 hours. Features isolated student deadline tracking via `extendedDeadlines` array (ensuring only the purchasing student's deadline is extended) and strict consumption cooldown (`48h` between uses).
- **Zustand Store Synchronization**: Real-time, zero-reload state synchronization between `useShopStore` and `useAuthStore` for instant UI updates across the navigation pill, shop inventory, and MCQ HUD banners.
- **Responsive Tactical HUD**: Comprehensive mobile (`480px`) and tablet (`768px`/`1024px`) viewport optimizations for perk banners, action buttons, and inventory chips.

### v1.0.1 — MCQ Stability & Hardening (May 2026)
- Fixed timer resetting to full duration after pause/resume (timer now reads from `timeLeftRef` instead of state deps).
- Fixed breach count resetting to 0 after resume (violations restored from `test.progress.breachCount` on mount).
- Fixed paused students incorrectly shown as `0/total` in completed results table.
- Fixed reassign action causing full-page skeleton loader (switched to per-button local loading state).
- Fixed score cell layout on mobile (pill + edit button wrapped in flex container).
- Fixed hover regression on Review Paper / Terminate buttons (specificity conflict resolved).
- Added server-side `breachCount` sanitization in `submitTest` and `pauseTest`.
- Added `updateScoreSchema` Zod validation on the score PATCH route.
- Null-guard on `studentId` in analytics Set construction (handles deleted student accounts).
- Fixed stale `violations` closure in `handleSubmit` via `violationsRef`.

---

## 🤝 Contributing
Contributions are welcome. Feel free to fork, submit PRs, or open issues. Looking to collaborate with:
- **Experienced developers** — architecture, scaling, real-time engine optimization.
- **UI/UX designers** — elevating the Tactical HUD aesthetic.
- **Educators** — beta testing and feature feedback.

---

## 👨‍💻 Author

**Sk Ramiz Raza** — Full-Stack Developer & Student Mentor
- LinkedIn: [Sk Ramiz Raza](https://www.linkedin.com/in/sk-ramiz-raza-016460309/)
- GitHub: [@Ramiz1323](https://github.com/Ramiz1323)

---

## 📄 License
Licensed under the **GNU General Public License v3.0**. See [LICENSE](LICENSE) for details.
Copyright © 2026 Sk Ramiz Raza. All Rights Reserved.
