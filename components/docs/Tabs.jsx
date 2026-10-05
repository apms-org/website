"use client";

import { Children, isValidElement, useEffect, useId, useState } from "react";

const STORE = "apm-site-tab";

// Tab panels. A choice like "Windows" is remembered and applied to every tab group that offers it.
export function Tabs({ items = [], children }) {
  const id = useId();
  const panels = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  const key = items.join("|");

  useEffect(() => {
    const apply = (label) => {
      const i = items.indexOf(label);
      if (i >= 0) setActive(i);
    };
    try { apply(localStorage.getItem(STORE)); } catch {}
    const on = (e) => apply(e.detail);
    window.addEventListener("dx-tab", on);
    return () => window.removeEventListener("dx-tab", on);
  }, [key]);

  const pick = (i) => {
    setActive(i);
    try { localStorage.setItem(STORE, items[i]); } catch {}
    window.dispatchEvent(new CustomEvent("dx-tab", { detail: items[i] }));
  };

  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (active + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    pick(n);
    document.getElementById(id + "-t" + n)?.focus();
  };

  return (
    <div className="dx-tabs">
      <div className="dx-tablist" role="tablist" onKeyDown={onKey}>
        {items.map((label, i) => (
          <button
            key={label}
            id={id + "-t" + i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={id + "-p" + i}
            tabIndex={i === active ? 0 : -1}
            className={"dx-tab" + (i === active ? " is-on" : "")}
            onClick={() => pick(i)}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((p, i) => (
        <div key={i} id={id + "-p" + i} role="tabpanel" aria-labelledby={id + "-t" + i} hidden={i !== active} className="dx-tabpanel">
          {p}
        </div>
      ))}
    </div>
  );
}

export function Tab({ children }) {
  return <>{children}</>;
}
