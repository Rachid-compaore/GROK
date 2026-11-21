import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, FONT, GOLD, spr, tw } from "../theme";

/** Lettres qui montent d'un masque, l'espacement se resserre (titres produits). */
export const LetterReveal: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number }> = ({ text, at, style, stagger = 0.03 }) => {
  const frame = useCurrentFrame();
  const track = tw(frame, at, at + 1.3, 0.22, 0.04, EASE.out);
  return (
    <div style={{ ...style, whiteSpace: "nowrap", letterSpacing: `${track}em` }}>
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

/** Nom de marque TOPCAFÉ en capitales romaines dorées, révélé lettre par lettre avec éclat. */
export const BrandReveal: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  const sweep = tw(frame, at + 0.5, at + 1.6, -20, 120);
  const glow = tw(frame, at + 0.3, at + 0.9, 0, 1) * (1 - tw(frame, at + 1.2, at + 2.2, 0, 0.6));
  return (
    <div style={{ display: "flex", justifyContent: "center", filter: `drop-shadow(0 0 ${30 * glow}px rgba(255,210,120,${0.8 * glow})) drop-shadow(0 8px 20px rgba(0,0,0,0.5))` }}>
      {Array.from("TOPCAFÉ").map((ch, i) => {
        const p = spr(frame, at + i * 0.06, 14, 0.8, 120);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.02em" }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: FONT.brand,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1,
                transform: `translateY(${(1 - p) * 105}%)`,
                backgroundImage: `linear-gradient(100deg, ${GOLD.deep} 0%, ${GOLD.mid} ${sweep - 15}%, #ffffff ${sweep}%, ${GOLD.mid} ${sweep + 15}%, ${GOLD.deep} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/**
 * Le slogan « CRÉMEUX ET DÉLICIEUX » : mots révélés depuis un masque avec léger
 * impact (ressort), dégradé doré traversé par un éclat, halo, filet doré.
 * `lines` permet de le poser sur une ou deux lignes sans jamais changer le texte.
 */
export const Slogan: React.FC<{ at: number; size: number; lines: string[][]; align?: "left" | "center"; rule?: boolean; dark?: boolean }> = ({ at, size, lines, align = "left", rule = true, dark = false }) => {
  const c0 = dark ? "#7a3f14" : GOLD.mid, c1 = dark ? "#b4661f" : GOLD.light, hi = dark ? "#f6c27a" : "#ffffff";
  const frame = useCurrentFrame();
  const sweep = tw(frame, at + 0.4, at + 1.5, -20, 120);
  const glow = tw(frame, at + 0.2, at + 0.6, 0, 1) * (1 - tw(frame, at + 0.9, at + 2.0, 0, 0.55));
  let k = 0;
  return (
    <div style={{ textAlign: align, filter: dark ? `drop-shadow(0 0 ${20 * glow}px rgba(255,230,180,${0.9 * glow})) drop-shadow(0 4px 10px rgba(90,40,10,0.25))` : `drop-shadow(0 0 ${26 * glow}px rgba(255,214,130,${0.85 * glow})) drop-shadow(0 6px 16px rgba(0,0,0,0.45))` }}>
      {lines.map((words, li) => (
        <div key={li} style={{ whiteSpace: "nowrap", lineHeight: 1.05 }}>
          {words.map((w, wi) => {
            const s = at + k++ * 0.12;
            const p = spr(frame, s, 12, 0.7, 150);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: wi < words.length - 1 ? size * 0.28 : 0, padding: "0.04em 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: FONT.sans,
                    fontWeight: 900,
                    fontSize: size,
                    transform: `translateY(${(1 - Math.min(1.08, p)) * 110}%) scale(${0.96 + Math.min(1, p) * 0.04})`,
                    backgroundImage: `linear-gradient(100deg, ${c0} 0%, ${c1} ${sweep - 14}%, ${hi} ${sweep}%, ${c1} ${sweep + 14}%, ${c0} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </div>
      ))}
      {rule && (
        <div style={{ display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
          <div style={{ height: 4, width: tw(frame, at + 0.5, at + 1.2, 0, size * 3.2, EASE.out), marginTop: size * 0.2, background: `linear-gradient(90deg, ${GOLD.deep}, ${GOLD.light}, ${GOLD.deep})`, borderRadius: 2 }} />
        </div>
      )}
    </div>
  );
};
