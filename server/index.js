const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: isProd ? false : 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reactions', require('./routes/reactions'));

const db = require('./db/db');

app.post('/api/spaces/:id/join', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('INSERT INTO space_members (space_id, user_id) VALUES (?, 1)').run(id);
  } catch (err) {
    if (!err.message.includes('UNIQUE')) throw err;
  }
  const count = db.prepare('SELECT COUNT(*) as c FROM space_members WHERE space_id = ?').get(id).c;
  res.json({ is_member: 1, member_count: count });
});

app.post('/api/spaces/:id/leave', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM space_members WHERE space_id = ? AND user_id = 1').run(id);
  const count = db.prepare('SELECT COUNT(*) as c FROM space_members WHERE space_id = ?').get(id).c;
  res.json({ is_member: 0, member_count: count });
});

if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
