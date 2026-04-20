const express = require('express');
const db = require('../db/db');
const router = express.Router();

router.get('/', (req, res) => {
  const spaces = db.prepare(`
    SELECT s.*, u.username as creator,
      (SELECT COUNT(*) FROM posts WHERE space_id = s.id) as post_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) as member_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id AND user_id = 1) as is_member
    FROM spaces s
    LEFT JOIN users u ON s.created_by = u.id
    ORDER BY s.created_at DESC
  `).all();
  res.json(spaces);
});

router.post('/', (req, res) => {
  const { name, description, banner_color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = db.prepare(
      'INSERT INTO spaces (name, description, banner_color, created_by) VALUES (?, ?, ?, 1)'
    ).run(name.trim(), description?.trim() || null, banner_color || '#4B9CD3');
    const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(space);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Space name already taken' });
    throw err;
  }
});


router.get('/:id', (req, res) => {
  const space = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM posts WHERE space_id = s.id) as post_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) as member_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id AND user_id = 1) as is_member
    FROM spaces s
    WHERE s.id = ?
  `).get(req.params.id);
  if (!space) return res.status(404).json({ error: 'Space not found' });
  res.json(space);
});

module.exports = router;
