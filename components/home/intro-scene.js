// The homepage intro: "apm" written as one continuous glass tube, a floating glass bubble, and a few vault
// entries drifting behind them. Scrolling turns the word in 3D and flies it into the nav logo.
// Loaded on demand by intro.jsx, so three.js never blocks the first paint.
//
// The glass is a custom shader rather than MeshPhysicalMaterial transmission: it refracts an analytic copy of
// the page behind it (background, rails, grid, glows; the same geometry intro.css draws) plus the entry cards,
// lit by an analytic studio of strip lights. That keeps the refracted grid pixel-aligned with the real one,
// needs no extra render pass, and reads the theme's own colours.
import {
  WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, Group, Mesh, BufferGeometry, BufferAttribute,
  SphereGeometry, PlaneGeometry, ShaderMaterial, CanvasTexture, LinearFilter, Matrix3, Vector3, Vector4, Matrix4,
  Euler, NoToneMapping, DynamicDrawUsage
} from "three";

// ---------------------------------------------------------------------------------------------------------------
// Knobs
// ---------------------------------------------------------------------------------------------------------------
export const KNOBS = {
  width: 0.85,          // most of the viewport width the word may span ("a" to the last stem of "m"), landscape
  widthPortrait: 0.92,  // the same on portrait screens
  centerX: 4.85,        // letter-unit x set at the middle of the screen (a touch right of the box centre, for the tail)
  centerY: 1.15,        // letter-unit y set at the middle of the area below the nav (between x-height and box centre)
  topClear: 22,         // px kept clear below the nav
  bottomClear: 28,      // px kept clear above the bottom edge
  radius: 0.3,          // tube radius in letter units (x-height is 3)
  bubble: 0.43,         // bubble radius in letter units
  fov: 30,              // camera field of view, degrees
  drawMs: 2700,         // how long the pen takes to write the visible part of the word
  drawDelay: 260,       // pause before it starts
  pace: 0.38,           // how much the pen slows down in tight turns (0 = constant speed)
  bubbleAt: 0.83,       // share of the drawing after which the bubble pops in
  bubbleMs: 900,
  idleYaw: 0.05,        // idle drift, radians
  idlePitch: 0.032,
  idleBob: 0.06,        // idle float, letter units
  parallaxYaw: 0.16,    // pointer parallax at the screen edges, radians
  parallaxPitch: 0.1,
  parallaxEase: 2.4,    // how quickly the word follows the pointer (per second)
  envDrift: 1,          // how much the studio lights drift over time (0 = still)
  flightYaw: 0.38,      // radians the word turns about its vertical axis mid-flight (back to 0 when it lands)
  landWidth: 0.9,       // share of the nav logo's width the cursive word shrinks to before the morph takes over
  morphFrom: 0.3,       // scroll progress where the tube starts reshaping into the nav logo (bird + A, P, M)...
  landFrom: 0.95,       // ...where it matches the logo exactly and the crossfade starts...
  landTo: 1,            // ...and where the real logo has fully taken over
  inkFrom: 0.72,        // the glass takes on the logo's own colours from here to landFrom
  morphRings: 960,      // rings along the morphing tube
  morphRadial: 16,      // segments around it
  cards: 5,             // background entries on wide screens (4 on phones)
  cardAlpha: 0.72,      // their overall strength
  cardDrift: 7,         // px they wander
  maxDpr: 2,
  segments: 2000,       // tube segments along the path
  radial: 40            // segments around the tube
};

// Glass and studio per theme. Colours of the page itself always come from the CSS tokens.
export const LOOK = {
  dark: {
    ior: 1.5, depth: 3.2, devMax: 1.3, disp: 0.035, boost: 2.2,
    tint: [1, 1, 1], edge: [0.82, 0.985, 0], edgeColor: [0, 0, 0],
    f0: 0.04, spec: 1, ambient: [0.05, 0.05, 0.056],
    back: [2.2, 0.5, 0.9, 0.45],
    key: [16, 3.2, 1.1, 0.06], keySoftH: 0.32, keyDir: [-0.12, 0.72, 0.68],
    side: [12, 2.4, 0.05, 1.4], sideSoftW: 0.3, sideDir: [-0.78, 0.1, 0.62],
    fill: [4, 0.05, 1.4], fillDir: [0.85, -0.05, 0.52],
    soft: [0.025, 0.22], iri: [0.08, 1.6]
  },
  light: {
    ior: 1.5, depth: 3.2, devMax: 1.3, disp: 0.035, boost: 2.0,
    tint: [0.94, 0.94, 0.95], edge: [0.8, 0.985, 0.75], edgeColor: [0.2, 0.2, 0.22],
    f0: 0.07, spec: 1, ambient: [0.74, 0.74, 0.76],
    back: [-0.6, 0.5, 0.9, 0.5],
    key: [9, 1.2, 1.1, 0.06], keySoftH: 0.32, keyDir: [-0.12, 0.72, 0.68],
    side: [-0.7, -0.3, 0.06, 1.4], sideSoftW: 0.3, sideDir: [-0.78, 0.1, 0.62],
    fill: [-0.6, 0.06, 1.4], fillDir: [0.85, -0.05, 0.52],
    soft: [0.025, 0.22], iri: [0, 1.6]
  }
};

// Made-up vault entries for the background. No real brands.
const ENTRIES = [
  { mono: "M", title: "Mail", user: "maya@example.com", totp: false },
  { mono: "B", title: "Bank", user: "maya.lin", totp: true },
  { mono: "W", title: "Work VPN", user: "mlin", totp: true },
  { mono: "R", title: "Home router", user: "admin", totp: false },
  { mono: "C", title: "Cloud drive", user: "maya@example.com", totp: false },
  { mono: "F", title: "Forum", user: "mayalin", totp: false }
];
const ROWS = 6;

// ---------------------------------------------------------------------------------------------------------------
// The lettering. x right, y up, baseline 0, x-height 3 (letter units). Control points for a centripetal
// Catmull-Rom curve. Retraces are depth hairpins: the two legs share x/y, one in front of the other, and turn
// through a half circle in depth, so from the front they read as a single stroke with a round end.
// ---------------------------------------------------------------------------------------------------------------
const D = 0.32;
const turnY = (x, yc, up, from) => [1, 2, 3].map((k) => { const t = (k / 4) * Math.PI; return [x, yc + (up ? 1 : -1) * D * Math.sin(t), from * D * Math.cos(t)]; });
const turnX = (xc, y, from) => [1, 2, 3].map((k) => { const t = (k / 4) * Math.PI; return [xc - D * Math.sin(t), y, from * D * Math.cos(t)]; });
const STEM_P = 3.05;
const BOWL_BOTTOM = [[4.72, -0.02], [4.02, 0.06], [3.6, 0.2], [STEM_P + D, 0.26]];

export const PATH = [
  // a: bowl, counter-clockwise from the top right, then up its right side
  [0.98, 2.72, 0], [0.15, 3.1, 0], [-0.85, 2.72, 0], [-1.38, 1.6, 0], [-1.2, 0.45, 0], [-0.45, -0.04, 0], [0.45, 0.25, 0],
  [1.05, 1.15, 0.12], [1.28, 2.25, 0.28], [1.32, 2.85, D],
  ...turnY(1.32, 2.85, true, 1),
  // a: the stem comes down behind the bowl's side, then out
  [1.33, 2.85, -D], [1.35, 1.8, -D], [1.38, 0.7, -D], [1.5, 0.15, -0.24], [1.82, -0.03, -0.1], [2.18, 0.12, 0],
  // up to the pointed top of p
  [2.55, 1.2, 0.06], [2.81, 2.5, 0.16], [2.97, 3.18, 0.22], [3.05, 3.38, 0.04], [3.07, 3.15, -0.2],
  // p: stem down to the descender
  [STEM_P, 2.3, -D], [STEM_P, 0.5, -D], [3.01, -1.2, -D], [2.98, -2.1, -D],
  ...turnY(2.98, -2.1, false, -1),
  // p: back up in front of the stem, round the bowl, closing on the stem
  [2.98, -2.1, D], [3.01, -1.2, D], [STEM_P, 0.5, D], [STEM_P, 1.6, D], [3.22, 2.5, 0.2], [3.8, 3.02, 0.06], [4.55, 3.1, 0],
  [5.3, 2.66, 0], [5.6, 1.5, 0], [5.32, 0.42, 0],
  ...BOWL_BOTTOM.map(([x, y]) => [x, y, D]),
  ...turnX(STEM_P + D, 0.26, 1),
  // out along the bottom of the bowl, behind it, and on into m
  ...BOWL_BOTTOM.slice().reverse().map(([x, y]) => [x, y, -D]),
  [5.42, 0.05, -0.24], [5.98, 0.32, -0.1], [6.32, 1.4, 0.1], [6.5, 2.5, 0.26], [6.55, 2.95, D],
  ...turnY(6.55, 2.95, true, 1),
  // m: first stem, then two humps
  [6.56, 2.95, -D], [6.58, 1.6, -D], [6.6, 0.32, -D],
  ...turnY(6.6, 0.32, false, -1),
  [6.6, 0.32, D], [6.66, 1.5, 0.3], [6.92, 2.5, 0.2], [7.5, 3.05, 0.05], [8.12, 2.95, 0], [8.45, 2.25, -0.1], [8.55, 1.2, -0.25], [8.57, 0.32, -D],
  ...turnY(8.57, 0.32, false, -1),
  [8.57, 0.32, D], [8.62, 1.5, 0.3], [8.88, 2.5, 0.2], [9.46, 3.05, 0.05], [10.07, 2.95, 0], [10.4, 2.25, -0.04], [10.5, 1.2, -0.04], [10.56, 0.4, 0],
  // the tail: out along the baseline and away off the right edge
  [10.84, -0.02, 0], [11.45, 0, 0], [12.3, 0.32, 0], [13.4, 0.95, 0], [14.9, 1.95, 0], [16.9, 3.35, 0], [19.4, 5.1, 0]
];
// The box the layout fits ("a" to the last stem of "m", p's top to its descender), and the bubble [x, y, z].
export const WORD = { x0: -1.7, x1: 10.9, y0: -2.75, y1: 3.7 };
export const BUBBLE = [9.7, -2.05, 0.45];
const TAIL_KEEP = 11.15; // on the way to the nav the tail draws back to here

