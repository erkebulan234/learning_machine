import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function CreateLessonPage() {
  const { courseId } = useParams();
  const [form, setForm] = useState({ title: '', content: '', sort_order: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/lessons', { ...form, course_id: courseId, sort_order: Number(form.sort_order) });
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Новый урок</h1>
      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Например: Функции и замыкания" required />
          </div>
          <div className="form-group">
            <label>Содержание</label>
            <textarea name="content" value={form.content} onChange={handleChange} placeholder="Текст урока..." rows={5} />
          </div>
          <div className="form-group">
            <label>Порядок</label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} min={1} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/courses/${courseId}`)}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Создаём...' : 'Создать урок'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}