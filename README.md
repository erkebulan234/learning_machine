# Learning Machine

Learning Machine — веб-приложение для прохождения учебных курсов, уроков и практических заданий с системой опыта, уровней и достижений.

## Технологии

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT, bcrypt

## Структура проекта

```text
 backend/
  database/
    schema.sql
  src/
    app.js
    server.js
 frontend/
  src/
```
## Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE learning_machine;
```

Выполните скрипт создания таблиц:

```bash
psql -U postgres -d learning_machine -f backend/database/schema.sql
```

## Настройка backend

Создайте файл:

```text
backend/src/.env
```

Пример содержимого:

```env
PORT=5000
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=learning_machine
DB_USER=postgres
DB_PASSWORD=1234

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Установите зависимости и запустите сервер:

```bash
cd backend
npm install
node src/server.js
```

Backend будет доступен по адресу:

```text
http://localhost:5000
```

## Настройка frontend

Установите зависимости и запустите приложение:

```bash
cd frontend
npm install
npm start
```

Frontend будет доступен по адресу:

```text
http://localhost:3000
```

## Основные возможности

- регистрация и вход пользователей;
- просмотр курсов;
- просмотр уроков;
- выполнение заданий;
- начисление XP;
- уровни пользователя;
- достижения;
- профиль пользователя;
- админ-панель для создания курсов, уроков и заданий.

## Основные API endpoints

- `POST /api/auth/register` — регистрация пользователя
- `POST /api/auth/login` — вход пользователя
- `GET /api/auth/me` — данные текущего пользователя
- `GET /api/courses` — список курсов
- `GET /api/courses/:id` — курс и его уроки
- `POST /api/courses` — создание курса, только admin
- `PUT /api/courses/:id` — обновление курса, только admin
- `DELETE /api/courses/:id` — удаление курса, только admin
- `GET /api/lessons/:id` — урок и задания
- `POST /api/lessons` — создание урока, только admin
- `PUT /api/lessons/:id` — обновление урока, только admin
- `DELETE /api/lessons/:id` — удаление урока, только admin
- `GET /api/tasks/:id` — данные задания
- `POST /api/tasks` — создание задания, только admin
- `POST /api/tasks/:id/submit` — отправка решения
- `GET /api/users/profile` — профиль пользователя
- `GET /api/achievements` — список достижений
- `GET /api/achievements/my` — достижения текущего пользователя

## Роли пользователей

По умолчанию новые пользователи создаются с ролью:

```text
user
```

Для доступа к админ-панели пользователю нужно назначить роль:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## Проверка проекта

Frontend тесты:

```bash
cd frontend
npm test -- --watchAll=false --runInBand
```

Сборка frontend:

```bash
cd frontend
npm run build
```

Проверка backend:

```bash
cd backend
node src/server.js
```