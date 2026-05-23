import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/courses'); return; }
    api.get('/courses').then(({ data }) => {
      setCourses(data.courses);
    }).finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const deleteCourse = async (id) => {
    if (!window.confirm('Удалить курс и все его уроки?')) return;
    setDeleting(id);
    try {
      await api.delete(`/courses/${id}`);
      setCourses(c => c.filter(x => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка удаления');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="page-loading">Загрузка...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">⚙ Админ-панель</div>
        <nav className="admin-nav">
          <a href="#courses" className="admin-nav-item active">📚 Курсы</a>
          <Link to="/courses/new" className="admin-nav-item">➕ Новый курс</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Управление контентом</h1>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Курсов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{courses.reduce((a, c) => a + Number(c.lessons_count), 0)}</div>
            <div className="stat-label">Уроков</div>
          </div>
        </div>

        <div className="admin-section" id="courses">
          <div className="admin-section-header">
            <h2>Курсы</h2>
            <Link to="/courses/new" className="btn-primary admin-btn-new">+ Новый курс</Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Сложность</th>
                  <th>Уроков</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">Курсов нет</td></tr>
                ) : courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <Link to={`/courses/${course.id}`} className="table-link">
                        {course.title}
                      </Link>
                    </td>
                    <td><span className={`difficulty-badge ${course.difficulty}`}>{course.difficulty}</span></td>
                    <td>{course.lessons_count}</td>
                    <td>{new Date(course.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="table-actions">
                      <Link to={`/courses/${course.id}`} className="action-btn view">👁</Link>
                      <Link to={`/courses/${course.id}/lessons/new`} className="action-btn add">➕</Link>
                      <button
                        className="action-btn delete"
                        onClick={() => deleteCourse(course.id)}
                        disabled={deleting === course.id}
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}