# THE PIT – Execution Plan

## Project Summary

THE PIT is a Reddit-inspired social media app with Spaces, Posts, Comments, and a Like/Dislike system. Dark UI, Carolina Blue accents. No auth for MVP.

---

## Tech Stack (Decided)

| Layer    | Choice                        |
|----------|-------------------------------|
| Frontend | React + Vite + TailwindCSS    |
| Backend  | Node.js + Express             |
| Database | SQLite (via better-sqlite3)   |

**Rationale:** Vite keeps dev fast, Express is minimal, SQLite requires zero infrastructure for MVP.

---

## Project Structure

```
thepit/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   └── vite.config.js
├── server/          # Express backend
│   ├── routes/
│   ├── db/
│   │   ├── schema.sql
│   │   └── db.js
│   └── index.js
└── CLAUDE.md
```

---

## Data Models

### User (mock, no auth)
- `id`, `username`, `created_at`
- MVP default: `demo_user` (id: 1, hardcoded)

### Space
- `id`, `name`, `description`, `created_by`, `banner_color`, `created_at`

### Post
- `id`, `space_id`, `user_id`, `title`, `content`, `created_at`

### Comment
- `id`, `post_id`, `user_id`, `parent_comment_id` (nullable), `content`, `created_at`

### Reaction
- `id`, `user_id`, `target_type` (post|comment), `target_id`, `value` (+1|-1)
- Unique constraint on `(user_id, target_type, target_id)` — enforces like/dislike mutual exclusivity

---

## API Routes

| Method | Route                              | Action                        |
|--------|------------------------------------|-------------------------------|
| GET    | /api/spaces                        | List all spaces               |
| POST   | /api/spaces                        | Create space                  |
| GET    | /api/spaces/:id/posts              | Get posts in space (sorted)   |
| POST   | /api/posts                         | Create post                   |
| GET    | /api/posts/:id                     | Get single post + comments    |
| POST   | /api/comments                      | Create comment                |
| POST   | /api/reactions                     | Add/toggle reaction           |

---

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  Header (THE PIT logo + nav)                    │
├──────────────┬──────────────────────────────────┤
│ Left Sidebar │ Main Feed / Post View            │
│              │                                  │
│ Spaces list  │ Posts or post detail+comments    │
│ + Create btn │                                  │
└──────────────┴──────────────────────────────────┘
```

**Theme:**
- Background: `#0b0b0f`
- Accent: `#4B9CD3` (Carolina Blue)
- Text: white / `#d1d5db`
- Borders: `#1f2937`

---

## Build Order (MVP Phases)

### Phase 1 – Project Setup
- [ ] Init Vite React app in `client/`
- [ ] Init Express server in `server/`
- [ ] Set up SQLite with schema migrations
- [ ] Configure Tailwind, proxy between client and server

### Phase 2 – Spaces
- [ ] `GET /api/spaces` + `POST /api/spaces`
- [ ] Spaces list in sidebar
- [ ] Create Space modal/form
- [ ] Space detail page (shows posts)

### Phase 3 – Posts
- [ ] `POST /api/posts` + `GET /api/spaces/:id/posts`
- [ ] Post card component
- [ ] Create Post form inside a Space
- [ ] Sort by newest / most liked

### Phase 4 – Comments
- [ ] `POST /api/comments` + fetch on post detail
- [ ] Threaded comment rendering (recursive)
- [ ] Reply-to-comment form

### Phase 5 – Reactions
- [ ] `POST /api/reactions` (upsert/toggle logic in DB)
- [ ] Like/dislike buttons on posts and comments
- [ ] Display counts

### Phase 6 – Polish
- [ ] Dark theme refinement
- [ ] Hover effects, spacing, typography
- [ ] Loading states, empty states
- [ ] Mobile-responsive basics

---

## Behavior Rules

- No authentication until explicitly requested.
- All actions attribute to `demo_user` (id: 1).
- Stop and ask before implementing anything ambiguous.
- Prefer minimal working code — no over-engineering.
- One phase at a time unless instructed otherwise.
