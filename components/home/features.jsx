import { A, useState, useEffect, useRef, useMemo, cx, REDUCED, sleep, spot, Heading, Ticks, Roll, useSeen, useLive, generate, entropy, scoreBits, Colored, useScramble, Copy } from "./lib.jsx";
import { CODES, WATCH, COMMITS, PASSKEYS, SPACES, TYPES, POLICY } from "./seed.js";

function Cell({ className, icon, title, body, children, foot }) {
  return (
    <article className={cx("cell", className)} onPointerMove={spot}>
      <span className="cell-glow" aria-hidden="true" />
      <div className="cell-head">
        <span className="cell-icon"><A.Icon name={icon} size={16} /></span>
        <h3 className="cell-title">{title}</h3>
      </div>
      <p className="cell-body">{body}</p>
      <div className="cell-demo">{children}</div>
      {foot ? <div className="cell-foot mono-small">{foot}</div> : null}
    </article>
  );
}

function Authenticator() {
  const [hero, ...rest] = CODES;
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="auth-hero-head">
          <A.ItemIcon name={hero.name} letter={hero.letter} icon={hero.icon} />
          <span className="auth-text"><span className="auth-name">{hero.name}</span><span className="auth-sub">{hero.sub}</span></span>
        </div>
        <A.TotpCode secret={hero.secret} size="lg" />
        <div className="auth-hero-foot caption">
          <span className="auth-chip"><A.Icon name="link-2" size={12} />Linked to the {hero.link} login</span>
          <span className="mono-small">pm totp github</span>
        </div>
      </div>
      <div className="auth-list">
        {rest.map((c) => (
          <div key={c.name} className="auth-row">
            <A.ItemIcon name={c.name} letter={c.letter} icon={c.icon} size="sm" />
            <span className="auth-text"><span className="auth-name">{c.name}</span><span className="auth-sub">{c.sub}</span></span>
            <A.TotpCode secret={c.secret} />
          </div>
        ))}
      </div>
    </div>
  );
}

const RANGES = { random: { min: 8, max: 64, def: 24, label: "Length" }, words: { min: 3, max: 10, def: 5, label: "Words" }, pin: { min: 4, max: 12, def: 6, label: "Digits" } };

function Generator() {
  const [mode, setModeState] = useState("random");
  const [sizes, setSizes] = useState({ random: 24, words: 5, pin: 6 });
  const length = sizes[mode];
  const range = RANGES[mode];
  const setMode = (m) => setModeState(m);
  const setLength = (v) => setSizes((s) => ({ ...s, [mode]: v }));
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [seed, setSeed] = useState(0);
  const pw = useMemo(() => generate({ mode, length, digits, symbols }), [mode, length, digits, symbols, seed]);
  const text = useScramble(pw, 420);
  const bits = entropy(pw, mode, { digits, symbols });
  return (
    <div className="pwgen">
      <div className="pwgen-out">
        <Colored text={text} className="pwgen-pw" />
        <div className="pwgen-row">
          <A.StrengthMeter key={scoreBits(bits)} score={scoreBits(bits)} bits={bits} />
          <div className="pwgen-acts">
            <A.IconButton icon="dices" label="Generate another" onClick={() => setSeed((s) => s + 1)} />
            <Copy text={pw} label="Copy" className="pwgen-copy" />
          </div>
        </div>
      </div>
      <div className="pwgen-ctl">
        <A.SegmentedControl label="Kind" value={mode} onChange={setMode} options={[{ value: "random", label: "Random" }, { value: "words", label: "Words" }, { value: "pin", label: "PIN" }]} />
        <label className="pwgen-len">
          <span className="caption">{range.label}</span>
          <A.Slider label={range.label} value={length} min={range.min} max={range.max} onChange={setLength} />
          <span className="pwgen-num mono-small">{length}</span>
        </label>
        <div className={cx("pwgen-opts", mode !== "random" && "is-off")}>
          <span className="pwgen-opt"><A.Switch checked={digits} onChange={setDigits} label="Digits" disabled={mode !== "random"} /><span className="small">Digits</span></span>
          <span className="pwgen-opt"><A.Switch checked={symbols} onChange={setSymbols} label="Symbols" disabled={mode !== "random"} /><span className="small">Symbols</span></span>
        </div>
      </div>
    </div>
  );
}

