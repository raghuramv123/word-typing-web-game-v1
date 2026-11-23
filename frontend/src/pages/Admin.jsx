import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Admin() {
  const [roots, setRoots] = useState([]);
  const [words, setWords] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [newRoot, setNewRoot] = useState('');
  const [rootId, setRootId] = useState('');
  const [text, setText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [bulk, setBulk] = useState('');
  const [filter, setFilter] = useState('');

  async function load() {
    try {
      const [r, w] = await Promise.all([api.admin.roots(), api.admin.words()]);
      setRoots(r);
      setWords(w);
      setRootId((cur) => cur || (r[0] ? String(r[0].id) : ''));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function run(action, okMsg) {
    setError('');
    setMsg('');
    try {
      const res = await action();
      setMsg(typeof okMsg === 'function' ? okMsg(res) : okMsg);
      await load();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  const addRoot = async (e) => {
    e.preventDefault();
    if (await run(() => api.admin.addRoot(newRoot.trim()), 'Root added')) setNewRoot('');
  };

  const addWord = async (e) => {
    e.preventDefault();
    const ok = await run(() => api.admin.addWord(text.trim(), meaning.trim(), Number(rootId)), 'Word added');
    if (ok) {
      setText('');
      setMeaning('');
    }
  };

  const addBulk = async (e) => {
    e.preventDefault();
    const ok = await run(
      () => api.admin.addBulk(Number(rootId), bulk),
      (r) => `Added ${r.added} word(s), skipped ${r.skipped}`
    );
    if (ok) setBulk('');
  };

  const shown = filter ? words.filter((w) => String(w.rootId) === filter) : words;

  return (
    <>
      <h2>Admin – words &amp; roots</h2>
      {msg && <div className="ok">{msg}</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-grid">
        <form className="panel" onSubmit={addRoot}>
          <h3>1. Add a root</h3>
          <label>
            Root name
            <input value={newRoot} onChange={(e) => setNewRoot(e.target.value)} placeholder="e.g. Fid" required />
          </label>
          <button className="btn">Add root</button>
        </form>

        <form className="panel" onSubmit={addWord}>
          <h3>2. Add one word</h3>
          <label>
            Root
            <select value={rootId} onChange={(e) => setRootId(e.target.value)} required>
              {roots.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Word (single word)
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="confident" required />
          </label>
          <label>
            Meaning (keep it short)
            <input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="feeling sure about yourself"
              required
            />
          </label>
          <button className="btn" disabled={!rootId}>
            Add word
          </button>
        </form>

        <form className="panel" onSubmit={addBulk}>
          <h3>3. Add many words</h3>
          <p className="muted small-text">
            Uses the root selected above. One per line: <code>word | meaning</code>
          </p>
          <textarea
            rows={6}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'confident | feeling sure about yourself\nfidelity | faithfulness to a person or cause'}
            required
          />
          <button className="btn" disabled={!rootId}>
            Add all
          </button>
        </form>
      </div>

      <h3>Roots</h3>
      <div className="chips">
        {roots.map((r) => (
          <span key={r.id} className="chip">
            {r.name} ({r.wordCount})
            <button
              title="Delete root and all its words"
              onClick={() => {
                if (window.confirm(`Delete root "${r.name}" and all ${r.wordCount} of its words?`)) {
                  run(() => api.admin.deleteRoot(r.id), 'Root deleted');
                }
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <h3>
        Words ({shown.length}){' '}
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="inline-select">
          <option value="">all roots</option>
          {roots.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </h3>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Root</th>
              <th>Word</th>
              <th>Meaning</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((w) => (
              <tr key={w.id}>
                <td>{w.rootName}</td>
                <td>
                  <b>{w.text}</b>
                </td>
                <td>{w.meaning}</td>
                <td>
                  <button className="btn small ghost" onClick={() => run(() => api.admin.deleteWord(w.id), 'Word deleted')}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
