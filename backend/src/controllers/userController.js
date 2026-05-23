const pool = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
  `SELECT u.id, u.username, u.email, u.xp, u.level,
          u.created_at,
          curr.title AS level_title,
          next.xp_required AS next_xp
   FROM users u
   JOIN levels curr ON curr.level = u.level
   LEFT JOIN levels next ON next.level = u.level + 1
   WHERE u.id = $1`,
  [req.user.id]
);

    if (rows.length === 0)
      return res.status(404).json({ error: 'Пользователь не найден' });

    // Прогресс по курсам
    const { rows: progress } = await pool.query(
      `SELECT c.id, c.title,
              COUNT(DISTINCT l.id) AS total_lessons,
              COUNT(DISTINCT up.lesson_id) FILTER (WHERE up.completed) AS done_lessons
       FROM courses c
       JOIN lessons l ON l.course_id = c.id
       LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = $1
       GROUP BY c.id, c.title`,
      [req.user.id]
    );

    // Достижения
    const { rows: achievements } = await pool.query(
      `SELECT a.title, a.description, ua.unlocked_at
       FROM user_achievements ua
       JOIN achievements a ON a.id = ua.achievement_id
       WHERE ua.user_id = $1
       ORDER BY ua.unlocked_at DESC`,
      [req.user.id]
    );

    res.json({ user: rows[0], progress, achievements });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getProfile };