import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login(username.trim(), password);
      else await register(username.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth" onSubmit={submit}>
        <h1 className="brand big">
          Word<span>Fall</span>
        </h1>
        <p className="muted">{isLogin ? 'Log in to play and track your scores.' : 'Create a player account.'}</p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="letters, digits, _"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? '' : 'at least 6 characters'}
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
        </button>

        <p className="muted center">
          {isLogin ? (
            <>
              New player? <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              Already registered? <Link to="/login">Log in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
