const express = require('express');
const db = require('../db/db');
const router = express.Router();

router.post('/', (req, res) => {
  const { target_type, target_id, value } = req.body;
  if (!['post', 'comment'].includes(target_type) || !target_id || ![1, -1].includes(value)) {
    return res.status(400).json({ error: 'Invalid reaction' });
  }

  const existing = db.prepare(
    'SELECT * FROM reactions WHERE user_id = 1 AND target_type = ? AND target_id = ?'
  ).get(target_type, target_id);

  if (existing) {
    if (existing.value === value) {
      // Toggle off
      db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
    } else {
      // Switch vote
      db.prepare('UPDATE reactions SET value = ? WHERE id = ?').run(value, existing.id);
    }
  } else {
    db.prepare(
      'INSERT INTO reactions (user_id, target_type, target_id, value) VALUES (1, ?, ?, ?)'
    ).run(target_type, target_id, value);
  }

  const counts = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) as likes,
      COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) as dislikes
    FROM reactions WHERE target_type = ? AND target_id = ?
  `).get(target_type, target_id);

  const userReaction = db.prepare(
    'SELECT value FROM reactions WHERE user_id = 1 AND target_type = ? AND target_id = ?'
  ).get(target_type, target_id);

  res.json({ ...counts, userReaction: userReaction?.value ?? null });
});

module.exports = router;
