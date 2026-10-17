// Pruebas visuales del episodio 14 (cuadros sueltos para revisar materiales y luces)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Defs14, NightSky, Vignette, K} from './kit14';
import {Stage14, Terrain, Monte, IronMass, MESON, SkyLights, Blast, Meteor, Earth, Stars3D, GIGANTE, Ground, Tufts, horizonY, ContactShadow} from './three14';
import {MonteBackdrop, ForeGrass} from './art14';

export const Test14: React.FC<{which: string}> = ({which}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (which === 'monte') {
    const cam = {pos: [4.6, 1.25, 6.0] as [number, number, number], look: [0, 0.25, 0] as [number, number, number], fov: 36};
    return (
      <AbsoluteFill style={{background: K.void}}>
        <Defs14 />
        <MonteBackdrop t={t} mood="dusk" horizon={horizonY(cam)} pan={t * 20} />
        <Stage14 cam={cam} exposure={1.05} env={0.25}>
          <SkyLights mood="dusk" />
          <Ground tint="#6E6470" />
          <ContactShadow w={4.6} d={3.8} rot={0.5} />
          <IronMass shape={MESON} pos={[0, 0.12, 0]} rot={[0.04, 0.5, -0.03]} />
        </Stage14>
        <ForeGrass t={t} pan={t * 20} />
        <Vignette k={0.6} />
      </AbsoluteFill>
    );
  }
  if (which === 'golden') {
    const cam = {pos: [3.1, 0.75, 3.6] as [number, number, number], look: [0, 0.2, 0] as [number, number, number], fov: 34};
    return (
      <AbsoluteFill style={{background: K.void}}>
        <MonteBackdrop t={t} mood="golden" horizon={horizonY(cam)} />
        <Stage14 cam={cam} exposure={1.0} env={0.45}>
          <SkyLights mood="golden" />
          <Ground />
          <ContactShadow w={4.6} d={3.8} rot={0.5} />
          <IronMass shape={MESON} pos={[0, 0.12, 0]} rot={[0.04, 0.5, -0.03]} />
        </Stage14>
        <ForeGrass t={t} color="#1A140E" />
        <Vignette k={0.5} />
      </AbsoluteFill>
    );
  }
  if (which === 'blast')
    return (
      <AbsoluteFill style={{background: K.void}}>
        <NightSky t={t} horizon={0.9} hColor="#3B3A5E" />
        <Stage14 cam={{pos: [6.5, 2.2, 8], look: [0, 0.8, 0], fov: 40}} fog={['#232742', 18, 120]} exposure={1.1} env={0.35}>
          <SkyLights mood="dusk" />
          <Terrain />
          <Monte />
          <IronMass shape={MESON} pos={[0, 0.12, 0]} rot={[0.04, 0.5, -0.03]} />
          <Blast t={t} t0={0} pos={[0.4, 0, 1.1]} s={1} />
        </Stage14>
      </AbsoluteFill>
    );
  if (which === 'espacio')
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Stage14 cam={{pos: [0, 0, 14], look: [0, 0, 0], fov: 40}} env={0}>
          <ambientLight intensity={0.05} />
          <Stars3D />
          <Earth r={5} pos={[2, -4.2, -2]} rot={[0.5, 2.6, 0]} sun={[-1, 0.5, 0.4]} />
          <Meteor pos={[-2.5, 2.2, 3]} vel={[0.8, -0.55, -0.3]} s={0.7} t={t} />
        </Stage14>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <Stage14 cam={{pos: [6, 2.4, 7], look: [0, 1, 0], fov: 36}} env={0.8}>
        <SkyLights mood="day" />
        <IronMass shape={GIGANTE} pos={[0, 1.05, 0]} rot={[0, 0.8, 0]} />
      </Stage14>
    </AbsoluteFill>
  );
};
