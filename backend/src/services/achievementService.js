const pool = require('../config/db');

const CONDITION_TYPES = {
  XP_REACHED:       'xp_reached',       // набрал N XP
  LESSONS_COMPLETED:'lessons_completed', // завершил N уроков
  TASKS_COMPLETED:  'tasks_completed',   // сдал N заданий
  FIRST_SUBMIT:     'first_submit',      // первая сдача
};

const checkAndAwardAchievements = async (user_id) => {
  try {
    // Текущая статистика юзера
    const { rows: stats } = await pool.query(
      `SELECT
        u.xp,
        (SELECT COUNT(*) FROM user_progress   WHERE user_id = $1 AND completed = true) AS lessons_done,
        (SELECT COUNT(*) FROM submissions      WHERE user_id = $1 AND status = 'completed') AS tasks_done
       FROM users u WHERE u.id = $1`,
      [user_id]
    );

    if (stats.length === 0) return [];

    const { xp, lessons_done, tasks_done } = stats[0];

    // Все ачивки которых у юзера ещё нет
    const { rows: available } = await pool.query(
      `SELECT a.* FROM achievements a
       WHERE a.id NOT IN (
         SELECT achievement_id FROM user_achievements WHERE user_id = $1
       )`,
      [user_id]
    );

    const awarded = [];

    for (const achievement of available) {
      let earned = false;

      switch (achievement.condition_type) {
        case CONDITION_TYPES.XP_REACHED:
          earned = parseInt(xp) >= achievement.condition_value;
          break;
        case CONDITION_TYPES.LESSONS_COMPLETED:
          earned = parseInt(lessons_done) >= achievement.condition_value;
          break;
        case CONDITION_TYPES.TASKS_COMPLETED:
          earned = parseInt(tasks_done) >= achievement.condition_value;
          break;
        case CONDITION_TYPES.FIRST_SUBMIT:
          earned = parseInt(tasks_done) >= 1;
          break;
      }

      if (earned) {
        await pool.query(
          `INSERT INTO user_achievements (user_id, achievement_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [user_id, achievement.id]
        );
        awarded.push(achievement);
      }
    }

    return awarded;
  } catch (err) {
    console.error('achievementService error:', err);
    return [];
  }
};

module.exports = { checkAndAwardAchievements };