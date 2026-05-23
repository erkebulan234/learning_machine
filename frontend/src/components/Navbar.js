import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to={user ? '/courses' : '/'} className="navbar-logo">LearnApp</Link>

      <div className="navbar-links">
        {user ? (
          <>
            <NavLink to="/courses">Курсы</NavLink>
            <NavLink to="/profile">Профиль</NavLink>
            {isAdmin && <NavLink to="/admin" className="navbar-admin">Админ</NavLink>}
            <span className="navbar-xp">⚡ {user.xp} XP</span>
            <button onClick={handleLogout} className="btn-logout">Выйти</button>
          </>
        ) : (
          <>
            <NavLink to="/">Главная</NavLink>
            <NavLink to="/login">Войти</NavLink>
            <Link to="/register" className="nav-cta">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}