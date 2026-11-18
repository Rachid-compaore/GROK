import React from "react";

/** Grain de café dessiné en SVG, avec ombrage pour un rendu en volume. */
export const Bean: React.FC<{ size: number; id: string; spin?: number }> = ({
  size,
  id,
  spin = 0,
}) => {
  // spin (radians) : rotation autour de l'axe vertical → la face du grain tourne.
  const face = Math.cos(spin);
  const scaleX = 0.35 + 0.65 * Math.abs(face);
  const showCrease = face > -0.2;
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      style={{ transform: `scaleX(${scaleX})`, overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`b-${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor="#a8693d" />
          <stop offset="0.45" stopColor="#6b3b1e" />
          <stop offset="1" stopColor="#24120a" />
        </radialGradient>
        <linearGradient id={`c-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#1a0c05" />
          <stop offset="1" stopColor="#3a1d0e" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="65" rx="44" ry="60" fill={`url(#b-${id})`} />
      {showCrease && (
        <>
          <path
            d="M50 9 C34 40 66 88 50 121"
            stroke={`url(#c-${id})`}
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M55 14 C42 42 72 86 56 116"
            stroke="rgba(255,210,170,0.18)"
            strokeWidth="2.5"
            fill="none"
          />
        </>
      )}
      <ellipse cx="34" cy="36" rx="12" ry="18" fill="rgba(255,235,210,0.22)" transform="rotate(-18 34 36)" />
    </svg>
  );
};
