import { A, useState, useEffect, useRef, cx, REDUCED, sleep, Heading, Ticks, Lights, useLive, Colored, Copy } from "./lib.jsx";
import { COMMANDS, LINKS } from "./seed.js";

const ALL = COMMANDS.flatMap((g) => g.items.map((it) => ({ ...it, group: g.group })));

function Out({ l }) {
  if (l.pw) return <div className="term-out"><Colored text={l.pw} className="term-pw" /></div>;
  return <div className={cx("term-out", l.dim && "is-dim", l.tone && "is-" + l.tone)}>{l.k ? <span className="term-k">{l.k}</span> : null}{l.out}</div>;
}

function Screen({ item, typed, lines }) {
  return (
    <div className="win term cx-term" role="group" aria-label={"pm " + item.cmd}>
      <div className="term-bar"><Lights /><span className="term-title mono-small">zsh · pm 12.0.0</span></div>
      <div className="term-body mono" aria-live="polite">
        <div className="term-line"><span className="term-ps">~</span><span className="term-arrow">❯</span><span>{typed}</span>{typed.length < item.cmd.length || lines === 0 ? <span className="term-caret" /> : null}</div>
        {item.out.slice(0, lines).map((l, i) => <Out key={i} l={l} />)}
        {lines >= item.out.length ? <div className="term-line"><span className="term-ps">~</span><span className="term-arrow">❯</span><span className="term-caret" /></div> : null}
      </div>
    </div>
  );
}

function GetPm() {
  return (
    <div className="cx-get">
      <div className="cx-get-row">
        <span className="cx-get-icon"><A.Icon name="laptop" size={16} /></span>
        <span className="cx-get-text"><span className="small-medium">From the desktop app</span><span className="caption">On macOS, APM installs the pm command for you, the way VS Code installs code.</span></span>
      </div>
      <div className="cx-get-row">
        <span className="cx-get-icon"><A.Icon name="package" size={16} /></span>
        <span className="cx-get-text"><span className="small-medium">On its own</span><span className="caption">Builds for macOS, Windows and Linux, on Intel and ARM.</span></span>
        <A.Button size="sm" iconRight="arrow-up-right" href={LINKS.releases} target="_blank" rel="noreferrer">GitHub Releases</A.Button>
      </div>
    </div>
  );
}

export function Cli() {
  const ref = useRef(null);
  const live = useLive(ref, "-15% 0px");
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(ALL[0].cmd);
  const [lines, setLines] = useState(ALL[0].out.length);
  const [auto, setAuto] = useState(!REDUCED);
  const run = useRef(0);

  const show = async (i, id) => {
    const it = ALL[i];
    setIdx(i);
    if (REDUCED) { setTyped(it.cmd); setLines(it.out.length); return; }
    setTyped(""); setLines(0);
    for (let k = 1; k <= it.cmd.length; k++) { if (run.current !== id) return; setTyped(it.cmd.slice(0, k)); await sleep(26); }
    await sleep(220);
    for (let k = 1; k <= it.out.length; k++) { if (run.current !== id) return; setLines(k); await sleep(70); }
  };

  useEffect(() => {
    if (!live || !auto) return undefined;
    const id = ++run.current;
    (async () => {
      let i = idx;
      await sleep(600);
      while (run.current === id) {
        i = (i + 1) % ALL.length;
        await show(i, id);
        await sleep(2600);
      }
    })();
    return () => { run.current++; };
  }, [live, auto]);

  const pick = (i) => { setAuto(false); const id = ++run.current; show(i, id); };

  return (
    <section className="sec cli" id="cli" data-spy="cli" aria-labelledby="cli-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="05" label="Command line" id="cli-title" title="pm is the engine. Your shell is the interface.">
          Everything the app does, pm does too, because the app runs on it. Script it, pipe it, hand a build a scoped session or rewind the vault from a terminal.
        </Heading>
        <div ref={ref} className="cx">
          <div className="cx-list" role="listbox" aria-label="pm commands">
            {COMMANDS.map((g) => (
              <div key={g.group} className="cx-group">
                <div className="cx-group-title overline">{g.group}</div>
                {g.items.map((it) => {
                  const i = ALL.findIndex((x) => x.cmd === it.cmd);
                  return (
                    <button key={it.cmd} type="button" role="option" aria-selected={i === idx ? "true" : "false"} className={cx("cx-item", i === idx && "is-on")} onClick={() => pick(i)}>
                      <span className="cx-cmd mono-small">{it.cmd}</span>
                      <span className="cx-note caption">{it.note}</span>
                      {i === idx && auto && live ? <span className="cx-tick" aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="cx-side">
            <Screen item={ALL[idx]} typed={typed} lines={lines} />
            <GetPm />
          </div>
        </div>
      </div>
    </section>
  );
}
