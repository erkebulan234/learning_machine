import { Link, useNavigate } from 'react-router-dom';
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
      <Link to="/courses" className="navbar-logo">LearnApp</Link>
      {user && (
        <div className="navbar-links">
          <Link to="/courses">Курсы</Link>
          <Link to="/profile">Профиль</Link>
          {isAdmin && <Link to="/admin" className="navbar-admin">⚙ Админ</Link>}
          <span className="navbar-xp">⚡ {user.xp} XP</span>
          <button onClick={handleLogout} className="btn-logout">Выйти</button>
        </div>
      )}
    </nav>
  );
}