import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

// ---- Tunable game constants -------------------------------------------------
const SLOTS = 8; // container capacity – game ends when 8 blocks are inside
const BLOCK_H = 44; // height of a block / one container slot (px)
const FALL_H = 270; // height of the free-fall zone above the container (px)
const LAND_Y = FALL_H - BLOCK_H; // block bottom touches the container rim here
const START_SPEED = 32; // px / second
const MIN_SPEED = 12;
const MAX_SPEED = 160;
const SPEED_UP = 1.03; // +3% after every correct word (word + space)
const SLOW_DOWN = 0.88; // -12% every time a block lands (missed)

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function nextBlock(s, pool) {
  if (s.qi >= s.queue.length) {
    s.queue = shuffle(pool);
    s.qi = 0;
  }
  return { word: s.queue[s.qi++], typed: 0, stage: 'word', y: 0 };
}

function Letters({ word, typed }) {
  return [...word].map((c, i) => (
    <span key={i} className={i < typed ? 'on' : ''}>
      {c}
    </span>
  ));
}

export default function FallGame() {
  const [status, setStatus] = useState('loading'); // loading | ready | playing | over | error
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [, setFrame] = useState(0);

  const pool = useRef([]); // all words fetched from the API
  const game = useRef(null); // mutable game state (changes every frame)
  const raf = useRef(0);
  const inputRef = useRef(null);

  // ---- load words once ----
  useEffect(() => {
    let cancelled = false;
    api
      .randomWords(100)
      .then((list) => {
        if (cancelled) return;
        const words = list.map((w) => w.text).filter(Boolean);
        if (words.length < 3) {
          setError('Not enough words yet. Ask the admin to add some words.');
          setStatus('error');
          return;
        }
        pool.current = words;
        setStatus('ready');
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // ---- save score when the game ends ----
  useEffect(() => {
    if (status !== 'over' || !game.current) return;
    const s = game.current;
    setSaveMsg('Saving score…');
    api
      .saveScore({ game: 'FALL', score: s.score, correct: s.correct, missed: s.missed })
      .then(() => setSaveMsg('Score saved to your history ✓'))
      .catch((e) => setSaveMsg('Could not save score: ' + e.message));
  }, [status]);

  // ---- animation loop ----
  function loop(t) {
    const s = game.current;
    if (!s || s.over) return;
    const dt = Math.min(0.05, (t - s.last) / 1000);
    s.last = t;

    const b = s.block;
    b.y += s.speed * dt;

    if (b.y >= LAND_Y) {
      // Block touched the container: it stays inside exactly as it is.
      s.landed.push({ word: b.word, typed: b.typed });
      s.missed += 1;
      s.speed = Math.max(MIN_SPEED, s.speed * SLOW_DOWN); // slow down after a miss
      if (s.landed.length >= SLOTS) {
        s.over = true;
        setFrame((f) => f + 1);
        setStatus('over');
        return;
      }
      s.block = nextBlock(s, pool.current);
    }
    setFrame((f) => f + 1);
    raf.current = requestAnimationFrame(loop);
  }

  function start() {
    const s = {
      queue: shuffle(pool.current),
      qi: 0,
      landed: [],
      speed: START_SPEED,
      score: 0,
      correct: 0,
      missed: 0,
      last: performance.now(),
      over: false,
      block: null,
      flash: 0,
    };
    s.block = nextBlock(s, pool.current);
    game.current = s;
    setSaveMsg('');
    setStatus('playing');
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // ---- keyboard input (hidden input so it also works with phone keyboards) ----
  function onType(e) {
    const text = e.target.value;
    e.target.value = '';
    const s = game.current;
    if (!s || s.over || status !== 'playing') return;

    for (const ch of text) {
      const b = s.block;
      if (b.stage === 'word') {
        if (ch.toLowerCase() === b.word[b.typed].toLowerCase()) {
          b.typed += 1; // letter gets "selected"
          if (b.typed === b.word.length) b.stage = 'space'; // word done -> block now asks for SPACE
        } else {
          s.flash = performance.now();
        }
      } else if (ch === ' ') {
        s.correct += 1;
        s.score += 10 + b.word.length;
        s.speed = Math.min(MAX_SPEED, s.speed * SPEED_UP); // slightly faster
        s.block = nextBlock(s, pool.current); // next block starts from the top
      }
    }
    setFrame((f) => f + 1);
  }

  const s = game.current;
  const speedX = s ? (s.speed / START_SPEED).toFixed(2) : '1.00';
  const shaking = s && performance.now() - s.flash < 180;

  return (
    <div className="game-wrap">
      <div className="hud">
        <div>
          <b>{s ? s.score : 0}</b>
          <small>Score</small>
        </div>
        <div>
          <b>{s ? s.correct : 0}</b>
          <small>Correct</small>
        </div>
        <div>
          <b>{s ? s.missed : 0}</b>
          <small>Missed</small>
        </div>
        <div>
          <b>{speedX}×</b>
          <small>Speed</small>
        </div>
        <div>
          <b>
            {s ? s.landed.length : 0}/{SLOTS}
          </b>
          <small>Container</small>
        </div>
      </div>

      <div
        className="arena"
        style={{ height: FALL_H + SLOTS * BLOCK_H + 8 }}
        onClick={() => inputRef.current?.focus()}
      >
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

        {/* falling block */}
        {status === 'playing' && s && (
          <div
            className={
              'block falling' + (s.block.stage === 'space' ? ' space' : '') + (shaking ? ' shake' : '')
            }
            style={{ top: s.block.y, height: BLOCK_H - 4 }}
          >
            {s.block.stage === 'word' ? (
              <Letters word={s.block.word} typed={s.block.typed} />
            ) : (
              <span className="keycap">SPACE</span>
            )}
          </div>
        )}

        {/* open-lid container */}
        <div className="container" style={{ top: FALL_H, height: SLOTS * BLOCK_H + 6 }}>
          {s &&
            s.landed.map((l, i) => (
              <div key={i} className="block landed" style={{ bottom: i * BLOCK_H + 3, height: BLOCK_H - 4 }}>
                <Letters word={l.word} typed={l.typed} />
              </div>
            ))}
        </div>

        {status !== 'playing' && (
          <div className="overlay">
            {status === 'loading' && <p>Loading words…</p>}
            {status === 'error' && (
              <>
                <p className="error">{error}</p>
                <button className="btn" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </>
            )}
            {status === 'ready' && (
              <>
                <h3>Ready?</h3>
                <p>
                  Type the falling word. When it turns into <kbd>SPACE</kbd>, press the space bar. Let 8 blocks pile into
                  the container and the game ends.
                </p>
                <button className="btn" onClick={start}>
                  Start
                </button>
              </>
            )}
            {status === 'over' && s && (
              <>
                <h3>Game over</h3>
                <p>
                  Score <b>{s.score}</b> · Correct <b>{s.correct}</b> · Missed <b>{s.missed}</b>
                </p>
                <p className="muted">{saveMsg}</p>
                <div className="row">
                  <button className="btn" onClick={start}>
                    Play again
                  </button>
                  <Link className="btn ghost" to="/history">
                    My scores
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
