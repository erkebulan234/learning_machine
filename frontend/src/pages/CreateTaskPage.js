import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function CreateTaskPage() {
  const { lessonId } = useParams();
  const [form, setForm] = useState({ title: '', description: '', xp_reward: 10 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/tasks', { ...form, lesson_id: lessonId, xp_reward: Number(form.xp_reward) });
      navigate(`/lessons/${lessonId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Новое задание</h1>
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
            <label>Награда XP</label>
            <input type="number" name="xp_reward" value={form.xp_reward} onChange={handleChange} min={1} max={500} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/lessons/${lessonId}`)}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Создаём...' : 'Создать задание'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}