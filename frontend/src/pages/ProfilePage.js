import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!profile) return <div className="page">Ошибка загрузки</div>;

  const { user: u, progress, achievements } = profile;
  const xpPercent = u.next_xp ? Math.min(Math.round((u.xp / u.next_xp) * 100), 100) : 100;

  return (
    <div className="page">
      <h1>Профиль</h1>
      <div className="profile-card">
        <div className="profile-avatar">{u.username[0].toUpperCase()}</div>
        <div className="profile-info">
          <h2>{u.username}</h2>
          <p className="profile-email">{u.email}</p>
          <div className="profile-level">Уровень {u.level} — {u.level_title}</div>
          <div className="xp-bar-wrap">
            <div className="xp-bar" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="xp-label">{u.xp} / {u.next_xp} XP</div>
        </div>
      </div>

      <div className="section">
        <h2>Прогресс по курсам</h2>
        {progress.length === 0 ? <p className="empty">Ещё не начато</p> : (
          progress.map(c => (
            <div key={c.id} className="progress-item">
              <span>{c.title}</span>
              <span className="progress-count">{c.done_lessons}/{c.total_lessons} уроков</span>
            </div>
          ))
        )}
      </div>

      <div className="section">
        <h2>Достижения</h2>
        {achievements.length === 0 ? <p className="empty">Пока нет достижений</p> : (
          <div className="achievements-grid">
            {achievements.map(a => (
              <div key={a.id} className="achievement-card">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-title">{a.title}</div>
                <div className="achievement-desc">{a.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}