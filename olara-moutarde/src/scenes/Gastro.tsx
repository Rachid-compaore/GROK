import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cucumber, FoodDefs, GrilledSlice, Leaf, Plate, Seeds, SpoonDollop, Tomato } from "../components/Food";
import { MatterRibbon, MustardSurface } from "../components/Matter";
import { C, EASE, T, sec, tw, useLayout } from "../theme";

/**
 * ACTE 2 — LA TRANSFORMATION GASTRONOMIQUE (9–16 s).
 * Un plan-séquence au-dessus d'une table d'ardoise : la caméra suit la pointe du
 * filet de moutarde jusqu'à l'assiette, la sauce se pose sur le poulet grillé,
 * puis un travelling glisse vers les ingrédients frais et la cuillère.
 * La caméra plonge dans la noisette de moutarde (transition 3), et la lumière s'éteint.
 */
const WORLD = { w: 3400, h: 1900 };
const PLATE = { x: 1350, y: 950, r: 400 };
const SPOON = { x: 2620, y: 980 };

/** Caméra : [temps local, centre x, centre y, zoom] — segments adoucis, zoom interpolé en log. */
const CAM: [number, number, number, number][] = [
  [0.0, 960, 960, 1.0],
  [1.35, 1180, 930, 1.0],
  [3.2, 1350, 950, 1.12],
  [3.8, 1350, 950, 1.12],
  [5.2, 2480, 960, 1.05],
  [6.6, SPOON.x - 40, SPOON.y, 1.35],
  [7.4, SPOON.x - 40, SPOON.y, 9.0],
];

