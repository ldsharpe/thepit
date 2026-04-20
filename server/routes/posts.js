const express = require('express');
const db = require('../db/db');
const router = express.Router();

router.get('/space/:spaceId', (req, res) => {
  const { sort = 'new' } = req.query;
  const orderBy = sort === 'top'
    ? 'net_score DESC, p.created_at DESC'
    : 'p.created_at DESC';

  const posts = db.prepare(`
    SELECT p.*, u.username,
      COALESCE(SUM(CASE WHEN r.value = 1 THEN 1 ELSE 0 END), 0) as likes,
      COALESCE(SUM(CASE WHEN r.value = -1 THEN 1 ELSE 0 END), 0) as dislikes,
      COALESCE(SUM(r.value), 0) as net_score,
      COUNT(DISTINCT c.id) as comment_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN reactions r ON r.target_type = 'post' AND r.target_id = p.id
    LEFT JOIN comments c ON c.post_id = p.id
    WHERE p.space_id = ?
    GROUP BY p.id
    ORDER BY ${orderBy}
  `).all(req.params.spaceId);
  res.json(posts);
});

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username,
      COALESCE(SUM(CASE WHEN r.value = 1 THEN 1 ELSE 0 END), 0) as likes,
      COALESCE(SUM(CASE WHEN r.value = -1 THEN 1 ELSE 0 END), 0) as dislikes
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN reactions r ON r.target_type = 'post' AND r.target_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comments = db.prepare(`
    SELECT c.*, u.username,
      COALESCE(SUM(CASE WHEN r.value = 1 THEN 1 ELSE 0 END), 0) as likes,
      COALESCE(SUM(CASE WHEN r.value = -1 THEN 1 ELSE 0 END), 0) as dislikes
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN reactions r ON r.target_type = 'comment' AND r.target_id = c.id
    WHERE c.post_id = ?
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `).all(req.params.id);

  res.json({ ...post, comments });
});

router.post('/', (req, res) => {
  const { space_id, title, content } = req.body;
  if (!space_id || !title?.trim()) return res.status(400).json({ error: 'space_id and title are required' });

  const result = db.prepare(
    'INSERT INTO posts (space_id, user_id, title, content) VALUES (?, 1, ?, ?)'
  ).run(space_id, title.trim(), content?.trim() || null);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

module.exports = router;
