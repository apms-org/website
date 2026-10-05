import { A, useState, useEffect, useRef, useCallback, cx, REDUCED, sleep, clamp, onFrame, Lights, Ticks } from "./lib.jsx";
import { ITEMS, NAV, TERMINAL, TOTP_CMD, TOTP_OUT, DEMO_PASSWORD, DEMO_USER, CHAPTERS } from "./seed.js";

const STOP = { stop: true };

function Sidebar({ onLock }) {
  return (
    <aside className="w-side" aria-label="Sidebar">
      <div className="w-bar"><Lights /></div>
      <div className="w-side-body">
        <button type="button" className="w-space"><A.Mark size={20} tile /><span className="w-space-name">Personal</span><A.Icon name="chevrons-up-down" size={14} /></button>
        <button type="button" className="w-search"><A.Icon name="search" size={15} /><span>Search</span><A.Kbd keys={["⌘", "K"]} /></button>
        <nav className="w-group">{NAV.library.map((n) => <A.NavItem key={n.label} icon={n.icon} label={n.label} count={n.count} badge={n.badge} active={n.id === "all"} />)}</nav>
        <div className="w-over overline">Types</div>
        <nav className="w-group">{NAV.types.map((n) => <A.NavItem key={n.label} icon={n.icon} label={n.label} count={n.count} />)}</nav>
        <div className="w-grow" />
        <nav className="w-group">
          <A.NavItem icon="settings" label="Settings" kbd={["⌘", ","]} />
          <A.NavItem icon="lock" label="Lock vault" kbd={["⌘", "L"]} onClick={onLock} />
        </nav>
      </div>
    </aside>
  );
}

