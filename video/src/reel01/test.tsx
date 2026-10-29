/* Pruebas del 3D del reel 01: stills del bañado, el caballo con jinete, la escuela, el aula y la tormenta. */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useAssets} from './assets';
import {Stage, SkyDome, Lights, Water, MudFloor, Marsh, Mist, Egrets, Horse, School, Classroom, Rain, Bolt, Stars, flashAt, type Mood, type Cam} from './three';

const SHOTS = ['ride', 'side', 'school', 'night', 'storm', 'cold', 'dusk', 'aula'];
/** cada 30 cuadros cambia de plano: así un solo bundle sirve para todas las pruebas */
export const TestR01: React.FC<{shot?: string; t?: number}> = ({t: t0 = 3}) => {
  const ok = useAssets();
  const f = useCurrentFrame();
  const shot = SHOTS[Math.floor(f / 30) % SHOTS.length];
  const t = t0 + (f % 30) / 30;
  if (!ok) return null;
  const mood: Mood = shot === 'night' ? 'night' : shot === 'storm' ? 'storm' : shot === 'cold' ? 'cold' : shot === 'dusk' ? 'dusk' : 'dawn';
  const z = -t * 1.05;
  const cams: Record<string, Cam> = {
    ride: {pos: [-3.6, 0.9, z + 3.4], look: [0.6, 1.35, z - 1.6], fov: 40},
    side: {pos: [5.5, 1.3, z - 0.5], look: [0, 1.2, z - 0.5], fov: 38},
    school: {pos: [6, 2.2, 24], look: [0, 2.5, 0], fov: 45},
    night: {pos: [6, 2.2, 24], look: [0, 2.5, 0], fov: 45},
    storm: {pos: [0, 1.6, 8], look: [0, 3, -30], fov: 50},
    cold: {pos: [3.2, 1.6, z + 4.5], look: [0, 1.3, z - 1], fov: 40},
    dusk: {pos: [7, 1.6, 22], look: [0, 2.2, 4], fov: 42},
    aula: {pos: [0, 1.5, 2.6], look: [0, 1.0, -1], fov: 55},
  };
  const cam = cams[shot] ?? cams.ride;
  const flash = shot === 'storm' ? flashAt(t, [0.2]) : 0;
  if (shot === 'aula')
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Stage cam={cam} mood="dawn" env={0.4} fog={0}>
          <ambientLight intensity={0.25} />
          <Classroom t={t} />
        </Stage>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Stage cam={cam} mood={mood}>
        <SkyDome mood={mood} flash={flash} />
        <Lights mood={mood} flash={flash} />
        <Stars k={mood === 'night' ? 1 : 0} />
        <MudFloor />
        <Water mood={mood} t={t} />
        <Marsh t={t} mood={mood} />
        <Mist t={t} color="#F3D2B0" k={mood === 'dawn' ? 1 : 0.4} />
        <Egrets t={t} k={mood === 'dawn' ? 1 : 0} />
        {shot === 'school' || shot === 'night' || shot === 'dusk' ? <School t={t} night={shot === 'night' ? 1 : 0} /> : null}
        {shot === 'ride' || shot === 'side' ? (
          <>
            <Horse t={t} pos={[0, 0, z]} yaw={Math.PI} clips={[{name: 'Walk', w: 1, ts: 0.9}]} />
            <Horse t={t + 0.4} pos={[0.6, 0, z - 4.2]} yaw={Math.PI} coat="gray" rider="baqueana" clips={[{name: 'Walk', w: 1, ts: 0.9}]} />
          </>
        ) : null}
        {shot === 'cold' ? <Horse t={t} pos={[0, 0, z]} yaw={Math.PI} coat="black" rider="policia" clips={[{name: 'Walk', w: 1, ts: 0.8}]} /> : null}
        {shot === 'dusk' ? <Horse t={t} pos={[3, 0, 12]} yaw={-0.9} rider="none" clips={[{name: 'Idle_Headlow', w: 1}]} /> : null}
        {shot === 'storm' ? (
          <>
            <Rain t={t} center={[0, 0, 0]} />
            <Bolt k={flash} />
          </>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};
