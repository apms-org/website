import { A, useState, useEffect, useRef, cx, REDUCED, sleep, spot, Heading, Ticks, useLive } from "./lib.jsx";
import { IMPORTS, REVIEW, EXPORTS, SYNC } from "./seed.js";

const ACTIONS = ["Import", "Merge", "Replace", "Keep both", "Skip"];

function Review() {
  const [rows, setRows] = useState(() => REVIEW.map((r) => ({ ...r, on: r.badge.text !== "Can't import" && r.action !== "Skip" })));
  const [done, setDone] = useState(false);
  const toggle = (i, v) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, on: v } : r)));
  const cycle = (i) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, action: ACTIONS[(ACTIONS.indexOf(r.action) + 1) % ACTIONS.length] } : r)));
  const count = 312 + rows.reduce((n, r) => n + (r.badge.text === "Possible duplicate" ? (r.on ? 1 : 0) : (r.badge.text === "Conflict" || r.badge.text === "New") && !r.on ? -1 : 0), 0);
  return (
    <div className="mv-review">
      <div className="mv-review-head">
        <span className="mv-file"><A.Icon name="file-up" size={15} /><span className="small-medium">bitwarden.json</span><span className="caption">Bitwarden JSON · 356 items · 4 passkeys</span></span>
        <span className="mv-steps caption"><b>Source</b><A.Icon name="chevron-right" size={12} /><b className="is-on">Review</b><A.Icon name="chevron-right" size={12} /><b>Done</b></span>
      </div>
      <div className="mv-tally">
        <span><b>309</b> new</span>
        <span><b>41</b> existing</span>
        <span className="is-warn"><b>3</b> conflicts</span>
        <span className="is-warn"><b>2</b> possible duplicates</span>
        <span className="is-bad"><b>1</b> can't import</span>
      </div>
      <div className="mv-rows">
        {rows.map((r, i) => (
          <A.ReviewRow
            key={r.title}
            checked={r.on}
            disabled={r.badge.text === "Can't import"}
            onCheck={(v) => toggle(i, v)}
            title={r.title}
            subtitle={r.sub}
            letter={r.letter}
            icon={r.icon}
            tone={r.badge.tone === "danger" ? "danger" : r.badge.text === "Conflict" ? "warning" : undefined}
            badges={<A.Badge tone={r.badge.tone} size="sm">{r.badge.text}</A.Badge>}
            trailing={r.badge.text === "Can't import" ? <span className="mv-act is-off caption">Skipped</span> : <button type="button" className="mv-act caption" onClick={() => cycle(i)} aria-label={"Action for " + r.title + ": " + r.action}>{r.action}<A.Icon name="chevrons-up-down" size={12} /></button>}
          />
        ))}
      </div>
      <div className="mv-review-foot">
        <span className="caption mv-undo">{done ? "Imported as one commit. Undo it from History or with pm lgit undo." : "The whole import becomes one commit you can undo."}</span>
        <A.Button variant={done ? "secondary" : "primary"} size="sm" icon={done ? "undo-2" : "download"} onClick={() => setDone(!done)}>{done ? "Undo import" : "Import " + count + " items"}</A.Button>
      </div>
    </div>
  );
}

function Sync() {
  const ref = useRef(null);
  const live = useLive(ref);
  const [on, setOn] = useState({ "Google Drive": true, GitHub: true, Dropbox: false });
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!live || REDUCED) return undefined;
    const t = setInterval(() => setPulse((p) => p + 1), 2600);
    return () => clearInterval(t);
  }, [live]);
  return (
    <div ref={ref} className="mv-sync">
      <div className="mv-sync-src">
        <span className="mv-sync-file"><A.Icon name="file-lock-2" size={18} /></span>
        <span className="mv-sync-text"><span className="small-medium">vault.dat</span><span className="caption mono-small">encrypted · signed</span></span>
      </div>
      <div className="mv-sync-rows">
        {SYNC.map((s) => (
          <div key={s.name} className={cx("mv-sync-row", on[s.name] && "is-on")}>
            <span className="mv-sync-wire" aria-hidden="true"><i key={pulse} /></span>
            <A.ItemIcon icon={s.icon} size="sm" />
            <span className="mv-sync-text"><span className="small-medium">{s.name}</span><span className="caption">{on[s.name] ? (s.when === "Off" ? "Synced just now" : s.when) : "Off"}</span></span>
            <A.Switch checked={!!on[s.name]} onChange={(v) => setOn((o) => ({ ...o, [s.name]: v }))} label={"Sync with " + s.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Move() {
  return (
    <section className="sec move" id="move" data-spy="move" aria-labelledby="move-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="06" label="Import, export and sync" id="move-title" title="Move in from anywhere. Leave whenever you like.">
          Bring logins, codes and passkeys from another manager, check every item side by side, then import it all as one commit. Export to open formats at any time.
        </Heading>
        <div className="mv">
          <article className="mv-cell mv-in" onPointerMove={spot}>
            <span className="cell-glow" aria-hidden="true" />
            <div className="mv-cell-head">
              <h3 className="cell-title">Import</h3>
              <p className="cell-body">Conflicts get a choice: skip, merge, replace or keep both. Try it, the rows are live.</p>
            </div>
            <div className="mv-sources">
              {IMPORTS.map((s) => (
                <span key={s.name} className="mv-src">
                  <A.ItemIcon name={s.name} letter={s.letter} icon={s.icon} size="sm" />
                  <span className="mv-src-text"><span className="small-medium">{s.name}</span><span className="caption">{s.ext}</span></span>
                </span>
              ))}
            </div>
            <Review />
          </article>
          <div className="mv-side">
            <article className="mv-cell" onPointerMove={spot}>
              <span className="cell-glow" aria-hidden="true" />
              <div className="mv-cell-head">
                <h3 className="cell-title">Sync, without a server</h3>
                <p className="cell-body">Keep a copy in Google Drive, GitHub or Dropbox. Only the encrypted file leaves your computer, and pm cloud diff merges changes made elsewhere.</p>
              </div>
              <Sync />
            </article>
            <article className="mv-cell" onPointerMove={spot}>
              <span className="cell-glow" aria-hidden="true" />
              <div className="mv-cell-head">
                <h3 className="cell-title">Export</h3>
                <p className="cell-body">Your data in formats other tools read, passkeys included. pm export compare shows what changed since an export.</p>
              </div>
              <div className="mv-exports">
                {EXPORTS.map((e) => <span key={e} className="mv-chip"><A.Icon name="file-down" size={14} />{e}</span>)}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
