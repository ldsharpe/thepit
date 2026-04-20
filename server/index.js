const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(cors({ origin: isProd ? false : 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reactions', require('./routes/reactions'));

const db = require('./db/db');
const { requireAuth } = require('./routes/auth');

app.post('/api/spaces/:id/join', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  try {
    db.prepare('INSERT INTO space_members (space_id, user_id) VALUES (?, ?)').run(id, userId);
  } catch (err) {
    if (!err.message.includes('UNIQUE')) throw err;
  }
  const count = db.prepare('SELECT COUNT(*) as c FROM space_members WHERE space_id = ?').get(id).c;
  res.json({ is_member: 1, member_count: count });
});

app.post('/api/spaces/:id/leave', requireAuth, (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;
  db.prepare('DELETE FROM space_members WHERE space_id = ? AND user_id = ?').run(id, userId);
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
