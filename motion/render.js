const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const dir = __dirname, out = path.join(dir, 'frames');
const FPS = 30, DUR = +(process.argv[2] || 15.5), only = process.argv[3];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await pg.goto('file://' + path.join(dir, 'video.html'));
  await pg.evaluate(() => document.fonts.ready);
  const times = only ? only.split(',').map(Number) : [...Array(Math.round(DUR * FPS)).keys()].map(i => i / FPS);
  for (let i = 0; i < times.length; i++) {
    await pg.evaluate(t => render(t), times[i]);
    await pg.screenshot({ path: path.join(out, only ? `check_${times[i]}.jpg` : `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
  }
  await b.close();
})();
