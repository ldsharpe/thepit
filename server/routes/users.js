const express = require('express');
const db = require('../db/db');
const { requireAuth } = require('./auth');
const router = express.Router();

router.get('/:username', (req, res) => {
  const user = db.prepare('SELECT id, username, bio, created_at FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const totalLikes = db.prepare(`
    SELECT COUNT(*) as c FROM reactions
    WHERE value = 1 AND (
      (target_type = 'post'    AND target_id IN (SELECT id FROM posts    WHERE user_id = ?))
      OR
      (target_type = 'comment' AND target_id IN (SELECT id FROM comments WHERE user_id = ?))
    )
  `).get(user.id, user.id).c;

  const posts = db.prepare(`
    SELECT p.id, p.title, p.content, p.created_at, p.space_id,
           s.name as space_name, s.banner_color as space_banner_color,
           (SELECT COUNT(*) FROM reactions WHERE target_type='post' AND target_id=p.id AND value=1)  as likes,
           (SELECT COUNT(*) FROM reactions WHERE target_type='post' AND target_id=p.id AND value=-1) as dislikes,
           (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
    FROM posts p
    JOIN spaces s ON s.id = p.space_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(user.id);

  const comments = db.prepare(`
    SELECT c.id, c.content, c.created_at, c.post_id,
           p.title as post_title, p.space_id,
           s.name as space_name, s.banner_color as space_banner_color,
           (SELECT COUNT(*) FROM reactions WHERE target_type='comment' AND target_id=c.id AND value=1)  as likes,
           (SELECT COUNT(*) FROM reactions WHERE target_type='comment' AND target_id=c.id AND value=-1) as dislikes
    FROM comments c
    JOIN posts p ON p.id = c.post_id
    JOIN spaces s ON s.id = p.space_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
    LIMIT 20
  `).all(user.id);

  res.json({ ...user, totalLikes, posts, comments });
});

router.patch('/:username/bio', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' });
  const { bio } = req.body;
  db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio?.trim() || null, user.id);
  res.json({ ok: true });
});

module.exports = router;
