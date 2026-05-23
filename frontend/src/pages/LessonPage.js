import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser, isAdmin } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(({ data }) => {
        setLesson(data.lesson);
        setTasks(data.tasks);
        if (data.tasks.length > 0) setActiveTask(data.tasks[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!activeTask || !code.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post(`/tasks/${activeTask.id}/submit`, { code });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === activeTask.id ? { ...task, completed: true } : task
        )
      );

      setActiveTask((currentTask) =>
        currentTask ? { ...currentTask, completed: true } : currentTask
      );

      setResult(data);
      updateUser(data.user);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Ошибка' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!lesson) return <div className="page">Урок не найден</div>;

  return (
  <div className="page">
    <Link to={`/courses/${lesson.course_id}`} className="back-link">
      <ArrowLeft size={18} />
      Назад к курсу
    </Link>
    <h1>{lesson.title}</h1>
    <p className="lesson-content">{lesson.content}</p>

    <div className="tasks-section">
      <h2>Задания</h2>
      {isAdmin && (
        <button className="btn-primary btn-create" onClick={() => navigate(`/lessons/${id}/tasks/new`)}>
          + Новое задание
        </button>
      )}

      {tasks.length === 0 ? (
        <p className="empty">Заданий пока нет</p>
      ) : (
        <>
          <div className="task-tabs">
            {tasks.map((task, i) => (
              <button
                key={task.id}
                className={`task-tab ${activeTask?.id === task.id ? 'active' : ''}`}
                onClick={() => { setActiveTask(task); setCode(''); setResult(null); }}
              >
                {task.completed && <Check size={16} />}
                Задание {i + 1}
              </button>
            ))}
          </div>

          {activeTask && (
            <div className="task-panel">
              <h3>{activeTask.title}</h3>
              <p className="task-desc">{activeTask.description}</p>
              <div className="xp-badge">
                {activeTask.completed ? 'Выполнено' : `+${activeTask.xp_reward} XP`}
              </div>
              <textarea
                className="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Напишите код здесь..."
                rows={10}
                spellCheck={false}
              />
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !code.trim()}
              >
                {submitting ? 'Проверяем...' : 'Сдать задание'}
              </button>

              {result && !result.error && (
                <div className="result-success">
                  <strong>
                    <Check size={18} />
                    Принято!
                  </strong>
                  +{result.xp_earned} XP
                  {result.new_achievements?.length > 0 && (
                    <div className="achievements-earned">
                      {result.new_achievements.map(a => (
                        <div key={a.id} className="achievement-badge">
                          <Trophy size={18} />
                          {a.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {result?.error && (
                <div className="error-msg">{result.error}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  </div>
)
};