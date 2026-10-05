import { useState, useEffect, useRef, cx, REDUCED, clamp, onFrame } from "./lib.jsx";

// A WebGL 2 context that isn't a software fallback, or no intro at all: the hero then simply comes first.
function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

// The hero grid's columns (HeroGrid in hero.jsx), so the intro's grid runs straight on into it.
function gridMetrics(host) {
  const W = host.clientWidth, H = host.clientHeight;
  const hg = document.querySelector(".hero .hg");
  let gl, gw;
  if (hg && hg.clientWidth > 0) {
    gl = hg.getBoundingClientRect().left - host.getBoundingClientRect().left;
    gw = hg.clientWidth;
  } else {
    const g = clamp(0.04 * window.innerWidth, 16, 48);
    gw = Math.min(1200, W - 2 * g);
    gl = (W - gw) / 2;
  }
  const cols = gw >= 900 ? 12 : gw >= 560 ? 8 : 6;
  return { gl, gw, cell: gw / cols, W, H };
}

const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function Intro() {
  const [ok, setOk] = useState(canUseWebGL);
  const [drawn, setDrawn] = useState(REDUCED);
  const root = useRef(null);
  const stage = useRef(null);
  const scene = useRef(null);
  const metrics = useRef(null);
  const lastScroll = useRef("");

  // Grid metrics drive the CSS grid and the copy of it that the glass refracts.
  useEffect(() => {
    const el = root.current;
    if (!ok || !el) return undefined;
    let raf = 0;
    const fit = () => {
      raf = 0;
      const m = gridMetrics(el);
      const nav = document.querySelector(".nav");
      const navH = nav ? nav.offsetHeight : 72;
      const hero = document.querySelector(".hero");
      const glow = !!hero && getComputedStyle(hero, "::before").backgroundImage.indexOf("gradient") >= 0;
      const set = (k, v) => el.style.setProperty(k, v);
      set("--cell", m.cell + "px");
      set("--gx", m.gl - 1 + "px");
      set("--gy", m.H - 1 + "px");
      set("--gl", m.gl + "px");
      set("--gr", m.gl + m.gw + "px");
      set("--srx", 0.72 * m.gw + "px");
      set("--sry", 1.3 * m.H + "px");
      el.classList.toggle("has-glow", glow);
      metrics.current = { m, navH, glow };
      if (scene.current) scene.current.setGrid(m, navH, glow);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(fit); };
    fit();
    const ro = new ResizeObserver(kick);
    ro.observe(el);
    const hg = document.querySelector(".hero .hg");
    if (hg) ro.observe(hg);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [ok]);

  // three.js and the scene load after first paint.
  useEffect(() => {
    if (!ok) return undefined;
    let dead = false;
    import("./intro-scene.js")
      .then(({ createIntroScene }) => {
        if (dead || !root.current || !stage.current) return;
        const s = createIntroScene({
          host: root.current,
          mount: stage.current,
          reduced: REDUCED,
          onDrawn: () => { if (!dead) setDrawn(true); },
          onFail: () => { if (!dead) setOk(false); }
        });
        scene.current = s;
        if (metrics.current) s.setGrid(metrics.current.m, metrics.current.navH, metrics.current.glow);
        lastScroll.current = "";
        window.dispatchEvent(new Event("scroll"));
        if (process.env.NODE_ENV !== "production") window.__apmIntro = s;
      })
      .catch(() => { if (!dead) setOk(false); });
    return () => {
      dead = true;
      if (scene.current) { scene.current.dispose(); scene.current = null; }
      if (process.env.NODE_ENV !== "production") delete window.__apmIntro;
    };
  }, [ok]);

  // Scroll: over about one viewport the word flies up and the glass tube morphs into the nav logo, which then
  // takes over. The logo stays hidden (intro.css) until the glass matches it; under reduced motion they crossfade.
  useEffect(() => {
    if (!ok) return undefined;
    const html = document.documentElement;
    html.setAttribute("data-intro", "");
    const off = onFrame(() => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nav = document.querySelector(".nav");
      const navH = nav ? nav.offsetHeight : 72;
      const rel = Math.max(0, -r.top);
      const p = clamp(rel / Math.max(1, r.height - navH));
      const b = document.querySelector(".nav .nav-brand");
      const br = b ? b.getBoundingClientRect() : null;
      const brand = br && br.width > 0 ? { x: br.left - r.left, y: br.top - r.top, w: br.width, h: br.height } : null;
      const key = p.toFixed(4) + (brand ? brand.x.toFixed(1) + "," + brand.y.toFixed(1) + "," + brand.w.toFixed(1) : "");
      if (key === lastScroll.current) return;
      lastScroll.current = key;
      el.style.setProperty("--intro-q", p.toFixed(4));
      el.classList.toggle("is-lifting", !REDUCED && p > 0.02 && p < 1);
      // the real logo only takes over once the glass has become it (landFrom/landTo in intro-scene.js);
      // its tile fades in a little earlier, behind the glass bird
      const logo = REDUCED ? smoothstep(0.35, 0.75, p) : smoothstep(0.95, 1, p);
      const tile = REDUCED ? logo : smoothstep(0.8, 0.95, p);
      html.style.setProperty("--intro-brand", logo.toFixed(3));
      html.style.setProperty("--intro-tile", tile.toFixed(3));
      html.classList.toggle("intro-landed", logo >= 0.999);
      if (b) b.inert = logo < 0.5; // no Tab stop on the logo while it is hidden
      if (scene.current) scene.current.scroll(p, brand, rel);
    });
    return () => {
      off();
      html.removeAttribute("data-intro");
      html.style.removeProperty("--intro-brand");
      html.style.removeProperty("--intro-tile");
      html.classList.remove("intro-landed");
      const b = document.querySelector(".nav .nav-brand");
      if (b) b.inert = false;
    };
  }, [ok]);

  // Theme: the footer switch sets data-theme on <html>; with no choice saved the OS scheme applies.
  useEffect(() => {
    if (!ok) return undefined;
    const update = () => { if (scene.current) scene.current.theme(); };
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (mq) mq.addEventListener("change", update);
    return () => { mo.disconnect(); if (mq) mq.removeEventListener("change", update); };
  }, [ok]);

  if (!ok) return null;
  return (
    <div ref={root} className="intro">
      <div className="intro-art" aria-hidden="true">
        <div className="intro-glow" />
        <div className="intro-spot" />
        <div className="intro-grid" />
        <div className="intro-shade" />
        <div ref={stage} className="intro-stage" />
      </div>
      <a className={cx("intro-cue", drawn && "is-on")} href="#top" aria-label="Scroll down">
        <span>Scroll</span>
        <i aria-hidden="true" />
      </a>
    </div>
  );
}
