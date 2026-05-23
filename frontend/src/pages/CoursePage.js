import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(({ data }) => {
        setCourse(data.course);
        setLessons(data.lessons);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!course) return <div className="page">Курс не найден</div>;
  
  return (
    <div className="page">
      <Link to="/courses" className="back-link">← Все курсы</Link>
      <h1>{course.title}</h1>
      <p className="course-desc">{course.description}</p>
      <div className="lessons-list">
        <h2>Уроки</h2>
        {isAdmin && (
          <button className="btn-primary btn-create" onClick={() => navigate(`/courses/${id}/lessons/new`)}>
            + Новый урок
          </button>
        )}
        {lessons.length === 0 ? (
          <p className="empty">Уроков пока нет</p>
        ) : (
          lessons.map((lesson, i) => (
            <Link to={`/lessons/${lesson.id}`} key={lesson.id} className="lesson-item">
              <span className="lesson-num">{i + 1}</span>
              <div>
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-meta">{lesson.tasks_count} заданий</div>
              </div>
              <span className="lesson-arrow">→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}