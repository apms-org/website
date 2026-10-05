import { A, useState, useEffect, useRef, cx, spot, useScrollVar, Heading, Ticks, Roll, useSeen } from "./lib.jsx";
import { LAYERS, PROFILES, KEYS, GUARDS } from "./seed.js";

// Plate-space px of hysteresis between neighbouring plates.
const SNAP = 8;

// The plate under the pointer, tested against the plates' resting boxes. Hover only moves the
// faces inside them, so a lifted plate can never slide out from under the pointer and flip the hover.
// The hovered plate holds until the pointer is SNAP past its edge, and a plate drawn above it has
// to be entered SNAP deep to take over. Otherwise the topmost plate drawn at the point wins.
function pick(stack, x, y, cur) {
  const plates = stack ? stack.querySelectorAll(".vx-layer") : [];
  if (!plates.length) return -1;
  const flat = new DOMMatrixReadOnly(getComputedStyle(plates[0].firstElementChild).transform).inverse();
  const over = (k, pad) => {
    const r = plates[k].getBoundingClientRect();
    const p = flat.transformPoint(new DOMPoint(x - r.left - r.width / 2, y - r.top - r.height / 2));
    return Math.abs(p.x) <= r.width / 2 + pad && Math.abs(p.y) <= r.height / 2 + pad;
  };
  if (cur >= 0 && cur < plates.length) {
    for (let k = 0; k < cur; k++) if (over(k, -SNAP)) return k;
    if (over(cur, SNAP)) return cur;
  }
  for (let k = 0; k < plates.length; k++) if (over(k, 0)) return k;
  return -1;
}

