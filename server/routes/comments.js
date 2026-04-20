const express = require('express');
const db = require('../db/db');
const { requireAuth } = require('./auth');
const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  const { post_id, content, parent_comment_id } = req.body;
  if (!post_id || !content?.trim()) return res.status(400).json({ error: 'post_id and content are required' });

  const result = db.prepare(
    'INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES (?, ?, ?, ?)'
  ).run(post_id, req.session.userId, parent_comment_id || null, content.trim());

  const comment = db.prepare(`
    SELECT c.*, u.username,
      (SELECT role FROM space_members WHERE space_id = (SELECT space_id FROM posts WHERE id = c.post_id) AND user_id = c.user_id) as author_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ ...comment, likes: 0, dislikes: 0 });
});

module.exports = router;
