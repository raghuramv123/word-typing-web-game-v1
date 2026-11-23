import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <h2>Welcome, {user.username}</h2>
      <p className="muted">Pick a game. Your scores are saved automatically.</p>
      <div className="cards">
        <Link to="/fall" className="panel game-card">
          <h3>Falling Words</h3>
          <p>
            Type each falling word, then press <kbd>Space</kbd>. Missed words pile up in the container – when 8 are in,
            it&apos;s game over.
          </p>
        </Link>
        <Link to="/meaning" className="panel game-card">
          <h3>Word &amp; Meaning</h3>
          <p>Choose a root (like “Fid”), then type each word and its meaning to learn the vocabulary.</p>
        </Link>
        <Link to="/history" className="panel game-card">
          <h3>My Scores</h3>
          <p>See your history and best scores.</p>
        </Link>
        {user.role === 'ADMIN' && (
          <Link to="/admin" className="panel game-card">
            <h3>Admin</h3>
            <p>Add roots, words and meanings used by the games.</p>
          </Link>
        )}
      </div>
    </>
  );
}
