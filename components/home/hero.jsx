import React from "react";
import { A, useState, useEffect, useRef, cx, REDUCED, detectOS } from "./lib.jsx";
import { LINKS, OS_LABEL } from "./seed.js";
import { Stage } from "./stage.jsx";

const LIT = [[1, 1], [10, 0], [3, 3], [8, 2], [11, 3], [5, 0], [0, 4], [6, 4]];
const CROSS = [[2, 1], [10, 1], [4, 3], [8, 3], [12, 2], [0, 2]];

function Beam({ dir, lines, delay, dur }) {
  const [line, setLine] = useState(() => 1 + Math.floor(Math.random() * Math.max(1, lines - 1)));
  const next = () => setLine(1 + Math.floor(Math.random() * Math.max(1, lines - 1)));
  return <span className={cx("hg-beam", "is-" + dir)} style={{ "--line": line, animationDelay: delay + "ms", animationDuration: dur + "ms" }} onAnimationIteration={next} />;
}

export function HeroGrid() {
  const ref = useRef(null);
  const [g, setG] = useState({ cols: 12, rows: 6, cell: 100 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const cols = w >= 900 ? 12 : w >= 560 ? 8 : 6;
      const cell = w / cols;
      setG({ cols, rows: Math.ceil(h / cell), cell });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const lit = LIT.filter(([c, r]) => c < g.cols && r < g.rows);
  const cross = CROSS.filter(([c, r]) => c <= g.cols && r <= g.rows);
  return (
    <div ref={ref} className="hg" style={{ "--cell": g.cell + "px", "--cols": g.cols }} aria-hidden="true">
      <div className="hg-lines" />
      <div className="hg-hot" />
      {lit.map(([c, r], i) => <span key={"l" + i} className="hg-lit" style={{ "--c": c, "--r": r, "--k": i }} />)}
      {cross.map(([c, r], i) => <span key={"x" + i} className="hg-cross" style={{ "--c": c, "--r": r }} />)}
      {REDUCED ? null : (
        <>
          <Beam dir="v" lines={g.cols} delay={400} dur={5200} />
          <Beam dir="v" lines={g.cols} delay={2900} dur={6400} />
          <Beam dir="h" lines={g.rows} delay={1500} dur={7200} />
          <Beam dir="h" lines={g.rows} delay={4700} dur={6000} />
        </>
      )}
    </div>
  );
}

function Words({ text, from = 0 }) {
  const parts = text.split(" ");
  return parts.map((w, i) => (
    <React.Fragment key={i}>
      <span className="hw" style={{ "--i": from + i }}>{w}</span>
      {i < parts.length - 1 ? " " : null}
    </React.Fragment>
  ));
}

export function Hero() {
  const [os, setOs] = useState("macos");
  useEffect(() => setOs(detectOS()), []);
  const glow = (e) => {
    const el = e.currentTarget.querySelector(".hg");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  };
  return (
    <section className="hero" id="top" onPointerMove={glow}>
      <div className="frame hero-frame">
        <HeroGrid />
        <div className="hero-in">
          <h1 className="hero-title">
            <span className="hero-line"><Words text="The open source" /></span>
            <span className="hero-line"><Words text="password manager" from={3} /></span>
          </h1>
          <p className="hero-lede hx" style={{ "--i": 6 }}>
            Every password, passkey, one-time code and API key in one encrypted file on your computer. Open it from the desktop app, the terminal, Chrome or your AI tools. There's no account to create.
          </p>
          <div className="hero-ctas hx" style={{ "--i": 7 }}>
            <A.Button variant="primary" size="lg" icon="download" href="#download" className="cta-main">Download for {OS_LABEL[os]}</A.Button>
            <A.Button variant="secondary" size="lg" icon="star" href={LINKS.repo} target="_blank" rel="noreferrer" className="cta-alt">Star on GitHub</A.Button>
          </div>
          <p className="hero-meta hx" style={{ "--i": 8 }}>
            <span>Free and open source</span><i aria-hidden="true" />
            <span>GPL-3.0</span><i aria-hidden="true" />
            <span>macOS, Windows and Linux</span>
          </p>
        </div>
      </div>
      <Stage />
    </section>
  );
}
