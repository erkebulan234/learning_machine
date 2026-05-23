-- ============================================================
--  Database initialization script
--  Порядок: независимые таблицы → таблицы с FK
-- ============================================================

-- Расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  1. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty  VARCHAR(50),
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
--  2. LEVELS
-- ============================================================
CREATE TABLE IF NOT EXISTS levels (
  level       INT         PRIMARY KEY,
  xp_required INT         NOT NULL,
  title       VARCHAR(100) NOT NULL
);

-- ============================================================
--  3. ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  condition_type  VARCHAR(100),
  condition_value INT
);

-- ============================================================
--  4. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  xp            INT          NOT NULL DEFAULT 0,
  level         INT          NOT NULL DEFAULT 1 REFERENCES levels(level),
  role          VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  5. LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  6. TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id   UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  xp_reward   INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  7. SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id      UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  code         TEXT,
  status       VARCHAR(50)  NOT NULL DEFAULT 'pending',
  score        INT          DEFAULT 0,
  submitted_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_completed_once
ON submissions(user_id, task_id)
WHERE status = 'completed';

-- ============================================================
--  8. USER_PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN      NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
--  9. USER_ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID      NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
--  Indexes (производительность часто используемых запросов)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lessons_course_id       ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lesson_id         ON tasks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id     ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id     ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id   ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user  ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);

-- ============================================================
--  Seed: базовые уровни (1–10)
-- ============================================================
INSERT INTO levels (level, xp_required, title) VALUES
  (1,    0,    'Новичок'),
  (2,    100,  'Ученик'),
  (3,    300,  'Практикант'),
  (4,    600,  'Разработчик'),
  (5,    1000, 'Специалист'),
  (6,    1500, 'Эксперт'),
  (7,    2200, 'Профессионал'),
  (8,    3000, 'Мастер'),
  (9,    4000, 'Гуру'),
  (10,   5500, 'Легенда')
ON CONFLICT (level) DO NOTHING;

INSERT INTO achievements (title, description, condition_type, condition_value) VALUES
  ('Первый шаг', 'Выполнено первое задание', 'first_submit', 1),
  ('100 XP', 'Набрано 100 очков опыта', 'xp_reached', 100),
  ('Практик', 'Выполнено 5 заданий', 'tasks_completed', 5),
  ('Ученик курса', 'Завершен первый урок', 'lessons_completed', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
--  Seed: demo course, lesson and task
-- ============================================================
INSERT INTO courses (id, title, description, difficulty) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'JavaScript для начинающих',
    'Базовый курс по JavaScript с практическими заданиями.',
    'beginner'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, course_id, title, content, sort_order) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Переменные и типы данных',
    'В этом уроке рассматриваются переменные, строки, числа и логические значения в JavaScript.',
    1
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, lesson_id, title, description, xp_reward) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Создать переменную',
    'Напишите код, который создает переменную name и записывает в нее ваше имя.',
    50
  )
ON CONFLICT (id) DO NOTHING;