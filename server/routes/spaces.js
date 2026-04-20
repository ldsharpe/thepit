const express = require('express');
const db = require('../db/db');
const { requireAuth } = require('./auth');
const router = express.Router();

function requireCoordinator(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  const member = db.prepare(
    'SELECT role FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId);
  if (!member || member.role !== 'coordinator') {
    return res.status(403).json({ error: 'Coordinator access required' });
  }
  next();
}

router.get('/', (req, res) => {
  const userId = req.session.userId || 0;
  const spaces = db.prepare(`
    SELECT s.*, u.username as creator,
      (SELECT COUNT(*) FROM posts WHERE space_id = s.id) as post_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) as member_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id AND user_id = ?) as is_member,
      (SELECT role FROM space_members WHERE space_id = s.id AND user_id = ?) as user_role
    FROM spaces s
    LEFT JOIN users u ON s.created_by = u.id
    ORDER BY s.created_at DESC
  `).all(userId, userId);
  res.json(spaces);
});

router.post('/', requireAuth, (req, res) => {
  const { name, description, banner_color, category, rules, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = db.prepare(
      'INSERT INTO spaces (name, description, banner_color, category, rules, icon, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name.trim(),
      description?.trim() || null,
      banner_color || '#4B9CD3',
      category || 'General',
      rules?.trim() || null,
      icon?.trim() || null,
      req.session.userId,
    );
    const spaceId = result.lastInsertRowid;
    // Auto-join creator as coordinator
    db.prepare(
      'INSERT OR IGNORE INTO space_members (space_id, user_id, role) VALUES (?, ?, ?)'
    ).run(spaceId, req.session.userId, 'coordinator');
    const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(spaceId);
    res.status(201).json(space);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Space name already taken' });
    throw err;
  }
});

router.get('/:id', (req, res) => {
  const userId = req.session.userId || 0;
  const space = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM posts WHERE space_id = s.id) as post_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) as member_count,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id AND user_id = ?) as is_member,
      (SELECT role FROM space_members WHERE space_id = s.id AND user_id = ?) as user_role
    FROM spaces s
    WHERE s.id = ?
  `).get(userId, userId, req.params.id);
  if (!space) return res.status(404).json({ error: 'Space not found' });
  res.json(space);
});

router.put('/:id/settings', requireCoordinator, (req, res) => {
  const { description, banner_color, category, rules, icon } = req.body;
  db.prepare(`
    UPDATE spaces SET
      description = ?,
      banner_color = ?,
      category = ?,
      rules = ?,
      icon = ?
    WHERE id = ?
  `).run(
    description?.trim() || null,
    banner_color || '#4B9CD3',
    category || 'General',
    rules?.trim() || null,
    icon?.trim() || null,
    req.params.id,
  );
  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  res.json(space);
});

router.get('/:id/members', (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.username, sm.role, sm.joined_at,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND space_id = sm.space_id) as post_count
    FROM space_members sm
    JOIN users u ON sm.user_id = u.id
    WHERE sm.space_id = ?
    ORDER BY CASE sm.role WHEN 'coordinator' THEN 0 WHEN 'helper' THEN 1 ELSE 2 END, sm.joined_at ASC
  `).all(req.params.id);
  res.json(members);
});

router.patch('/:id/members/:userId/role', requireCoordinator, (req, res) => {
  const { role } = req.body;
  if (!['helper', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role must be helper or member' });
  }
  // Cannot change coordinator's own role
  const target = db.prepare(
    'SELECT role FROM space_members WHERE space_id = ? AND user_id = ?'
  ).get(req.params.id, req.params.userId);
  if (!target) return res.status(404).json({ error: 'Member not found' });
  if (target.role === 'coordinator') return res.status(403).json({ error: 'Cannot change coordinator role' });

  db.prepare(
    'UPDATE space_members SET role = ? WHERE space_id = ? AND user_id = ?'
  ).run(role, req.params.id, req.params.userId);
  res.json({ ok: true, role });
});

module.exports = router;
