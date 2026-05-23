import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Загрузка...</div>;

  return (
    <div className="page">
      <h1>Курсы</h1>
      {isAdmin && (
        <button className="btn-primary btn-create" onClick={() => navigate('/courses/new')}>
          + Создать курс
        </button>
      )}
      {courses.length === 0 ? (
        <p className="empty">Курсов пока нет</p>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
              <div className="course-difficulty">{course.difficulty}</div>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className="course-meta">{course.lessons_count} уроков</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}