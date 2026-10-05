import { A, useState, useEffect, useRef, useMemo, useLayoutEffect, cx } from "./lib.jsx";
import { Nav, useTheme } from "./nav.jsx";
import { Footer } from "./closing.jsx";
import { HeroGrid } from "./hero.jsx";
import { PRODUCTS, TYPES, RELEASES } from "./releases-data.js";

const TYPE = Object.fromEntries(TYPES.map((t) => [t.id, t]));
const KIND = { major: "Major release", minor: "Feature release", patch: "Fixes" };
const fmt = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const anchor = (product, version) => product + "-" + version.replace(/\./g, "-");

function readProduct() {
  const p = new URLSearchParams(window.location.search).get("product");
  if (PRODUCTS.some((x) => x.id === p)) return p;
  const h = window.location.hash.slice(1).split("-")[0];
  return PRODUCTS.some((x) => x.id === h) ? h : "gui";
}

// Keeps only the releases and changes that pass the type filter and the search.
function useFiltered(product, type, query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES[product]
      .map((r) => {
        const head = !q || ("v" + r.version + " " + r.title + " " + r.summary).toLowerCase().includes(q);
        const changes = r.changes.filter((c) => (type === "all" || c.type === type) && (head || (c.text + " " + (c.tag || "")).toLowerCase().includes(q)));
        return { ...r, changes };
      })
      .filter((r) => r.changes.length);
  }, [product, type, query]);
}

function ProductPicker({ value, onChange }) {
  return (
    <A.ChoiceGroup label="Product" value={value} onChange={onChange} columns={3} className="rl-products">
      {PRODUCTS.map((p) => {
        const latest = RELEASES[p.id][0];
        return (
          <A.ChoiceTile
            key={p.id}
            value={p.id}
            icon={p.icon}
            title={p.name}
            description={p.blurb}
            meta={<><A.Badge size="sm" outline>{p.short}</A.Badge><span className="rl-tile-ver mono-small">v{latest.version}</span></>}
          />
        );
      })}
    </A.ChoiceGroup>
  );
}

