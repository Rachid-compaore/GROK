import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE, FONT, SLOGAN, tw } from "../theme";
import { MatterRibbon } from "./Matter";

/**
 * Signature « CRÉMEUX ET DÉLICIEUX ».
 * Personnalité : capitales Didone (Bodoni) à fort contraste, « ET » en italique
 * fin entre deux filets, lettres qui se dessinent d'abord au trait puis se
 * remplissent de crème dorée ; un trait de moutarde vient souligner la phrase.
 */
export const Signature: React.FC<{ at: number; underlineAt: number; size: number; twoLines?: boolean; width: number }> = ({ at, underlineAt, size, twoLines = false, width }) => {
  const frame = useCurrentFrame();
  const [w1, w2, w3] = SLOGAN.split(" "); // CRÉMEUX · ET · DÉLICIEUX
  const word = (text: string, start: number) => (
    <span style={{ display: "inline-flex" }}>
      {Array.from(text).map((ch, i) => {
        const s = start + i * 0.045;
        const stroke = tw(frame, s, s + 0.5, 0, 1, EASE.out);
        const fill = tw(frame, s + 0.35, s + 0.9, 0, 1, EASE.inOut);
        const rise = tw(frame, s, s + 0.7, 1, 0, EASE.out);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", transform: `translateY(${rise * 0.18}em)`, opacity: Math.min(1, stroke * 1.4) }}>
            <span style={{ WebkitTextStroke: `${Math.max(0.5, size * 0.012)}px rgba(244,207,74,${1 - fill * 0.6})`, color: "transparent" }}>{ch}</span>
            <span
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(180deg, #fff6da 0%, ${C.mustardLight} 45%, ${C.gold} 70%, #b9852a 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                clipPath: `inset(${(1 - fill) * 100}% 0 0 0)`,
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </span>
  );
  const etP = tw(frame, at + 0.45, at + 1.0, 0, 1, EASE.out);
  const et = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.18, margin: `0 ${size * 0.22}px`, transform: twoLines ? undefined : `translateY(-${size * 0.06}px)` }}>
      <span style={{ width: size * 0.5 * etP, height: Math.max(1, size * 0.02), background: C.gold }} />
      <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontWeight: 500, fontSize: size * 0.62, color: C.cream, opacity: etP, letterSpacing: size * 0.02 }}>{w2}</span>
      <span style={{ width: size * 0.5 * etP, height: Math.max(1, size * 0.02), background: C.gold }} />
    </span>
  );
  const ink = tw(frame, underlineAt, underlineAt + 0.8, 0, 1, EASE.out);
  const uw = width * 0.62, uy = size * (twoLines ? 2.35 : 1.25);
  const glow = tw(frame, at + 0.9, at + 1.6, 0, 1) * (1 - tw(frame, at + 1.8, at + 3.0, 0, 0.6));
  return (
    <div style={{ position: "relative", width, textAlign: "center", filter: `drop-shadow(0 0 ${size * 0.25 * glow}px rgba(244,207,74,${0.55 * glow})) drop-shadow(0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.55))` }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: size * 0.02, whiteSpace: "nowrap" }}>
        {twoLines ? (
          <>
            <div>{word(w1, at)}</div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {et}
              {word(w3, at + 0.55)}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {word(w1, at)}
            {et}
            {word(w3, at + 0.55)}
          </div>
        )}
      </div>
      {/* trait de moutarde peint sous la signature */}
      <div style={{ position: "absolute", left: 0, top: uy, width, height: size * 0.5 }}>
        <svg width={width} height={size * 0.5} style={{ overflow: "visible" }}>
          <g transform={`translate(${(width - uw) / 2} ${size * 0.12})`}>
            <MatterRibbonInline w={uw} h={size * 0.16} draw={ink} />
          </g>
        </svg>
      </div>
    </div>
  );
};

/** Trait de moutarde en forme de coup de pinceau (version locale, coordonnées SVG). */
const MatterRibbonInline: React.FC<{ w: number; h: number; draw: number }> = ({ w, h, draw }) => {
  if (draw <= 0) return null;
  const d = `M0 ${h * 0.9} C${w * 0.25} ${h * 0.2} ${w * 0.6} ${h * 1.2} ${w} ${h * 0.35}`;
  const len = w * 1.3;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - draw) };
  return (
    <g>
      <path d={d} fill="none" stroke={C.mustardDeep} strokeWidth={h * 1.1} strokeLinecap="round" style={dash} />
      <path d={d} fill="none" stroke={C.mustard} strokeWidth={h * 0.8} strokeLinecap="round" transform={`translate(0 ${-h * 0.08})`} style={dash} />
      <path d={d} fill="none" stroke="#fff1b8" strokeWidth={h * 0.14} strokeLinecap="round" transform={`translate(0 ${-h * 0.25})`} style={{ filter: "blur(1px)", ...dash }} />
    </g>
  );
};

export { MatterRibbon };
