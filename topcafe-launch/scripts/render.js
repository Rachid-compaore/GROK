// Rendu du film : 60 i/s, 8 sous-images par image (obturateur 180°) mélangées par ffmpeg tmix.
// Usage : node scripts/render.js [workers=4]
const { chromium } = require("playwright");
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "out");
const FPS = 60, SUB = 8, SHUTTER = 0.5, DUR = 15.0;
const FRAMES = Math.round(DUR * FPS);
const WORKERS = +(process.argv[2] || 4);

async function renderChunk(w, f0, f1) {
  const seg = path.join(OUT, `seg_${w}.mp4`);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS * SUB), "-c:v", "mjpeg", "-i", "-",
    "-vf", `tmix=frames=${SUB},select='not(mod(n+1\\,${SUB}))',setpts=N/(${FPS}*TB)`,
    "-r", String(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", seg], { stdio: ["pipe", "inherit", "inherit"] });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on("pageerror", e => console.error("ERREUR PAGE:", e.message));
  await pg.goto("file://" + path.join(ROOT, "film.html"));
  await pg.evaluate(() => window.ready);
  for (let f = f0; f < f1; f++) {
    for (let k = 0; k < SUB; k++) {
      const t = (f + (k / SUB) * SHUTTER) / FPS;
      await pg.evaluate(t => seek(t), t);
      const buf = await pg.screenshot({ type: "jpeg", quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    }
    if ((f - f0) % 60 === 0) console.log(`  worker ${w} : image ${f}/${f1}`);
  }
  await b.close();
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  return seg;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const per = Math.ceil(FRAMES / WORKERS);
  const segs = await Promise.all([...Array(WORKERS).keys()].map(w => renderChunk(w, w * per, Math.min(FRAMES, (w + 1) * per))));
  fs.writeFileSync(path.join(OUT, "segs.txt"), segs.map(s => `file '${s}'`).join("\n"));
  const silent = path.join(OUT, "video_silent.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(OUT, "segs.txt"), "-c", "copy", silent]);
  // son : normalisation à -14 LUFS en deux passes
  const m = execFileSync("ffmpeg", ["-hide_banner", "-i", path.join(OUT, "audio_raw.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] }).toString() ||
    "";
  let stats;
  try { stats = JSON.parse(execFileSync("bash", ["-c", `ffmpeg -hide_banner -i '${path.join(OUT, "audio_raw.wav")}' -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString()); } catch (e) { stats = null; }
  const ln = stats ? `loudnorm=I=-14:TP=-1:LRA=11:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true` : "loudnorm=I=-14:TP=-1:LRA=11";
  const final = path.join(OUT, "topcafe-lancement-15s-60fps.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", silent, "-i", path.join(OUT, "audio_raw.wav"), "-af", ln, "-ar", "48000", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", final]);
  console.log("OK →", final);
})();
