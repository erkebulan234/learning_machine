import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateCoursePage() {
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'beginner' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/courses', form);
      navigate(`/courses/${data.course.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Новый курс</h1>
      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Например: Python с нуля" required />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="О чём этот курс..." rows={3} />
          </div>
          <div className="form-group">
            <label>Сложность</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange}>
              <option value="beginner">Начинающий</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/courses')}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Создаём...' : 'Создать курс'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}