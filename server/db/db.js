const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'thepit.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// Migrations for existing databases
for (const col of [
  "ALTER TABLE spaces ADD COLUMN category TEXT DEFAULT 'General'",
  "ALTER TABLE spaces ADD COLUMN rules TEXT",
  "ALTER TABLE spaces ADD COLUMN icon TEXT",
]) {
  try { db.exec(col); } catch {}
}

module.exports = db;
