# THE PIT – Social Media Web App (Claude Coding Spec)

## 1. Overview

THE PIT is a small-scale social media web application inspired by Reddit. Users can create and join “Spaces” (similar to subreddits), create posts inside those spaces, and interact through likes, dislikes, comments, and threaded replies.

The goal is to build a clean, fast, minimal-but-functional social platform with a dark UI and Carolina Blue accents.

---

## 2. Core Features

### 2.1 Authentication (NO AUTH FOR MVP)

* No login/signup required for initial build
* Use mock users or hardcoded user IDs
* All posts/comments assume a default user (e.g. "demo_user")
* Authentication will be added later as a separate phase

> Claude should NOT implement authentication unless explicitly requested later.

### 2.2 Spaces (like subreddits)

* Create a Space

  * Name
  * Description
  * Optional banner color/image
* Browse list of Spaces
* Join/leave Spaces (optional for MVP)
* View Space page showing posts

---

### 2.3 Posts

* Create post inside a Space

  * Title
  * Body (text only for MVP, media optional later)
* View posts in Space feed
* Sort posts:

  * Most recent
  * Most liked
* Like / dislike posts

---

### 2.4 Comments

* Comment on posts
* Threaded replies (nested comments)
* Like / dislike comments

---

### 2.5 Reactions System

* Each user can:

  * Like OR dislike (mutually exclusive)
* Counts displayed on posts and comments

---

## 3. UI / UX Requirements

### Theme

* Dark mode default
* Background: near-black (#0b0b0f or similar)
* Primary accent: Carolina Blue (#4B9CD3 or close)
* Secondary: white / light gray text

### Layout

* Left sidebar:

  * Spaces list
* Main feed:

  * Posts
* Right panel (optional MVP):

  * Trending spaces or posts

### Style

* Think old-school reddit
* Clean spacing
* Blend of old school website design mixed with modern styling to give a unique look and feel
* Subtle hover effects

---

## 4. Data Models (Suggested)

### User

* id
* username
* password_hash (if auth enabled)
* created_at

### Space

* id
* name
* description
* created_by
* created_at

### Post

* id
* space_id
* user_id
* title
* content
* likes
* dislikes
* created_at

### Comment

* id
* post_id
* user_id
* parent_comment_id (nullable for threading)
* content
* likes
* dislikes
* created_at

---

## 5. Suggested Tech Stack (flexible)

Claude should choose, but recommended:

### Frontend

* React (Vite or Next.js)
* TailwindCSS

### Backend

* Node.js + Express OR Next.js API routes

### Database

* SQLite (simple MVP) OR PostgreSQL (if scalable)

---

## 6. Behavior Rules for Claude (IMPORTANT)

* If any requirement is unclear, STOP and ask the user questions before implementing.
* Do NOT assume missing product decisions (auth, DB, hosting, etc.)
* Prefer minimal working MVP before adding enhancements
* Keep code modular and readable
* Avoid overengineering

---

## 7. MVP Build Order

1. Basic project setup (frontend + backend)
2. Spaces creation + listing
3. Post creation + feed
4. Comments system
5. Likes/dislikes system
6. Styling + dark theme polish

---

## 8. Optional Enhancements (later)

* Image uploads in posts
* Search functionality
* Trending algorithm
* User profiles
* Notifications
* Real-time updates (WebSockets)

---

## 9. Claude Instruction Summary

You are building a small social media app called THE PIT.

Before coding anything unclear, ask questions.
Prioritize MVP simplicity.
Keep UI dark-themed with Carolina Blue accents.
Focus on functionality first, polish second.
You don't need to build everything all at once, let's take this slow if need be!