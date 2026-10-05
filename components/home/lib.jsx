import "./ds-global.js";
import "../../vendor/design-system/bundle.js";
import React from "react";

export const A = window.APM;
export const { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } = React;
export const REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const cx = (...c) => c.filter(Boolean).join(" ");
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
// In-page links like "#cli" point back to the homepage when the nav or footer sits on another page.
export const at = (href) => (typeof href === "string" && href[0] === "#" && window.location.pathname !== "/" ? "/" + href : href);

const subs = new Set();
let frame = 0;
const flush = () => {
  frame = 0;
  const vh = window.innerHeight || 800;
  subs.forEach((fn) => fn(vh));
};
const kick = () => { if (!frame) frame = requestAnimationFrame(flush); };
window.addEventListener("scroll", kick, { passive: true });
window.addEventListener("resize", kick);

export function onFrame(fn) {
  subs.add(fn);
  fn(window.innerHeight || 800);
  return () => subs.delete(fn);
}

export function useScrollVar(ref, calc, name = "--p") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (REDUCED) { el.style.setProperty(name, "1"); return undefined; }
    let last = -1;
    return onFrame((vh) => {
      const v = clamp(calc(el.getBoundingClientRect(), vh));
      if (Math.abs(v - last) > 0.0005) { last = v; el.style.setProperty(name, v.toFixed(4)); }
    });
  }, []);
}

export function useSeen(ref, threshold = 0.25) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (!("IntersectionObserver" in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return seen;
}

export function useLive(ref, margin = "0px") {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setLive(true); return undefined; }
    const io = new IntersectionObserver((es) => setLive(es[es.length - 1].isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return live;
}

export function useMedia(query) {
  const get = () => !!(window.matchMedia && window.matchMedia(query).matches);
  const [on, setOn] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const m = window.matchMedia(query);
    const fn = () => setOn(m.matches);
    fn();
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, [query]);
  return on;
}

export function useLoop(active, fn, deps = []) {
  useEffect(() => {
    if (!active || REDUCED) return undefined;
    const run = { on: true };
    fn(run);
    return () => { run.on = false; };
  }, [active, ...deps]);
}

export function spot(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", e.clientX - r.left + "px");
  el.style.setProperty("--my", e.clientY - r.top + "px");
}

export function Roll({ value, on }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!on || REDUCED) return undefined;
    let b = 0;
    const a = requestAnimationFrame(() => { b = requestAnimationFrame(() => setArmed(true)); });
    return () => { cancelAnimationFrame(a); cancelAnimationFrame(b); };
  }, [on]);
  return (
    <span className="roll" aria-label={value}>
      {String(value).split("").map((ch, i) => (/\d/.test(ch) ? (
        <span key={i} className="roll-col" aria-hidden="true">
          <span className={cx("roll-strip", armed && "is-on")} style={{ "--d": ch, transitionDelay: i * 90 + "ms" }}>
            {Array.from({ length: 20 }, (_, k) => <span key={k}>{k % 10}</span>)}
          </span>
        </span>
      ) : <span key={i} aria-hidden="true">{ch}</span>))}
    </span>
  );
}

const SETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  digits: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~"
};
const WORDS = ["orbit", "lantern", "quarry", "harbor", "copper", "meadow", "falcon", "ember", "glacier", "willow", "summit", "cobalt", "thistle", "juniper", "saffron", "basalt", "tundra", "marble", "pepper", "vellum", "cinder", "fjord", "hollow", "kestrel"];

function rand(n) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
}

export function generate({ mode = "random", length = 24, digits = true, symbols = true }) {
  if (mode === "words") {
    const parts = Array.from({ length }, () => WORDS[rand(WORDS.length)]);
    parts.push(String(10 + rand(90)));
    return parts.join("-");
  }
  if (mode === "pin") return Array.from({ length }, () => String(rand(10))).join("");
  let pool = SETS.lower + SETS.upper;
  const must = [SETS.lower[rand(SETS.lower.length)], SETS.upper[rand(SETS.upper.length)]];
  if (digits) { pool += SETS.digits; must.push(SETS.digits[rand(SETS.digits.length)]); }
  if (symbols) { pool += SETS.symbols; must.push(SETS.symbols[rand(SETS.symbols.length)]); }
  const out = Array.from({ length: Math.max(length - must.length, 0) }, () => pool[rand(pool.length)]).concat(must);
  for (let i = out.length - 1; i > 0; i--) { const j = rand(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out.join("");
}

export function entropy(pw, mode, { digits = true, symbols = true } = {}) {
  if (mode === "words") return Math.round((pw.split("-").length - 1) * Math.log2(WORDS.length) + Math.log2(90));
  if (mode === "pin") return Math.round(pw.length * Math.log2(10));
  const size = 49 + (digits ? 8 : 0) + (symbols ? 25 : 0);
  return Math.round(pw.length * Math.log2(size));
}

export function scoreBits(bits) {
  if (bits >= 100) return 4;
  if (bits >= 72) return 3;
  if (bits >= 50) return 2;
  if (bits >= 30) return 1;
  return 0;
}

export function Colored({ text, className }) {
  return (
    <span className={cx("pw", className)}>
      {text.split("").map((ch, i) => <span key={i} className={/\d/.test(ch) ? "pw-d" : /[a-z]/i.test(ch) ? undefined : "pw-s"}>{ch}</span>)}
    </span>
  );
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789#%&*+=?@";

export function useScramble(target, ms = 520) {
  const [text, setText] = useState(target);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || REDUCED) { first.current = false; setText(target); return undefined; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const fixed = Math.floor(k * target.length);
      let s = target.slice(0, fixed);
      for (let i = fixed; i < target.length; i++) s += target[i] === "-" ? "-" : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setText(s);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return text;
}

export function Copy({ text, label = "Copy", className }) {
  const [done, setDone] = useState(false);
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const go = () => {
    A.copyText(text);
    setDone(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setDone(false), 1400);
  };
  return (
    <button type="button" className={cx("copy", done && "is-done", className)} onClick={go} aria-label={done ? "Copied" : label}>
      <A.Icon name={done ? "check" : "copy"} size={14} />
      <span>{done ? "Copied" : label}</span>
    </button>
  );
}

export function Heading({ index, label, title, children, id, center }) {
  return (
    <div className={cx("sh", center && "is-center")}>
      <div className="sh-label"><span className="sh-index">{index}</span><span className="sh-rule" aria-hidden="true" /><span>{label}</span></div>
      <div className="sh-grid">
        <h2 className="sh-title" id={id}>{title}</h2>
        {children ? <p className="sh-body">{children}</p> : null}
      </div>
    </div>
  );
}

export function Ticks() {
  return (
    <>
      <span className="tick tick-l" aria-hidden="true" />
      <span className="tick tick-r" aria-hidden="true" />
    </>
  );
}

export function Lights() {
  return <span className="lights" aria-hidden="true"><i /><i /><i /></span>;
}

export function detectOS() {
  const p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "").toLowerCase();
  if (p.includes("win")) return "windows";
  if (p.includes("linux") || p.includes("x11")) return "linux";
  return "macos";
}