function List({ sel, onSelect }) {
  let n = 0;
  return (
    <section className="w-list" aria-label="All items">
      <div className="w-bar w-list-bar">
        <span className="title-3">All items</span>
        <span className="w-count caption">48</span>
        <span className="w-grow" />
        <A.IconButton icon="list-filter" label="Sort and filter" />
        <A.IconButton icon="plus" label="New item" />
      </div>
      <div className="w-rows">
        {["Today", "This week", "Earlier"].map((g) => {
          const rows = ITEMS.filter((i) => i.group === g);
          return (
            <div key={g} className="w-sec">
              <div className="w-sec-head caption"><span>{g}</span><span>{rows.length}</span></div>
              {rows.map((i) => (
                <A.ItemRow key={i.id} className={"rd" + Math.min(++n, 10)} title={i.title} subtitle={i.sub} letter={i.letter} icon={i.icon} mono={i.mono} time={i.time} favorite={i.fav} alert={i.alert} active={sel === i.id} onClick={() => onSelect(i.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Detail({ item, onCopy }) {
  return (
    <section className="w-detail" aria-label={item.title}>
      <div className="w-bar w-detail-bar">
        <span className="w-crumb caption"><A.Icon name="layers" size={13} />All items<A.Icon name="chevron-right" size={12} />{item.title}</span>
        <span className="w-grow" />
        <A.IconButton icon="star" label={item.fav ? "Remove from favorites" : "Add to favorites"} active={item.fav} filled={item.fav} />
        <A.IconButton icon="pencil" label="Edit" />
        <A.IconButton icon="ellipsis" label="More" />
      </div>
      <div className="w-detail-body" key={item.id}>
        <div className="w-head">
          <A.ItemIcon name={item.title} letter={item.letter} icon={item.icon} size="lg" />
          <div className="w-head-text">
            <h3 className="title-1">{item.title}</h3>
            <div className="small w-kind">{item.kind} · Personal</div>
          </div>
        </div>
        <A.FieldGroup>
          {item.fields.map((f) => (
            <A.SecretField key={f.label} label={f.label} icon={f.icon} value={f.value} copyValue={f.value} totp={f.totp} secret={f.secret} mono={f.mono} href={f.href} copyable={f.copyable} onCopy={(label) => onCopy(label, !!(f.secret || f.totp))}>
              {f.strength ? <A.StrengthMeter score={f.strength.score} bits={f.strength.bits} detail={f.strength.detail} /> : null}
            </A.SecretField>
          ))}
        </A.FieldGroup>
        <div className="w-foot mono-small">
          <span>Edited {item.edited}</span>
          <span>Encrypted in vault.dat</span>
        </div>
      </div>
    </section>
  );
}

function Locked({ pw, setPw, busy, fly, error, shake, onSubmit }) {
  return (
    <div className={cx("w-lock", fly && "is-fly")}>
      <div className="w-bar"><Lights /></div>
      <div className="w-lock-body">
        <span className="w-lock-mark"><A.Mark size={56} tile /></span>
        <h3 className="display w-lock-title">Unlock your vault</h3>
        <p className="small w-lock-sub">Locked after 15 minutes idle</p>
        <div className="w-lock-field">
          <A.PasswordInput value={pw} onChange={(v) => setPw(v)} onSubmit={onSubmit} busy={busy} error={error} shakeKey={shake} placeholder="Master password" />
          <div className={cx("w-derive", busy && "is-on")} aria-hidden="true"><span /></div>
        </div>
        <button type="button" className="w-touch" onClick={() => onSubmit("touch")}><A.Icon name="fingerprint" size={15} />Use Touch ID</button>
        <div className="mono-small w-lock-cipher">{busy ? "Deriving keys with Argon2id" : "~/.apm/vault.dat"}</div>
      </div>
    </div>
  );
}

function Terminal({ lines }) {
  const live = lines.length > 0 && lines[lines.length - 1].live;
  const prompt = (text, caret, key) => (
    <div key={key} className="term-line"><span className="term-ps">~</span><span className="term-arrow">❯</span><span>{text}</span>{caret ? <span className="term-caret" /> : null}</div>
  );
  return (
    <div className="win term" role="group" aria-label="pm in a terminal">
      <div className="term-bar"><Lights /><span className="term-title mono-small">zsh · 80×24</span></div>
      <div className="term-body mono">
        {lines.map((l, i) => (l.cmd !== undefined ? prompt(l.cmd, l.live, i) : <div key={i} className={cx("term-out", l.dim && "is-dim", l.tone && "is-" + l.tone)}>{l.out}</div>))}
        {live ? null : prompt("", true, "idle")}
      </div>
    </div>
  );
}

function FieldMenu({ menu, setMenu, active, setActive, fill, setFill }) {
  const choose = () => { setMenu(false); setFill(DEMO_USER); };
  return (
    <div className="win fm" role="group" aria-label="APM for Chrome on github.com">
      <div className="fm-bar">
        <Lights />
        <div className="fm-url mono-small"><A.Icon name="lock" size={12} /><span>github.com/login</span></div>
      </div>
      <div className="fm-page">
        <div className="fm-label small-medium">Username or email address</div>
        <button type="button" className={cx("fm-input", menu && "is-focus")} onClick={() => setMenu(!menu)} aria-label="Username or email address"><span className="fm-val">{fill}</span><span className="fm-caret" /></button>
        <div className="fm-label small-medium fm-gap">Password</div>
        <div className="fm-input is-static"><span className="fm-dots">{fill ? "••••••••••••••••••" : ""}</span></div>
        <div className="fm-submit"><A.Button size="sm" block>Sign in</A.Button></div>
        {menu ? (
          <div className="fm-menu">
            <div className="im">
              <div className="im-head">
                <A.Mark size={14} />
                <span className="im-brand">APM</span>
                <span className="im-host mono-small">github.com</span>
                <A.Kbd keys={["↑", "↓"]} />
              </div>
              <button type="button" className={cx("im-row", active === 0 && "is-active")} onMouseEnter={() => setActive(0)} onClick={choose}>
                <A.ItemIcon name="GitHub" letter="G" size="sm" />
                <span className="row-text"><span className="row-title">{DEMO_USER}</span><span className="row-sub">GitHub · Personal · code ready</span></span>
                {active === 0 ? <A.Kbd keys={["↵"]} /> : null}
              </button>
              <div className="im-label overline">Passkeys</div>
              <button type="button" className={cx("im-row", active === 1 && "is-active")} onMouseEnter={() => setActive(1)} onClick={choose}>
                <A.ItemIcon icon="fingerprint" size="sm" />
                <span className="row-text"><span className="row-title">maya</span><span className="row-sub">Passkey · GitHub</span></span>
                {active === 1 ? <A.Kbd keys={["↵"]} /> : null}
              </button>
              <div className="im-sep" />
              <button type="button" className="im-row im-action"><A.Icon name="search" size={16} /><span>Search the vault</span><A.Kbd keys={["⌥", "⇧", "A"]} /></button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Ghost({ g }) {
  return (
    <div className={cx("ghost", g.on && "is-on", g.jump && "is-jump")} style={{ transform: "translate3d(" + g.x + "px, " + g.y + "px, 0)" }} aria-hidden="true">
      <span key={"r" + g.down} className={cx("ghost-ring", g.down > 0 && "is-click")} />
      <svg key={"p" + g.down} className={cx("ghost-ptr", g.down > 0 && "is-click")} width="22" height="26" viewBox="0 0 22 26"><path d="M3 2v18.6l4.9-4.4 3.2 7.4 3.3-1.4-3.2-7.3 6.7-.3z" /></svg>
    </div>
  );
}

function Tag({ label, on }) {
  return <span className={cx("wtag", on && "is-on")} aria-hidden="true"><i />{label}</span>;
}

export function Stage() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const run = useRef(0);
  const mode = useRef(REDUCED ? "off" : "idle");
  const inView = useRef(false);
  const [demo, setDemoState] = useState(mode.current);
  const [step, setStep] = useState(REDUCED ? 4 : -1);
  const [pass, setPass] = useState(0);
  const [toast, setToast] = useState(null);
  const [locked, setLocked] = useState(!REDUCED);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [fly, setFly] = useState(false);
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(0);
  const [sel, setSel] = useState("github");
  const [lines, setLines] = useState(REDUCED ? TERMINAL.concat([{ cmd: TOTP_CMD }, { out: TOTP_OUT, tone: "success" }]) : TERMINAL);
  const [menu, setMenu] = useState(!REDUCED);
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState("");
  const [ghost, setGhost] = useState({ x: 0, y: 0, on: false, jump: true, down: 0 });

  const setDemo = (m) => { mode.current = m; setDemoState(m); };
  const notify = useCallback((label, secret) => setToast({ key: Date.now(), title: "Copied " + label.toLowerCase(), countdown: secret ? 30 : undefined }), []);
  // A.Toast calls onDone from inside its own state update, so the toast is cleared on the next task rather than mid-render, and only if it is still the one showing.
  const clearToast = useCallback((key) => { setTimeout(() => setToast((t) => (t && t.key === key ? null : t)), 0); }, []);

  const unlock = useCallback(async (v) => {
    if (!v) { setError("Type your master password to unlock."); setShake((s) => s + 1); return false; }
    setError(null);
    setBusy(true);
    await sleep(1150);
    setFly(true);
    await sleep(480);
    setLocked(false);
    setBusy(false);
    setFly(false);
    setPw("");
    return true;
  }, []);

  const q = (s) => (canvasRef.current ? canvasRef.current.querySelector(s) : null);
  const field = (label) => (canvasRef.current ? Array.from(canvasRef.current.querySelectorAll(".apm-sf")).find((el) => el.textContent.startsWith(label)) : null);
  const shown = (el) => !!el && el.getClientRects().length > 0;
  const flash = (el) => {
    if (!el) return;
    el.classList.remove("is-flash");
    void el.offsetWidth;
    el.classList.add("is-flash");
    setTimeout(() => el.classList.remove("is-flash"), 1200);
  };

  const play = useCallback(async (from = 0) => {
    const id = ++run.current;
    const wait = async (ms) => { await sleep(ms); if (run.current !== id) throw STOP; };
    const move = async (el, ms, fx = 0.5, fy = 0.5) => {
      if (!shown(el) || !canvasRef.current) return false;
      const c = canvasRef.current.getBoundingClientRect(), r = el.getBoundingClientRect();
      const x = r.left - c.left + r.width * fx, y = r.top - c.top + r.height * fy;
      setGhost((g) => (g.on ? { ...g, x, y, jump: false } : { ...g, x: x + 150, y: y + 110, on: true, jump: true }));
      await wait(50);
      setGhost((g) => ({ ...g, x, y, jump: false }));
      await wait(ms);
      return true;
    };
    const click = async () => { setGhost((g) => ({ ...g, down: g.down + 1 })); await wait(200); };
    const steps = [
      async () => {
        await wait(500);
        await move(q(".w-lock input"), 900, 0.3);
        await click();
        for (let i = 1; i <= DEMO_PASSWORD.length; i++) { setPw(DEMO_PASSWORD.slice(0, i)); await wait(40); }
        await wait(220);
        await move(q(".w-lock .apm-pw-submit"), 650);
        await click();
        await unlock(DEMO_PASSWORD);
        if (run.current !== id) throw STOP;
        await wait(700);
      },
      async () => {
        const pass = field("Password");
        await move(pass && pass.querySelector(".apm-sf-value"), 900, 0.25);
        await click();
        flash(pass);
        notify("password", true);
        await wait(1500);
      },
      async () => {
        if (await move(q(".fm-input"), 900, 0.35)) {
          await click();
          setMenu(true);
          await wait(700);
          await move(q(".fm .im-row"), 650, 0.55);
          await click();
          setMenu(false);
          for (let i = 1; i <= DEMO_USER.length; i++) { setFill(DEMO_USER.slice(0, i)); await wait(24); }
          await wait(800);
        }
      },
      async () => {
        await move(q(".term-body"), 900, 0.6, 0.85);
        await click();
        setGhost((g) => ({ ...g, on: false }));
        setLines((l) => l.concat([{ cmd: "", live: true }]));
        for (let i = 1; i <= TOTP_CMD.length; i++) {
          const t = TOTP_CMD.slice(0, i);
          setLines((l) => l.slice(0, -1).concat([{ cmd: t, live: true }]));
          await wait(55);
        }
        await wait(340);
        setLines((l) => l.slice(0, -1).concat([{ cmd: TOTP_CMD }, { out: TOTP_OUT, tone: "success" }]));
        flash(field("One-time code"));
        await wait(600);
      }
    ];
    try {
      setDemo("run");
      setToast(null); setMenu(false); setFill(""); setActive(0); setLines(TERMINAL); setSel("github");
      setPw(""); setBusy(false); setFly(false); setError(null);
      setLocked(from === 0);
      for (let i = from; i < steps.length; i++) {
        setStep(i);
        setPass((p) => p + 1);
        await steps[i]();
      }
      setStep(steps.length);
      setDemo("done");
      await wait(8000);
      if (mode.current === "done") { if (inView.current) play(0); else setDemo("idle"); }
    } catch (e) {
      if (e !== STOP) throw e;
    }
  }, [unlock, notify]);

  const takeOver = (e) => {
    if (!e.isTrusted || mode.current === "off") return;
    if (e.target.closest && e.target.closest(".ch")) return;
    run.current++;
    setGhost((g) => ({ ...g, on: false }));
    setDemo("off");
  };

  useEffect(() => {
    const el = stageRef.current;
    if (REDUCED) { el.style.setProperty("--p", "1"); return undefined; }
    return onFrame((vh) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.62));
      el.style.setProperty("--p", p.toFixed(4));
      inView.current = r.top < vh * 0.8 && r.bottom > vh * 0.2;
      if (p > 0.96 && mode.current === "idle") play(0);
    });
  }, [play]);

  useEffect(() => () => { run.current++; }, []);

  const spotGrid = (e) => {
    const g = gridRef.current;
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty("--mx", e.clientX - r.left + "px");
    g.style.setProperty("--my", e.clientY - r.top + "px");
  };

  const item = ITEMS.find((i) => i.id === sel);
  const win = step >= 0 && step < CHAPTERS.length && demo === "run" ? CHAPTERS[step].win : null;
  return (
    <div ref={stageRef} className="stage" id="product" data-spy="product" onPointerMove={spotGrid}>
      <div className="frame stage-in">
        <Ticks />
        <div ref={gridRef} className="stage-grid" aria-hidden="true" />
        <div ref={canvasRef} className="stage-canvas" onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
          <div className="stage-app">
            <Tag label="Desktop app" on={win === "app"} />
            <div className={cx("win app", locked && "is-locked")} role="group" aria-label="APM desktop app, example vault">
              {locked ? (
                <Locked pw={pw} setPw={setPw} busy={busy} fly={fly} error={error} shake={shake} onSubmit={unlock} />
              ) : (
                <>
                  <Sidebar onLock={() => setLocked(true)} />
                  <List sel={sel} onSelect={setSel} />
                  <Detail item={item} onCopy={notify} />
                </>
              )}
            </div>
            <span className="glare" aria-hidden="true" />
            <div className="stage-toast" aria-live="polite">
              {toast ? <A.Toast key={toast.key} title={toast.title} countdown={toast.countdown} onDone={() => clearToast(toast.key)} /> : null}
            </div>
          </div>
          <div className="term-wrap">
            <Tag label="pm" on={win === "term"} />
            <Terminal lines={lines} />
          </div>
          <div className="fm-wrap">
            <Tag label="APM for Chrome" on={win === "browser"} />
            <FieldMenu menu={menu} setMenu={setMenu} active={active} setActive={setActive} fill={fill} setFill={setFill} />
          </div>
          <Ghost g={ghost} />
        </div>
        <div className="ch" role="group" aria-label="Product tour">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={cx("ch-item", demo !== "off" && i < step && "is-done", demo === "run" && i === step && "is-on", demo === "done" && "is-done")}
              style={{ "--dur": c.dur + "ms" }}
              onClick={() => play(i)}
              aria-label={"Play the tour from " + c.title.toLowerCase()}
            >
              <span className="ch-bar" aria-hidden="true"><i key={i === step ? pass : "s"} /></span>
              <span className="ch-top"><span className="ch-index">{"0" + (i + 1)}</span><span className="ch-title">{c.title}</span></span>
              <span className="ch-sub">{c.sub}</span>
            </button>
          ))}
          <div className="ch-end">
            <span className="ch-note">
              <span className={cx("stage-dot", demo === "run" && "is-live")} />
              {demo === "run" ? "Playing the tour" : demo === "off" ? "You're driving" : "Example vault"}
            </span>
            <A.Button size="sm" variant="ghost" icon="rotate-ccw" onClick={() => play(0)}>Replay</A.Button>
          </div>
        </div>
      </div>
    </div>
  );
}
