import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function MeaningGame() {
  const [roots, setRoots] = useState(null);
  const [error, setError] = useState('');
  const [root, setRoot] = useState(null);
  const [cards, setCards] = useState([]);
  const [step, setStep] = useState('pick'); // pick | play | done
  const [i, setI] = useState(0); // current card index
  const [stage, setStage] = useState('word'); // word -> meaning
  const [typed, setTyped] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(0);
  const [shake, setShake] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const inputRef = useRef(null);
  const savedRef = useRef(false);

  useEffect(() => {
    api
      .roots()
      .then(setRoots)
      .catch((e) => setError(e.message));
  }, []);

  async function choose(r) {
    setError('');
    try {
      const list = await api.rootWords(r.id);
      if (!list.length) {
        setError('This root has no words yet.');
        return;
      }
      setRoot(r);
      setCards(shuffle(list));
      setI(0);
      setStage('word');
      setTyped(0);
      setMistakes(0);
      setDone(0);
      setSaveMsg('');
      savedRef.current = false;
      setStep('play');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (e) {
      setError(e.message);
    }
  }

  function finish(correct, wrong) {
    setStep('done');
    if (savedRef.current || correct === 0) return;
    savedRef.current = true;
    const score = Math.max(0, correct * 10 - wrong);
    setSaveMsg('Saving score…');
    api
      .saveScore({ game: 'MEANING', score, correct, missed: wrong, rootId: root.id })
      .then(() => setSaveMsg('Score saved to your history ✓'))
      .catch((e) => setSaveMsg('Could not save score: ' + e.message));
  }

  function onType(e) {
    const text = e.target.value;
    e.target.value = '';
    if (step !== 'play') return;

    let idx = i;
    let st = stage;
    let t = typed;
    let m = mistakes;
    let d = done;
    let wrong = false;

    for (const ch of text) {
      if (idx >= cards.length) break;
      const target = st === 'word' ? cards[idx].text : cards[idx].meaning;
      if (ch.toLowerCase() === target[t].toLowerCase()) {
        t += 1;
        if (t === target.length) {
          if (st === 'word') {
            st = 'meaning';
            t = 0;
          } else {
            d += 1; // word + meaning typed -> card disappears, next appears
            idx += 1;
            st = 'word';
            t = 0;
          }
        }
      } else {
        m += 1;
        wrong = true;
      }
    }

    setI(idx);
    setStage(st);
    setTyped(t);
    setMistakes(m);
    setDone(d);
    if (wrong) {
      setShake(true);
      setTimeout(() => setShake(false), 180);
    }
    if (idx >= cards.length) finish(d, m);
  }

  function skip() {
    const idx = i + 1;
    setStage('word');
    setTyped(0);
    setI(idx);
    if (idx >= cards.length) finish(done, mistakes);
    inputRef.current?.focus();
  }

  // ------------------------------------------------------------------ pick root
  if (step === 'pick') {
    return (
      <>
        <h2>Word &amp; Meaning</h2>
        <p className="muted">First choose a root. You will then practise the words (and meanings) built on that root.</p>
        {error && <div className="error">{error}</div>}
        {!roots && !error && <p>Loading roots…</p>}
        {roots && roots.length === 0 && <p>No roots available yet. Ask the admin to add some.</p>}
        <div className="cards">
          {roots &&
            roots.map((r) => (
              <button key={r.id} className="panel game-card root-card" onClick={() => choose(r)}>
                <h3>{r.name}</h3>
                <p>{r.wordCount} words</p>
              </button>
            ))}
        </div>
      </>
    );
  }

  // ------------------------------------------------------------------ summary
  if (step === 'done') {
    const score = Math.max(0, done * 10 - mistakes);
    return (
      <div className="panel summary">
        <h2>Finished – root “{root.name}”</h2>
        <p>
          Cards completed <b>{done}</b> / {cards.length} · Mistakes <b>{mistakes}</b> · Score <b>{score}</b>
        </p>
        <p className="muted">{saveMsg}</p>
        <div className="row">
          <button className="btn" onClick={() => choose(root)}>
            Play this root again
          </button>
          <button className="btn ghost" onClick={() => setStep('pick')}>
            Choose another root
          </button>
          <Link className="btn ghost" to="/history">
            My scores
          </Link>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ play
  const c = cards[i];
  return (
    <div className="meaning-wrap" onClick={() => inputRef.current?.focus()}>
      <div className="hud">
        <div>
          <b>{root.name}</b>
          <small>Root</small>
        </div>
        <div>
          <b>
            {done}/{cards.length}
          </b>
          <small>Cards</small>
        </div>
        <div>
          <b>{mistakes}</b>
          <small>Mistakes</small>
        </div>
      </div>

      <div className="progress">
        <div style={{ width: `${(done / cards.length) * 100}%` }} />
      </div>

      <input
        ref={inputRef}
        className="hidden-input"
        onChange={onType}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label="Type here"
      />

      <div key={i} className={'panel card-view' + (shake ? ' shake' : '')}>
        <div className="line word-line">
          {[...c.text].map((ch, k) => (
            <span key={k} className={stage === 'meaning' || k < typed ? 'on' : ''}>
              {ch}
            </span>
          ))}
        </div>
        <div className="sep">:</div>
        <div className="line meaning-line">
          {[...c.meaning].map((ch, k) => (
            <span key={k} className={stage === 'meaning' && k < typed ? 'on' : ''}>
              {ch}
            </span>
          ))}
        </div>
        <p className="muted small-text">
          {stage === 'word' ? 'Type the word first…' : 'Now type the meaning.'}
        </p>
      </div>

      <div className="row">
        <button className="btn ghost small" onClick={skip}>
          Skip card
        </button>
        <button className="btn ghost small" onClick={() => finish(done, mistakes)}>
          End &amp; save
        </button>
      </div>
    </div>
  );
}
