// Mide cuánto tarda cada cuadro, para encontrar lo caro antes de un render largo (con WebGL por software, un filtro SVG o
// un desenfoque grande pueden costar segundos por cuadro).
//   node medir_cuadros.mjs ENTRADA COMPOSICIÓN CADA_N ESCALA SALIDA [desde hasta]
// Variables: PUBDIR (carpeta public reducida, obligatoria), CONC (pestañas, 4), RANGES="300-303,1200-1203" (tramos de
// cuadros seguidos: el primero de cada tramo es "en frío" y los demás muestran el costo real), VARIANTS='[{},{"x":1}]'
// (inputProps alternativos para comparar, por ejemplo interruptores que apagan una capa). Imprime "frame N ... ms".
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [,, entry, comp, nth, scale, outDir, from, to] = process.argv;
const browserExecutable = process.env.BROWSER || ['/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find((p) => fs.existsSync(p));
const serveUrl = await bundle({entryPoint: path.resolve(entry), onProgress: () => {}, publicDir: path.resolve(process.env.PUBDIR), outDir: path.resolve(outDir, 'bundle')});
const chromiumOptions = {gl: 'swangle'};
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser, chromiumOptions});
const t0 = Date.now();
const ranges = (process.env.RANGES || `${from ?? 0}-${to ?? composition.durationInFrames - 1}`).split(',').map((r) => r.split('-').map(Number));
const variants = JSON.parse(process.env.VARIANTS || '[{}]');
for (const v of variants) for (const [a, b] of ranges) {
  console.log('VARIANT', JSON.stringify(v));
  const t1 = Date.now();
  await renderFrames({serveUrl, composition, inputProps: v, outputDir: path.join(outDir, 'frames'), imageFormat: 'jpeg', jpegQuality: 80,
    frameRange: [a, b], everyNthFrame: Number(nth), concurrency: Number(process.env.CONC || 4), scale: Number(scale), puppeteerInstance: browser,
    chromiumOptions, timeoutInMilliseconds: 240000, onStart: () => {},
    onFrameUpdate: (n, f, ms) => console.log('frame', f, 't', (f / 30).toFixed(1), 'ms', Math.round(ms), 'elapsed', Math.round((Date.now() - t1) / 1000))});
  console.log('RANGE', a, b, Math.round((Date.now() - t1) / 1000), 's');
}
console.log('TOTAL', Math.round((Date.now() - t0) / 1000), 's');
await browser.close({silent: true});
fs.rmSync(path.join(outDir, 'bundle'), {recursive: true, force: true});
