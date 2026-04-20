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

if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
