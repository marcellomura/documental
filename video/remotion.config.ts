import {Config} from '@remotion/cli/config';
import fs from 'fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
// Chromium headless del contenedor (la versión cambia con la imagen): el primero que exista
Config.setBrowserExecutable(
  process.env.BROWSER ||
    ['/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell', '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find((p) => fs.existsSync(p)) ||
    null,
);
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
