import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Загрузка...</div>;

  const lessonsCount = courses.reduce((sum, course) => sum + Number(course.lessons_count || 0), 0);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Learning dashboard</span>
          <h1>Курсы</h1>
          <p>Выберите курс, проходите уроки, выполняйте задания и набирайте XP.</p>
        </div>

        {isAdmin && (
          <button className="btn-primary btn-create" onClick={() => navigate('/courses/new')}>
            + Создать курс
          </button>
        )}
      </section>

      <div className="dashboard-layout">
        <main className="dashboard-main">
          {courses.length === 0 ? (
            <p className="empty">Курсов пока нет</p>
          ) : (
            <div className="courses-grid">
              {courses.map((course, index) => (
                <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                  <div className="course-topline">
                    <div className="course-difficulty">{course.difficulty}</div>
                    <span className="course-index">0{index + 1}</span>
                  </div>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <div className="course-footer">
                    <span>{course.lessons_count} уроков</span>
                    <span>Открыть →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <aside className="dashboard-aside">
          <div className="side-card profile-mini">
            <span className="eyebrow">Ваш прогресс</span>
            <strong>{user?.username || 'Студент'}</strong>
            <p>{user?.xp || 0} XP · уровень {user?.level || 1}</p>
          </div>

          <div className="side-card stats-mini">
            <div>
              <strong>{courses.length}</strong>
              <span>курсов</span>
            </div>
            <div>
              <strong>{lessonsCount}</strong>
              <span>уроков</span>
            </div>
          </div>

          <div className="side-card roadmap-card">
            <span className="eyebrow">Маршрут</span>
            <ol>
              <li>Выберите курс</li>
              <li>Пройдите урок</li>
              <li>Сдайте задание</li>
              <li>Получите XP</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}