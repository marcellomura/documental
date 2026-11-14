// Prueba puntual: la vista de s14 a los 464 s por capas (0: Tierra, 1: + cinturón, 2: + campo)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Atmosphere, BeltShell, Earth, Stage16, useAssets16} from './globe16';
import {L, camPath, sunFrom} from './lib16';

export const Test16b: React.FC = () => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  const T = L, A = (p: string) => T.at('s14', p);
  const s0 = T.start('s14'), s1 = T.end('s14');
  const tCom = A('las comunicaciones'), tArg = A('y los satélites');
  const t = 464;
  const cam = camPath(t, [[s0 - 1, {lat: 12, lon: -50, range: 16, fov: 36}], [tCom + 0.5, {lat: 5, lon: -55, range: 12, fov: 36}], [tArg + 0.6, {lat: -28, lon: -50, range: 3.1, fov: 32}], [s1 + 1.2, {lat: -30, lon: -48, range: 2.9, fov: 32}]]);
  const sun = sunFrom(-15, -40);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Stage16 cam={cam} w={1920} h={1080}>
        <Earth t={t} sun={sun} cam={cam} field={f >= 2 ? {year: 2025, k: 0.66, full: 0, thr: 26000, hi: 0.45, iso: 0.6} : undefined} />
        <Atmosphere sun={sun} cam={cam} />
        {f >= 1 ? <BeltShell t={t} cam={cam} k={0.27} hot={0.2} /> : null}
      </Stage16>
    </AbsoluteFill>
  );
};
