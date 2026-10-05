// The APM mark, drawn like the design system's Mark so the docs need no client JavaScript for it.
const MARK = {
  viewBox: "131 118 734 734",
  transform: "translate(535 625) rotate(-22)",
  body: "M330 -22 C312 -44 284 -54 262 -52 C248 -84 204 -104 150 -106 C40 -112 -80 -80 -170 -40 C-230 -14 -290 -20 -350 -40 Q-374 -46 -374 -22 C-368 22 -320 52 -250 54 C-160 58 -80 96 20 96 C130 96 230 60 266 16 C290 2 312 -6 326 -10 Q336 -14 330 -22 Z",
  wings: [
    "M160 -84 C140 -170 130 -226 80 -236 L-120 -160 C-130 -110 -100 -80 -150 -40 C-60 -70 60 -84 160 -84 Z",
    "M130 -209.4 Q72.4 -417.9 -15.9 -489.9 Q-18.6 -411.6 34.2 -202.7 Z",
    "M33.1 -190.5 Q-84.8 -345.5 -182.8 -374.5 Q-160.6 -308.6 -46.8 -151.6 Z",
    "M-70.4 -170.2 Q-218.8 -259.5 -308.8 -249.2 Q-270.7 -201.9 -125 -109.6 Z"
  ],
  eye: [222, -62, 11]
};

export default function Mark({ size = 26, id = "docs" }) {
  const inner = Math.round(size * 0.66);
  return (
    <span className="apm-mark-tile" style={{ width: size, height: size }}>
      <svg viewBox={MARK.viewBox} width={inner} height={inner} role="img" aria-label="APM" focusable="false">
        <defs>
          <mask id={"apm-eye-" + id} maskUnits="userSpaceOnUse" x={-700} y={-700} width={1400} height={1400}>
            <rect x={-700} y={-700} width={1400} height={1400} fill="#fff" />
            <circle cx={MARK.eye[0]} cy={MARK.eye[1]} r={MARK.eye[2]} fill="#000" />
          </mask>
        </defs>
        <g transform={MARK.transform} mask={"url(#apm-eye-" + id + ")"} fill="currentColor" stroke="currentColor" strokeWidth={12} strokeLinejoin="round">
          <path d={MARK.body} />
          {MARK.wings.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>
    </span>
  );
}
