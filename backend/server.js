/*
backend/server.js

Simple server + Telegram bot integration.
Set BOT_TOKEN and WEBAPP_URL in environment variables before running.
If BOT_TOKEN is not set, bot won't launch (safe for local testing).
*/

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { Telegraf } = require('telegraf');
const { generatePack } = require('./cardLogic');
const cors = require('cors');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://PUT_YOUR_WEBAPP_URL';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'webapp')));

// Initialize SQLite DB
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      last_open INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      rarity TEXT,
      created_at INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      pack_json TEXT,
      created_at INTEGER
    )
  `);
});

// API: profile
app.get('/api/profile/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  db.get('SELECT id, username, level, exp FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ id: userId, username: null, level: 1, exp: 0 });
    res.json(row);
  });
});

// API: open pack
app.post('/api/openPack', (req, res) => {
  const { userId, username } = req.body;
  if (!userId) return res.status(400).json({ error: 'no userId' });

  const now = Date.now();
  db.get('SELECT last_open FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user) {
      db.run('INSERT INTO users (id, username, last_open) VALUES (?, ?, ?)', [userId, username || null, now]);
    } else {
      if (now - user.last_open < 30 * 60 * 1000) {
        return res.json({ error: 'wait', remaining: 30 * 60 * 1000 - (now - user.last_open) });
      }
      db.run('UPDATE users SET last_open = ? WHERE id = ?', [now, userId]);
    }

    const pack = generatePack(5);

    const stmt = db.prepare('INSERT INTO cards (id, user_id, name, rarity, created_at) VALUES (?, ?, ?, ?, ?)');
    for (const c of pack) {
      stmt.run(c.id, userId, c.name, c.rarity, now);
    }
    stmt.finalize();

    db.run('INSERT INTO history (user_id, pack_json, created_at) VALUES (?, ?, ?)', [userId, JSON.stringify(pack), now]);

    res.json({ pack });
  });
});

// API: inventory
app.get('/api/inventory/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  db.all('SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: top players
app.get('/api/top', (req, res) => {
  db.all('SELECT id, username, level, exp FROM users ORDER BY exp DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Telegram bot: start and keyboard
let bot = null;
if (BOT_TOKEN && BOT_TOKEN !== '') {
  bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx) => {
    const url = process.env.WEBAPP_URL || WEBAPP_URL;
    return ctx.reply('Добро пожаловать! Открой WebApp:', {
      reply_markup: {
        keyboard: [[{ text: '🎴 Открыть WebApp', web_app: { url } }]],
        resize_keyboard: true
      }
    });
  });

  bot.launch().then(() => console.log('Bot launched')).catch(err => {
    console.error('Bot launch error:', err.message);
  });
} else {
  console.log('BOT_TOKEN not set — bot will not be launched. Set BOT_TOKEN to enable Telegram bot.');
}

// Start HTTP server
app.listen(PORT, () => console.log(`WebApp running on port ${PORT}`));

// Graceful shutdown
process.once('SIGINT', () => {
  if (bot) bot.stop('SIGINT');
  process.exit(0);
});
process.once('SIGTERM', () => {
  if (bot) bot.stop('SIGTERM');
  process.exit(0);
});