function Watchtower() {
  const ref = useRef(null);
  const seen = useSeen(ref, 0.4);
  return (
    <div ref={ref} className="wt">
      <div className="wt-stats">
        {WATCH.stats.map((s) => (
          <div key={s.label} className={cx("wt-stat", s.tone && "is-" + s.tone)}>
            <span className="wt-num"><Roll value={s.value} on={seen} /></span>
            <span className="caption">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="wt-list">
        {WATCH.rows.map((r) => (
          <div key={r.title} className="wt-row">
            <A.ItemIcon name={r.title} letter={r.letter} icon={r.icon} size="sm" />
            <span className="wt-text"><span className="small-medium">{r.title}</span><span className="caption">{r.why}</span></span>
            <A.Badge tone={r.tone} size="sm" dot>{r.badge}</A.Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [undone, setUndone] = useState(false);
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const undo = () => {
    if (undone) { setUndone(false); return; }
    setUndone(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setUndone(false), 6000);
  };
  const rows = undone ? [{ hash: COMMITS.undoHash, msg: "Undo: " + COMMITS.list[0].msg, when: "now", icon: "undo-2", tone: "success", fresh: true }].concat(COMMITS.list.map((c, i) => (i === 0 ? { ...c, struck: true } : c))) : COMMITS.list;
  return (
    <div className="hist">
      <ol className="hist-list">
        {rows.slice(0, 5).map((c) => (
          <li key={c.hash + (c.struck ? "s" : "")} className={cx("hist-row", c.fresh && "is-fresh", c.struck && "is-struck", c.tone && "is-" + c.tone)}>
            <span className="hist-dot"><A.Icon name={c.icon} size={13} /></span>
            <span className="hist-msg small">{c.msg}</span>
            <span className="hist-hash mono-small">{c.hash}</span>
            <span className="hist-when caption">{c.when}</span>
          </li>
        ))}
      </ol>
      <div className="hist-bar">
        <span className="hist-cmd mono-small"><span className="hist-ps">$</span> pm lgit undo</span>
        <A.Button size="sm" icon={undone ? "rotate-cw" : "undo-2"} onClick={undo}>{undone ? "Redo" : "Undo last change"}</A.Button>
      </div>
    </div>
  );
}

function Passkeys() {
  const ref = useRef(null);
  const live = useLive(ref);
  const [state, setState] = useState(REDUCED ? "ok" : "idle");
  useEffect(() => {
    if (!live || REDUCED) return undefined;
    let on = true;
    (async () => {
      while (on) {
        setState("idle"); await sleep(1600);
        if (!on) break;
        setState("ask"); await sleep(1700);
        if (!on) break;
        setState("ok"); await sleep(2400);
      }
    })();
    return () => { on = false; };
  }, [live]);
  return (
    <div ref={ref} className="pkx">
      <div className={cx("pkx-prompt", "is-" + state)}>
        <span className="pkx-ring"><A.Icon name={state === "ok" ? "check" : "fingerprint"} size={22} /></span>
        <span className="pkx-text">
          <span className="small-medium">{state === "ok" ? "Signed in to vercel.com" : "Sign in to vercel.com"}</span>
          <span className="caption">{state === "ask" ? "Signing with your P-256 key" : state === "ok" ? "Passkey · maya" : "Use a passkey saved in APM"}</span>
        </span>
      </div>
      <div className="pkx-list">
        {PASSKEYS.map((p) => (
          <div key={p.site} className="pkx-row">
            <A.ItemIcon name={p.site} letter={p.letter} size="sm" />
            <span className="pkx-row-text"><span className="small-medium">{p.site}</span><span className="caption">{p.user}</span></span>
            <span className="pkx-alg mono-small">P-256</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spaces() {
  const ref = useRef(null);
  const live = useLive(ref);
  const [space, setSpace] = useState(SPACES[0].id);
  const touched = useRef(false);
  useEffect(() => {
    if (!live || REDUCED || touched.current) return undefined;
    const t = setInterval(() => {
      if (touched.current) return;
      setSpace((s) => SPACES[(SPACES.findIndex((x) => x.id === s) + 1) % SPACES.length].id);
    }, 2600);
    return () => clearInterval(t);
  }, [live]);
  const cur = SPACES.find((s) => s.id === space);
  return (
    <div ref={ref} className="spaces">
      <A.SegmentedControl label="Space" value={space} onChange={(v) => { touched.current = true; setSpace(v); }} options={SPACES.map((s) => ({ value: s.id, label: s.label }))} />
      <div className="spaces-list" key={space}>
        {cur.items.map((it, i) => (
          <div key={it.title} className="spaces-row" style={{ "--i": i }}>
            <A.ItemIcon name={it.title} letter={it.letter} icon={it.icon} size="sm" />
            <span className="spaces-text"><span className="small-medium">{it.title}</span><span className="caption">{it.sub}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function check(pw) {
  if (pw.length < 16) return "password too short (min 16)";
  if (!/[A-Z]/.test(pw)) return "password must contain an uppercase letter";
  if (!/[0-9]/.test(pw)) return "password must contain a number";
  if (!/[^A-Za-z0-9]/.test(pw)) return "password must contain a symbol";
  return null;
}

function Policy() {
  const [pw, setPw] = useState("Sunflower2019!");
  const err = check(pw);
  return (
    <div className="pol">
      <pre className="pol-yaml mono-small"><code>
        {POLICY.map((l, i) => (
          <span key={i} className="pol-line" style={{ "--in": l.i || 0 }}>
            <span className="tk-k">{l.k}</span>:{l.v ? " " : ""}{l.v ? <span className={l.n ? "tk-n" : "tk-v"}>{l.v}</span> : null}
          </span>
        ))}
      </code></pre>
      <label className="pol-try">
        <span className="caption">Try a password</span>
        <input className="pol-input mono-small" value={pw} onChange={(e) => setPw(e.target.value)} spellCheck="false" autoComplete="off" aria-label="Password to check against the policy" />
      </label>
      <div className={cx("pol-out mono-small", err ? "is-bad" : "is-ok")} aria-live="polite">
        <A.Icon name={err ? "circle-x" : "circle-check"} size={14} />{err || "passes engineering"}
      </div>
    </div>
  );
}

function TypeRow({ items, reverse }) {
  return (
    <div className={cx("types-row", reverse && "is-rev")}>
      <div className="types-track">
        {items.concat(items).map((t, i) => (
          <span key={i} className="type-chip" aria-hidden={i >= items.length ? "true" : undefined}><A.Icon name={t.icon} size={15} />{t.label}</span>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  const half = Math.ceil(TYPES.length / 2);
  return (
    <section className="sec features" id="features" data-spy="features" aria-labelledby="features-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="02" label="Features" id="features-title" title="Everything you expect. Done carefully.">
          Codes, passkeys, a generator, health checks and a full history, all inside the same encrypted file. Try them here, nothing leaves this page.
        </Heading>
        <div className="bento">
          <Cell className="c-auth" icon="timer" title="Authenticator" body="Add a setup key and APM generates the six-digit codes. Link a code to its login and autofill or pm totp picks the right one." foot="These codes are live, computed in your browser from example keys.">
            <Authenticator />
          </Cell>
          <Cell className="c-watch" icon="radar" title="Watchtower" body="Finds reused, weak and aging passwords on your device. Nothing is sent anywhere to check.">
            <Watchtower />
          </Cell>
          <Cell className="c-pwgen" icon="dices" title="Generator" body="Random characters, word phrases or PINs from your system's secure random source.">
            <Generator />
          </Cell>
          <Cell className="c-hist" icon="history" title="History and undo" body="Every change to the vault is a commit. Undo an edit, a delete or a whole import with one click or one command.">
            <History />
          </Cell>
          <Cell className="c-pkx" icon="fingerprint" title="Passkeys" body="Create passkeys and sign in with them in Chrome. They're stored encrypted in the vault, next to everything else.">
            <Passkeys />
          </Cell>
          <Cell className="c-spaces" icon="layers" title="Spaces" body="Keep personal, work and family items apart inside one vault, each with its own list.">
            <Spaces />
          </Cell>
          <Cell className="c-pol" icon="scroll-text" title="Policy as code" body="Write password rules in YAML and turn them on with pm policy load. pm checks them on every add and edit." foot="pm reads policies from a folder next to your vault.">
            <Policy />
          </Cell>
        </div>
        <div className="types">
          <div className="types-head">
            <span className="types-count"><span className="types-num">{TYPES.length}</span><span className="small">item types</span></span>
            <span className="small types-note">Each type has the fields it needs, so a card looks like a card and an SSH key like an SSH key.</span>
          </div>
          <TypeRow items={TYPES.slice(0, half)} />
          <TypeRow items={TYPES.slice(half)} reverse />
        </div>
      </div>
    </section>
  );
}
