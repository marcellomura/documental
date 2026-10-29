// Renderiza cuadros de prueba: node stills.mjs /ruta/frames.txt /ruta/salida
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const [,, list, outDir] = process.argv;
import fs0 from 'fs';
// Chromium headless del contenedor (la versión cambia con la imagen): el primero que exista
const browserExecutable = process.env.BROWSER || ['/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find((p) => fs0.existsSync(p));
// PUBDIR: carpeta public reducida (bundle chico); BUNDLE_OUT: bundle fuera de /tmp/remotion-webpack-bundle-* (los
// scripts de render por tramos borran esos bundles entre tramo y tramo)
const serveUrl = await bundle({
  entryPoint: path.resolve(process.env.ENTRY || 'src/index.ts'), onProgress: () => {},
  ...(process.env.PUBDIR ? {publicDir: path.resolve(process.env.PUBDIR)} : {}), ...(process.env.BUNDLE_OUT ? {outDir: path.resolve(process.env.BUNDLE_OUT)} : {}),
});
const inputProps = JSON.parse(process.env.PROPS || '{}');
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Documental', browserExecutable, inputProps, chromiumOptions: {gl: process.env.GL || null}});
fs.mkdirSync(outDir, {recursive: true});
for (const line of fs.readFileSync(list, 'utf8').trim().split('\n')) {
  const [name, frame] = line.split(/\s+/);
  await renderStill({serveUrl, composition, frame: Number(frame), output: path.join(outDir, name + '.jpg'), imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, chromiumOptions: {gl: process.env.GL || null}, scale: Number(process.env.SCALE || 0.5), inputProps, onBrowserLog: process.env.LOG ? (l) => console.log('[browser]', l.type, l.text) : undefined});
  console.log('ok', name, frame);
}
// el bundle copia public/ entero (~1 GB): se borra al terminar para no llenar el disco
fs.rmSync(serveUrl, {recursive: true, force: true});
