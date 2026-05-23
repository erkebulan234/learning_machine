const pool = require('../config/db');

// GET /api/lessons/:id
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT l.*, c.title AS course_title
       FROM lessons l
       JOIN courses c ON c.id = l.course_id
       WHERE l.id = $1`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Урок не найден' });

    const { rows: tasks } = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.description,
        t.xp_reward,
        EXISTS (
          SELECT 1
          FROM submissions s
          WHERE s.task_id = t.id
            AND s.user_id = $2
            AND s.status = 'completed'
        ) AS completed
      FROM tasks t
      WHERE t.lesson_id = $1
      ORDER BY t.created_at ASC`,
      [id, req.user?.id || null]
    );

    // Прогресс текущего юзера если авторизован
    let progress = null;
    if (req.user) {
      const { rows: p } = await pool.query(
        `SELECT completed, completed_at
         FROM user_progress
         WHERE user_id = $1 AND lesson_id = $2`,
        [req.user.id, id]
      );
      progress = p[0] || null;
    }

    res.json({ lesson: rows[0], tasks, progress });
  } catch (err) {
    console.error('getLessonById error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// POST /api/lessons
const createLesson = async (req, res) => {
  try {
    const { course_id, title, content, sort_order } = req.body;

    if (!course_id || !title)
      return res.status(400).json({ error: 'course_id и title обязательны' });

    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1', [course_id]
    );
    if (courseCheck.rows.length === 0)
      return res.status(404).json({ error: 'Курс не найден' });

    const { rows } = await pool.query(
      `INSERT INTO lessons (course_id, title, content, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_id, title, content || null, sort_order ?? 0]
    );

    res.status(201).json({ lesson: rows[0] });
  } catch (err) {
    console.error('createLesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// PUT /api/lessons/:id
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, sort_order } = req.body;

    const { rows } = await pool.query(
      `UPDATE lessons
       SET title      = COALESCE($1, title),
           content    = COALESCE($2, content),
           sort_order = COALESCE($3, sort_order)
       WHERE id = $4 RETURNING *`,
      [title, content, sort_order, id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Урок не найден' });

    res.json({ lesson: rows[0] });
  } catch (err) {
    console.error('updateLesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// DELETE /api/lessons/:id
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM lessons WHERE id = $1 RETURNING id', [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Урок не найден' });
    res.json({ message: 'Урок удалён' });
  } catch (err) {
    console.error('deleteLesson error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getLessonById, createLesson, updateLesson, deleteLesson };