export const GastroAct: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const { W, H, portrait } = useLayout();
  // caméra
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1];
  const k = interpolate(frame, [sec(a[0]), sec(b[0])], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: i === CAM.length - 2 ? EASE.in : EASE.inOut });
  const cx = a[1] + (b[1] - a[1]) * k, cy = a[2] + (b[2] - a[2]) * k;
  const z = Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * k) * (portrait ? 1.04 : 1.0);

  // filet de moutarde : il entre par la gauche et rejoint l'assiette (pointe suivie par la caméra)
  const lead = tw(frame, 0, 1.4, 0, 1, EASE.inOut);
  const zig = tw(frame, 1.3, 2.9, 0, 1, EASE.inOut);
  const zigPts: [number, number][] = [];
  for (let n = 0; n <= 9; n++) zigPts.push([PLATE.x - 230 + n * 52, PLATE.y - 120 + (n % 2 ? 90 : -40) + n * 20]);
  const dim = tw(frame, 7.2, 7.9, 0, 1, EASE.in); // la lumière s'éteint vers le reveal
  const goldIn = tw(frame, 6.9, 7.35, 0, 1, EASE.in);
  const steam = Math.max(0, Math.min(1, (t - 2.0) / 1.0));
  return (
    <AbsoluteFill style={{ background: "#0d0b0a", isolation: "isolate" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WORLD.w,
          height: WORLD.h,
          transformOrigin: "0 0",
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${z}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <svg width={WORLD.w} height={WORLD.h} style={{ position: "absolute", inset: 0 }}>
          <FoodDefs />
          <defs>
            <filter id="slate">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={4} seed={3} />
              <feColorMatrix values="0 0 0 0 0.11  0 0 0 0 0.1  0 0 0 0 0.09  0 0 0 0.9 0" />
            </filter>
            <radialGradient id="tableLight" cx="40%" cy="45%" r="60%">
              <stop offset="0" stopColor="rgba(255,226,170,0.22)" />
              <stop offset="1" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          {/* ardoise */}
          <rect width={WORLD.w} height={WORLD.h} fill="#1b1816" />
          <rect width={WORLD.w} height={WORLD.h} filter="url(#slate)" opacity="0.9" />
          <rect width={WORLD.w} height={WORLD.h} fill="url(#tableLight)" />
          {/* décor autour de l'assiette */}
          <Leaf x={560} y={520} s={1.4} rot={-20} />
          <Leaf x={700} y={1420} s={1.2} rot={30} />
          <Seeds x={820} y={700} spread={90} count={26} seed="s1" />
          <Tomato x={860} y={1250} r={46} id="t0" />
          {/* assiette : poulet grillé, roquette, tomates, sauce moutarde */}
          <g transform={`translate(${PLATE.x} ${PLATE.y})`}>
            <Plate r={PLATE.r} />
            <Leaf x={-260} y={-110} s={1.3} rot={-35} />
            <Leaf x={-250} y={60} s={1.1} rot={10} />
            <Leaf x={120} y={170} s={1.2} rot={160} />
            {[0, 1, 2, 3, 4].map((n) => (
              <GrilledSlice key={n} w={250} h={86} rot={-28 + n * 4} x={-40 + n * 42} y={-150 + n * 78} id={`g${n}`} />
            ))}
            <Tomato x={190} y={-180} r={44} half id="t1" />
            <Tomato x={240} y={-80} r={40} half id="t2" />
          </g>
          <Seeds x={PLATE.x + 300} y={PLATE.y + 330} spread={70} count={18} seed="s2" />
          {/* ingrédients frais */}
          <Leaf x={2050} y={600} s={1.6} rot={-10} />
          <Leaf x={2180} y={1300} s={1.5} rot={25} />
          {[0, 1, 2, 3].map((n) => (
            <Cucumber key={n} x={2100 + n * 70} y={820 + n * 40} r={58} />
          ))}
          <Tomato x={2330} y={1140} r={62} id="t3" />
          <Tomato x={2420} y={1240} r={56} half id="t4" />
          <Tomato x={2250} y={1260} r={50} id="t5" />
          <Seeds x={2520} y={760} spread={110} count={40} seed="s3" />
          <SpoonDollop x={SPOON.x} y={SPOON.y} s={1.4} rot={-8} />
          <Leaf x={2950} y={700} s={1.3} rot={140} />
          <Seeds x={3000} y={1250} spread={90} count={22} seed="s4" />
        </svg>
        {/* vapeur légère au-dessus du poulet chaud */}
        <svg width={WORLD.w} height={WORLD.h} style={{ position: "absolute", inset: 0, opacity: 0.45 * steam, pointerEvents: "none" }}>
          {[0, 1, 2].map((n) => {
            const pts: string[] = [];
            for (let s = 0; s <= 20; s++) {
              const hh = s / 20;
              pts.push(`${PLATE.x - 40 + n * 70 + Math.sin(hh * 5 + t * 1.4 + n) * 22 * hh},${PLATE.y + 40 - hh * 320}`);
            }
            return <polyline key={n} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={22} strokeLinecap="round" style={{ filter: "blur(10px)" }} />;
          })}
        </svg>
        {/* filet de moutarde, en coordonnées du monde */}
        <WorldRibbon
          pts={[[-200, 980], [300, 860], [700, 1020], [1000, 900], [PLATE.x - 240, PLATE.y - 130]]}
          width={40}
          draw={lead}
        />
        <WorldRibbon pts={zigPts} width={26} draw={zig} />
      </div>
      {/* plongée dans la cuillère : la moutarde envahit l'écran, puis la lumière s'éteint */}
      {goldIn > 0 && (
        <AbsoluteFill style={{ opacity: goldIn }}>
          <MustardSurface id="dive" light={1 - dim * 0.9} drift={4} lightX={0.5} lightY={0.45} freq={0.005} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: dim }} />
    </AbsoluteFill>
  );
};

/** Ruban dessiné dans le repère du monde (et non de l'écran). */
const WorldRibbon: React.FC<{ pts: [number, number][]; width: number; draw: number }> = ({ pts, width, draw }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: WORLD.w, height: WORLD.h }}>
    <WorldSized>
      <MatterRibbon pts={pts} width={width} draw={draw} sway={3} colors={{ body: C.mustard, shade: C.mustardDeep, shine: "#fff1b8" }} />
    </WorldSized>
  </div>
);
const WorldSized: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, width: WORLD.w, height: WORLD.h }}>{children}</div>
);

export { T };
