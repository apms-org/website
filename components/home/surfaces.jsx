import { A, useState, useEffect, useRef, cx, REDUCED, onFrame, clamp, sleep, Heading, Ticks, Lights, useLive, useMedia } from "./lib.jsx";
import { SURFACES, PALETTE, SHELL_SCRIPT, CLIENTS } from "./seed.js";

function Palette({ on }) {
  const [q, setQ] = useState("github");
  const [row, setRow] = useState(0);
  useEffect(() => {
    if (!on || REDUCED) return undefined;
    let live = true;
    (async () => {
      while (live) {
        setQ(""); setRow(0);
        await sleep(700);
        for (let i = 1; i <= 6 && live; i++) { setQ("github".slice(0, i)); await sleep(110); }
        for (let r = 0; r < 4 && live; r++) { await sleep(900); setRow(r); }
        await sleep(2200);
      }
    })();
    return () => { live = false; };
  }, [on]);
  const items = q ? PALETTE.items.filter((i) => i.title.toLowerCase().includes(q.slice(0, 3))) : PALETTE.recent;
  return (
    <div className="pv">
      <div className="pv-app" aria-hidden="true">
        <div className="pv-side">{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ width: 40 + ((i * 37) % 50) + "%" }} />)}</div>
        <div className="pv-main">{[0, 1, 2, 3, 4].map((i) => <span key={i}><b /><i style={{ width: 30 + ((i * 23) % 40) + "%" }} /></span>)}</div>
      </div>
      <div className="pv-cmd" role="group" aria-label="Command menu">
        <div className="pv-input">
          <A.Icon name="search" size={16} />
          <span className={cx("pv-q", !q && "is-empty")}>{q || "Search items and actions"}<i className="pv-caret" /></span>
          <A.Kbd keys={["esc"]} />
        </div>
        <div className="pv-list">
          <div className="pv-group overline">{q ? "Items" : "Recent"}</div>
          {items.map((it, i) => (
            <div key={it.title} className={cx("pv-row", i === row && "is-on")}>
              <A.ItemIcon name={it.title} letter={it.letter} icon={it.icon} size="sm" />
              <span className="pv-text"><span className="pv-title">{it.title}</span><span className="pv-sub">{it.sub}</span></span>
              {i === row ? <A.Kbd keys={["↵"]} /> : null}
            </div>
          ))}
          <div className="pv-group overline">Actions</div>
          {PALETTE.actions.map((a) => (
            <div key={a.title} className="pv-row is-action">
              <span className="pv-ic"><A.Icon name={a.icon} size={15} /></span>
              <span className="pv-text"><span className="pv-title">{a.title}</span></span>
              <A.Kbd keys={a.kbd} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Browser({ on }) {
  const [phase, setPhase] = useState(2);
  useEffect(() => {
    if (!on || REDUCED) return undefined;
    let live = true;
    (async () => {
      while (live) {
        setPhase(0); await sleep(900);
        if (!live) break;
        setPhase(1); await sleep(2100);
        if (!live) break;
        setPhase(2); await sleep(2600);
        if (!live) break;
        setPhase(3); await sleep(2600);
      }
    })();
    return () => { live = false; };
  }, [on]);
  return (
    <div className="bv win">
      <div className="bv-bar">
        <Lights />
        <div className="bv-url mono-small"><A.Icon name="lock" size={12} /><span>linear.app/login</span></div>
        <span className="bv-ext"><A.Mark size={14} /></span>
      </div>
      <div className="bv-page">
        <div className="bv-brand"><span className="bv-logo" />Log in to Linear</div>
        <div className="bv-field">
          <span className="bv-label small-medium">Email</span>
          <span className={cx("bv-input", phase === 1 && "is-focus")}>{phase >= 2 ? "maya@example.com" : ""}<i className="bv-caret" /></span>
        </div>
        <div className="bv-field">
          <span className="bv-label small-medium">Password</span>
          <span className="bv-input">{phase >= 2 ? "•••••••••••••••••••" : ""}</span>
        </div>
        <span className="bv-btn">Continue</span>
        {phase === 1 ? (
          <div className="bv-menu im">
            <div className="im-head"><A.Mark size={14} /><span className="im-brand">APM</span><span className="im-host mono-small">linear.app</span></div>
            <div className="im-row is-active"><A.ItemIcon name="Linear" letter="L" size="sm" /><span className="row-text"><span className="row-title">maya@example.com</span><span className="row-sub">Linear · Personal</span></span><A.Kbd keys={["↵"]} /></div>
            <div className="im-row"><A.ItemIcon icon="fingerprint" size="sm" /><span className="row-text"><span className="row-title">Sign in with a passkey</span><span className="row-sub">P-256 · stored in your vault</span></span></div>
          </div>
        ) : null}
        {phase === 3 ? (
          <div className="bv-save">
            <A.Mark size={16} />
            <span className="bv-save-text"><span className="small-medium">Update the password for Linear?</span><span className="caption">Saved to Personal. Undo it any time from History.</span></span>
            <span className="bv-save-act"><span className="bv-chip">Not now</span><span className="bv-chip is-primary">Update</span></span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Shell({ on }) {
  const full = SHELL_SCRIPT;
  const [shown, setShown] = useState(full);
  useEffect(() => {
    if (!on || REDUCED) return undefined;
    let live = true;
    (async () => {
      while (live) {
        setShown([]);
        await sleep(400);
        for (const step of full) {
          if (!live) return;
          if (step.cmd) {
            for (let i = 1; i <= step.cmd.length && live; i++) { setShown((s) => s.filter((x) => !x.typing).concat([{ cmd: step.cmd.slice(0, i), typing: true }])); await sleep(38); }
            await sleep(260);
            setShown((s) => s.filter((x) => !x.typing).concat([{ cmd: step.cmd }]));
          } else {
            setShown((s) => s.concat([step]));
            await sleep(90);
          }
        }
        await sleep(4200);
      }
    })();
    return () => { live = false; };
  }, [on]);
  return (
    <div className="win term sv">
      <div className="term-bar"><Lights /><span className="term-title mono-small">zsh · ~/projects/api</span></div>
      <div className="term-body mono">
        {shown.map((l, i) => (l.cmd !== undefined ? (
          <div key={i} className="term-line"><span className="term-ps">~</span><span className="term-arrow">❯</span><span>{l.cmd}</span>{l.typing ? <span className="term-caret" /> : null}</div>
        ) : (
          <div key={i} className={cx("term-out", l.dim && "is-dim", l.tone && "is-" + l.tone)}>{l.k ? <><span className="term-k">{l.k}</span>{l.out}</> : l.out}</div>
        )))}
        {shown.length && !shown[shown.length - 1].typing ? <div className="term-line"><span className="term-ps">~</span><span className="term-arrow">❯</span><span className="term-caret" /></div> : null}
      </div>
    </div>
  );
}

function Clients({ on }) {
  const [pending, setPending] = useState(true);
  useEffect(() => {
    if (!on || REDUCED) return undefined;
    let live = true;
    (async () => {
      while (live) { setPending(true); await sleep(3200); if (!live) break; setPending(false); await sleep(2600); }
    })();
    return () => { live = false; };
  }, [on]);
  return (
    <div className="cv win">
      <div className="cv-head">
        <span className="cv-crumb caption">Settings<A.Icon name="chevron-right" size={12} />Connections</span>
        <span className="title-2">AI access</span>
        <span className="small cv-sub">Tokens for MCP clients. Each one reaches only its scopes.</span>
      </div>
      <div className="cv-list">
        {CLIENTS.map((c) => (
          <div key={c.name} className="cv-row">
            <A.ItemIcon icon={c.icon} size="sm" />
            <span className="cv-text"><span className="small-medium">{c.name}</span><span className="caption">{c.last}</span></span>
            <span className="cv-scopes">{c.scopes.map((s) => <span key={s} className={cx("scope", "is-" + s)}>{s}</span>)}</span>
          </div>
        ))}
      </div>
      <div className={cx("cv-ask", !pending && "is-done")}>
        <span className="cv-ask-icon"><A.Icon name={pending ? "shield-alert" : "check"} size={16} /></span>
        <span className="cv-text">
          <span className="small-medium">{pending ? "Cursor previewed an edit" : "Approved and committed"}</span>
          <span className="caption">{pending ? "Postmark server token · expires in 15 min" : "Written to History and the audit log"}</span>
        </span>
        <span className="cv-act">{pending ? <><span className="bv-chip">Reject</span><span className="bv-chip is-primary">Approve</span></> : <A.Badge tone="success" dot>Done</A.Badge>}</span>
      </div>
    </div>
  );
}

const VIS = { desktop: Palette, browser: Browser, shell: Shell, ai: Clients };

export function Surfaces() {
  const wrap = useRef(null);
  const steps = useRef([]);
  const live = useLive(wrap, "-10% 0px");
  const narrow = useMedia("(max-width: 960px)");
  const [active, setActive] = useState(0);
  useEffect(() => onFrame((vh) => {
    const w = wrap.current;
    if (!w) return;
    const r = w.getBoundingClientRect();
    w.style.setProperty("--sxp", clamp((vh * 0.5 - r.top) / Math.max(1, r.height)).toFixed(4));
    let cur = 0;
    steps.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top < vh * 0.55) cur = i; });
    setActive(cur);
  }), []);
  return (
    <section className="sec surfaces" id="surfaces" aria-labelledby="surfaces-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="01" label="Surfaces" id="surfaces-title" title="One vault. Every place you work.">
          The desktop app, pm, APM for Chrome and your AI tools all open the same encrypted file on your computer. Each one gets exactly the access it needs.
        </Heading>
        <div ref={wrap} className="sx">
          <div className="sx-steps">
            <span className="sx-rail" aria-hidden="true"><i /></span>
            {SURFACES.map((s, i) => {
              const V = VIS[s.id];
              return (
                <article key={s.id} id={s.anchor} data-spy={s.anchor} ref={(n) => { steps.current[i] = n; }} className={cx("sx-step", i === active && "is-on")}>
                  <div className="sx-kicker"><A.Icon name={s.icon} size={16} /><span>{s.kicker}</span></div>
                  <h3 className="sx-title">{s.title}</h3>
                  <p className="sx-body">{s.body}</p>
                  <ul className="sx-points">
                    {s.points.map((p) => <li key={p}><A.Icon name="check" size={14} /><span>{p}</span></li>)}
                  </ul>
                  {narrow ? <div className="sx-inline"><V on={live && i === active} /></div> : null}
                </article>
              );
            })}
          </div>
          {narrow ? null : <div className="sx-stage">
            <div className="sx-sticky">
              <div className="sx-frame">
                <span className="sx-glow" aria-hidden="true" />
                {SURFACES.map((s, i) => {
                  const V = VIS[s.id];
                  return <div key={s.id} className={cx("sx-vis", i === active && "is-on", i < active && "is-past")} aria-hidden={i === active ? undefined : "true"}><V on={live && i === active} /></div>;
                })}
              </div>
              <div className="sx-dots" aria-hidden="true">{SURFACES.map((s, i) => <i key={s.id} className={cx(i === active && "is-on")} />)}</div>
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}
