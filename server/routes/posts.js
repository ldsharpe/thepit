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
      COALESCE((SELECT SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'post' AND target_id = p.id), 0) as likes,
      COALESCE((SELECT SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'post' AND target_id = p.id), 0) as dislikes,
      COALESCE((SELECT SUM(value) FROM reactions WHERE target_type = 'post' AND target_id = p.id), 0) as net_score,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      (SELECT value FROM reactions WHERE target_type = 'post' AND target_id = p.id AND user_id = 1) as userReaction
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.space_id = ?
    ORDER BY ${orderBy}
  `).all(req.params.spaceId);
  res.json(posts);
});

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username,
      COALESCE((SELECT SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'post' AND target_id = p.id), 0) as likes,
      COALESCE((SELECT SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'post' AND target_id = p.id), 0) as dislikes,
      (SELECT value FROM reactions WHERE target_type = 'post' AND target_id = p.id AND user_id = 1) as userReaction
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comments = db.prepare(`
    SELECT c.*, u.username,
      COALESCE((SELECT SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'comment' AND target_id = c.id), 0) as likes,
      COALESCE((SELECT SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END) FROM reactions WHERE target_type = 'comment' AND target_id = c.id), 0) as dislikes,
      (SELECT value FROM reactions WHERE target_type = 'comment' AND target_id = c.id AND user_id = 1) as userReaction
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
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