// ---------------------------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------------------------
function catmull(points) {
  const n = points.length;
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const ext = (a, b) => [2 * a[0] - b[0], 2 * a[1] - b[1], 2 * a[2] - b[2]];
  const segs = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : ext(points[0], points[1]);
    const p1 = points[i], p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : ext(points[n - 1], points[n - 2]);
    let dt0 = Math.pow(d2(p0, p1), 0.25), dt1 = Math.pow(d2(p1, p2), 0.25), dt2 = Math.pow(d2(p2, p3), 0.25);
    if (dt1 < 1e-4) dt1 = 1;
    if (dt0 < 1e-4) dt0 = dt1;
    if (dt2 < 1e-4) dt2 = dt1;
    segs.push([0, 1, 2].map((k) => {
      const x0 = p0[k], x1 = p1[k], x2 = p2[k], x3 = p3[k];
      const t1 = ((x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1) * dt1;
      const t2 = ((x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2) * dt1;
      return [x1, t1, -3 * x1 + 3 * x2 - 2 * t1 - t2, 2 * x1 - 2 * x2 + t1 + t2];
    }));
  }
  return (t) => {
    const p = (n - 1) * t;
    let i = Math.floor(p), w = p - i;
    if (i >= n - 1) { i = n - 2; w = 1; }
    return segs[i].map((c) => c[0] + w * (c[1] + w * (c[2] + w * c[3])));
  };
}

// Evenly spaced (by arc length) samples of the path.
function sampleCurve(points, count) {
  const f = catmull(points);
  const dense = count * 12;
  const raw = new Array(dense + 1);
  const acc = new Float64Array(dense + 1);
  for (let i = 0; i <= dense; i++) raw[i] = f(i / dense);
  for (let i = 1; i <= dense; i++) acc[i] = acc[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1], raw[i][2] - raw[i - 1][2]);
  const length = acc[dense];
  const pts = new Float32Array((count + 1) * 3);
  let j = 0;
  for (let k = 0; k <= count; k++) {
    const s = (k / count) * length;
    while (j < dense - 1 && acc[j + 1] < s) j++;
    const w = (s - acc[j]) / Math.max(1e-9, acc[j + 1] - acc[j]);
    for (let c = 0; c < 3; c++) pts[k * 3 + c] = raw[j][c] + (raw[j + 1][c] - raw[j][c]) * w;
  }
  return { pts, length, count };
}

// A tube along the samples with rotation-minimising frames, laid out ring after ring so a draw range grows it
// along the path. Same vertex/normal/winding conventions as THREE.TubeGeometry.
function tubeGeometry(path, radius, radial) {
  const { pts, count } = path;
  const rings = count + 1;
  const P = (i) => new Vector3(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
  const tangents = [];
  for (let i = 0; i < rings; i++) tangents.push(P(Math.min(i + 1, count)).sub(P(Math.max(i - 1, 0))).normalize());
  let normal = new Vector3(0, 0, 1);
  if (Math.abs(tangents[0].dot(normal)) > 0.9) normal.set(0, 1, 0);
  normal = new Vector3().crossVectors(tangents[0], normal).cross(tangents[0]).normalize();
  const position = new Float32Array(rings * (radial + 1) * 3);
  const normals = new Float32Array(rings * (radial + 1) * 3);
  const axis = new Vector3(), rot = new Matrix4(), B = new Vector3(), n = new Vector3(), tmp = new Vector3();
  for (let i = 0; i < rings; i++) {
    if (i > 0) {
      axis.crossVectors(tangents[i - 1], tangents[i]);
      const l = axis.length();
      if (l > 1e-8) normal.applyMatrix4(rot.makeRotationAxis(axis.divideScalar(l), Math.acos(Math.min(1, Math.max(-1, tangents[i - 1].dot(tangents[i]))))));
      normal.sub(tmp.copy(tangents[i]).multiplyScalar(normal.dot(tangents[i]))).normalize();
    }
    B.crossVectors(tangents[i], normal);
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const c = -Math.cos(v), s = Math.sin(v);
      n.set(c * normal.x + s * B.x, c * normal.y + s * B.y, c * normal.z + s * B.z).normalize();
      const o = (i * (radial + 1) + j) * 3;
      normals[o] = n.x; normals[o + 1] = n.y; normals[o + 2] = n.z;
      position[o] = pts[i * 3] + radius * n.x; position[o + 1] = pts[i * 3 + 1] + radius * n.y; position[o + 2] = pts[i * 3 + 2] + radius * n.z;
    }
  }
  const index = new Uint32Array(count * radial * 6);
  let k = 0;
  for (let i = 1; i <= count; i++) {
    for (let j = 1; j <= radial; j++) {
      const a = (radial + 1) * (i - 1) + (j - 1), b = (radial + 1) * i + (j - 1), c = (radial + 1) * i + j, d = (radial + 1) * (i - 1) + j;
      index[k++] = a; index[k++] = b; index[k++] = d;
      index[k++] = b; index[k++] = c; index[k++] = d;
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(position, 3));
  g.setAttribute("normal", new BufferAttribute(normals, 3));
  g.setIndex(new BufferAttribute(index, 1));
  return g;
}

// Evenly spaced (by arc length) resample of a polyline. Each row holds the position (first `dim` values)
// followed by any extra channels, which are interpolated along.
function resampleRows(rows, dim, n) {
  const acc = [0];
  for (let i = 1; i < rows.length; i++) {
    let d = 0;
    for (let k = 0; k < dim; k++) d += (rows[i][k] - rows[i - 1][k]) ** 2;
    acc.push(acc[i - 1] + Math.sqrt(d));
  }
  const L = acc[acc.length - 1];
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (L * i) / (n - 1);
    while (j < rows.length - 2 && acc[j + 1] < s) j++;
    const w = clamp((s - acc[j]) / Math.max(1e-9, acc[j + 1] - acc[j]));
    out.push(rows[j].map((v, k) => v + (rows[j + 1][k] - v) * w));
  }
  return { out, L };
}
function resample(pts, _r, n, outP) {
  const { out, L } = resampleRows(pts, 3, n);
  out.forEach((q, i) => { outP[i * 3] = q[0]; outP[i * 3 + 1] = q[1]; outP[i * 3 + 2] = q[2]; });
  return L;
}
// A round end: the radius over the last R of a stroke, as a share of the full radius.
const capProfile = (d, R) => (d >= R ? 1 : Math.sqrt(Math.max(0, 1 - ((R - d) / R) ** 2)));

