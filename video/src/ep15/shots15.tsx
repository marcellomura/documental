/* Planos 3D del ep15 listos para usar: cada uno arma su escenario con el tamaño del cuadro (largo o vertical) y recibe
   la cámara ya calculada. dolly() mueve la cámara entre dos posiciones a lo largo de un plano. */
import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeInOut} from '../lib/anim';
import {
  Stage15, CabezaScene, Tierra, Pueblo, Yacht, LightPaths, Shore, MoonGlitter, Cadenas, Shafts, Bubbles, Motes, Pabellon, Tambores, Water, Stars, Mist, Figure,
  lerpCam, satPoint, type Cam, type V3, type ProjMode, type CropName,
} from './three15';

export {satPoint};
export type {Cam, V3};
/** cámara que viaja de A a B entre t0 y t1 (suave en las puntas; lin = casi lineal, para planos largos) */
export const dolly = (t: number, t0: number, t1: number, A: Cam, B: Cam, lin = false): Cam => {
  const k = clamp((t - t0) / (t1 - t0));
  const e = lin ? k * 0.75 + easeInOut(k) * 0.25 : easeInOut(k);
  return lerpCam(A, B, e);
};
const useWH = () => {
  const {width, height} = useVideoConfig();
  return {w: width, h: height};
};

export const CabezaShot: React.FC<{t: number; cam: Cam; id?: number; scatter?: number; proj?: {k: number; mode: ProjMode; off?: number; color?: string}; scan?: {y: number; k: number}; rotY?: number; rotX?: number; wire?: number; red?: number; key?: number; pos?: V3}> = (p) => {
  const {w, h} = useWH();
  return <CabezaScene w={w} h={h} {...p} />;
};

export const PuebloShot: React.FC<{t: number; cam: Cam; walkers?: {t0: number; from: V3; to: V3; dur: number}[]; door?: number; jeep?: boolean; exposure?: number}> = ({t, cam, walkers, door = 0, jeep = true, exposure = 1}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="alba" w={w} h={h} shadow={{size: 42, center: [0, 0, 5]}} exposure={exposure}>
      <Pueblo t={t} door={door} walkers={walkers} jeep={jeep} />
    </Stage15>
  );
};

export const TierraShot: React.FC<{t: number; cam: Cam; crop: CropName; outline?: number; outlineO?: number; pins?: {name: string; o: number}[]; exposure?: number}> = ({t, cam, crop, outline = 0, outlineO = 1, pins = [], exposure = 1}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="tierra" w={w} h={h} env={0.6} exposure={exposure} fog={clamp(70 / Math.max(cam.pos[1], 1), 0.12, 1)} near={Math.max(0.5, cam.pos[1] * 0.02)}>
      <Tierra t={t} crop={crop} outline={outline} outlineO={outlineO} pins={pins} />
    </Stage15>
  );
};

export const YateShot: React.FC<{t: number; cam: Cam; lights?: number}> = ({t, cam, lights = 1}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="rio" w={w} h={h} env={0.5}>
      <Stars k={1} />
      <Water mood="night" t={t} size={1600} opacity={0.94} />
      <Yacht t={t} pos={[0, 0, 0]} yaw={0.55} lights={lights} />
      <LightPaths t={t} cam={cam} lights={[{p: [-0.6, 0, -3.5], color: '#F2B56B', len: 9, k: lights}, {p: [1.2, 0, 1], color: '#F2B56B', k: 0.6 * lights}, {p: [1.6, 0, -0.5], color: '#FF3B30', k: 0.5, len: 5}]} />
      <Shore z={-240} x={60} />
      <MoonGlitter t={t} />
      <Mist t={t} color="#7E93A8" k={0.5} z={-60} />
    </Stage15>
  );
};

export const CadenasShot: React.FC<{t: number; t0: number; cam: Cam}> = ({t, t0, cam}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="agua" w={w} h={h} sky={false} env={0.4}>
      <pointLight position={[2, 4, 6]} intensity={60} distance={30} decay={1.2} color="#CFE3C9" />
      <Shafts t={t} />
      <Cadenas t={t} t0={t0} />
      <Bubbles t={t} />
      <Motes t={t} n={900} box={[16, 14, 12]} center={[0, 0, 0]} color="#B9C9A5" size={2.4} k={0.7} />
    </Stage15>
  );
};

export const TamboresShot: React.FC<{t: number; cam: Cam; beams?: number; police?: number}> = ({t, cam, beams = 1, police = 0.6}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="laguna" w={w} h={h} env={0.5}>
      <Stars k={0.7} />
      <Tambores t={t} beams={beams} police={police} />
    </Stage15>
  );
};

export const PabellonShot: React.FC<{t: number; cam: Cam; figure?: boolean}> = ({t, cam, figure = true}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="celda" w={w} h={h} sky={false}>
      <Pabellon t={t} figure={figure} />
    </Stage15>
  );
};

/** silueta alta y flaca a contraluz (el Gusano), en el estudio negro */
export const SiluetaShot: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const {w, h} = useWH();
  return (
    <Stage15 cam={cam} atm="void" w={w} h={h} sky={false} env={0.15} key={0.25}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#0C0E10" roughness={0.35} metalness={0.2} /></mesh>
      <pointLight position={[0, 2.4, -2.2]} intensity={40} distance={12} decay={1.4} color="#9FC2DA" />
      <pointLight position={[1.4, 3.2, -1]} intensity={14} distance={10} decay={1.4} color="#E39B47" />
      <Figure pos={[0, 0, 0]} t={t} walk={0} scale={1.22} color="#07080A" />
      <Motes t={t} n={400} box={[8, 6, 6]} center={[0, 2, 0]} color="#BFD6E6" k={0.5} />
    </Stage15>
  );
};
