const vm = require('vm');
const pool = require('../config/db');
const { checkAndAwardAchievements } = require('../services/achievementService');

const submitTask = async (req, res) => {
  try {
    const { id: task_id } = req.params;
    const { code } = req.body;
    const user_id = req.user.id;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Код решения обязателен' });
    }

    const { rows: taskRows } = await pool.query(
      'SELECT * FROM tasks WHERE id = $1', [task_id]
    );
    if (taskRows.length === 0)
      return res.status(404).json({ error: 'Задание не найдено' });

    const task = taskRows[0];

    if (!task.check_variable_name?.trim()) {
      return res.status(400).json({ error: 'Для задания не настроена проверка' });
    }

    try {
      const variableName = task.check_variable_name;

      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(variableName)) {
        throw new Error('Некорректное имя переменной в проверке');
      }

      const sandbox = {};
      vm.createContext(sandbox);

      vm.runInContext(
        `${code}
    globalThis.__checkedValue = ${variableName};`,
        sandbox,
        { timeout: 1000 }
      );

      const actualValue = sandbox.__checkedValue;

      if (typeof actualValue === 'undefined') {
        throw new Error(`Переменная ${variableName} не объявлена`);
      }

      if (task.check_value_type && typeof actualValue !== task.check_value_type) {
        throw new Error(`Переменная ${variableName} должна иметь тип ${task.check_value_type}`);
      }

      const expectedValue = task.check_expected_value;

      if (expectedValue !== null && expectedValue !== '') {
        const normalizedActual = String(actualValue);
        const normalizedExpected = String(expectedValue);

        if (normalizedActual !== normalizedExpected) {
          throw new Error(`Переменная ${variableName} должна быть равна ${normalizedExpected}`);
        }
      }
    } catch (testError) {
      const { rows: sub } = await pool.query(
        `INSERT INTO submissions (user_id, task_id, code, status, score)
        VALUES ($1, $2, $3, 'failed', 0) RETURNING *`,
        [user_id, task_id, code]
      );

      return res.status(400).json({
        error: testError.message || 'Решение не прошло проверку',
        submission: sub[0],
        xp_earned: 0,
      });
    }

    const { rows: existingCompleted } = await pool.query(
      `SELECT id FROM submissions
      WHERE user_id = $1 AND task_id = $2 AND status = 'completed'
      LIMIT 1`,
      [user_id, task_id]
    );

    const alreadyCompleted = existingCompleted.length > 0;
    const xpEarned = alreadyCompleted ? 0 : task.xp_reward;

    const submissionStatus = alreadyCompleted ? 'reviewed' : 'completed';

    const { rows: sub } = await pool.query(
      `INSERT INTO submissions (user_id, task_id, code, status, score)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, task_id, code, submissionStatus, xpEarned]
    );

    let updated;

    if (alreadyCompleted) {
      const { rows } = await pool.query(
        `SELECT id, username, xp, level, role
        FROM users
        WHERE id = $1`,
        [user_id]
      );
      updated = rows;
    } else {
      const { rows } = await pool.query(
        `UPDATE users
        SET xp = xp + $1,
            level = (
              SELECT MAX(l.level) FROM levels l WHERE l.xp_required <= users.xp + $1
            ),
            updated_at = NOW()
        WHERE id = $2
        RETURNING id, username, xp, level, role`,
        [task.xp_reward, user_id]
      );
      updated = rows;
    }

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
      xp_earned: xpEarned,
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
        const {
      lesson_id,
      title,
      description,
      check_variable_name,
      check_value_type,
      check_expected_value,
      xp_reward,
    } = req.body;

    if (!lesson_id || !title || !check_variable_name)
      return res.status(400).json({ error: 'lesson_id, title и check_variable_name обязательны' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (
        lesson_id,
        title,
        description,
        check_variable_name,
        check_value_type,
        check_expected_value,
        xp_reward
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        lesson_id,
        title,
        description || null,
        check_variable_name,
        check_value_type || null,
        check_expected_value ?? null,
        xp_reward ?? 10,
      ]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getTaskById, createTask, submitTask };