const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'Все поля обязательны' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email или username уже занят' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, xp, level, role, created_at`,
      [username, email, password_hash]
    );

    const user = rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email и пароль обязательны' });

    const { rows } = await pool.query(
      `SELECT id, username, email, password_hash, xp, level, role
       FROM users WHERE email = $1`,
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const { password_hash, ...userWithoutHash } = user;
    const token = generateToken(user);

    res.json({ user: userWithoutHash, token });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, xp, level, role, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Пользователь не найден' });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { register, login, me };