import React from "react";
import { A, useState, useEffect, useRef, useLayoutEffect, cx, onFrame, clamp, at } from "./lib.jsx";
import { LINKS } from "./seed.js";

const MENUS = [
  {
    id: "product",
    label: "Product",
    cols: [
      {
        title: "Apps",
        items: [
          { icon: "monitor", title: "Desktop app", sub: "macOS, Windows and Linux", href: "#desktop" },
          { icon: "terminal", title: "Terminal", sub: "pm, the whole vault in your shell", href: "#cli" },
          { icon: "globe", title: "APM for Chrome", sub: "Logins, codes and passkeys on any site", href: "#browser" },
          { icon: "bot", title: "AI agents", sub: "Scoped access over MCP", href: "#agents" }
        ]
      },
      {
        title: "Features",
        compact: true,
        items: [
          { icon: "timer", title: "Authenticator", href: "#features" },
          { icon: "radar", title: "Watchtower", href: "#features" },
          { icon: "dices", title: "Generator", href: "#features" },
          { icon: "history", title: "History and undo", href: "#features" },
          { icon: "layers", title: "Spaces", href: "#features" },
          { icon: "fingerprint", title: "Passkeys", href: "#features" },
          { icon: "file-up", title: "Import and export", href: "#move" }
        ]
      }
    ],
    feature: { kind: "release", tag: "v12.0.0", title: "APM 12 is out", body: "The desktop app and APM for Chrome are here. The app and pm share version 12.", cta: "Read the release notes", href: LINKS.changelog }
  },
  {
    id: "security",
    label: "Security",
    cols: [
      {
        title: "How it works",
        items: [
          { icon: "lock-keyhole", title: "Encryption", sub: "Argon2id keys, authenticated ciphers", href: "#security" },
          { icon: "file-lock-2", title: "One vault file", sub: "Every byte encrypted and signed", href: "#security" },
          { icon: "timer", title: "Autolock", sub: "Idle, maximum and sleep timers", href: "#security" },
          { icon: "hard-drive", title: "Local by design", sub: "No account, and the vault is a file you own", href: "#security" }
        ]
      }
    ],
    feature: { kind: "model", title: "The security model", body: "What APM encrypts, where keys live and what each surface can reach.", cta: "Read the docs", href: LINKS.docs + "/security" }
  },
  {
    id: "developers",
    label: "Developers",
    cols: [
      {
        title: "Build with APM",
        items: [
          { icon: "terminal-square", title: "Command line", sub: "Every vault action as a pm command", href: "#cli" },
          { icon: "plug", title: "MCP server", sub: "Claude Desktop, Cursor and VS Code", href: "#agents" },
          { icon: "network", title: "Browser bridge", sub: "pm extension serve on 127.0.0.1:41417", href: "#browser" },
          { icon: "git-branch", title: "Source code", sub: "GPL-3.0, four repositories", href: "#open-source" }
        ]
      }
    ],
    feature: { kind: "install", title: "pm in your terminal", body: "The desktop app installs the pm command on macOS. Builds for every platform are on GitHub Releases.", cta: "GitHub Releases", href: LINKS.releases }
  }
];

const PLAIN = [
  { id: "docs", label: "Docs", href: LINKS.docs },
  { id: "releases", label: "Releases", href: LINKS.changelog }
];

const SPY = { product: "product", desktop: "product", browser: "product", features: "product", move: "product", security: "security", agents: "developers", cli: "developers", "open-source": "developers", releases: "releases" };

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("apm-site-theme"); } catch (e) { return null; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme); else root.removeAttribute("data-theme");
    try { if (theme) localStorage.setItem("apm-site-theme", theme); else localStorage.removeItem("apm-site-theme"); } catch (e) {}
  }, [theme]);
  const dark = theme ? theme === "dark" : !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return { theme, dark, setTheme, toggle: () => setTheme(dark ? "light" : "dark") };
}

export const ThemeContext = React.createContext(null);

function Feature({ f }) {
  if (f.kind === "install") {
    return (
      <div className="mm-feature">
        <div className="mm-art mm-art-term" aria-hidden="true">
          <span className="mm-term-line"><i>$</i> pm unlock</span>
          <span className="mm-term-line is-ok">Vault unlocked.</span>
          <span className="mm-term-line"><i>$</i> pm totp github<b /></span>
        </div>
        <div className="mm-feature-text">
          <span className="mm-feature-title">{f.title}</span>
          <span className="mm-feature-body">{f.body}</span>
        </div>
        <a className="mm-feature-cta" href={f.href} target="_blank" rel="noreferrer">{f.cta}<A.Icon name="arrow-up-right" size={14} /></a>
      </div>
    );
  }
  return (
    <a className="mm-feature is-link" href={f.href} target={/^https?:/.test(f.href) ? "_blank" : undefined} rel={/^https?:/.test(f.href) ? "noreferrer" : undefined}>
      {f.kind === "release" ? (
        <div className="mm-art mm-art-release" aria-hidden="true">
          <span className="mm-art-win"><i /><i /><i /></span>
          <span className="mm-art-tile"><A.Mark size={34} tile /></span>
          <span className="mm-art-tag mono-small">{f.tag}</span>
        </div>
      ) : (
        <div className="mm-art mm-art-model" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} className="mm-layer" style={{ "--i": i }} />)}
        </div>
      )}
      <div className="mm-feature-text">
        <span className="mm-feature-title">{f.title}</span>
        <span className="mm-feature-body">{f.body}</span>
      </div>
      <span className="mm-feature-cta">{f.cta}<A.Icon name="arrow-right" size={14} /></span>
    </a>
  );
}

