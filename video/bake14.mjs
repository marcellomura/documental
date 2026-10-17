// Hornea las texturas caras del episodio 14 a PNG transparentes a 1,333× (el tamaño del render de 1440p): las cuatro
// líneas de árboles del monte en los cuatro climas (public/ep14/monte/{clima}_{capa}.png) y el ruido del pergamino
// (public/ep14/tex/parch14.webp). Sus filtros SVG cuestan segundos por cuadro con WebGL por software. Uso: node bake14.mjs
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, getCompositions} from '@remotion/renderer';
import fs from 'fs';
import os from 'os';
import path from 'path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'bake14-pub-'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index14bake.tsx'), onProgress: () => {}, publicDir: empty});
const out = path.resolve('public/ep14');
fs.mkdirSync(path.join(out, 'monte'), {recursive: true});
fs.mkdirSync(path.join(out, 'tex'), {recursive: true});
for (const c of await getCompositions(serveUrl, {browserExecutable})) {
  const [, mood, L] = c.id.split('-');
  const composition = await selectComposition({serveUrl, id: c.id, browserExecutable});
  // el pergamino es ruido fino: en PNG pesa 9 MB, en WebP con transparencia 2,5 MB
  const parch = c.id === 'Parch';
  const file = parch ? 'tex/parch14.webp' : `monte/${mood}_${L}.png`;
  await renderStill({serveUrl, composition, frame: 0, output: path.join(out, file), imageFormat: parch ? 'webp' : 'png', scale: 4 / 3, browserExecutable});
  console.log('ok', c.id, composition.width, 'x', composition.height);
}
fs.rmSync(serveUrl, {recursive: true, force: true});
fs.rmSync(empty, {recursive: true, force: true});
