# THE PIT — Project State

> **REMINDER TO CLAUDE:** Update this file after every prompt. Keep it current so context resets don't lose momentum.

---

## Current Status
Phase 1–5 complete. MVP is fully functional and running.

- **Backend:** `http://localhost:3001` (Express + SQLite via better-sqlite3)
- **Frontend:** `http://localhost:5173` (React + Vite + Tailwind)

To start the app:
```
# Terminal 1
cd server && node index.js

# Terminal 2
cd client && npm run dev
```

---

## What's Been Built

- Spaces (create, list, browse)
- Posts (create, feed, sort by new/top, clickable rows)
- Comments (threaded/nested, collapsible, sorted by net score at every level)
- Reactions (like/dislike, mutually exclusive, toggle-off)
- Dark theme with Carolina Blue (#4B9CD3) accents
- Reddit-style home feed (posts from all spaces)
- Popular page (top posts across all spaces)
- Left sidebar: Home, Popular, Explore Spaces (stub), Create a Space
- Search bar in header (filters spaces live)
- "Home" back button in header when inside a space
- No auth — all actions attributed to demo_user (id: 1)

---

## Tech Stack

| Layer    | Choice                              |
|----------|-------------------------------------|
| Frontend | React + Vite 5 + Tailwind CSS 3     |
| Backend  | Node.js + Express 5                 |
| Database | SQLite via better-sqlite3           |
| Fonts    | Unbounded (headers/branding) + Inter (body) + IBM Plex Mono (meta/labels) |

---

## Current Goals / Next Up

- User is deploying to Railway. Production config is set up (railway.json, root package.json, Express serves client/dist in prod).
- After deploy, next likely step: authentication so users have their own identities.

### Planned / Possible Next Steps
- Explore Spaces page (stubbed in sidebar, not yet built)
- User profiles
- Image uploads in posts
- Search for posts (currently only searches spaces)
- Real auth system (explicitly deferred — do NOT implement unless asked)

---

## Key Decisions & Constraints

- **No authentication** until explicitly requested by user
- **SQLite** is fine — user expects ~20 users max
- **No emojis** anywhere in the UI (user explicitly requested)
- Font pairing: **Source Sans 3** (body) + **IBM Plex Mono** (labels, metadata, logo)
- Design language: boxy/structured (no rounded corners), forum-era aesthetic
- Post cards: clicking anywhere navigates to post; score column stops propagation
- Comments: collapsed with ▼/▶ toggle, replies hidden count shown when collapsed

---

## Known Issues / Tech Debt

- None currently known.