function Stack({ hover, setHover }) {
  const ref = useRef(null);
  const stack = useRef(null);
  const cur = useRef(hover);
  cur.current = hover;
  useScrollVar(ref, (r, vh) => (vh - r.top - r.height / 2) / (vh * 0.45), "--e");
  useEffect(() => {
    const vx = ref.current && ref.current.parentElement;
    if (!vx) return undefined;
    const out = (e) => { if (!vx.contains(e.relatedTarget)) setHover(-1); };
    vx.addEventListener("focusout", out);
    return () => vx.removeEventListener("focusout", out);
  }, []);
  const track = (e) => {
    const k = pick(stack.current, e.clientX, e.clientY, cur.current);
    if (k !== cur.current) { cur.current = k; setHover(k); }
  };
  const leave = (e) => {
    if (e.pointerType === "touch") return;
    cur.current = -1;
    setHover(-1);
  };
  return (
    <div ref={ref} className="vx-visual" onPointerMove={track} onPointerDown={track} onPointerLeave={leave}>
      <div className="vx-scene" aria-hidden="true">
        <div ref={stack} className="vx-stack">
          {LAYERS.map((l, i) => (
            <div key={l.id} className={cx("vx-layer", "is-" + l.id, hover === i && "is-on", i < hover && "is-up")} style={{ "--k": i }}>
              <span className="vx-face"><span className="vx-art" /></span>
            </div>
          ))}
          {LAYERS.map((l, i) => (
            <span key={l.id} className={cx("vx-pin", hover === i && "is-on", i < hover && "is-up", hover >= 0 && hover !== i && "is-dim")} style={{ "--k": i }}>
              <i className="vx-lead" />
              <span className="vx-n mono-small">{l.n}</span>
              <span className="vx-tag mono-small">{l.tag}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="vx-file mono-small"><A.Icon name="file-lock-2" size={13} />~/.apm/vault.dat</div>
    </div>
  );
}

function Profiles() {
  const ref = useRef(null);
  const seen = useSeen(ref, 0.3);
  const [id, setId] = useState("standard");
  const [spin, setSpin] = useState(0);
  const p = PROFILES.find((x) => x.id === id);
  const choose = (v) => { setId(v); setSpin((s) => s + 1); };
  const rows = [
    { k: "Key derivation", v: "Argon2id" },
    { k: "Memory", v: <><Roll key={"m" + spin} value={p.memory} on={seen} /><span className="kd-unit">MiB</span></> },
    { k: "Passes", v: <Roll key={"t" + spin} value={p.time} on={seen} /> },
    { k: "Parallel lanes", v: <Roll key={"p" + spin} value={p.threads} on={seen} /> },
    { k: "Salt", v: p.salt + " bytes" },
    { k: "Nonce", v: p.nonce + " bytes" }
  ];
  return (
    <div ref={ref} className="kd-prof">
      <div className="kd-prof-head">
        <span className="kd-label overline">Security profile</span>
        <A.SegmentedControl label="Security profile" value={id} onChange={choose} options={PROFILES.map((x) => ({ value: x.id, label: x.label }))} />
      </div>
      <dl className="kd-params">
        {rows.map((r) => (
          <div key={r.k} className="kd-param">
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
      <div className="kd-prof-foot">
        <span className="small kd-fit">{p.fit}</span>
        <span className="kd-cmd mono-small"><span className="kd-ps">$</span> pm profile set {p.id}</span>
      </div>
    </div>
  );
}

function Flow() {
  return (
    <div className="kd-flow" aria-label="How APM derives keys">
      <div className="kd-node">
        <span className="kd-node-icon"><A.Icon name="key-round" size={16} /></span>
        <span className="kd-node-text"><span className="small-medium">Master password</span><span className="caption">Typed when you unlock</span></span>
      </div>
      <span className="kd-wire" aria-hidden="true"><i /></span>
      <div className="kd-node is-kdf">
        <span className="kd-node-icon"><A.Icon name="cpu" size={16} /></span>
        <span className="kd-node-text"><span className="small-medium">Argon2id</span><span className="caption mono-small">96 bytes, memory hard</span></span>
      </div>
      <span className="kd-wire is-split" aria-hidden="true"><i /></span>
      <div className="kd-keys">
        {KEYS.map((k, i) => (
          <div key={k.name} className="kd-key" style={{ "--k": i }}>
            <span className="kd-bytes mono-small">bytes {k.bytes}</span>
            <span className="small-medium">{k.name}</span>
            <span className="caption">{k.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Security() {
  const [hover, setHover] = useState(-1);
  return (
    <section className="sec security" id="security" data-spy="security" aria-labelledby="security-title">
      <div className="frame sec-in">
        <Ticks />
        <Heading index="03" label="Security" id="security-title" title="Encrypted on your computer. Signed against tampering.">
          Your master password runs through Argon2id to make three keys. One seals a random data key, one signs the file and one checks your password before anything is decrypted. Change a single byte of the file and it won't open.
        </Heading>
        <div className="vx">
          <Stack hover={hover} setHover={setHover} />
          <ol className="vx-list" onPointerLeave={() => setHover(-1)}>
            {LAYERS.map((l, i) => (
              <li key={l.id} className={cx("vx-row", hover === i && "is-on")} onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}>
                <span className="vx-row-n mono-small">{l.n}</span>
                <span className="vx-row-text">
                  <span className="vx-row-title">{l.title}<span className="vx-row-tag mono-small">{l.tag}</span></span>
                  <span className="vx-row-body">{l.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="kd">
          <div className="kd-cell">
            <div className="kd-cell-head"><span className="overline">Key derivation</span><span className="caption">One run, three keys</span></div>
            <Flow />
          </div>
          <div className="kd-cell">
            <Profiles />
          </div>
        </div>
        <div className="guards">
          {GUARDS.map((g) => (
            <div key={g.title} className="guard" onPointerMove={spot}>
              <span className="cell-glow" aria-hidden="true" />
              <span className="guard-icon"><A.Icon name={g.icon} size={18} /></span>
              <h3 className="guard-title">{g.title}</h3>
              <p className="guard-body">{g.body}</p>
            </div>
          ))}
        </div>
        <p className="sec-note small">AES-256-GCM by default. Switch to XChaCha20-Poly1305 in the app's security settings or with pm profile edit.</p>
      </div>
    </section>
  );
}
