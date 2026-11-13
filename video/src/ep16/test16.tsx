// Prueba del 3D del ep16: cada cuadro es una vista distinta (npx remotion still … --frame=N)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Atmosphere, BeltParticles, BeltShell, Earth, FieldLines, Metop, Section, CoreSphere, Stage16, useAssets16, VanAllen, SolarWind, Mars, Blob, GlowTube, orbitPts} from './globe16';
import {sunFrom, type GeoCam} from './lib16';

const W = 1920, H = 1080;
export const Test16: React.FC = () => {
  const ok = useAssets16();
  const f = useCurrentFrame();
  if (!ok) return null;
  const t = 10;
  const sun = sunFrom(-15, -20);
  const sunB = sunFrom(-20, -10);
  const belt = (cam: GeoCam) => <><Earth t={t} sun={sunB} cam={cam} field={{year: 2025, k: 0.5, full: 0, thr: 26000, hi: 0.4, iso: 0.5}} clouds={0.5} /><Atmosphere sun={sunB} cam={cam} /><BeltShell t={t} cam={cam} k={0.9} /><BeltParticles t={t} k={0.6} /><GlowTube id="iss" pts={orbitPts(51.6, -95, 410, 300)} radius={0.0035} color="#8DB8FF" k={1} /><GlowTube id="hub" pts={orbitPts(28.5, -70, 530, 300)} radius={0.0035} color="#C9B6FF" k={1} /></>;
  const views: {cam: GeoCam; body: (cam: GeoCam) => React.ReactNode}[] = [
    {cam: {lat: -30, lon: -20, r0: 1, range: 0.9, tilt: 65, head: -80, fov: 40}, body: belt},
    {cam: {lat: -48, lon: -58, r0: 1, range: 1.1, tilt: 70, head: 10, fov: 40}, body: belt},
    {cam: {lat: -38, lon: -42, range: 2.55, fov: 32}, body: belt},
    {cam: {lat: -26, lon: -30, r0: 1, range: 0.6, tilt: 78, head: -90, fov: 44}, body: belt},
    {cam: {lat: 5, lon: -60, r0: 1, range: 1.6, tilt: 60, head: 180, fov: 38}, body: belt},
    {cam: {lat: 8, lon: -40, range: 6, fov: 34}, body: (cam) => <><Earth t={t} sun={sunB} cam={cam} /><Atmosphere sun={sunB} cam={cam} /><VanAllen t={t} size={18} /></>},
  ];
  const v = views[Math.min(f, views.length - 1)];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Stage16 cam={v.cam} w={W} h={H}>{v.body(v.cam)}</Stage16>
    </AbsoluteFill>
  );
};
