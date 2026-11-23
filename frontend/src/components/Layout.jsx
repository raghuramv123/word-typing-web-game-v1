import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="brand">
          Word<span>Fall</span>
        </NavLink>
        <nav>
          <NavLink to="/fall">Falling Words</NavLink>
          <NavLink to="/meaning">Word &amp; Meaning</NavLink>
          <NavLink to="/history">My Scores</NavLink>
          {user.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="who">
          <span>
            {user.username}
            {user.role === 'ADMIN' ? ' (admin)' : ''}
          </span>
          <button
            className="btn small ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
