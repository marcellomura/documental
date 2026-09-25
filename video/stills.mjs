// Renderiza cuadros de prueba: node stills.mjs /ruta/frames.txt /ruta/salida
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const [,, list, outDir] = process.argv;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const inputProps = JSON.parse(process.env.PROPS || '{}');
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Documental', browserExecutable, inputProps});
fs.mkdirSync(outDir, {recursive: true});
for (const line of fs.readFileSync(list, 'utf8').trim().split('\n')) {
  const [name, frame] = line.split(/\s+/);
  await renderStill({serveUrl, composition, frame: Number(frame), output: path.join(outDir, name + '.jpg'), imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, scale: Number(process.env.SCALE || 0.5), inputProps});
  console.log('ok', name, frame);
}
