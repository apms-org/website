import { A, useState, useEffect, useRef, cx, REDUCED, spot, Heading, Ticks, Roll, useSeen, Copy, detectOS, at } from "./lib.jsx";
import { COMPAT, REPOS, FAQ, FOOTER, DOWNLOADS, LINKS, STATS } from "./seed.js";

const WORDMARK = "M55.8 -142H87.6L138.8 0H111.6L99.8 -33.6H43.6L31.8 0H4.6ZM92.2 -55.8 71.8 -115.8 51.2 -55.8ZM151.6 -142H206.6Q223 -142 234.9 -136.6Q246.8 -131.2 253.2 -121Q259.6 -110.8 259.6 -96.8Q259.6 -82.6 253.2 -72.3Q246.8 -62 234.9 -56.6Q223 -51.2 206.6 -51.2H177.6V0H151.6ZM232.8 -96.8Q232.8 -107.8 225.7 -113.6Q218.6 -119.4 205.4 -119.4H177.6V-73.8H205.4Q218.6 -73.8 225.7 -79.6Q232.8 -85.4 232.8 -96.8ZM276.4 -142H311.4L350.6 -32L389.8 -142H424.8V0H398.8V-98L363 -0.2H338.2L302.4 -98V0H276.4Z";

function Rotator({ names, delay }) {
  const [i, setI] = useState(0);
  const [turned, setTurned] = useState(false);
  useEffect(() => {
    if (REDUCED || names.length < 2) return undefined;
    let t = 0;
    const next = () => { setTurned(true); setI((x) => (x + 1) % names.length); };
    const s = setTimeout(() => { next(); t = setInterval(next, 2800); }, 1800 + delay);
    return () => { clearTimeout(s); clearInterval(t); };
  }, []);
  return (
    <span className="rot" aria-label={names.join(", ")}>
      <span key={i} className={cx("rot-word", turned && "is-turn")} aria-hidden="true">{names[i]}</span>
    </span>
  );
}

