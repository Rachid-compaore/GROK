import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE, tween } from "../theme";

/** Mots qui montent depuis une ligne de masque, avec léger décalage. */
export const WordsRise: React.FC<{
  lines: string[];
  at: number;
  stagger?: number;
  style: React.CSSProperties;
  lineHeight: number;
  /** mot à surligner en jaune, et instant du surlignage */
  highlight?: { word: string; at: number };
  exitAt?: number;
}> = ({ lines, at, stagger = 0.07, style, lineHeight, highlight, exitAt }) => {
  const frame = useCurrentFrame();
  let k = 0;
  return (
    <div style={{ ...style, lineHeight: `${lineHeight}px` }}>
      {lines.map((line, li) => (
        <div key={li} style={{ height: lineHeight, whiteSpace: "nowrap" }}>
          {line.split(" ").map((w, wi) => {
            const start = at + k++ * stagger;
            const p = tween(frame, start, start + 0.45, 0, 1, EASE.out);
            const out = exitAt === undefined ? 0 : tween(frame, exitAt, exitAt + 0.3, 0, 1, EASE.in);
            const hl = highlight && w.startsWith(highlight.word) ? tween(frame, highlight.at, highlight.at + 0.45, 0, 1, EASE.out) : 0;
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 0.06em", margin: "0 0.12em" }}>
                <span style={{ display: "inline-block", position: "relative", transform: `translateY(${(1 - p) * 105 - out * 105}%)` }}>
                  {hl > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        left: "-0.08em",
                        right: "-0.08em",
                        bottom: "0.12em",
                        height: "0.42em",
                        background: C.yellow,
                        transformOrigin: "0 50%",
                        transform: `scaleX(${hl})`,
                        zIndex: -1,
                        borderRadius: 6,
                      }}
                    />
                  )}
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Lignes de texte révélées une par une (masque), pour une lecture confortable. */
export const LinesRise: React.FC<{ lines: string[]; at: number; step?: number; style: React.CSSProperties; lineHeight: number }> = ({
  lines,
  at,
  step = 0.22,
  style,
  lineHeight,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={style}>
      {lines.map((l, i) => {
        const p = tween(frame, at + i * step, at + i * step + 0.5, 0, 1, EASE.out);
        return (
          <div key={i} style={{ height: lineHeight, overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ transform: `translateY(${(1 - p) * 100}%)`, lineHeight: `${lineHeight}px` }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Pictogramme de validation vert : cercle puis coche tracés. */
export const CheckDraw: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  const ring = tween(frame, at, at + 0.4, 0, 1, EASE.inOut);
  const fill = tween(frame, at + 0.25, at + 0.55, 0, 1, EASE.out);
  const tick = tween(frame, at + 0.4, at + 0.75, 0, 1, EASE.out);
  const R = 2 * Math.PI * 44;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="chk" cx="40%" cy="35%">
          <stop offset="0" stopColor="#4fd06b" />
          <stop offset="1" stopColor="#139a3b" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r={44 * fill} fill="url(#chk)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#0d7a2e" strokeWidth="5" strokeDasharray={R} strokeDashoffset={R * (1 - ring)} transform="rotate(-90 50 50)" strokeLinecap="round" />
      <path d="M30 52 L44 65 L71 36" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - tick)} />
    </svg>
  );
};

/** Petits éclats jaunes « croustillant » qui jaillissent puis se rétractent. */
export const Crunch: React.FC<{ at: number; x: number; y: number; angle: number; size?: number }> = ({ at, x, y, angle, size = 60 }) => {
  const frame = useCurrentFrame();
  const grow = tween(frame, at, at + 0.18, 0, 1, EASE.out);
  const shrink = tween(frame, at + 0.22, at + 0.5, 0, 1, EASE.in);
  if (grow <= 0 || shrink >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${angle}deg)` }}>
      {[-28, 0, 28].map((a, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: -4,
            width: size * (i === 1 ? 1 : 0.75),
            height: 9,
            borderRadius: 5,
            background: i === 1 ? "#f5b400" : "#ffd403",
            transformOrigin: "0 50%",
            transform: `rotate(${a}deg) translateX(${18 + shrink * size * 0.6}px) scaleX(${grow * (1 - shrink)})`,
          }}
        />
      ))}
    </div>
  );
};
