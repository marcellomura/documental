/* La pila de fetas del modelo del queso suizo (el recurso central del episodio 13): N placas a lo largo de z con su
   agujero de falla, el viajero que intenta atravesarlas (la "falla" como esfera roja o la ampolla del lote) y la
   décima barrera del hospital. Los rótulos se dibujan en HTML proyectando puntos 3D a la pantalla. */
import React from 'react';
import * as THREE from 'three';
import {Stage13, Lights13, Slice, Ampoule, glowTex, sliceZ, PATH_XY, SLICE_D, project, missPos} from './three13';
import type {Cam, V3} from './three13';
import {K, clamp, mix} from './kit13';

export type SliceState = {open?: number; align?: number; glow?: number; color?: string; o?: number; solid?: boolean; edge?: string; scale?: number; tilt?: number};
export type Traveler = {kind: 'sphere' | 'ampoule'; z: number; o?: number; glow?: number; spin?: number; xy?: [number, number]};

export const holeWorld = (i: number, n: number, align = 1, dx = 0): V3 => {
  const mp = missPos(i);
  return [mix(mp[0], PATH_XY[0], align) + dx, mix(mp[1], PATH_XY[1], align), sliceZ(i, n) + SLICE_D / 2];
};

/** pila de fetas con viajero y décima barrera; overlay recibe una función de proyección para rótulos en HTML */
export const StackView: React.FC<{
  t: number; cam: Cam; n: number; state: (i: number) => SliceState; traveler?: Traveler | null; tenth?: {o: number; glow?: number} | null;
  overlay?: (proj: (p: V3) => [number, number]) => React.ReactNode; bg?: string; exposure?: number; offsetZ?: number; w?: number; h?: number;
}> = ({t, cam, n, state, traveler, tenth, overlay, bg, exposure = 1.05, offsetZ = 0, w = 1920, h = 1080}) => {
  const proj = (p: V3) => project(cam, p, w, h);
  const tz = traveler ? traveler.z : 0;
  const txy = traveler?.xy ?? PATH_XY;
  return (
    <>
      <Stage13 cam={cam} bg={bg} exposure={exposure} w={w} h={h}>
        <Lights13 />
        <pointLight position={[2.5, 2, sliceZ(0, n) - 2]} intensity={6} distance={14} color="#7FE3D2" />
        <group position={[0, 0, offsetZ]}>
          {Array.from({length: n}, (_, i) => {
            const s = state(i);
            if ((s.o ?? 1) <= 0.01) return null;
            return <Slice key={i} i={i} pos={[0, 0, sliceZ(i, n)]} open={s.open ?? 0} align={s.align ?? 0} glow={s.glow ?? 0} color={s.color} o={s.o ?? 1} solid={s.solid} edge={s.edge} scale={s.scale ?? 1} tilt={s.tilt ?? 0} />;
          })}
          {tenth && tenth.o > 0.01 ? (
            <Slice i={42} pos={[0, 0, sliceZ(n - 1, n) + 1.15 * 1.1]} open={0} solid color="#22C9B4" edge="#C9FFF4" o={tenth.o} glow={tenth.glow ?? 0.3} scale={mix(0.7, 1, tenth.o)} />
          ) : null}
          {traveler && (traveler.o ?? 1) > 0.01 ? (
            traveler.kind === 'sphere' ? (
              <group position={[txy[0], txy[1], tz]}>
                <mesh>
                  <sphereGeometry args={[0.12, 32, 24]} />
                  <meshStandardMaterial color="#FF3B30" emissive="#FF3B30" emissiveIntensity={1.4} transparent opacity={traveler.o ?? 1} />
                </mesh>
                <sprite scale={[1.1, 1.1, 1]}>
                  <spriteMaterial map={glowTex()} color="#FF4A3D" transparent opacity={0.8 * (traveler.o ?? 1)} depthWrite={false} blending={THREE.AdditiveBlending} />
                </sprite>
                <pointLight intensity={3 * (traveler.o ?? 1)} distance={3} color="#FF5A4E" />
              </group>
            ) : (
              <group position={[txy[0], txy[1], tz]}>
                <Ampoule pos={[0, 0, -0.25]} rot={[Math.PI / 2, traveler.spin ?? 0, 0]} s={0.5} cloud={0.25} glow={traveler.glow ?? 0.6} o={traveler.o ?? 1} />
                <pointLight intensity={2.4 * (traveler.glow ?? 0.6)} distance={2.6} color="#FF5A4E" />
              </group>
            )
          ) : null}
        </group>
      </Stage13>
      {overlay ? overlay(proj) : null}
    </>
  );
};

/** z del viajero que recorre la pila de punta a punta en [t0, t0+dur] (con aceleración suave) */
export const travelZ = (t: number, t0: number, dur: number, n: number, pad = 1.6) => {
  const z0 = sliceZ(0, n) - pad, z1 = sliceZ(n - 1, n) + pad;
  const k = clamp((t - t0) / dur);
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  return mix(z0, z1, e);
};
/** índice de la última feta que el viajero ya cruzó */
export const passed = (z: number, n: number) => {
  let c = -1;
  for (let i = 0; i < n; i++) if (z > sliceZ(i, n)) c = i;
  return c;
};
export {K};
