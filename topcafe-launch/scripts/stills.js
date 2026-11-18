// Rend quelques images fixes : node scripts/stills.js 1.5 6.5 8.8 13
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const times = process.argv.slice(2).map(Number);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on("pageerror", e => console.error("ERREUR PAGE:", e.message));
  await pg.goto("file://" + path.resolve(__dirname, "..", "film.html"));
  await pg.evaluate(() => window.ready);
  for (const t of times) {
    await pg.evaluate(t => seek(t), t);
    await pg.screenshot({ path: path.resolve(__dirname, "..", "out", `still_${t}.png`) });
  }
  await b.close();
})();