// The nav logo as strokes for the morph, in .nav-brand-local css px: the bird from the mark's own SVG paths
// (each traced along its middle, as thick as the shape is wide, so it reads as the filled bird at 18px), then
// single-stroke A, P and M sized on the measured glyph boxes of .nav-word. Joined end to end by connectors of
// zero radius and resampled to n rings. Writes positions to P, radii to R and the logo's colours to ink.
function logoTarget(el, n, P, R, ink, ringVerts) {
  const br = el.getBoundingClientRect();
  if (!br.width) return false;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const strokes = [];
  // the bird
  const svg = el.querySelector("svg");
  if (svg) {
    const col = parseColor(getComputedStyle(svg).color, ctx);
    svg.querySelectorAll("path").forEach((path) => {
      const L = path.getTotalLength(), M = path.getScreenCTM();
      if (!L || !M) return;
      const half = 6 * Math.hypot(M.a, M.b); // the mark is filled and stroked 12 user units wide
      const N = 96, pts = [];
      for (let i = 0; i < N; i++) {
        const q = path.getPointAtLength((L * i) / N);
        const v = new DOMPoint(q.x, q.y).matrixTransform(M);
        pts.push([v.x - br.left, v.y - br.top]);
      }
      let tip = 0, far = -1;
      pts.forEach((q, i) => { const d = Math.hypot(q[0] - pts[0][0], q[1] - pts[0][1]); if (d > far) { far = d; tip = i; } });
      const a = resampleRows(pts.slice(0, tip + 1), 2, 28).out;
      const b = resampleRows(pts.slice(tip).concat([pts[0]]).reverse(), 2, 28).out;
      const line = a.map((q, i) => {
        const w = Math.hypot(q[0] - b[i][0], q[1] - b[i][1]) / 2 + half;
        return [(q[0] + b[i][0]) / 2, (q[1] + b[i][1]) / 2, clamp(w, 0.3, 2.4), col[0], col[1], col[2]];
      });
      strokes.push(line);
    });
  }
  // the wordmark
  const word = el.querySelector(".nav-word");
  const tn = word && word.firstChild;
  if (tn && tn.nodeType === 3) {
    const cs = getComputedStyle(word);
    ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    const col = parseColor(cs.color, ctx);
    const I = ctx.measureText("I");
    const r = clamp((I.actualBoundingBoxRight + I.actualBoundingBoxLeft) / 2 || parseFloat(cs.fontSize) * 0.055, 0.5, 2);
    const range = document.createRange();
    const text = tn.textContent;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i].toUpperCase();
      range.setStart(tn, i);
      range.setEnd(tn, i + 1);
      const rc = range.getBoundingClientRect();
      const mt = ctx.measureText(text[i]);
      const x0 = rc.left - br.left - mt.actualBoundingBoxLeft, x1 = rc.left - br.left + mt.actualBoundingBoxRight;
      const bot = rc.top - br.top + (mt.fontBoundingBoxAscent || rc.height * 0.8), top = bot - mt.actualBoundingBoxAscent;
      const capH = bot - top, mid = (x0 + x1) / 2;
      const polys = [];
      if (ch === "A") {
        const l = [x0 + r, bot], t = [mid, top + r * 0.8], rr = [x1 - r, bot];
        polys.push([l, t, rr]);
        const yb = bot - 0.3 * capH, f = (bot - yb) / (bot - t[1]);
        polys.push([[l[0] + (t[0] - l[0]) * f, yb], [rr[0] + (t[0] - rr[0]) * f, yb]]);
      } else if (ch === "P") {
        const sx = x0 + r, yt = top + r, ym = top + 0.58 * capH, rho = (ym - yt) / 2, xa = x1 - r - rho;
        const q = [[sx, bot], [sx, yt], [xa, yt]];
        for (let k = 1; k <= 16; k++) { const th = -Math.PI / 2 + (Math.PI * k) / 16; q.push([xa + rho * Math.cos(th), yt + rho + rho * Math.sin(th)]); }
        q.push([sx, ym]);
        polys.push(q);
      } else if (ch === "M") {
        polys.push([[x0 + r, bot], [x0 + r, top + r], [mid, bot - r - 0.1 * capH], [x1 - r, top + r], [x1 - r, bot]]);
      } else if (x1 > x0) {
        polys.push([[x0 + r, (top + bot) / 2], [x1 - r, (top + bot) / 2]]);
      }
      for (const q of polys) {
        const d = resampleRows(q, 2, Math.max(8, Math.ceil(q.reduce((s2, v, k) => s2 + (k ? Math.hypot(v[0] - q[k - 1][0], v[1] - q[k - 1][1]) : 0), 0) / 0.25))).out;
        const Ls = d.reduce((s2, v, k) => s2 + (k ? Math.hypot(v[0] - d[k - 1][0], v[1] - d[k - 1][1]) : 0), 0);
        let acc = 0;
        strokes.push(d.map((v, k) => {
          if (k) acc += Math.hypot(v[0] - d[k - 1][0], v[1] - d[k - 1][1]);
          return [v[0], v[1], r * capProfile(Math.min(acc, Ls - acc), r), col[0], col[1], col[2]];
        }));
      }
    }
  }
  if (!strokes.length) return false;
  // one polyline: strokes joined by zero-radius connectors, so the pieces come apart cleanly
  const rows = [];
  strokes.forEach((st2) => {
    if (rows.length) {
      const last = rows[rows.length - 1], first = st2[0];
      rows.push([last[0], last[1], 0, first[3], first[4], first[5]]);
      rows.push([first[0], first[1], 0, first[3], first[4], first[5]]);
    }
    st2.forEach((v) => rows.push(v));
  });
  const out = resampleRows(rows, 2, n).out;
  out.forEach((v, i) => {
    P[i * 2] = v[0]; P[i * 2 + 1] = v[1]; R[i] = v[2];
    for (let j = 0; j < ringVerts; j++) { const o = (i * ringVerts + j) * 3; ink[o] = v[3]; ink[o + 1] = v[4]; ink[o + 2] = v[5]; }
  });
  return true;
}

// Pen pacing: time spent per sample grows with curvature, so the pen eases through turns and runs on straights.
function pacing(path, pace) {
  const { pts, count, length } = path;
  const h = length / count;
  const t = new Float64Array(count + 1);
  for (let i = 1; i <= count; i++) {
    let k = 0;
    if (i < count) {
      const ax = pts[i * 3] - pts[(i - 1) * 3], ay = pts[i * 3 + 1] - pts[(i - 1) * 3 + 1], az = pts[i * 3 + 2] - pts[(i - 1) * 3 + 2];
      const bx = pts[(i + 1) * 3] - pts[i * 3], by = pts[(i + 1) * 3 + 1] - pts[i * 3 + 1], bz = pts[(i + 1) * 3 + 2] - pts[i * 3 + 2];
      const cos = (ax * bx + ay * by + az * bz) / Math.max(1e-9, Math.hypot(ax, ay, az) * Math.hypot(bx, by, bz));
      k = Math.acos(Math.min(1, Math.max(-1, cos))) / h;
    }
    t[i] = t[i - 1] + h * (1 + pace * Math.min(k, 4));
  }
  return t;
}

