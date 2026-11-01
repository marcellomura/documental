/* Pruebas del 3D del ep15: cada 30 cuadros cambia de plano, así un solo bundle sirve para todos los stills. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useAssets15, Stage15, CabezaScene, Tierra, satPoint, Yacht, Shore, MoonGlitter, LightPaths, Cadenas, Shafts, Bubbles, Motes, Pueblo, Pabellon, Tambores, Water, Stars, Mist, type Cam} from './three15';
import {FilmLook} from './kit';

const SHOTS = ['cara', 'cara34', 'perfil', 'shatter', 'region', 'rio', 'pueblo', 'yate', 'cadenas', 'tambores', 'pabellon', 'huella', 'sombra'];
export const Test15: React.FC = () => {
  const ok = useAssets15();
  const f = useCurrentFrame();
  const {width: w, height: h} = useVideoConfig();
  const shot = SHOTS[Math.floor(f / 30) % SHOTS.length];
  const t = 3 + (f % 30) / 30;
  const pk = satPoint('region', 'parque');
  const cams: Record<string, Cam> = {
    cara: {pos: [0, 0.1, 6.2], look: [0, -0.15, 0], fov: 28},
    cara34: {pos: [3.4, 0.4, 4.6], look: [0, -0.1, 0], fov: 30},
    perfil: {pos: [6, 0.1, 0.3], look: [0, -0.1, 0.1], fov: 28},
    shatter: {pos: [1.5, 0.3, 6], look: [0, -0.1, 0], fov: 32},
    huella: {pos: [0.6, 0.05, 4.2], look: [0, -0.05, 0], fov: 30},
    region: {pos: [pk[0] - 60, 110, pk[2] + 260], look: [pk[0] + 20, 0, pk[2] - 60], fov: 45},
    rio: {pos: [-40, 26, 90], look: [10, 0, -10], fov: 50},
    pueblo: {pos: [10, 1.6, 23], look: [-1, 1.8, 2], fov: 40},
    yate: {pos: [-13, 2.0, 15], look: [0, 1.6, -2], fov: 36},
    cadenas: {pos: [0.5, -1.5, 8], look: [0, 1, 0], fov: 50},
    tambores: {pos: [2.2, 1.0, 7.4], look: [0, 0.35, 2.8], fov: 38},
    pabellon: {pos: [0, 1.6, 3], look: [0, 1.4, -30], fov: 50},
    sombra: {pos: [0, 12, 20], look: [0, 0, 0], fov: 45},
  };
  const cam = cams[shot];
  let scene: React.ReactNode = null;
  if (shot === 'cara') scene = <CabezaScene t={t} w={w} h={h} cam={cam} />;
  else if (shot === 'cara34') scene = <CabezaScene t={t} w={w} h={h} cam={cam} proj={{k: 1.2, mode: 'nombres'}} rotY={0.5} />;
  else if (shot === 'perfil') scene = <CabezaScene t={t} w={w} h={h} cam={cam} id={1} scan={{y: 0.1, k: 1}} />;
  else if (shot === 'shatter') scene = <CabezaScene t={t} w={w} h={h} cam={cam} id={2} scatter={0.45} proj={{k: 0.8, mode: 'grilla'}} />;
  else if (shot === 'huella') scene = <CabezaScene t={t} w={w} h={h} cam={cam} proj={{k: 1.4, mode: 'huella', color: '#FF6A50'}} key={0.4} red={0.2} />;
  else if (shot === 'region' || shot === 'rio')
    scene = (
      <Stage15 cam={cam} atm="tierra" w={w} h={h} env={0.6}>
        <Tierra t={t} crop={shot} outline={0.8} pins={shot === 'region' ? [{name: 'pompeya', o: 1}] : []} />
      </Stage15>
    );
  else if (shot === 'pueblo')
    scene = (
      <Stage15 cam={cam} atm="alba" w={w} h={h} shadow={{size: 40, center: [0, 0, 4]}}>
        <Pueblo t={t} door={0.6} walkers={[{t0: 0, from: [-30, 0, 9.3], to: [-3, 0, 9], dur: 5}, {t0: 0.3, from: [-31, 0, 10.3], to: [-4, 0, 10], dur: 5}, {t0: 0.6, from: [-32, 0, 9.8], to: [-5, 0, 9.5], dur: 5}]} />
      </Stage15>
    );
  else if (shot === 'yate')
    scene = (
      <Stage15 cam={cam} atm="rio" w={w} h={h} env={0.5}>
        <Stars k={1} />
        <Water mood="night" t={t} size={1600} opacity={0.94} />
        <Yacht t={t} pos={[0, 0, 0]} yaw={0.55} />
        <LightPaths t={t} cam={cam} lights={[{p: [-0.6, 0, -3.5], color: '#F2B56B', len: 9}, {p: [1.2, 0, 1], color: '#F2B56B', k: 0.6}, {p: [1.6, 0, -0.5], color: '#FF3B30', k: 0.5, len: 5}]} />
        <Shore z={-240} x={60} />
        <MoonGlitter t={t} />
        <Mist t={t} color="#7E93A8" k={0.5} z={-60} />
      </Stage15>
    );
  else if (shot === 'cadenas')
    scene = (
      <Stage15 cam={cam} atm="agua" w={w} h={h} sky={false} env={0.4}>
        <pointLight position={[2, 4, 6]} intensity={60} distance={30} decay={1.2} color="#CFE3C9" />
        <Shafts t={t} />
        <Cadenas t={t} t0={2} />
        <Bubbles t={t} />
        <Motes t={t} n={900} box={[16, 14, 12]} center={[0, 0, 0]} color="#B9C9A5" size={2.4} k={0.7} />
      </Stage15>
    );
  else if (shot === 'sombra')
    scene = (
      <Stage15 cam={cam} atm="alba" w={w} h={h} shadow={{size: 20, center: [0, 0, 0]}} env={0}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#AAAAAA" /></mesh>
        <mesh position={[0, 1, 0]} castShadow receiveShadow><boxGeometry args={[2, 2, 2]} /><meshStandardMaterial color="#CC4444" /></mesh>
      </Stage15>
    );
  else if (shot === 'pabellon')
    scene = (
      <Stage15 cam={cam} atm="celda" w={w} h={h} sky={false}>
        <Pabellon t={t} />
      </Stage15>
    );
  else if (shot === 'tambores')
    scene = (
      <Stage15 cam={cam} atm="laguna" w={w} h={h} env={0.5}>
        <Stars k={0.7} />
        <Tambores t={t} />
      </Stage15>
    );
  if (!ok) return null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scene}
      <FilmLook t={t} />
    </AbsoluteFill>
  );
};
