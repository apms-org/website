"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

// "On this page": follows the heading nearest the top of the viewport, with a marker that slides to it.
export default function Toc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  const [mark, setMark] = useState(null);
  const list = useRef(null);

  useEffect(() => {
    if (!items.length) return undefined;
    let frame = 0;
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    const update = () => {
      frame = 0;
      const line = 120;
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top - line <= 0) cur = el.id;
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (bottom) cur = els[els.length - 1]?.id;
      setActive(cur);
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => { window.removeEventListener("scroll", kick); window.removeEventListener("resize", kick); cancelAnimationFrame(frame); };
  }, [items]);

  // Measure the active link so the marker can move to it, and keep it in view when the list scrolls.
  useLayoutEffect(() => {
    const ul = list.current;
    const a = ul?.querySelector('a[data-id="' + CSS.escape(active || "") + '"]');
    if (!a) return;
    setMark((m) => ({ y: a.offsetTop, h: a.offsetHeight, ready: !!m }));
    const rail = ul.closest(".dx-rail-in");
    if (rail) {
      const top = a.offsetTop - rail.scrollTop;
      if (top < 40 || top > rail.clientHeight - 60) rail.scrollTo({ top: a.offsetTop - rail.clientHeight / 2, behavior: "smooth" });
    }
  }, [active]);

  if (!items.length) return null;
  return (
    <nav className="dx-toc" aria-label="On this page">
      <p className="dx-toc-title">On this page</p>
      <ul ref={list}>
        {mark && (
          <li
            className={"dx-toc-mark" + (mark.ready ? "" : " is-instant")}
            style={{ transform: "translateY(" + mark.y + "px)", height: mark.h }}
            aria-hidden="true"
          />
        )}
        {items.map((h) => (
          <li key={h.id} className={"is-d" + h.depth}>
            <a href={"#" + h.id} data-id={h.id} className={active === h.id ? "is-on" : undefined}>{h.text}</a>
          </li>
        ))}
      </ul>
      <button type="button" className="dx-toc-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUp size={13} strokeWidth={2} /> Back to top
      </button>
    </nav>
  );
}