export function Compat() {
  return (
    <section className="compat" aria-label="Where APM works">
      <div className="frame compat-in">
        {COMPAT.map((c, i) => (
          <div key={c.label} className="compat-cell">
            <span className="compat-label overline">{c.label}</span>
            <Rotator names={c.names} delay={i * 520} />
            <span className="compat-note caption">{c.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OpenSource() {
  const ref = useRef(null);
  const seen = useSeen(ref, 0.3);
  return (
    <section className="sec open" id="open-source" data-spy="open-source" aria-labelledby="open-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="07" label="Open source" id="open-title" title="Read every line that touches your secrets.">
          APM is free software under GPL-3.0. The engine, the app, the extension and the design system are public, and every release is built by CI on macOS, Windows and Linux.
        </Heading>
        <div className="repos">
          {REPOS.map((r) => (
            <a key={r.name} className="repo" href={r.href} target="_blank" rel="noreferrer" onPointerMove={spot}>
              <span className="cell-glow" aria-hidden="true" />
              <span className="repo-head">
                <A.Icon name="git-branch" size={15} />
                <span className="repo-name mono-small">{r.name}</span>
                <A.Icon name="arrow-up-right" size={14} />
              </span>
              <span className="repo-body small">{r.body}</span>
              <span className="repo-lang caption"><i />{r.lang}</span>
            </a>
          ))}
        </div>
        <div ref={ref} className="stats">
          {STATS.map((s) => (
            <div key={s.unit} className="stat">
              <span className="stat-num"><span className="stat-value"><Roll value={s.value} on={seen} /></span><span className="stat-unit">{s.unit}</span></span>
              <p className="stat-body small">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec faq" id="faq" aria-labelledby="faq-title">
      <div className="frame sec-in faq-in">
        <Ticks />
        <div className="faq-side">
          <div className="sh-label"><span className="sh-index">08</span><span className="sh-rule" aria-hidden="true" /><span>Questions</span></div>
          <h2 className="sh-title" id="faq-title">Good questions to ask a password manager.</h2>
          <p className="sh-body">Something else? <a className="link" href={LINKS.issues} target="_blank" rel="noreferrer">Open an issue on GitHub</a>.</p>
        </div>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <div key={f.q} className={cx("faq-item", open === i && "is-open")}>
              <button type="button" className="faq-q" aria-expanded={open === i ? "true" : "false"} aria-controls={"faq-" + i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq-sign" aria-hidden="true"><i /><i /></span>
              </button>
              <div className="faq-a" id={"faq-" + i} role="region">
                <div className="faq-a-in"><p>{f.a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Download() {
  const [os, setOs] = useState("macos");
  useEffect(() => setOs(detectOS()), []);
  return (
    <section className="sec cta" id="download" aria-labelledby="cta-title" onPointerMove={spot}>
      <div className="frame sec-in cta-in">
        <Ticks />
        <span className="cta-glow" aria-hidden="true" />
        <span className="cta-rings" aria-hidden="true"><i /><i /><i /></span>
        <span className="cta-mark"><A.Mark size={76} tile /></span>
        <h2 className="cta-title" id="cta-title">Your secrets belong on your computer.</h2>
        <p className="cta-body">Download the desktop app for free. It opens the same vault as pm and APM for Chrome.</p>
        <div className="dl">
          {DOWNLOADS.map((d) => (
            <a key={d.os} className={cx("dl-item", d.os === os && "is-mine")} href={LINKS.releases} target="_blank" rel="noreferrer" onPointerMove={spot}>
              <span className="cell-glow" aria-hidden="true" />
              <span className="dl-icon"><A.Icon name={d.icon} size={20} /></span>
              <span className="dl-text"><span className="dl-title">{d.title}</span><span className="caption">{d.sub}</span></span>
              <span className="dl-go"><A.Icon name="download" size={16} /></span>
              {d.os === os ? <span className="dl-tag caption">Your system</span> : null}
            </a>
          ))}
        </div>
        <p className="caption cta-meta">Version 12.0.0 · On macOS the app also installs pm for your terminal · <a className="link" href={LINKS.changelog}>Release notes</a></p>
      </div>
    </section>
  );
}

export function Footer({ theme }) {
  const word = useRef(null);
  const glow = (e) => {
    const el = word.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--wx", ((e.clientX - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--wy", ((e.clientY - r.top) / r.height) * 100 + "%");
  };
  return (
    <footer className="foot">
      <div className="frame foot-in">
        <div className="foot-top">
          <div className="foot-brand">
            <a className="nav-brand" href={at("#top")} aria-label="APM home"><A.Mark size={26} tile /><span className="nav-word">APM</span></a>
            <p className="small foot-tag">The open source password manager. One encrypted file, every surface.</p>
            <A.SegmentedControl
              label="Theme"
              value={theme.theme || "system"}
              onChange={(v) => theme.setTheme(v === "system" ? null : v)}
              options={[{ value: "system", label: "System", icon: "monitor" }, { value: "light", label: "Light", icon: "sun" }, { value: "dark", label: "Dark", icon: "moon" }]}
            />
          </div>
          <nav className="foot-cols" aria-label="Footer">
            {FOOTER.map((c) => (
              <div key={c.title} className="foot-col">
                <span className="foot-col-title small-medium">{c.title}</span>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}><a href={at(l.href)} target={l.external ? "_blank" : undefined} rel={l.external ? "noreferrer" : undefined}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div ref={word} className="foot-word" onPointerMove={glow} aria-hidden="true">
          <svg className="foot-word-base" viewBox="4.6 -146 420.2 150" preserveAspectRatio="xMidYMax meet"><path d={WORDMARK} /></svg>
          <svg className="foot-word-lit" viewBox="4.6 -146 420.2 150" preserveAspectRatio="xMidYMax meet"><path d={WORDMARK} /></svg>
        </div>
        <div className="foot-bottom caption">
          <span>Free software under GPL-3.0</span>
          <span className="foot-dot" aria-hidden="true" />
          <span className="mono-small">v12.0.0</span>
          <span className="foot-grow" />
          <span>No account required.</span>
        </div>
      </div>
    </footer>
  );
}