// ---------------------------------------------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------------------------------------------
const VERT = /* glsl */ `
uniform float uRadius;
uniform float uFocal;
varying vec3 vN;
varying vec3 vP;
varying float vRpx;
#ifdef MORPH
attribute vec3 aInk;
varying vec3 vInk;
#endif
void main() {
#ifdef MORPH
  vInk = aInk;
#endif
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vP = mv.xyz;
  vN = normalize(normalMatrix * normal);
  vRpx = uRadius * uFocal / max(1e-3, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uView;      // intro size, css px
uniform float uDpr;
uniform vec3 uBg;        // page colours, sRGB
uniform vec4 uLine;      // grid line rgb + alpha
uniform vec3 uRail;
uniform vec3 uHot;       // grid line colour as seen through the glass
uniform vec4 uGlow;      // mirrored hero glow rgb + alpha
uniform vec4 uSpot;      // light behind the word rgb + alpha
uniform vec4 uGrid;      // left, width, cell, rails start
uniform vec4 uMask;      // seam rx, seam ry, centre rx, centre ry
uniform vec4 uGlowGeo;   // glow rx, glow ry, spot y, top shade height
uniform sampler2D uAtlas;
uniform vec4 uCard[${ROWS}];     // entry cards: x, y, w, h (css px)
uniform float uCardA[${ROWS}];
uniform vec4 uLens;      // ior, depth, max deviation, dispersion
uniform float uBoost;
uniform vec3 uTint;
uniform vec4 uEdge;      // start, end, amount
uniform vec3 uEdgeColor; // linear
uniform vec2 uFres;      // f0, specular gain
uniform vec3 uAmbient;   // linear
uniform vec4 uBack;      // intensity, from, to, top bias
uniform vec4 uKey;       // crisp, soft, half width, half height
uniform float uKeySoftH;
uniform mat3 uKeyM;
uniform vec4 uSide;      // crisp, soft, half width, half height
uniform float uSideSoftW;
uniform mat3 uSideM;
uniform vec3 uFill;      // intensity, half width, half height
uniform mat3 uFillM;
uniform vec2 uSoft;      // crisp edge, soft edge
uniform vec2 uIri;       // amount, frequency
uniform mat3 uEnvRot;
uniform float uInkMix;
varying vec3 vN;
varying vec3 vP;
varying float vRpx;
#ifdef MORPH
varying vec3 vInk;
#endif

float sat(float x) { return clamp(x, 0.0, 1.0); }
vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
// share of the 1px line [a, a + 1) covered by a box of width w centred on x
float cover(float x, float a, float w) { return sat((min(x + 0.5 * w, a + 1.0) - max(x - 0.5 * w, a)) / w); }

// The page behind the intro, as intro.css and base.css draw it, plus the entry cards (sRGB).
vec3 backdrop(vec2 q, vec2 fw) {
  float W = uView.x, H = uView.y;
  float gl = uGrid.x, gw = uGrid.y, cell = uGrid.z;
  vec3 c = uBg;
  float rail = max(cover(q.x, gl, fw.x), cover(q.x, gl + gw - 1.0, fw.x)) * sat((q.y - uGrid.w) / 32.0);
  c = mix(c, uRail, rail);
  float gt = length(vec2((q.x - 0.5 * W) / uGlowGeo.x, (q.y - H) / uGlowGeo.y)) / 0.7;
  c = mix(c, uGlow.rgb, uGlow.a * sat(1.0 - gt));
  float st = sat(1.0 - length(vec2((q.x - 0.5 * W) / (0.48 * W), (q.y - uGlowGeo.z) / (0.42 * H))));
  c = mix(c, uSpot.rgb, uSpot.a * st * st);
  float lx = gl - 1.0 + floor((q.x - gl + 1.0) / cell + 0.5) * cell;
  float ly = H - 1.0 - floor((H - 1.0 - q.y) / cell + 0.5) * cell;
  float line = max(cover(q.x, lx, fw.x), cover(q.y, ly, fw.y));
  float ms = sat((0.86 - length(vec2((q.x - 0.5 * W) / uMask.x, (H - q.y) / uMask.y))) / 0.52) * step(gl, q.x) * step(q.x, gl + gw);
  float mc = sat((1.0 - length(vec2((q.x - 0.5 * W) / uMask.z, (q.y - 0.5 * H) / uMask.w))) / 0.7);
  float m = mc + ms * (1.0 - mc);
  c = mix(c, uHot, min(1.0, uLine.a * m * line * uBoost));
  for (int i = 0; i < ${ROWS}; i++) {
    vec4 R = uCard[i];
    vec2 l = (q - R.xy) / R.zw;
    if (uCardA[i] > 0.001 && l.x >= 0.0 && l.x <= 1.0 && l.y >= 0.0 && l.y <= 1.0) {
      vec4 t = textureLod(uAtlas, vec2(l.x, 1.0 - (float(i) + l.y) / ${ROWS}.0), 0.0);
      c = mix(c, t.rgb, t.a * uCardA[i]);
    }
  }
  return mix(c, uBg, sat(1.0 - q.y / uGlowGeo.w));
}

float band(vec3 r, mat3 M, float hw, float hh, float soft) {
  vec3 l = M * r;
  vec2 uv = abs(l.xy) / max(l.z, 1e-3);
  return step(0.05, l.z) * (1.0 - smoothstep(hw - soft, hw + soft, uv.x)) * (1.0 - smoothstep(hh - soft, hh + soft, uv.y));
}

vec3 studio(vec3 r) {
  r = uEnvRot * r;
  float back = uBack.x * smoothstep(uBack.y, uBack.z, -r.z) * (1.0 - uBack.w + uBack.w * smoothstep(-0.8, 0.8, r.y));
  float key = uKey.x * band(r, uKeyM, uKey.z, uKey.w, uSoft.x) + uKey.y * band(r, uKeyM, uKey.z, uKeySoftH, uSoft.y);
  float side = uSide.x * band(r, uSideM, uSide.z, uSide.w, uSoft.x) + uSide.y * band(r, uSideM, uSideSoftW, uSide.w, uSoft.y);
  float fill = uFill.x * band(r, uFillM, uFill.y, uFill.z, uSoft.x);
  return max(uAmbient + vec3(back + key + side + fill), 0.0);
}

void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(-vP);
  float cosI = sat(dot(n, v));
  vec3 np = n - v * dot(n, v);
  float s = min(0.9999, length(np));
  vec2 dir = s > 1e-4 ? vec2(np.x, -np.y) / s : vec2(0.0);
  // a solid rod: the deviation through it grows towards the rim, so the page behind shows inverted and squeezed
  float dev = 2.0 * (asin(s) - asin(s / uLens.x));
  float k = uLens.y * tan(min(dev, uLens.z));
  vec2 frag = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 off = -dir * k * vRpx;
  vec2 q = frag + off;
  vec2 fw = max(fwidth(q), vec2(1.0 / uDpr));
  vec3 tr = vec3(
    toLinear(backdrop(frag + off * (1.0 - uLens.w), fw)).r,
    toLinear(backdrop(q, fw)).g,
    toLinear(backdrop(frag + off * (1.0 + uLens.w), fw)).b
  );
  float e = smoothstep(uEdge.x, uEdge.y, s) * uEdge.z;
  vec3 trans = mix(tr, uEdgeColor, e) * uTint;
  float F = uFres.x + (1.0 - uFres.x) * pow(1.0 - cosI, 5.0);
  vec3 E = studio(reflect(-v, n));
  vec3 iri = 1.0 - uIri.x + uIri.x * (0.5 + 0.5 * cos(6.2832 * (uIri.y * cosI + vec3(0.0, 0.33, 0.67))));
  vec3 col = trans * (1.0 - F) + E * F * uFres.y * iri;
#ifdef MORPH
  col = mix(col, toLinear(vInk), uInkMix);
#endif
  gl_FragColor = vec4(toSRGB(clamp(col, 0.0, 1.0)), 1.0);
}
`;

