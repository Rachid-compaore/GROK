import React from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";
import { CheckDraw, Crunch, LinesRise, WordsRise } from "../components/Motion";
import { C, EASE, F, pop, s, T, tween } from "../theme";

const titleStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  width: 980,
  textAlign: "center",
  fontFamily: F.display,
  color: C.greenDark,
};

/** Photo originale posée sur la carte : entrée douce, léger zoom continu, ombre au sol. */
const Photo: React.FC<{ src: string; at: number; w: number; h: number; cx: number; cy: number; kick?: number[] }> = ({ src, at, w, h, cx, cy, kick = [] }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 16, 0.9, 110);
  const enter = tween(frame, at, at + 0.7, 0, 1, EASE.out);
  const zoom = 1 + Math.max(0, frame / 60 - at) * 0.006;
  let bump = 0, rot = 0;
  for (const k of kick) {
    const d = frame / 60 - k;
    if (d > 0 && d < 1) { bump += Math.exp(-d * 9) * Math.sin(d * 40) * 0.025; rot += Math.exp(-d * 8) * Math.sin(d * 34) * 2.2; }
  }
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h }}>
      <div
        style={{
          position: "absolute",
          left: w * 0.12,
          right: w * 0.12,
          bottom: -h * 0.04,
          height: h * 0.12,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,40,15,0.28) 0%, rgba(0,40,15,0) 70%)",
          transform: `scaleX(${enter})`,
        }}
      />
      <Img
        src={staticFile(src)}
        style={{
          width: w,
          height: h,
          transform: `translateY(${(1 - enter) * 120}px) scale(${(0.82 + p * 0.18) * zoom * (1 + bump)}) rotate(${(1 - enter) * -8 + rot}deg)`,
        }}
      />
    </div>
  );
};

/** Astuce 1 — frites croustillantes (textes identiques au visuel). */
export const TipFrites: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <WordsRise
        lines={["Tu veux des", "frites bien", "croustillantes ?"]}
        at={T.fritesTitle}
        lineHeight={84}
        style={{ ...titleStyle, top: 70, fontSize: 60 }}
        highlight={{ word: "croustillantes", at: T.highlight }}
      />
      <Photo src="img/frites.png" at={T.fritesImg} w={480} h={458} cx={490} cy={580} kick={T.crunch} />
      {T.crunch.map((c, i) => (
        <React.Fragment key={i}>
          <Crunch at={c} x={240} y={430} angle={200} />
          <Crunch at={c + 0.04} x={740} y={420} angle={-20} />
          <Crunch at={c + 0.08} x={760} y={760} angle={30} />
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 50, top: 880 }}>
        <CheckDraw at={T.fritesCheck} size={92} />
      </div>
      <LinesRise
        lines={["Après avoir découpé tes pommes de", "terre, rince-les pour retirer l'excès", "d'amidon, puis sèche-les parfaitement", "avant la friture."]}
        at={T.fritesBody}
        lineHeight={56}
        style={{ position: "absolute", left: 168, top: 860, fontFamily: F.body, fontWeight: 700, fontSize: 43, color: C.greenDark }}
      />
      {frame < 0 && null}
    </>
  );
};

/** Grains de sel discrets qui tombent de la salière à chaque secousse. */
const SaltGrains: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  return (
    <>
      {T.shake.flatMap((sh, n) =>
        Array.from({ length: 7 }, (_, i) => {
          const r = (k: string) => random(`g${n}-${i}-${k}`);
          const tau = t - sh - r("d") * 0.35;
          if (tau < 0 || tau > 0.8) return null;
          const gx = x + (r("x") - 0.5) * 40 + (r("vx") - 0.5) * 80 * tau;
          const gy = y + 900 * tau * tau + 60 * tau;
          const sz = 5 + r("s") * 5;
          return (
            <div
              key={`${n}-${i}`}
              style={{ position: "absolute", left: gx, top: gy, width: sz, height: sz, borderRadius: 2, background: "#e9edf0", border: "1.5px solid #b9c2c8", transform: `rotate(${r("r") * 90}deg)` }}
            />
          );
        }),
      )}
    </>
  );
};

/** Astuce 2 — plat trop salé (textes identiques au visuel). */
export const TipSel: React.FC = () => (
  <>
    <WordsRise lines={["Plat trop", "salé ?"]} at={T.selTitle} lineHeight={112} style={{ ...titleStyle, top: 80, fontSize: 92 }} />
    <SaltGrains x={300} y={700} />
    <Photo src="img/sel.png" at={T.selImg} w={420} h={470} cx={500} cy={560} kick={T.shake} />
    <div style={{ position: "absolute", left: 50, top: 880 }}>
      <CheckDraw at={T.selCheck} size={92} />
    </div>
    <LinesRise
      lines={["Ajoutez une pomme de terre crue épluchée et", "coupée en deux dans votre plat en sauce.", "Elle agira comme une éponge en absorbant", "l'excès de sel."]}
      at={T.selBody}
      lineHeight={54}
      style={{ position: "absolute", left: 168, top: 862, fontFamily: F.body, fontWeight: 400, fontSize: 39, color: "#1d1d1d" }}
    />
  </>
);

/** Carte blanche arrondie qui porte les astuces, avec la transition diagonale verte et jaune. */
export const Card: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const rise = pop(frame, T.card, 15, 0.9, 90);
  const leave = tween(frame, T.outro, T.outro + 0.55, 0, 1, EASE.in);
  // transition : une bande verte + jaune balaie la carte en diagonale
  const w1 = tween(frame, T.wipe, T.swap, 0, 1, EASE.in);
  const w2 = tween(frame, T.swap, T.wipe + 1.0, 0, 1, EASE.out);
  const sweep = t < T.swap ? -1.3 + w1 * 1.3 : w2 * 1.4;
  const breathe = t > T.wipe && t < T.wipe + 1 ? 1 - Math.sin(Math.PI * (t - T.wipe)) * 0.02 : 1;
  const drift = 1 + (t < T.swap ? Math.max(0, t - T.frites) * 0.0025 : Math.max(0, t - T.swap) * 0.0025);
  if (rise <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 500,
        width: 980,
        height: 1200,
        transform: `translateY(${(1 - rise) * 1400 + leave * 1500}px) scale(${breathe}) rotate(${leave * 4}deg)`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 110,
          background: C.white,
          boxShadow: "0 30px 70px rgba(0,40,15,0.22), 0 6px 18px rgba(0,40,15,0.12)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transform: `scale(${drift})`, transformOrigin: "50% 40%" }}>
          {t < T.swap ? <TipFrites /> : <TipSel />}
        </div>
        {t > T.wipe && t < T.wipe + 1 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${sweep * 100}%)` }}>
            <div style={{ position: "absolute", top: -300, bottom: -300, left: -200, right: -200, transform: "skewX(-18deg)" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 80, width: 70, background: C.yellow }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 150, right: 150, background: C.green }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 80, width: 70, background: C.yellow }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { s };
