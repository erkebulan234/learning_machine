import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <div className="home-badge">Learning Machine</div>
          <h1>Учись, решай задания и прокачивай уровень</h1>
          <p>
            Современная платформа для курсов, практических уроков, XP, достижений
            и отслеживания прогресса.
          </p>

          <div className="home-actions">
            {user ? (
              <Link to="/courses" className="btn-primary">Перейти к курсам</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Начать обучение</Link>
                <Link to="/login" className="btn-secondary">Войти</Link>
              </>
            )}
          </div>
        </div>

        <div className="home-preview">
          <div className="preview-top">
            <span>Course Progress</span>
            <strong>72%</strong>
          </div>
          <div className="preview-line"><span style={{ width: '72%' }} /></div>
          <div className="preview-card active">
            <span>01</span>
            <div>
              <strong>JavaScript Basics</strong>
              <small>2 урока · +120 XP</small>
            </div>
          </div>
          <div className="preview-card">
            <span>02</span>
            <div>
              <strong>Практические задания</strong>
              <small>Проверка решений</small>
            </div>
          </div>
          <div className="preview-card">
            <span>03</span>
            <div>
              <strong>Достижения</strong>
              <small>Уровни и награды</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div>
          <strong>Курсы</strong>
          <span>Структурированное обучение по темам</span>
        </div>
        <div>
          <strong>Практика</strong>
          <span>Задания с отправкой решений</span>
        </div>
        <div>
          <strong>Прогресс</strong>
          <span>XP, уровни и достижения</span>
        </div>
      </section>
    </main>
  );
}