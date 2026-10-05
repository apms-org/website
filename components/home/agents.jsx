import { A, useState, useEffect, useRef, cx, REDUCED, sleep, spot, Heading, Ticks, Lights, useLive, Copy } from "./lib.jsx";
import { SCOPES, MCP_CONFIG, AGENT_FLOW } from "./seed.js";

function AskCard() {
  return (
    <div className="ag-card-body">
      <div className="ag-who"><A.ItemIcon icon="terminal-square" size="sm" /><span className="small-medium">Cursor</span><span className="ag-tool mono-small">edit_entry</span></div>
      <p className="ag-msg small">Rotate the Postmark token used by the staging deploy.</p>
      <div className="ag-reply mono-small">
        <span>Preview: new token for Postmark server token</span>
        <span>Transaction created: tx_8c1f42</span>
        <span className="is-dim">Re-run with tx_id and approve to commit.</span>
      </div>
    </div>
  );
}

function ApproveCard({ on }) {
  return (
    <div className="ag-card-body">
      <div className="ag-who"><A.Mark size={20} tile /><span className="small-medium">Approve this change?</span></div>
      <div className="ag-item"><A.ItemIcon icon="key-round" size="sm" /><span className="ag-item-text"><span className="small-medium">Postmark server token</span><span className="caption">API key · Personal</span></span></div>
      <div className="ag-diff mono-small">
        <span className="is-del">- a3f8c2d1-7e4b-…-2d8e1f0a9b37</span>
        <span className="is-add">+ 7d1e09b4-52aa-…-91f3c08bc2a6</span>
      </div>
      <div className="ag-acts">
        <span className="caption ag-exp"><A.Icon name="clock" size={12} />Expires in 15 min</span>
        <span className="bv-chip">Reject</span>
        <span className={cx("bv-chip is-primary", on && "is-press")}>Approve</span>
      </div>
    </div>
  );
}

function RecordCard() {
  return (
    <div className="ag-card-body">
      <div className="ag-who"><span className="ag-ok"><A.Icon name="check" size={14} /></span><span className="small-medium">Committed</span><span className="ag-tool mono-small">[VERIFIED]</span></div>
      <div className="ag-log mono-small">
        <span className="ag-log-k">lgit</span>
        <span>SAVE · 2026-10-05 14:02:11</span>
        <span className="ag-log-k">audit</span>
        <span>MCP_ENTRY_EDITED</span>
        <span />
        <span className="is-dim">Token 'cursor' edited entry 'Postmark server token'</span>
      </div>
    </div>
  );
}

const CARDS = [AskCard, ApproveCard, RecordCard];

function Config() {
  const text = MCP_CONFIG.map((l) => l.t + (l.k || "") + (l.r || "") + (l.v || "") + (l.e || "")).join("\n");
  return (
    <div className="ag-code win">
      <div className="ag-code-bar">
        <Lights />
        <span className="ag-code-name mono-small">claude_desktop_config.json</span>
        <Copy text={text} label="Copy" />
      </div>
      <pre className="ag-pre mono"><code>
        {MCP_CONFIG.map((l, i) => (
          <span key={i} className="ag-line">
            <span className="ag-ln" aria-hidden="true">{i + 1}</span>
            {l.t}{l.k ? <span className="tk-k">{l.k}</span> : null}{l.r || ""}{l.v ? <span className="tk-v">{l.v}</span> : null}{l.e || ""}
          </span>
        ))}
      </code></pre>
      <div className="ag-code-foot caption"><span className="mono-small">pm mcp token</span> creates a token and prints this snippet. Run <span className="mono-small">pm unlock</span> first, the server needs an open session.</div>
    </div>
  );
}

export function Agents() {
  const ref = useRef(null);
  const live = useLive(ref, "-15% 0px");
  const [step, setStep] = useState(REDUCED ? -1 : 0);
  useEffect(() => {
    if (!live || REDUCED) return undefined;
    let on = true;
    (async () => {
      while (on) {
        for (let i = 0; i < 3 && on; i++) { setStep(i); await sleep(i === 1 ? 3000 : 2600); }
      }
    })();
    return () => { on = false; };
  }, [live]);
  return (
    <section className="sec agents" id="agents" data-spy="agents" aria-labelledby="agents-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="04" label="AI agents" id="agents-title" title="Let agents use secrets without handing over the vault.">
          APM speaks MCP. Give Claude Desktop, Cursor or VS Code a token with only the scopes it needs. Tokens can expire, can be revoked at any time and only work while your vault is unlocked.
        </Heading>
        <div ref={ref} className="ag-flow" style={{ "--step": step }}>
          {AGENT_FLOW.map((f, i) => {
            const C = CARDS[i];
            return (
              <article key={f.id} className={cx("ag-card", step === i && "is-on", step > i && "is-past")} onPointerMove={spot}>
                <span className="cell-glow" aria-hidden="true" />
                <div className="ag-card-head">
                  <span className="ag-n mono-small">{f.n}</span>
                  <h3 className="ag-title">{f.title}</h3>
                </div>
                <p className="ag-body small">{f.body}</p>
                <div className="ag-shot"><C on={step === i} /></div>
                {i < 2 ? <span className="ag-wire" aria-hidden="true"><i /></span> : null}
              </article>
            );
          })}
        </div>
        <div className="ag-grid">
          <div className="ag-scopes">
            <div className="ag-scopes-head"><span className="overline">Scopes</span><span className="caption">Pick per token. Add one tool at a time if you prefer.</span></div>
            {SCOPES.map((s) => (
              <div key={s.id} className="ag-scope">
                <span className={cx("scope", "is-" + s.id)}>{s.title}</span>
                <span className="ag-scope-text">
                  <span className="small">{s.body}</span>
                  <span className="ag-scope-tools mono-small">{s.tools}</span>
                </span>
              </div>
            ))}
          </div>
          <Config />
        </div>
      </div>
    </section>
  );
}
