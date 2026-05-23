// controllers/coursesController.js
const pool = require('../config/db');

// GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, 
        COUNT(DISTINCT l.id) AS lessons_count
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error('getAllCourses error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM courses WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    // Уроки курса + количество заданий в каждом
    const { rows: lessons } = await pool.query(
      `SELECT l.*,
        COUNT(DISTINCT t.id) AS tasks_count
       FROM lessons l
       LEFT JOIN tasks t ON t.lesson_id = l.id
       WHERE l.course_id = $1
       GROUP BY l.id
       ORDER BY l.sort_order ASC`,
      [id]
    );

    res.json({ course: rows[0], lessons });
  } catch (err) {
    console.error('getCourseById error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// POST /api/courses
const createCourse = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Название обязательно' });
    }

    const { rows } = await pool.query(
      `INSERT INTO courses (title, description, difficulty)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description || null, difficulty || null]
    );

    res.status(201).json({ course: rows[0] });
  } catch (err) {
    console.error('createCourse error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty } = req.body;

    const { rows } = await pool.query(
      `UPDATE courses
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           difficulty  = COALESCE($3, difficulty)
       WHERE id = $4
       RETURNING *`,
      [title, description, difficulty, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json({ course: rows[0] });
  } catch (err) {
    console.error('updateCourse error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `DELETE FROM courses WHERE id = $1 RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }

    res.json({ message: 'Курс удалён' });
  } catch (err) {
    console.error('deleteCourse error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };