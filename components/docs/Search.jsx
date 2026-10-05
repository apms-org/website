"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileText, Hash, Search as SearchIcon } from "lucide-react";

let indexPromise = null;
const loadIndex = () => (indexPromise ||= fetch("/docs/search.json").then((r) => r.json()).catch(() => { indexPromise = null; return []; }));

const norm = (s) => s.toLowerCase();

function score(page, terms) {
  const title = norm(page.title), desc = norm(page.description), text = norm(page.text);
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (title === t) s += 60;
    else if (title.startsWith(t)) s += 40;
    else if (title.includes(t)) s += 28;
    if (page.headings.some((h) => norm(h.text).includes(t))) s += 14;
    if (desc.includes(t)) s += 8;
    if (text.includes(t)) s += 3;
    if (!s) return 0;
    total += s;
  }
  return total;
}

function snippet(text, terms) {
  const low = norm(text);
  let at = -1;
  for (const t of terms) { at = low.indexOf(t); if (at >= 0) break; }
  if (at < 0) return "";
  const start = Math.max(0, at - 50);
  return (start ? "…" : "") + text.slice(start, at + 110).trim() + "…";
}

function Mark({ text, terms }) {
  if (!terms.length || !text) return text;
  const re = new RegExp("(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "ig");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

function search(index, q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return { terms, results: [] };
  const results = [];
  for (const page of index) {
    const s = score(page, terms);
    if (!s) continue;
    results.push({ key: page.href, href: page.href, title: page.title, section: page.section, kind: "page", score: s, sub: page.description || snippet(page.text, terms) });
    // Matching headings follow their page, at most three of them.
    let shown = 0;
    for (const h of page.headings) {
      const ht = norm(h.text);
      if (shown < 3 && terms.every((t) => ht.includes(t))) {
        shown++;
        results.push({ key: page.href + "#" + h.id, href: page.href + "#" + h.id, title: h.text, section: page.section + " · " + page.title, kind: "heading", score: s - shown * 0.01 });
      }
    }
  }
  results.sort((a, b) => b.score - a.score);
  return { terms, results: results.slice(0, 24) };
}

const SUGGEST = [
  { href: "/docs/getting-started/installation", title: "Install APM", section: "Get started" },
  { href: "/docs/getting-started/quickstart", title: "Quickstart", section: "Get started" },
  { href: "/docs/cli", title: "Command line", section: "Command line" },
  { href: "/docs/extension", title: "Browser extension", section: "Browser extension" },
  { href: "/docs/agents/setup", title: "Connect an AI agent", section: "AI agents (MCP)" },
  { href: "/docs/security/encryption", title: "Encryption", section: "Security" }
];

export default function Search() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(null);
  const [sel, setSel] = useState(0);
  const [mac, setMac] = useState(true);
  const input = useRef(null);
  const list = useRef(null);

  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)); }, []);

  const show = useCallback(() => {
    setOpen(true);
    loadIndex().then(setIndex);
  }, []);

  useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open ? setOpen(false) : show(); }
      else if (e.key === "/" && !open && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) { e.preventDefault(); show(); }
    };
    document.addEventListener("keydown", key);
    window.addEventListener("dx-search", show);
    return () => { document.removeEventListener("keydown", key); window.removeEventListener("dx-search", show); };
  }, [open, show]);

  useEffect(() => {
    document.documentElement.classList.toggle("dx-locked", open);
    if (open) setTimeout(() => input.current?.focus(), 10);
    else setQ("");
  }, [open]);

  const { terms, results } = useMemo(() => (index ? search(index, q) : { terms: [], results: [] }), [index, q]);
  const rows = q.trim() ? results : SUGGEST.map((s) => ({ ...s, key: s.href, kind: "page" }));

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    list.current?.querySelector('[data-sel="true"]')?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const go = (r) => {
    if (!r) return;
    setOpen(false);
    router.push(r.href);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(rows.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(rows[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  return (
    <>
      <button type="button" className="dx-search-btn" onClick={show} aria-label="Search documentation">
        <SearchIcon size={15} strokeWidth={1.75} />
        <span className="dx-search-label">Search docs…</span>
        <span className="apm-kbd dx-search-kbd"><kbd>{mac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd></span>
      </button>
      {open && (
        <div className="dx-dialog" role="dialog" aria-modal="true" aria-label="Search documentation" onKeyDown={onKey}>
          <div className="dx-dialog-scrim" onClick={() => setOpen(false)} />
          <div className="dx-palette">
            <div className="dx-palette-input">
              <SearchIcon size={17} strokeWidth={1.75} />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the docs: commands, settings, concepts"
                aria-label="Search"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="dx-results"
                aria-activedescendant={rows[sel] ? "dx-r-" + sel : undefined}
              />
              <button type="button" className="dx-esc" onClick={() => setOpen(false)}>Esc</button>
            </div>
            <div className="dx-palette-body" ref={list}>
              {!q.trim() && <p className="dx-palette-group">Popular</p>}
              {q.trim() && index && !rows.length && (
                <div className="dx-palette-empty">
                  <p>No results for “{q}”</p>
                  <span>Try a command like <code>pm add</code>, or a word like “passkey”.</span>
                </div>
              )}
              {q.trim() && !index && <div className="dx-palette-empty"><span>Loading the index…</span></div>}
              <ul id="dx-results" role="listbox">
                {rows.map((r, i) => (
                  <li key={r.key} id={"dx-r-" + i} role="option" aria-selected={i === sel} data-sel={i === sel}>
                    <a
                      href={r.href}
                      className={"dx-result" + (i === sel ? " is-sel" : "")}
                      onClick={(e) => { e.preventDefault(); go(r); }}
                      onPointerMove={() => setSel(i)}
                    >
                      <span className="dx-result-icon">{r.kind === "heading" ? <Hash size={15} strokeWidth={1.75} /> : <FileText size={15} strokeWidth={1.75} />}</span>
                      <span className="dx-result-text">
                        <span className="dx-result-meta">{r.section}</span>
                        <span className="dx-result-title"><Mark text={r.title} terms={terms} /></span>
                        {r.sub && <span className="dx-result-sub"><Mark text={r.sub} terms={terms} /></span>}
                      </span>
                      <CornerDownLeft size={14} strokeWidth={1.75} className="dx-result-enter" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dx-palette-foot">
              <span><span className="apm-kbd"><kbd>↑</kbd><kbd>↓</kbd></span> to move</span>
              <span><span className="apm-kbd"><kbd>↵</kbd></span> to open</span>
              <span><span className="apm-kbd"><kbd>esc</kbd></span> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
