const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// GET /api/achievements — все достижения
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM achievements ORDER BY condition_value ASC'
    );
    res.json({ achievements: rows });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/achievements/my — достижения текущего юзера
router.get('/my', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, ua.unlocked_at
       FROM user_achievements ua
       JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC`,
      [req.user.id]
    );
    res.json({ achievements: rows });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;