function MenuBody({ m, onPick }) {
  return (
    <div className="mm-body">
      {m.cols.map((c) => (
        <div key={c.title} className={cx("mm-col", c.compact && "is-compact")}>
          <div className="mm-col-title overline">{c.title}</div>
          <ul className="mm-list">
            {c.items.map((it) => (
              <li key={it.title}>
                <a className="mm-item" href={at(it.href)} onClick={onPick}>
                  <span className="mm-icon"><A.Icon name={it.icon} size={c.compact ? 15 : 17} /></span>
                  <span className="mm-text">
                    <span className="mm-title">{it.title}</span>
                    {it.sub ? <span className="mm-sub">{it.sub}</span> : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Feature f={m.feature} />
    </div>
  );
}

export function Nav({ theme }) {
  const head = useRef(null);
  const shell = useRef(null);
  const links = useRef(null);
  const bodies = useRef({});
  const triggers = useRef({});
  const timer = useRef(0);
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(null);
  const [shown, setShown] = useState(null);
  const [instant, setInstant] = useState(true);
  const [box, setBox] = useState({ x: 0, w: 640, h: 320 });
  const [pill, setPill] = useState({ x: 0, w: 0, on: false });
  const [spy, setSpy] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [group, setGroup] = useState("product");

  useEffect(() => onFrame((vh) => {
    const y = window.scrollY || 0;
    setFloating(y > 12);
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    if (head.current) head.current.style.setProperty("--sp", clamp(y / max).toFixed(4));
    let cur = null;
    document.querySelectorAll("[data-spy]").forEach((s) => { if (s.getBoundingClientRect().top < vh * 0.42) cur = s.getAttribute("data-spy"); });
    setSpy(cur ? SPY[cur] || null : null);
  }), []);

  // The panel opens under its trigger's left edge and stays between the first link and the bar's right content edge.
  useLayoutEffect(() => {
    if (!open) return;
    const b = bodies.current[open], t = triggers.current[open], h = head.current, s = shell.current, l = links.current;
    if (!b || !t || !h || !s || !l) return;
    const hr = h.getBoundingClientRect(), tr = t.getBoundingClientRect(), sr = s.getBoundingClientRect(), lr = l.getBoundingClientRect();
    const w = b.offsetWidth, ht = b.offsetHeight;
    const pad = 8;
    const right = sr.right - (parseFloat(getComputedStyle(s).paddingRight) || 0);
    const lo = Math.max(lr.left - hr.left, pad), hi = Math.min(right - hr.left, hr.width - pad) - w;
    const x = Math.round(clamp(tr.left - hr.left, lo, Math.max(lo, hi)));
    setBox({ x, w, h: ht, top: Math.round(sr.bottom - hr.top + 12) });
  }, [open, floating]);

  useEffect(() => {
    if (open) {
      setShown(open);
      return undefined;
    }
    const t = setTimeout(() => { setShown(null); setInstant(true); }, 220);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => { if (e.key === "Escape") { const t = triggers.current[open]; setOpen(null); t && t.focus(); } };
    const down = (e) => { if (head.current && !head.current.contains(e.target)) setOpen(null); };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", down); };
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-drawer", drawer);
    if (!drawer) return undefined;
    const key = (e) => { if (e.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [drawer]);

  const openRef = useRef(null);
  openRef.current = open;
  const openMenu = (id, delay) => {
    clearTimeout(timer.current);
    const go = () => { setInstant(!openRef.current); setOpen(id); };
    if (delay) timer.current = setTimeout(go, delay); else go();
  };
  const closeSoon = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 160); };
  const hold = () => clearTimeout(timer.current);

  const movePill = (el) => {
    const l = links.current;
    if (!l || !el) return;
    const lr = l.getBoundingClientRect(), r = el.getBoundingClientRect();
    setPill({ x: r.left - lr.left, w: r.width, on: true });
  };

  const order = MENUS.map((m) => m.id);
  const cur = order.indexOf(shown);
  const pick = () => { setOpen(null); setDrawer(false); };

  return (
    <header ref={head} className={cx("nav", floating && "is-float", open && "is-open", drawer && "is-drawer")} style={{ "--px": box.x + "px", "--pw": box.w + "px", "--ph": box.h + "px", "--pt": (box.top || 84) + "px" }}>
      <div className="nav-veil" aria-hidden="true"><i /><i /><i /><i /></div>
      <div ref={shell} className="nav-shell">
        <nav ref={links} className="nav-links" aria-label="Main" onPointerLeave={() => { setPill((p) => ({ ...p, on: false })); closeSoon(); }}>
          <span className={cx("nav-pill", pill.on && "is-on")} style={{ transform: "translateX(" + pill.x + "px)", width: pill.w }} aria-hidden="true" />
          {MENUS.map((m) => (
            <button
              key={m.id}
              ref={(n) => { triggers.current[m.id] = n; }}
              type="button"
              className={cx("nav-link nav-trigger", open === m.id && "is-on", spy === m.id && "is-spy")}
              aria-expanded={open === m.id ? "true" : "false"}
              aria-controls={"mm-" + m.id}
              onPointerEnter={(e) => { movePill(e.currentTarget); if (e.pointerType !== "touch") openMenu(m.id, open ? 0 : 70); }}
              onFocus={(e) => movePill(e.currentTarget)}
              onClick={() => { clearTimeout(timer.current); setInstant(!open); setOpen(open === m.id ? null : m.id); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(m.id);
                  setTimeout(() => { const b = bodies.current[m.id]; const a = b && b.querySelector("a"); a && a.focus(); }, 30);
                }
              }}
            >
              {m.label}
              <A.Icon name="chevron-down" size={14} />
            </button>
          ))}
          {PLAIN.map((p) => (
            <a
              key={p.id}
              className={cx("nav-link", spy === p.id && "is-spy")}
              href={at(p.href)}
              target={p.external ? "_blank" : undefined}
              rel={p.external ? "noreferrer" : undefined}
              onPointerEnter={(e) => { movePill(e.currentTarget); closeSoon(); }}
              onFocus={(e) => movePill(e.currentTarget)}
            >
              {p.label}
            </a>
          ))}
        </nav>
        <a className="nav-brand" href={at("#top")} aria-label="APM home" onClick={pick}>
          <A.Mark size={28} tile />
          <span className="nav-word">APM</span>
        </a>
        <div className="nav-end">
          <a className="nav-gh" href={LINKS.repo} target="_blank" rel="noreferrer"><A.Icon name="star" size={15} /><span>GitHub</span></a>
          <A.Button variant="primary" href={at("#download")} className="nav-cta">Download</A.Button>
          <button type="button" className={cx("nav-burger", drawer && "is-open")} aria-label={drawer ? "Close menu" : "Open menu"} aria-expanded={drawer ? "true" : "false"} onClick={() => setDrawer(!drawer)}>
            <span /><span />
          </button>
        </div>
      </div>

      <div className={cx("mega", open && "is-on", instant && "is-instant")} onPointerEnter={hold} onPointerLeave={closeSoon} aria-hidden={open ? undefined : "true"}>
        <div className="mega-inner">
          {MENUS.map((m, i) => (
            <div
              key={m.id}
              id={"mm-" + m.id}
              ref={(n) => { bodies.current[m.id] = n; }}
              className="mm"
              data-pos={i === cur ? "on" : i < cur ? "before" : "after"}
              inert={!(i === cur && open)}
            >
              <MenuBody m={m} onPick={pick} />
            </div>
          ))}
        </div>
      </div>

      <div className={cx("drawer", drawer && "is-open")} aria-hidden={drawer ? undefined : "true"} inert={!drawer}>
        <div className="drawer-in">
          {MENUS.map((m) => (
            <div key={m.id} className={cx("drawer-group", group === m.id && "is-open")}>
              <button type="button" className="drawer-head" aria-expanded={group === m.id ? "true" : "false"} onClick={() => setGroup(group === m.id ? null : m.id)}>
                <span>{m.label}</span>
                <A.Icon name="chevron-down" size={16} />
              </button>
              <div className="drawer-body" inert={group !== m.id}>
                <div className="drawer-list">
                  {m.cols.flatMap((c) => c.items).map((it) => (
                    <a key={it.title} className="drawer-item" href={at(it.href)} onClick={pick}>
                      <A.Icon name={it.icon} size={16} />
                      <span>{it.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {PLAIN.map((p) => <a key={p.id} className="drawer-head drawer-link" href={at(p.href)} onClick={pick}>{p.label}</a>)}
          <a className="drawer-head drawer-link" href={LINKS.repo} target="_blank" rel="noreferrer">GitHub</a>
          <div className="drawer-cta">
            <A.Button variant="primary" block href={at("#download")} onClick={pick}>Download APM</A.Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export { useTheme };
