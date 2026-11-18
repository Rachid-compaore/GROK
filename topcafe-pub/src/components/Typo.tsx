import React from "react";
import { useCurrentFrame } from "remotion";
import { anim, EASE } from "../theme";

type Props = {
  text: string;
  start: number;
  /** image de début de sortie (optionnel) */
  exit?: number;
  style?: React.CSSProperties;
  stagger?: number;
  /** révélation lettre par lettre au lieu de mot par mot */
  byLetter?: boolean;
};

/**
 * Typographie animée : chaque mot (ou lettre) monte légèrement en passant
 * du flou au net. La sortie est un fondu flou vers le haut, jamais brutal.
 */
export const RevealText: React.FC<Props> = ({ text, start, exit, style, stagger = 4, byLetter = false }) => {
  const frame = useCurrentFrame();
  const parts = byLetter ? Array.from(text) : text.split(" ");
  const out = exit === undefined ? 0 : anim(frame, [exit, exit + 22], [0, 1], EASE.in);
  return (
    <div
      style={{
        ...style,
        opacity: 1 - out,
        filter: `blur(${out * 10}px)`,
        transform: `translateY(${-out * 24}px)`,
        whiteSpace: "pre",
      }}
    >
      {parts.map((w, i) => {
        const s = start + i * stagger;
        const p = anim(frame, [s, s + 26], [0, 1], EASE.out);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * 34}px)`,
              filter: `blur(${(1 - p) * 12}px)`,
            }}
          >
            {w}
            {!byLetter && i < parts.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** Fine ligne dorée qui se dessine (séparateur typographique). */
export const GoldRule: React.FC<{ start: number; width: number; style?: React.CSSProperties }> = ({
  start,
  width,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = anim(frame, [start, start + 30], [0, 1], EASE.out);
  return (
    <div
      style={{
        height: 2,
        width: width * p,
        background: "linear-gradient(90deg, rgba(217,168,108,0), #d9a86c 30%, #f0cf9c 50%, #d9a86c 70%, rgba(217,168,108,0))",
        ...style,
      }}
    />
  );
};
