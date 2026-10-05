"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sections as a switcher on top, then the current section's pages as a plain list.
export default function Sidebar({ nav, onNavigate }) {
  const path = usePathname();
  const current = nav.find((s) => path === s.href || path.startsWith(s.href + "/")) || nav[0];

  return (
    <nav className="dx-side" aria-label="Documentation">
      <ul className="dx-switch">
        <li>
          <Link href="/docs" className={"dx-switch-item" + (path === "/docs" ? " is-on" : "")} onClick={onNavigate}>Documentation</Link>
        </li>
        {nav.map((s) => (
          <li key={s.slug}>
            <Link href={s.href} className={"dx-switch-item" + (current && s.slug === current.slug && path !== "/docs" ? " is-on" : "")} onClick={onNavigate}>
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
      {current && path !== "/docs" && (
        <div className="dx-tree">
          {groups(current.pages).map((g, i) => (
            <div key={i} className="dx-tree-group">
              {g.label && <p className="dx-tree-label">{g.label}</p>}
              <ul>
                {g.pages.map((p) => {
                  const on = path === p.href;
                  return (
                    <li key={p.href}>
                      <Link href={p.href} className={"dx-tree-link" + (on ? " is-on" : "")} aria-current={on ? "page" : undefined} onClick={onNavigate}>
                        {p.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}

// Consecutive pages that share a frontmatter `group` sit under one label.
function groups(pages) {
  const out = [];
  for (const p of pages) {
    const last = out[out.length - 1];
    if (last && last.label === (p.group || null)) last.pages.push(p);
    else out.push({ label: p.group || null, pages: [p] });
  }
  return out;
}