// The entry cards on screen: a quad each, sampling its row of the atlas.
const CARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const CARD_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uRow;
uniform float uA;
varying vec2 vUv;
void main() {
  vec4 t = texture2D(uAtlas, vec2(vUv.x, 1.0 - (uRow + 1.0 - vUv.y) / ${ROWS}.0));
  gl_FragColor = vec4(t.rgb * t.a * uA, t.a * uA);
}
`;

// ---------------------------------------------------------------------------------------------------------------
// Page colours
// ---------------------------------------------------------------------------------------------------------------
function parseColor(str, ctx) {
  const m = /^rgba?\(([^)]+)\)$/.exec(str);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1];
  }
  const c = /^color\(srgb\s+([^)]+)\)$/.exec(str);
  if (c) {
    const p = c[1].split(/[\s/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  if (ctx) {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = str;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  return [0, 0, 0, 0];
}

function readColors(host) {
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden;pointer-events:none";
  host.appendChild(probe);
  let ctx = null;
  try { const c = document.createElement("canvas"); c.width = c.height = 1; ctx = c.getContext("2d", { willReadFrequently: true }); } catch (e) { ctx = null; }
  const raw = (v, fallback) => {
    probe.style.color = fallback;
    probe.style.color = "var(" + v + ", " + fallback + ")";
    return getComputedStyle(probe).color;
  };
  const get = (v, fallback) => parseColor(raw(v, fallback), ctx);
  const out = {
    bg: get("--bg", "#09090b"),
    line: get("--web-grid-line", "rgba(31, 31, 36, 0.8)"),
    rail: get("--web-rail", "#1f1f24"),
    hot: get("--border-hover", "#44444c"),
    glow: get("--web-glow", "rgba(255, 255, 255, 0.075)"),
    spot: get("--intro-spot", "rgba(255, 255, 255, 0)"),
    // the entry cards are drawn with the 2D canvas API, which takes the computed strings as they are
    card: {
      surface: raw("--surface", "#131316"), border: raw("--border-strong", "#303037"), fill: raw("--fill", "#1b1b1f"),
      text: raw("--text-secondary", "#a1a1ab"), sub: raw("--text-tertiary", "#8a8a94"), dim: raw("--text-disabled", "#56565f"),
      font: getComputedStyle(host).fontFamily || "ui-sans-serif, system-ui, sans-serif"
    }
  };
  probe.remove();
  return out;
}

// One row of the atlas per entry: monogram tile, name, user, then a masked password or a one-time-code ring.
function drawCards(canvas, cw, ch, scale, col) {
  canvas.width = Math.round(cw * scale);
  canvas.height = Math.round(ch * ROWS * scale);
  const g = canvas.getContext("2d");
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.clearRect(0, 0, cw, ch * ROWS);
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const tile = Math.round(ch * 0.54);
  ENTRIES.slice(0, ROWS).forEach((e, i) => {
    const y = i * ch;
    rr(0.5, y + 0.5, cw - 1, ch - 1, 12);
    g.fillStyle = col.surface; g.fill();
    g.lineWidth = 1; g.strokeStyle = col.border; g.stroke();
    const ty = y + (ch - tile) / 2;
    rr(14, ty, tile, tile, 8);
    g.fillStyle = col.fill; g.fill();
    g.fillStyle = col.text; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "600 " + Math.round(tile * 0.42) + "px " + col.font;
    g.fillText(e.mono, 14 + tile / 2, ty + tile / 2 + 0.5);
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    const tx = 14 + tile + 12;
    g.font = "500 13px " + col.font; g.fillStyle = col.text;
    g.fillText(e.title, tx, y + ch / 2 - 3);
    g.font = "400 12px " + col.font; g.fillStyle = col.sub;
    g.fillText(e.user, tx, y + ch / 2 + 13);
    if (e.totp) {
      const cx = cw - 24, cy = y + ch / 2;
      g.lineWidth = 2; g.strokeStyle = col.border;
      g.beginPath(); g.arc(cx, cy, 8, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = col.sub;
      g.beginPath(); g.arc(cx, cy, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.35 + 0.15 * i)); g.stroke();
    } else {
      g.textAlign = "right"; g.font = "400 12px " + col.font; g.fillStyle = col.dim;
      g.fillText("•••••••", cw - 16, y + ch / 2 - 3);
      g.textAlign = "left";
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------------------------------------------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
const easeOutBack = (t) => { const c = 1.55; const u = clamp(t) - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));

function lightFrame(dir) {
  const d = new Vector3(...dir).normalize();
  const e1 = new Vector3().crossVectors(new Vector3(0, 1, 0), d).normalize();
  const e2 = new Vector3().crossVectors(d, e1);
  return new Matrix3().set(e1.x, e1.y, e1.z, e2.x, e2.y, e2.z, d.x, d.y, d.z);
}

export function createIntroScene({ host, mount, reduced = false, onDrawn, onFail }) {
  const canvas = document.createElement("canvas");
  canvas.className = "intro-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, stencil: false, powerPreference: "high-performance", failIfMajorPerformanceCaveat: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NoToneMapping;
  renderer.autoClear = false;
  mount.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(KNOBS.fov, 1, 0.1, 200);
  const CAM_Z = 20;
  camera.position.set(0, 0, CAM_Z);
  const world = new Group();   // placed, scaled and spun by the layout and the scroll
  const word = new Group();    // idle drift and pointer parallax, pivoting on the word's centre
  const letters = new Group(); // letter units, offset so the pivot sits at the word's centre
  world.add(word);
  word.add(letters);
  scene.add(world);
  const PIVOT = [(WORD.x0 + WORD.x1) / 2, (WORD.y0 + WORD.y1) / 2];
  letters.position.set(-PIVOT[0], -PIVOT[1], 0);

  const path = sampleCurve(PATH, KNOBS.segments);
  const tube = tubeGeometry(path, KNOBS.radius, KNOBS.radial);
  const times = pacing(path, KNOBS.pace);
  const cap = new SphereGeometry(KNOBS.radius, 40, 20);
  const ball = new SphereGeometry(KNOBS.bubble, 64, 32);
  let tailKeep = path.count;
  for (let i = Math.floor(path.count / 2); i <= path.count; i++) if (path.pts[i * 3] > TAIL_KEEP) { tailKeep = i; break; }

  // entry cards: an atlas drawn with the 2D canvas API, shown as quads and refracted by the glass
  const atlasCanvas = document.createElement("canvas");
  const atlas = new CanvasTexture(atlasCanvas);
  atlas.generateMipmaps = false;
  atlas.minFilter = LinearFilter;
  atlas.magFilter = LinearFilter;
  const cardScene = new Scene();
  const ortho = new OrthographicCamera(0, 1, 0, -1, -10, 10);
  const plane = new PlaneGeometry(1, 1);
  const cards = [];
  for (let i = 0; i < ROWS; i++) {
    const mat = new ShaderMaterial({ uniforms: { uAtlas: { value: atlas }, uRow: { value: i }, uA: { value: 0 } }, vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false });
    const mesh = new Mesh(plane, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    cardScene.add(mesh);
    cards.push({ mesh, mat, x: 0, y: 0, on: false, phase: i * 1.7 });
  }
  const cardRects = Array.from({ length: ROWS }, () => new Vector4(-1e5, -1e5, 1, 1));
  const cardAlpha = new Array(ROWS).fill(0);

  const uniforms = () => ({
    uRadius: { value: KNOBS.radius }, uFocal: { value: 1 },
    uView: { value: [1, 1] }, uDpr: { value: 1 },
    uBg: { value: new Vector3() }, uLine: { value: [0, 0, 0, 0.8] }, uRail: { value: new Vector3() }, uHot: { value: new Vector3() },
    uGlow: { value: [1, 1, 1, 0] }, uSpot: { value: [1, 1, 1, 0] },
    uGrid: { value: [0, 1200, 100, 72] }, uMask: { value: [1, 1, 1, 1] }, uGlowGeo: { value: [750, 456, 400, 120] },
    uAtlas: { value: atlas }, uCard: { value: cardRects }, uCardA: { value: cardAlpha },
    uLens: { value: [1.5, 3.2, 1.3, 0.035] }, uBoost: { value: 2 }, uTint: { value: new Vector3(1, 1, 1) },
    uEdge: { value: [0.8, 0.98, 0, 0] }, uEdgeColor: { value: new Vector3() }, uFres: { value: [0.04, 1] },
    uAmbient: { value: new Vector3() }, uBack: { value: [0, 0.5, 0.9, 0.5] },
    uKey: { value: [0, 0, 1, 0.06] }, uKeySoftH: { value: 0.3 }, uKeyM: { value: new Matrix3() },
    uSide: { value: [0, 0, 0.05, 1.4] }, uSideSoftW: { value: 0.3 }, uSideM: { value: new Matrix3() },
    uFill: { value: new Vector3() }, uFillM: { value: new Matrix3() },
    uSoft: { value: [0.025, 0.22] }, uIri: { value: [0, 1.6] }, uEnvRot: { value: new Matrix3() }, uInkMix: { value: 0 }
  });
  const glass = new ShaderMaterial({ uniforms: uniforms(), vertexShader: VERT, fragmentShader: FRAG });
  const bubbleGlass = new ShaderMaterial({ uniforms: uniforms(), vertexShader: VERT, fragmentShader: FRAG });
  const materials = [glass, bubbleGlass];

  const tubeMesh = new Mesh(tube, glass);
  const startCap = new Mesh(cap, glass);
  const tipCap = new Mesh(cap, glass);
  const bubble = new Mesh(ball, bubbleGlass);
  tubeMesh.frustumCulled = startCap.frustumCulled = tipCap.frustumCulled = bubble.frustumCulled = false;
  startCap.position.set(path.pts[0], path.pts[1], path.pts[2]);
  letters.add(tubeMesh, startCap, tipCap, bubble);
  bubble.position.set(BUBBLE[0], BUBBLE[1], BUBBLE[2]);

  // ---- the morph into the nav logo: one preallocated tube, rewritten in place only during the hand-over
  const MN = KNOBS.morphRings, MR = KNOBS.morphRadial, MV = MN * (MR + 1);
  const mPos = new Float32Array(MV * 3), mNrm = new Float32Array(MV * 3), mInk = new Float32Array(MV * 3);
  const mGeo = new BufferGeometry();
  mGeo.setAttribute("position", new BufferAttribute(mPos, 3).setUsage(DynamicDrawUsage));
  mGeo.setAttribute("normal", new BufferAttribute(mNrm, 3).setUsage(DynamicDrawUsage));
  mGeo.setAttribute("aInk", new BufferAttribute(mInk, 3));
  {
    const idx = new Uint32Array((MN - 1) * MR * 6);
    let k = 0;
    for (let i = 1; i < MN; i++) for (let j = 1; j <= MR; j++) {
      const a = (MR + 1) * (i - 1) + (j - 1), b = (MR + 1) * i + (j - 1), c = (MR + 1) * i + j, d = (MR + 1) * (i - 1) + j;
      idx[k++] = a; idx[k++] = b; idx[k++] = d; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    mGeo.setIndex(new BufferAttribute(idx, 1));
  }
  const morphGlass = new ShaderMaterial({ uniforms: glass.uniforms, vertexShader: VERT, fragmentShader: FRAG, defines: { MORPH: "" } });
  const morphMesh = new Mesh(mGeo, morphGlass);
  morphMesh.frustumCulled = false;
  morphMesh.visible = false;
  scene.add(morphMesh);
  // source: the visible word (tail drawn back), in letter units, with round ends like the caps
  const srcP = new Float32Array(MN * 3), srcR = new Float32Array(MN);
  {
    const R = KNOBS.radius;
    const pts = [];
    for (let i = 0; i <= tailKeep; i++) pts.push([path.pts[i * 3], path.pts[i * 3 + 1], path.pts[i * 3 + 2]]);
    const ext = (a, b) => { const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; const l = Math.hypot(...d) || 1; return [a[0] + (d[0] / l) * R, a[1] + (d[1] / l) * R, a[2] + (d[2] / l) * R]; };
    pts.unshift(ext(pts[0], pts[1]));
    pts.push(ext(pts[pts.length - 1], pts[pts.length - 2]));
    const L = resample(pts, null, MN, srcP, null);
    for (let i = 0; i < MN; i++) { const s = (i / (MN - 1)) * L; srcR[i] = R * capProfile(Math.min(s, L - s), R); }
  }
  const dst = { P: new Float32Array(MN * 2), R: new Float32Array(MN), key: "", ok: false };

  // ---- state
  const st = {
    W: 0, H: 0, dpr: 0, S: 1, wpp: 1, navH: 72, ox: 0, oy: 0, cx: 0, cy: 0, cw: 212, ch: 62,
    grid: null, colors: null, look: null, glowOn: true,
    t0: 0, start: 0, drawn: reduced, drawP: reduced ? 1 : 0, drawI: reduced ? path.count : 0, bubbleT: reduced ? 1 : -1, visEnd: path.count,
    ptr: [0, 0], ptrT: [0, 0], p: 0, brand: null, scrollRel: 0,
    inkGen: 0, raf: 0, running: false, ready: false, visible: document.visibilityState !== "hidden", onScreen: true, disposed: false, lost: false, dt: 0.016,
    frames: 0, cpuMs: 0, cpuMax: 0, lastT: 0, opacity: -1
  };

  function paintCards() {
    if (!st.colors) return;
    drawCards(atlasCanvas, st.cw, st.ch, st.dpr, st.colors.card);
    atlas.needsUpdate = true;
  }

  function applyLook() {
    const c = st.colors;
    const lum = 0.2126 * c.bg[0] + 0.7152 * c.bg[1] + 0.0722 * c.bg[2];
    const L = (st.look = lum < 0.5 ? LOOK.dark : LOOK.light);
    for (const m of materials) {
      const u = m.uniforms;
      u.uBg.value.set(c.bg[0], c.bg[1], c.bg[2]);
      u.uLine.value = [c.line[0], c.line[1], c.line[2], c.line[3]];
      u.uRail.value.set(c.rail[0], c.rail[1], c.rail[2]);
      u.uHot.value.set(c.hot[0], c.hot[1], c.hot[2]);
      u.uGlow.value = st.glowOn ? [c.glow[0], c.glow[1], c.glow[2], c.glow[3]] : [0, 0, 0, 0];
      u.uSpot.value = [c.spot[0], c.spot[1], c.spot[2], c.spot[3]];
      u.uLens.value = [L.ior, L.depth, L.devMax, L.disp];
      u.uBoost.value = L.boost;
      u.uTint.value.set(...L.tint);
      u.uEdge.value = [L.edge[0], L.edge[1], L.edge[2], 0];
      u.uEdgeColor.value.set(...L.edgeColor);
      u.uFres.value = [L.f0, L.spec];
      u.uAmbient.value.set(...L.ambient);
      u.uBack.value = L.back.slice();
      u.uKey.value = L.key.slice();
      u.uKeySoftH.value = L.keySoftH;
      u.uKeyM.value = lightFrame(L.keyDir);
      u.uSide.value = L.side.slice();
      u.uSideSoftW.value = L.sideSoftW;
      u.uSideM.value = lightFrame(L.sideDir);
      u.uFill.value.set(...L.fill);
      u.uFillM.value = lightFrame(L.fillDir);
      u.uSoft.value = L.soft.slice();
      u.uIri.value = L.iri.slice();
    }
    paintCards();
  }

  // Grid metrics come from intro.jsx, which also drives the CSS grid, so both always agree.
  function layout() {
    const r = host.getBoundingClientRect();
    const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    const dpr = Math.min(window.devicePixelRatio || 1, KNOBS.maxDpr);
    const dprChanged = dpr !== st.dpr;
    st.W = W; st.H = H; st.dpr = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    ortho.right = W; ortho.bottom = -H; ortho.updateProjectionMatrix();
    const tanH = Math.tan((KNOBS.fov * Math.PI) / 360);
    st.wpp = (2 * CAM_Z * tanH) / H;          // world units per css px at the word's depth
    const focal = H / 2 / tanH;               // css px
    // fit the word: its optical centre in the middle of the area below the nav, as large as the clear area allows
    const frac = W >= H ? KNOBS.width : KNOBS.widthPortrait;
    const top = st.navH + KNOBS.topClear, bottom = H - KNOBS.bottomClear;
    const my = (st.navH + H) / 2;
    const S = Math.max(8, Math.min((frac * W) / (WORD.x1 - WORD.x0), (my - top) / (WORD.y1 - KNOBS.centerY), (bottom - my) / (KNOBS.centerY - WORD.y0)));
    const ox = W / 2 - KNOBS.centerX * S, oy = my + KNOBS.centerY * S;
    st.S = S; st.ox = ox; st.oy = oy;
    st.cx = ox + PIVOT[0] * S;
    st.cy = oy - PIVOT[1] * S;
    // the visible end of the drawing: where the tail leaves the right edge
    st.visEnd = path.count;
    for (let i = Math.floor(path.count / 2); i <= path.count; i++) {
      if (path.pts[i * 3] > WORD.x1 && ox + path.pts[i * 3] * S - KNOBS.radius * S > W + 8) { st.visEnd = i; break; }
    }
    const g = st.grid || { gl: (W - Math.min(1200, W - 32)) / 2, gw: Math.min(1200, W - 32), cell: 100 };
    for (const m of materials) {
      const u = m.uniforms;
      u.uFocal.value = focal;
      u.uView.value = [W, H];
      u.uDpr.value = dpr;
      u.uGrid.value = [g.gl, g.gw, g.cell, st.navH];
      u.uMask.value = [0.72 * g.gw, 1.3 * H, 0.62 * W, 0.46 * H];
      u.uGlowGeo.value = [0.5 * Math.min(1500, W), 0.6 * 760, 0.45 * H, 120];
    }
    // entry cards: in the clear bands above and below the word, inside the rails, clear of the scroll cue
    const narrow = W < 640;
    const cw = narrow ? 188 : 212, ch = narrow ? 56 : 62;
    if (cw !== st.cw || ch !== st.ch || dprChanged) { st.cw = cw; st.ch = ch; paintCards(); }
    const L0 = g.gl + 16, L1 = g.gl + g.gw - 16 - cw;
    const aboveTop = st.navH + 22, aboveBot = oy - 3.45 * S - 18;
    const belowTop = oy + 0.42 * S + 18, belowBot = H - 34;
    const X = (u) => ox + u * S - cw / 2;
    const midAbove = (aboveTop + aboveBot) / 2 - ch / 2;
    const slots = narrow
      ? [[L0 + 4, aboveTop + (aboveBot - aboveTop - ch) * 0.2], [L1 - 4, aboveTop + (aboveBot - aboveTop - ch) * 0.8], [L0 + 10, belowTop + (belowBot - belowTop - ch) * 0.15], [L1 - 10, belowTop + (belowBot - belowTop - ch) * 0.6]]
      : [[X(-0.3), midAbove - 6], [X(9.2), midAbove + 8], [X(4.92), midAbove + 2], [X(0.1), belowTop + (belowBot - belowTop - ch) * 0.3], [X(6.1), belowTop + (belowBot - belowTop - ch) * 0.12]];
    const count = Math.min(narrow ? 4 : KNOBS.cards, slots.length, ROWS);
    // the middle card above the word only fits between the top of p and the first stem of m
    const midFits = (6.25 - 3.4) * S > cw + 24;
    cards.forEach((c, i) => {
      const s = slots[i];
      if (i >= count || !s) { c.on = false; return; }
      const x = clamp(s[0], L0, Math.max(L0, L1));
      const above = s[1] < oy;
      const fits = above ? s[1] >= aboveTop - 0.5 && s[1] + ch <= aboveBot + 0.5 : s[1] >= belowTop - 0.5 && s[1] + ch <= belowBot + 0.5;
      const cue = s[1] + ch > H - 120 && x < W / 2 + 60 && x + cw > W / 2 - 60;
      c.on = fits && !cue && L1 > L0 && Math.abs(x - s[0]) < 0.5 * cw && (narrow || i !== 2 || midFits);
      c.x = x; c.y = s[1];
      c.mesh.scale.set(cw, ch, 1);
    });
  }

  function place(now) {
    const W = st.W, H = st.H, S = st.S;
    const t = (now - st.t0) / 1000;
    const p = st.p;
    const idle = reduced ? 0 : smooth(0.6, 1, st.drawP) * (1 - smooth(0, 0.3, p));
    const k = 1 - Math.exp(-KNOBS.parallaxEase * Math.min(0.05, st.dt));
    st.ptr[0] += (st.ptrT[0] - st.ptr[0]) * k;
    st.ptr[1] += (st.ptrT[1] - st.ptr[1]) * k;

    // scroll: turn, shrink and fly into the nav logo (all in canvas css px)
    let cx = st.cx, cy = st.cy, scale = 1, yaw = 0;
    if (!reduced && p > 0) {
      const b = st.brand;
      // fly in viewport space (the canvas scrolls away underneath), then convert back to canvas space
      const rel = st.scrollRel;
      const tx = b ? b.x + b.w / 2 : W / 2, ty = (b ? b.y + b.h / 2 : st.navH / 2 + rel) - rel;
      const end = b ? (KNOBS.landWidth * b.w) / ((WORD.x1 - WORD.x0) * S) : 0.06;
      const e = clamp(p / KNOBS.landFrom); // arrive on the logo before the hand-over starts
      scale = Math.exp(Math.log(Math.max(0.01, end)) * (1 - Math.pow(1 - e, 1.5)));
      cx = st.cx + (tx - st.cx) * e;
      cy = st.cy + (ty - st.cy) * e + rel;
      // never let the word dip below the bottom of the canvas while it lifts away
      cy = Math.min(cy, H - KNOBS.bottomClear - (PIVOT[1] - WORD.y0) * S * scale);
      yaw = KNOBS.flightYaw * Math.sin(Math.PI * e);
    }
    world.position.set((cx - W / 2) * st.wpp, (H / 2 - cy) * st.wpp, 0);
    world.scale.setScalar(S * st.wpp * scale);
    world.rotation.set(0, yaw, 0);
    word.rotation.set(
      idle * (KNOBS.idlePitch * Math.sin(t * 0.19 + 1.3) + KNOBS.parallaxPitch * st.ptr[1]),
      idle * (KNOBS.idleYaw * Math.sin(t * 0.23) + KNOBS.parallaxYaw * st.ptr[0]),
      0
    );
    word.position.y = idle * KNOBS.idleBob * Math.sin(t * 0.31);

    // the tail draws back on the way up, so its end never shows
    const keep = Math.round(path.count + (tailKeep - path.count) * smooth(0, KNOBS.morphFrom, reduced ? 0 : p));
    setTip(Math.min(st.drawI, keep));

    // the morph: from the cursive word to the nav logo's own strokes
    let m = -1;
    if (!reduced && p >= KNOBS.morphFrom && st.brand && target()) {
      if (!st.drawn) { st.drawn = true; st.drawI = path.count; if (onDrawn) onDrawn(); }
      m = easeInOut((p - KNOBS.morphFrom) / (KNOBS.landFrom - KNOBS.morphFrom));
      morph(m, S * st.wpp * scale);
    }
    morphMesh.visible = m >= 0;
    if (m >= 0) tubeMesh.visible = startCap.visible = tipCap.visible = false;
    else tubeMesh.visible = true;
    glass.uniforms.uInkMix.value = m >= 0 ? smooth(KNOBS.inkFrom, KNOBS.landFrom, p) : 0;

    // studio drift (and a turn with the spin, so the highlights sweep across)
    const a = reduced ? 0 : KNOBS.envDrift;
    _euler.set(0.06 * a * Math.sin(t * 0.13 + 0.7), 0.12 * a * Math.sin(t * 0.11) + 0.5 * yaw, 0.1 * a * Math.sin(t * 0.07));
    _m4.makeRotationFromEuler(_euler);
    for (const m of materials) m.uniforms.uEnvRot.value.setFromMatrix4(_m4);

    // bubble: pops in near the end of the drawing, floats, and leaves first when the word lifts
    let bs = 0;
    if (st.bubbleT >= 0) {
      const b = reduced ? 1 : clamp((now - st.bubbleT) / KNOBS.bubbleMs);
      bs = (reduced ? 1 : easeOutBack(b)) * (1 - smooth(0, 0.22, reduced ? 0 : p));
      bubble.position.set(
        BUBBLE[0] + idle * 0.05 * Math.sin(t * 0.6),
        BUBBLE[1] - (1 - easeOutExpo(b)) * 0.7 + idle * 0.12 * Math.sin(t * 0.9 + 0.4),
        BUBBLE[2]
      );
    }
    bubble.visible = bs > 0.001;
    bubble.scale.setScalar(Math.max(0.001, bs));

    // entry cards: fade in while the pen writes, drift, and fade out as the word lifts
    const fadeOut = 1 - smooth(0.02, 0.3, p);
    cards.forEach((c, i) => {
      const fadeIn = reduced ? 1 : smooth(0.25 + i * 0.09, 0.62 + i * 0.09, st.drawP);
      const al = c.on ? KNOBS.cardAlpha * fadeIn * fadeOut : 0;
      const dx = reduced ? 0 : KNOBS.cardDrift * Math.sin(t * (0.21 + i * 0.033) + c.phase);
      const dy = reduced ? 0 : KNOBS.cardDrift * 0.7 * Math.sin(t * (0.17 + i * 0.027) + c.phase * 1.3) + (1 - fadeIn) * 10;
      const x = Math.round((c.x + dx) * st.dpr) / st.dpr, y = Math.round((c.y + dy) * st.dpr) / st.dpr;
      c.mat.uniforms.uA.value = al;
      c.mesh.visible = al > 0.001;
      c.mesh.position.set(x + st.cw / 2, -(y + st.ch / 2), 0);
      cardRects[i].set(c.mesh.visible ? x : -1e5, y, st.cw, st.ch);
      cardAlpha[i] = al;
    });

    // the hand-over: the canvas word fades as the nav logo fades in (intro.jsx owns the logo side)
    const o = reduced ? 1 - smooth(0.1, 0.55, p) : 1 - smooth(KNOBS.landFrom, KNOBS.landTo, p);
    if (Math.abs(o - st.opacity) > 0.002) { st.opacity = o; canvas.style.opacity = o.toFixed(3); }

    // world-space radii for the lens, in step with the transforms
    glass.uniforms.uRadius.value = KNOBS.radius * S * st.wpp * scale * (m > 0 ? 1 - m : 1) + (m > 0 ? m * 0.9 * st.wpp : 0);
    bubbleGlass.uniforms.uRadius.value = KNOBS.bubble * Math.max(0.001, bs) * S * st.wpp * scale;
  }
  const _euler = new Euler(), _m4 = new Matrix4();

  // The logo's strokes in .nav-brand-local css px, rebuilt when its size, the fonts or the theme change.
  function target() {
    const el = document.querySelector(".nav .nav-brand");
    const b = st.brand;
    const key = b.w.toFixed(1) + "x" + b.h.toFixed(1) + ":" + st.inkGen;
    if (key === dst.key) return dst.ok;
    dst.key = key;
    dst.ok = false;
    try { dst.ok = el ? logoTarget(el, MN, dst.P, dst.R, mInk, MR + 1) : false; } catch (e) { dst.ok = false; }
    if (dst.ok) mGeo.attributes.aInk.needsUpdate = true;
    return dst.ok;
  }

  // Blend the centreline and radius, then lay rings with rotation-minimising frames into the buffers.
  const C = new Float32Array(MN * 3), RR = new Float32Array(MN);
  function morph(m, ws) {
    letters.updateWorldMatrix(true, false);
    const e = letters.matrixWorld.elements;
    const W = st.W, H = st.H, wpp = st.wpp, bx = st.brand.x, by = st.brand.y;
    for (let i = 0; i < MN; i++) {
      const x = srcP[i * 3], y = srcP[i * 3 + 1], z = srcP[i * 3 + 2];
      const sx = e[0] * x + e[4] * y + e[8] * z + e[12], sy = e[1] * x + e[5] * y + e[9] * z + e[13], sz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const tx = (bx + dst.P[i * 2] - W / 2) * wpp, ty = (H / 2 - by - dst.P[i * 2 + 1]) * wpp;
      C[i * 3] = sx + (tx - sx) * m; C[i * 3 + 1] = sy + (ty - sy) * m; C[i * 3 + 2] = sz * (1 - m);
      RR[i] = srcR[i] * ws * (1 - m) + dst.R[i] * wpp * m;
    }
    let tx0 = 1, ty0 = 0, tz0 = 0, nx = 0, ny = 0, nz = 1;
    for (let i = 0; i < MN; i++) {
      const a = Math.max(0, i - 1), b = Math.min(MN - 1, i + 1);
      let tx = C[b * 3] - C[a * 3], ty = C[b * 3 + 1] - C[a * 3 + 1], tz = C[b * 3 + 2] - C[a * 3 + 2];
      const tl = Math.hypot(tx, ty, tz);
      if (tl < 1e-9) { tx = tx0; ty = ty0; tz = tz0; } else { tx /= tl; ty /= tl; tz /= tl; }
      if (i === 0) {
        // any normal perpendicular to the first tangent
        if (Math.abs(tz) < 0.9) { nx = 0; ny = 0; nz = 1; } else { nx = 0; ny = 1; nz = 0; }
      }
      // remove the tangent component (parallel transport by projection; rings are dense)
      const d = nx * tx + ny * ty + nz * tz;
      nx -= d * tx; ny -= d * ty; nz -= d * tz;
      let nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-6) { const q = Math.abs(tz) < 0.9 ? [0, 0, 1] : [0, 1, 0]; const d2 = q[0] * tx + q[1] * ty + q[2] * tz; nx = q[0] - d2 * tx; ny = q[1] - d2 * ty; nz = q[2] - d2 * tz; nl = Math.hypot(nx, ny, nz); }
      nx /= nl; ny /= nl; nz /= nl;
      const Bx = ty * nz - tz * ny, By = tz * nx - tx * nz, Bz = tx * ny - ty * nx;
      tx0 = tx; ty0 = ty; tz0 = tz;
      const cx = C[i * 3], cy = C[i * 3 + 1], cz = C[i * 3 + 2], r = RR[i];
      for (let j = 0; j <= MR; j++) {
        const v = (j / MR) * Math.PI * 2, c = -Math.cos(v), s = Math.sin(v);
        const ox = c * nx + s * Bx, oy = c * ny + s * By, oz = c * nz + s * Bz;
        const o = (i * (MR + 1) + j) * 3;
        mNrm[o] = ox; mNrm[o + 1] = oy; mNrm[o + 2] = oz;
        mPos[o] = cx + r * ox; mPos[o + 1] = cy + r * oy; mPos[o + 2] = cz + r * oz;
      }
    }
    mGeo.attributes.position.needsUpdate = true;
    mGeo.attributes.normal.needsUpdate = true;
  }

  function draw(now) {
    if (st.drawn) return;
    const p = clamp((now - st.start) / KNOBS.drawMs);
    st.drawP = p;
    const tEnd = times[st.visEnd];
    const target = easeInOut(p) * tEnd;
    let lo = 0, hi = st.visEnd;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (times[mid] < target) lo = mid; else hi = mid; }
    st.drawI = lo + clamp((target - times[lo]) / Math.max(1e-9, times[hi] - times[lo]));
    if (st.bubbleT < 0 && p >= KNOBS.bubbleAt) st.bubbleT = now;
    if (p >= 1) { st.drawn = true; st.drawI = path.count; if (onDrawn) onDrawn(); }
  }
  function setTip(f) {
    const i = Math.min(path.count, Math.max(0, f));
    const seg = Math.floor(i);
    tubeMesh.geometry.setDrawRange(0, seg * KNOBS.radial * 6);
    const j = Math.min(path.count, seg + 1), w = i - seg;
    const P = path.pts;
    tipCap.position.set(P[seg * 3] + (P[j * 3] - P[seg * 3]) * w, P[seg * 3 + 1] + (P[j * 3 + 1] - P[seg * 3 + 1]) * w, P[seg * 3 + 2] + (P[j * 3 + 2] - P[seg * 3 + 2]) * w);
    tipCap.visible = i < path.count;
    startCap.visible = i > 0;
  }

  function render() {
    renderer.clear();
    renderer.render(cardScene, ortho);
    renderer.render(scene, camera);
  }

  function frame(now) {
    st.raf = 0;
    if (st.disposed || st.lost) { st.running = false; return; }
    st.dt = st.lastT ? (now - st.lastT) / 1000 : 0.016;
    st.lastT = now;
    const c0 = performance.now();
    draw(now);
    place(now);
    if (st.opacity > 0.001) render();
    const ms = performance.now() - c0;
    st.frames++; st.cpuMs += ms; st.cpuMax = Math.max(st.cpuMax, ms);
    // keep going while there is something to animate on screen; scroll() and wake() restart it
    const live = !reduced && st.visible && st.onScreen && (st.opacity > 0.001 || !st.drawn);
    if (live) st.raf = requestAnimationFrame(frame);
    else { st.running = false; st.lastT = 0; }
  }

  function wake() {
    if (st.disposed || st.lost || !st.ready) return;
    const want = st.visible && st.onScreen;
    if (want && !st.running) {
      st.running = true;
      st.lastT = 0;
      if (!st.raf) st.raf = requestAnimationFrame(frame);
    } else if (!want && st.running) {
      st.running = false;
      if (st.raf) cancelAnimationFrame(st.raf);
      st.raf = 0;
    }
  }
  // a single frame (reduced motion, resizes, theme changes and scrolling while the loop is idle)
  function once() {
    if (st.disposed || st.lost || !st.ready || st.running) return;
    st.running = true;
    if (!st.raf) st.raf = requestAnimationFrame(frame);
  }

  // ---- inputs
  const onPointer = (e) => {
    if (e.pointerType === "touch") return;
    st.ptrT[0] = clamp(e.clientX / Math.max(1, window.innerWidth)) - 0.5;
    st.ptrT[1] = clamp(e.clientY / Math.max(1, window.innerHeight)) - 0.5;
  };
  const onVis = () => { st.visible = document.visibilityState !== "hidden"; wake(); };
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => { st.onScreen = es[es.length - 1].isIntersecting; wake(); }, { rootMargin: "64px 0px" }) : null;
  if (io) io.observe(host);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  const onLost = (e) => { e.preventDefault(); st.lost = true; st.running = false; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; };
  const onRestored = () => { st.lost = false; layout(); applyLook(); wake(); once(); };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  // ---- start
  st.colors = readColors(host);
  layout();
  applyLook();
  setTip(reduced ? path.count : 0);
  // redraw the cards once the site font is in
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!st.disposed) { paintCards(); st.inkGen++; once(); } });
  let failed = false;
  renderer.debug.onShaderError = () => { failed = true; if (onFail) onFail(new Error("shader")); };
  const go = () => {
    if (st.disposed || failed) return;
    st.ready = true;
    const now0 = performance.now();
    st.t0 = now0;
    st.start = now0 + KNOBS.drawDelay;
    if (reduced) { st.drawn = true; once(); } else wake();
    requestAnimationFrame(() => mount.classList.add("is-live"));
  };
  // compile off the main thread where the driver allows it, then start the pen
  morphMesh.visible = true; // so it compiles up front, not on the first scroll
  Promise.all([renderer.compileAsync(scene, camera), renderer.compileAsync(cardScene, ortho)]).then(() => { morphMesh.visible = false; go(); }, (e) => { failed = true; if (onFail) onFail(e); });

  return {
    // metrics of the hero's grid columns, from intro.jsx
    setGrid(g, navH, glowOn) {
      st.grid = g;
      if (navH) st.navH = navH;
      st.glowOn = glowOn !== false;
      layout();
      applyLook();
      once();
    },
    theme() { st.colors = readColors(host); st.inkGen++; applyLook(); once(); },
    // p: 0..1 through the hand-over; brand: the nav logo's rect in canvas css px; scrollRel: how far the intro has scrolled
    scroll(p, brand, scrollRel) {
      const v = clamp(p);
      const b = st.brand;
      const moved = v !== st.p || (!!brand !== !!b) || (brand && b && (brand.x !== b.x || brand.y !== b.y || brand.w !== b.w));
      st.p = v; st.brand = brand || null; st.scrollRel = scrollRel || 0;
      if (moved && st.visible && st.onScreen) once();
    },
    stats() {
      return { frames: st.frames, avgCpuMs: st.frames ? +(st.cpuMs / st.frames).toFixed(3) : 0, maxCpuMs: +st.cpuMax.toFixed(3), dpr: st.dpr, size: [st.W, st.H], running: st.running, drawn: st.drawn, look: st.look === LOOK.dark ? "dark" : "light", calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, opacity: st.opacity, S: +st.S.toFixed(2), cards: cards.filter((c) => c.on).length };
    },
    // step the animation to a moment ms after the pen starts and render it (for checks without a visible tab)
    seek(ms) {
      const now = st.start + ms;
      st.dt = 0.016;
      st.drawn = false;
      st.bubbleT = -1;
      if (ms >= KNOBS.drawMs * KNOBS.bubbleAt) st.bubbleT = st.start + KNOBS.drawMs * KNOBS.bubbleAt;
      draw(now);
      place(now);
      render();
      return { drawP: +st.drawP.toFixed(3), drawn: st.drawn, opacity: st.opacity };
    },
    // render n frames synchronously and wait for the GPU, to measure the real frame cost
    bench(n = 60) {
      const gl = renderer.getContext();
      const t0 = performance.now();
      for (let i = 0; i < n; i++) { place(performance.now()); render(); }
      gl.finish();
      const px = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return +((performance.now() - t0) / n).toFixed(3);
    },
    dispose() {
      st.disposed = true;
      st.running = false;
      if (st.raf) cancelAnimationFrame(st.raf);
      if (io) io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      tube.dispose(); cap.dispose(); ball.dispose(); plane.dispose(); atlas.dispose();
      glass.dispose(); bubbleGlass.dispose(); morphGlass.dispose(); mGeo.dispose();
      cards.forEach((c) => c.mat.dispose());
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch (e) { /* already gone */ }
      canvas.remove();
    }
  };
}