function Release({ r, product, latest, i }) {
  const id = anchor(product, r.version);
  const [copied, setCopied] = useState(false);
  const repo = PRODUCTS.find((p) => p.id === product).repo;
  const groups = TYPES.map((t) => ({ t, items: r.changes.filter((c) => c.type === t.id) })).filter((g) => g.items.length);

  const copy = () => {
    const url = window.location.origin + "/releases?product=" + product + "#" + id;
    A.copyText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); });
    history.replaceState(null, "", "/releases?product=" + product + "#" + id);
  };

  return (
    <li className="rl-item" id={id} style={{ "--i": i }}>
      <div className="rl-meta">
        <div className="rl-meta-in">
          <a className="rl-ver" href={"#" + id}>v{r.version}</a>
          <time className="rl-date" dateTime={r.date}>{fmt(r.date)}</time>
          {latest && <A.Badge tone="success" size="sm" dot>Latest</A.Badge>}
        </div>
      </div>
      <span className="rl-node" aria-hidden="true" />
      <article className="rl-card">
        <header className="rl-card-head">
          <span className="rl-kind overline">{KIND[r.kind]}</span>
          <h2 className="rl-title">{r.title}</h2>
          <p className="rl-summary">{r.summary}</p>
        </header>
        <div className="rl-groups">
          {groups.map(({ t, items }) => (
            <section key={t.id} className="rl-group" aria-label={t.label}>
              <A.Badge tone={t.tone} size="sm" dot>{t.label}</A.Badge>
              <ul className="rl-changes">
                {items.map((c, k) => (
                  <li key={k}>
                    <span>{c.text}</span>
                    {c.tag && <span className="rl-tag caption">{c.tag}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <footer className="rl-card-foot">
          <A.Button size="sm" iconRight="arrow-up-right" href={"https://github.com/" + repo + "/releases/tag/" + (r.tag || "v" + r.version)} target="_blank" rel="noreferrer">View on GitHub</A.Button>
          <A.IconButton icon={copied ? "check" : "link"} tone={copied ? "success" : undefined} label={copied ? "Link copied" : "Copy link to this release"} onClick={copy} />
        </footer>
      </article>
    </li>
  );
}

// The version rail: every release in the current product, with a marker that slides to the one in view.
function Versions({ product, list, active }) {
  const ref = useRef(null);
  const [mark, setMark] = useState(null);
  useLayoutEffect(() => {
    const a = ref.current?.querySelector('[data-v="' + active + '"]');
    if (!a) { setMark(null); return; }
    setMark((m) => ({ y: a.offsetTop, h: a.offsetHeight, ready: !!m }));
  }, [active, list]);
  return (
    <nav className="rl-versions" aria-label="Versions">
      <span className="rl-versions-title overline">Versions</span>
      <ul ref={ref}>
        {mark && <li className={cx("rl-vmark", !mark.ready && "is-instant")} style={{ transform: "translateY(" + mark.y + "px)", height: mark.h }} aria-hidden="true" />}
        {list.map((r) => (
          <li key={r.version}>
            <a href={"#" + anchor(product, r.version)} data-v={r.version} className={cx(active === r.version && "is-on")}>
              <span className="mono-small">v{r.version}</span>
              <span className="caption">{fmt(r.date).replace(/, \d{4}$/, "")}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ReleasesPage() {
  const theme = useTheme();
  const [product, setProduct] = useState(readProduct);
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const list = useFiltered(product, type, query);
  const all = RELEASES[product];
  const meta = PRODUCTS.find((p) => p.id === product);

  const pick = (p) => {
    setProduct(p);
    history.replaceState(null, "", "/releases?product=" + p);
  };

  // Open on the release in the URL hash.
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (!h) return;
    const t = setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: "start" }), 120);
    return () => clearTimeout(t);
  }, []);

  // Which release is under the toolbar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = [...document.querySelectorAll(".rl-item")];
      let cur = items[0]?.id;
      for (const el of items) if (el.getBoundingClientRect().top < window.innerHeight * 0.35) cur = el.id;
      const r = list.find((x) => anchor(product, x.version) === cur);
      setActive(r ? r.version : null);
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => { window.removeEventListener("scroll", kick); window.removeEventListener("resize", kick); cancelAnimationFrame(frame); };
  }, [list, product]);

  const counts = useMemo(() => {
    const c = { all: 0 };
    for (const r of all) for (const x of r.changes) { c.all++; c[x.type] = (c[x.type] || 0) + 1; }
    return c;
  }, [all]);

  return (
    <div className="page">
      <Nav theme={theme} />
      <main>
        <section className="hero rl-hero" id="top" data-spy="releases" onPointerMove={(e) => {
          const el = e.currentTarget.querySelector(".hg");
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", e.clientX - r.left + "px");
          el.style.setProperty("--my", e.clientY - r.top + "px");
        }}>
          <div className="frame hero-frame">
            <HeroGrid />
            <div className="hero-in rl-hero-in">
              <h1 className="hero-title rl-hero-title hx" style={{ "--i": 0 }}>Releases</h1>
              <p className="hero-lede hx" style={{ "--i": 1 }}>Every change to the desktop app, pm and APM for Chrome, release by release.</p>
              <div className="rl-pick hx" style={{ "--i": 2 }}>
                <ProductPicker value={product} onChange={pick} />
              </div>
            </div>
          </div>
        </section>

        <section className="sec rl-sec" data-spy="releases" aria-label={meta.name + " releases"}>
          <div className="rl-bar">
            <div className="frame rl-bar-in">
              <div className="rl-bar-title">
                <A.Icon name={meta.icon} size={16} />
                <span className="small-medium">{meta.name}</span>
                <span className="caption rl-bar-count">{all.length} releases</span>
              </div>
              <A.SegmentedControl
                label="Change type"
                value={type}
                onChange={setType}
                options={[{ value: "all", label: "All" }, ...TYPES.filter((t) => counts[t.id]).map((t) => ({ value: t.id, label: t.label }))]}
              />
              <A.SearchField className="rl-search" size="sm" placeholder={"Search " + meta.name + " releases"} value={query} onChange={setQuery} shortcut={null} />
            </div>
          </div>

          <div className="frame rl-body">
            <Versions product={product} list={list} active={active} />
            {list.length ? (
              <ol className="rl-list" key={product + type}>
                {list.map((r, i) => <Release key={r.version} r={r} product={product} latest={r.version === all[0].version} i={i} />)}
              </ol>
            ) : (
              <div className="rl-empty">
                <A.EmptyState icon="search" title="No changes match" action={<A.Button size="sm" onClick={() => { setQuery(""); setType("all"); }}>Clear filters</A.Button>}>
                  Nothing in {meta.name} matches {query ? "“" + query + "”" : "this filter"}.
                </A.EmptyState>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer theme={theme} />
    </div>
  );
}
