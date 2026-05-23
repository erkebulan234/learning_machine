const pool = require('../config/db');
const { checkAndAwardAchievements } = require('../services/achievementService');

const submitTask = async (req, res) => {
  try {
    const { id: task_id } = req.params;
    const { code } = req.body;
    const user_id = req.user.id;

    const { rows: taskRows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1', [task_id]
    );
    if (taskRows.length === 0)
      return res.status(404).json({ error: 'Задание не найдено' });

    const task = taskRows[0];

    const { rows: sub } = await pool.query(
      `INSERT INTO submissions (user_id, task_id, code, status, score)
       VALUES ($1, $2, $3, 'completed', $4) RETURNING *`,
      [user_id, task_id, code, task.xp_reward]
    );

    const { rows: updated } = await pool.query(
      `UPDATE users
       SET xp = xp + $1,
           level = (
             SELECT MAX(l.level) FROM levels l WHERE l.xp_required <= users.xp + $1
           ),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, username, xp, level`,
      [task.xp_reward, user_id]
    );

    const { rows: allTasks } = await pool.query(
      'SELECT id FROM tasks WHERE lesson_id = $1', [task.lesson_id]
    );
    const { rows: doneTasks } = await pool.query(
      `SELECT DISTINCT task_id FROM submissions
       WHERE user_id = $1 AND task_id = ANY($2) AND status = 'completed'`,
      [user_id, allTasks.map(t => t.id)]
    );

    if (doneTasks.length === allTasks.length) {
      await pool.query(
        `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (user_id, lesson_id)
         DO UPDATE SET completed = true, completed_at = NOW(), updated_at = NOW()`,
        [user_id, task.lesson_id]
      );
    }

    // Проверяем достижения
    const newAchievements = await checkAndAwardAchievements(user_id);

    res.json({
      submission: sub[0],
      xp_earned: task.xp_reward,
      user: updated[0],
      new_achievements: newAchievements,
    });
  } catch (err) {
    console.error('submitTask error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1', [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Задание не найдено' });
    res.json({ task: rows[0] });
  } catch (err) {
    console.error('getTaskById error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const createTask = async (req, res) => {
  try {
    const { lesson_id, title, description, xp_reward } = req.body;
    if (!lesson_id || !title)
      return res.status(400).json({ error: 'lesson_id и title обязательны' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (lesson_id, title, description, xp_reward)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [lesson_id, title, description || null, xp_reward ?? 10]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getTaskById, createTask, submitTask };