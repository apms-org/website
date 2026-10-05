"use client";

import { useEffect, useRef, useState } from "react";

// The homepage hero's grid (lines, lit cells, crosses and beams) behind the docs title, without its glow.
const LIT = [[1, 1], [10, 0], [3, 3], [8, 2], [11, 3], [5, 0], [0, 4], [6, 4]];
const CROSS = [[2, 1], [10, 1], [4, 3], [8, 3], [12, 2], [0, 2]];

function Beam({ dir, lines, delay, dur }) {
  const pick = () => 1 + Math.floor(Math.random() * Math.max(1, lines - 1));
  const [line, setLine] = useState(1);
  useEffect(() => setLine(pick()), [lines]);
  return <span className={"hg-beam is-" + dir} style={{ "--line": line, animationDelay: delay + "ms", animationDuration: dur + "ms" }} onAnimationIteration={() => setLine(pick())} />;
}

function Grid() {
  const ref = useRef(null);
  const [g, setG] = useState({ cols: 12, rows: 4, cell: 100 });
  const [still, setStill] = useState(true);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
    <div ref={ref} className="hg" style={{ "--cell": g.cell + "px" }} aria-hidden="true">
      <div className="hg-lines" />
      <div className="hg-hot" />
      {lit.map(([c, r], i) => <span key={"l" + i} className="hg-lit" style={{ "--c": c, "--r": r, "--k": i }} />)}
      {cross.map(([c, r], i) => <span key={"x" + i} className="hg-cross" style={{ "--c": c, "--r": r }} />)}
      {!still && (
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

export default function GridHero({ children }) {
  const glow = (e) => {
    const el = e.currentTarget.querySelector(".hg");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  };
  return (
    <header className="dx-home-top" onPointerMove={glow}>
      <Grid />
      <div className="dx-home-top-in">{children}</div>
    </header>
  );
}
