import React from "react";
import { useCurrentFrame } from "remotion";
import { C, EASE, FONT, spr, tw } from "../theme";

/** Lettres qui montent depuis un masque, l'espacement se resserre doucement. */
export const LetterReveal: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number; exitAt?: number }> = ({ text, at, style, stagger = 0.03, exitAt }) => {
  const frame = useCurrentFrame();
  const track = tw(frame, at, at + 1.4, 0.18, 0, EASE.out);
  const out = exitAt === undefined ? 0 : tw(frame, exitAt, exitAt + 0.4, 0, 1, EASE.in);
  return (
    <div style={{ ...style, whiteSpace: "nowrap", letterSpacing: `${track}em`, transform: `translateY(${-out * 30}px)`, opacity: 1 - out }}>
      {Array.from(text).map((ch, i) => {
        const p = tw(frame, at + i * stagger, at + i * stagger + 0.55, 0, 1, EASE.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{ch === " " ? " " : ch}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Phrase qui monte avec un reflet lumineux discret qui la traverse. */
export const GlowLine: React.FC<{ text: string; at: number; exitAt?: number; style: React.CSSProperties }> = ({ text, at, exitAt, style }) => {
  const frame = useCurrentFrame();
  const p = tw(frame, at, at + 0.8, 0, 1, EASE.out);
  const out = exitAt === undefined ? 0 : tw(frame, exitAt, exitAt + 0.45, 0, 1, EASE.in);
  const sweep = tw(frame, at + 0.3, at + 1.3, -30, 130);
  const color = String(style.color ?? "#fff");
  const { textShadow, ...rest } = style;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", filter: textShadow ? "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" : undefined }}>
      <div
        style={{
          ...rest,
          transform: `translateY(${(1 - p) * 60 - out * 40}px)`,
          opacity: p * (1 - out),
          backgroundImage: `linear-gradient(100deg, ${color} 0%, ${color} ${sweep - 12}%, #ffffff ${sweep}%, ${color} ${sweep + 12}%, ${color} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Bandeau doré « Qualité Supérieur » (même forme que sur le visuel, à pointes). */
export const GoldBadge: React.FC<{ at: number; text: string; scale?: number }> = ({ at, text, scale = 1 }) => {
  const frame = useCurrentFrame();
  const p = spr(frame, at, 13, 0.8, 120);
  const open = tw(frame, at, at + 0.5, 0, 1, EASE.out);
  const w = 560 * scale, h = 86 * scale;
  return (
    <div style={{ position: "relative", width: w, height: h, transform: `scale(${0.7 + p * 0.3})`, clipPath: `inset(0 ${(1 - open) * 50}% 0 ${(1 - open) * 50}%)` }}>
      <svg width={w} height={h} viewBox="0 0 560 86" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2b0" />
            <stop offset="0.45" stopColor={C.gold} />
            <stop offset="1" stopColor={C.goldDeep} />
          </linearGradient>
        </defs>
        <path d="M0 43 L34 8 L526 8 L560 43 L526 78 L34 78 Z" fill="url(#gb)" />
        <path d="M14 43 L40 16 L520 16 L546 43 L520 70 L40 70 Z" fill="none" stroke="#8a5a08" strokeWidth="2" opacity="0.6" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.cond, fontWeight: 800, fontSize: 44 * scale, color: "#2a1a00", letterSpacing: 1 }}>
        {text}
      </div>
    </div>
  );
};
