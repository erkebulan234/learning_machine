import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function CreateTaskPage() {
  const { lessonId, taskId } = useParams();
  const isEditing = Boolean(taskId);
  const [form, setForm] = useState({
    title: '',
    description: '',
    check_variable_name: '',
    check_value_type: 'string',
    check_expected_value: '',
    xp_reward: 10,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [returnLessonId, setReturnLessonId] = useState(lessonId || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/tasks/${taskId}`)
      .then(({ data }) => {
        const task = data.task;
        setReturnLessonId(task.lesson_id);
        setForm({
          title: task.title || '',
          description: task.description || '',
          check_variable_name: task.check_variable_name || '',
          check_value_type: task.check_value_type || 'string',
          check_expected_value: task.check_expected_value || '',
          xp_reward: task.xp_reward || 10,
        });
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Ошибка загрузки задания');
      });
  }, [isEditing, taskId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        const { data } = await api.put(`/tasks/${taskId}`, {
          ...form,
          xp_reward: Number(form.xp_reward),
        });
        navigate(`/lessons/${data.task.lesson_id}`);
      } else {
        await api.post('/tasks', {
          ...form,
          lesson_id: lessonId,
          xp_reward: Number(form.xp_reward),
        });
        navigate(`/lessons/${lessonId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>{isEditing ? 'Редактировать задание' : 'Новое задание'}</h1>
      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Например: Напишите функцию сложения" required />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Что нужно сделать..." rows={4} />
          </div>
          <div className="form-group">
            <label>Имя переменной</label>
            <input
              name="check_variable_name"
              value={form.check_variable_name}
              onChange={handleChange}
              placeholder="Например: name"
              required
            />
          </div>

          <div className="form-group">
            <label>Тип значения</label>
            <select
              name="check_value_type"
              value={form.check_value_type}
              onChange={handleChange}
            >
              <option value="string">Строка</option>
              <option value="number">Число</option>
              <option value="boolean">Логическое значение</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ожидаемое значение</label>
            <input
              name="check_expected_value"
              value={form.check_expected_value}
              onChange={handleChange}
              placeholder="Например: Erkebulan"
            />
          </div>
          <div className="form-group">
            <label>Награда XP</label>
            <input type="number" name="xp_reward" value={form.xp_reward} onChange={handleChange} min={1} max={500} />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/lessons/${returnLessonId || lessonId}`)}
            >
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
             {loading ? 'Сохраняем...' : isEditing ? 'Сохранить' : 'Создать задание'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}