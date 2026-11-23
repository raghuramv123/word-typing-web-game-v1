import { useEffect, useState } from 'react';
import { api } from '../api';

const GAME_NAME = { FALL: 'Falling Words', MEANING: 'Word & Meaning' };

export default function History() {
  const [scores, setScores] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .myScores()
      .then(setScores)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!scores) return <p>Loading…</p>;

  const best = (game) => scores.filter((s) => s.game === game).reduce((m, s) => Math.max(m, s.score), 0);

  return (
    <>
      <h2>My scores</h2>
      <div className="hud">
        <div>
          <b>{scores.length}</b>
          <small>Games played</small>
        </div>
        <div>
          <b>{best('FALL')}</b>
          <small>Best – Falling Words</small>
        </div>
        <div>
          <b>{best('MEANING')}</b>
          <small>Best – Word &amp; Meaning</small>
        </div>
      </div>

      {scores.length === 0 ? (
        <p className="muted">No games yet – go play one!</p>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Root</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Missed / mistakes</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>{GAME_NAME[s.game] || s.game}</td>
                  <td>{s.rootName || '–'}</td>
                  <td>
                    <b>{s.score}</b>
                  </td>
                  <td>{s.correct}</td>
                  <td>{s.missed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
