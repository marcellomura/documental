/* Kit 3D del episodio 9 (Vaca Muerta): bloque geológico en corte (mar antiguo, capas, pozo, fractura),
   mapa 3D de provincias con el área de Vaca Muerta y el oleoducto, barriles instanciados y litro de nafta. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {clamp, easeIn, easeInOut, easeOut, rnd} from '../lib/anim';
import provincias from '../data/ep09/provincias.json';
import countries from '../data/ep04/countries50.json';
import type {V3} from '../ep06/three6';

export {Stage, ShadowFloor, camPath, lerpCam, project, Globe3D, globeRot, globePoint} from '../ep06/three6';
export type {Cam, V3} from '../ep06/three6';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const tc = new THREE.Color(), tc2 = new THREE.Color();
const lerpHex = (a: string, b: string, k: number) => '#' + tc.set(a).lerp(tc2.set(b), clamp(k)).getHexString();

/* ------------------------------------------------------------------ texturas de canvas */
const CANVAS_TEX: Record<string, THREE.CanvasTexture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  if (CANVAS_TEX[key]) return CANVAS_TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  if (repeat) {
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(...repeat);
  }
  CANVAS_TEX[key] = tx;
  return tx;
};

/** roca estratificada: ruido + laminaciones horizontales (determinística) */
const strataTex = (seed: number, base: string, lam = 0.5, grain = 0.5) =>
  canvasTex(`strata-${seed}-${base}`, 1024, 256, (g) => {
    let s = seed * 101;
    const R = () => rnd(s++);
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 256);
    const c = new THREE.Color(base);
    // laminaciones
    for (let i = 0; i < 26 * lam + 6; i++) {
      const y = R() * 256, th = 1 + R() * 5;
      const k = (R() - 0.5) * 0.35;
      g.fillStyle = `rgba(${Math.round(255 * clamp(c.r + k))},${Math.round(255 * clamp(c.g + k))},${Math.round(255 * clamp(c.b + k))},${0.35 + R() * 0.4})`;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 3 + (R() - 0.5) * 2);
      g.lineTo(1024, y + th);
      for (let x = 1024; x >= 0; x -= 64) g.lineTo(x, y + th + Math.sin(x * 0.006 + i) * 3);
      g.closePath();
      g.fill();
    }
    // granos
    for (let i = 0; i < 2600 * grain; i++) {
      const a = R() < 0.5 ? 0 : 255;
      g.fillStyle = `rgba(${a},${a},${a},${0.04 + R() * 0.08})`;
      g.fillRect(R() * 1024, R() * 256, 1 + R() * 3, 1 + R() * 2);
    }
  });

const sandTex = () =>
  canvasTex('sand9', 1024, 512, (g) => {
    let s = 77;
    const R = () => rnd(s++);
    g.fillStyle = '#B98B5F';
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(${150 + R() * 60},${100 + R() * 40},${60 + R() * 30},${0.12 + R() * 0.2})`;
      g.beginPath();
      g.ellipse(R() * 1024, R() * 512, 20 + R() * 90, 8 + R() * 30, R() * 3, 0, Math.PI * 2);
      g.fill();
    }
    // matas de jarilla
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(${80 + R() * 30},${78 + R() * 30},${45 + R() * 20},${0.18 + R() * 0.25})`;
      g.beginPath();
      g.arc(R() * 1024, R() * 512, 0.6 + R() * 1.6, 0, Math.PI * 2);
      g.fill();
    }
    // huellas / caminos de ripio
    g.strokeStyle = 'rgba(220,190,150,0.55)';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(0, 300);
    g.bezierCurveTo(300, 260, 600, 360, 1024, 310);
    g.stroke();
    g.beginPath();
    g.moveTo(380, 0);
    g.bezierCurveTo(400, 200, 330, 330, 360, 512);
    g.stroke();
  });

/* ------------------------------------------------------------------ helpers de malla */
export const M: React.FC<{c: string; r?: number; m?: number; e?: string; ei?: number; o?: number; map?: THREE.Texture; side?: THREE.Side; dw?: boolean; tm?: boolean}> = ({
  c, r = 0.75, m = 0, e, ei = 0, o, map, side, dw, tm,
}) => (
  <meshStandardMaterial
    color={c} roughness={r} metalness={m} emissive={e ?? '#000'} emissiveIntensity={ei} transparent={o !== undefined} opacity={o ?? 1} map={map} side={side}
    depthWrite={dw ?? (o === undefined || o > 0.99)} toneMapped={tm ?? true}
  />
);
export const Box: React.FC<{p: V3; s: V3; c: string; r?: number; m?: number; rot?: V3; e?: string; ei?: number; o?: number; shadow?: boolean}> = ({p, s, c, r, m, rot, e, ei, o, shadow = true}) => (
  <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <M c={c} r={r} m={m} e={e} ei={ei} o={o} />
  </mesh>
);

/** malla instanciada que se actualiza en el mismo render (sin depender del orden de efectos) */
const useInstanced = (geo: THREE.BufferGeometry, mat: THREE.Material, max: number) =>
  useMemo(() => {
    const im = new THREE.InstancedMesh(geo, mat, max);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    return im;
  }, [geo, mat, max]);
const dummy = new THREE.Object3D();
const setInst = (im: THREE.InstancedMesh, i: number, p: V3, s: number | V3, rot: V3 = [0, 0, 0]) => {
  dummy.position.set(p[0], p[1], p[2]);
  dummy.rotation.set(rot[0], rot[1], rot[2]);
  if (typeof s === 'number') dummy.scale.set(s, s, s);
  else dummy.scale.set(s[0], s[1], s[2]);
  dummy.updateMatrix();
  im.setMatrixAt(i, dummy.matrix);
};

/* =====================================================================================
   BLOQUE GEOLÓGICO EN CORTE
   1 km = 1,5 unidades. Vaca Muerta entre −4,5 y −5,1 (≈ 3 km de profundidad).
   La cara frontal (z = +3) es el corte: ahí se ven el pozo, las fracturas y el petróleo.
   ===================================================================================== */
export const BX = 7, BZ = 3;
export const VM_TOP = -4.5, VM_BOT = -5.1, VM_MID = (VM_TOP + VM_BOT) / 2;
export const WX = -4.7; // boca del pozo
const BEND = 0.9; // radio de la curva del pozo
export const LAT_LEN = 4.5; // 3 km de rama horizontal
export const LAT_END = WX + BEND + LAT_LEN;
export const SEA_TOP = -1.3;

type Layer = {id: string; y0: number; y1: number; c: string; lam: number};
const LAYERS: Layer[] = [
  {id: 'basamento', y0: -7.0, y1: -6.0, c: '#3D3836', lam: 0.2},
  {id: 'tordillo', y0: -6.0, y1: VM_BOT, c: '#7C513C', lam: 0.6},
  {id: 'vm', y0: VM_BOT, y1: VM_TOP, c: '#25201C', lam: 1},
  {id: 'quintuco', y0: VM_TOP, y1: -3.3, c: '#8C785B', lam: 0.7},
  {id: 'agrio', y0: -3.3, y1: -2.3, c: '#A69679', lam: 0.9},
  {id: 'rayoso', y0: -2.3, y1: -1.3, c: '#706C5D', lam: 0.5},
  {id: 'neuquen', y0: -1.3, y1: -0.3, c: '#A0603F', lam: 0.8},
  {id: 'superficie', y0: -0.3, y1: 0, c: '#B98A5E', lam: 0.4},
];

export type GeoState = {
  t: number;
  build?: number; // capas por encima de Vaca Muerta (0 = todavía no existen)
  vm?: number; // espesor depositado de Vaca Muerta
  sea?: number; // mar jurásico
  plank?: number; // plancton en el agua
  fall?: number; // plancton cayendo al fondo
  rock?: number; // barro → roca
  heat?: number; // calor desde abajo
  press?: number; // presión (compactación)
  oil?: number; // gotas de petróleo dentro de la roca
  glow?: number; // resaltar Vaca Muerta
  well?: number; // perforación vertical
  lat?: number; // curva + rama horizontal
  frac?: number; // etapas de fractura (0→1 = 5 etapas)
  flow?: number; // el petróleo entra al pozo y sube
  lake?: number; // el "lago subterráneo" equivocado
  surface?: number; // equipo, bombas y camiones en la superficie
  night?: number; // luces de los equipos
};

const wellPath = (sV: number, sL: number) => {
  // sV: 0→1 tramo vertical, sL: 0→1 curva + horizontal
  const pts: THREE.Vector3[] = [];
  const z = BZ + 0.02;
  const yBend = VM_MID + BEND;
  const n1 = 30;
  for (let i = 0; i <= n1; i++) pts.push(new THREE.Vector3(WX, mix(0.15, yBend, (i / n1) * sV), z));
  if (sV >= 1 && sL > 0) {
    const arcLen = (Math.PI / 2) * BEND, tot = arcLen + LAT_LEN;
    const L = sL * tot;
    const na = 20;
    for (let i = 1; i <= na; i++) {
      const a = (i / na) * Math.min(1, L / arcLen) * (Math.PI / 2);
      pts.push(new THREE.Vector3(WX + BEND - BEND * Math.cos(a), yBend - BEND * Math.sin(a), z));
      if ((i / na) * arcLen >= L) break;
    }
    if (L > arcLen) {
      const nh = 40;
      for (let i = 1; i <= nh; i++) pts.push(new THREE.Vector3(WX + BEND + ((L - arcLen) * i) / nh, VM_MID, z));
    }
  }
  return pts;
};

/** posición x de cada etapa de fractura (de la punta hacia el talón, como en la realidad) */
export const FRAC_X = [0.88, 0.7, 0.52, 0.34, 0.16].map((k) => WX + BEND + LAT_LEN * k);

const crackShape = (seed: number, h: number) => {
  const s = new THREE.Shape();
  const n = 9;
  const w = 0.05;
  s.moveTo(0, -h);
  for (let i = 0; i <= n; i++) {
    const y = -h + (2 * h * i) / n;
    s.lineTo(w * (1 - Math.abs(y / h)) + (rnd(seed + i) - 0.5) * 0.12, y);
  }
  for (let i = n; i >= 0; i--) {
    const y = -h + (2 * h * i) / n;
    s.lineTo(-w * (1 - Math.abs(y / h)) + (rnd(seed + i) - 0.5) * 0.12, y);
  }
  return s;
};

const PumpJack: React.FC<{p: V3; t: number; s?: number; ry?: number; ph?: number}> = ({p, t, s = 1, ry = 0, ph = 0}) => {
  const a = Math.sin(t * 2.1 + ph) * 0.28;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
      <Box p={[0, 0.03, 0]} s={[0.9, 0.06, 0.26]} c="#2B2B2E" r={0.6} />
      <Box p={[0.02, 0.27, 0.07]} s={[0.04, 0.5, 0.04]} c="#C9372C" rot={[0, 0, 0.12]} r={0.5} />
      <Box p={[0.02, 0.27, -0.07]} s={[0.04, 0.5, 0.04]} c="#C9372C" rot={[0, 0, 0.12]} r={0.5} />
      <group position={[0.05, 0.52, 0]} rotation={[0, 0, a]}>
        <Box p={[0.05, 0, 0]} s={[0.78, 0.05, 0.06]} c="#1D1D20" r={0.5} />
        <Box p={[0.46, -0.07, 0]} s={[0.08, 0.2, 0.08]} c="#C9372C" r={0.5} />
      </group>
      <mesh position={[-0.32, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 18]} />
        <M c="#C9372C" r={0.5} />
      </mesh>
    </group>
  );
};

const Rig: React.FC<{p: V3; night: number; t: number; h?: number}> = ({p, night, t, h = 2.6}) => (
  <group position={p}>
    <Box p={[0, 0.12, 0]} s={[0.9, 0.24, 0.9]} c="#4C4F55" r={0.5} m={0.3} />
    <mesh position={[0, 0.24 + h / 2, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.36, h, 4, 6, true]} />
      <meshStandardMaterial color="#E6E1D6" wireframe emissive="#FFD9A0" emissiveIntensity={night * 0.9} />
    </mesh>
    <Box p={[0, 0.24 + h + 0.05, 0]} s={[0.22, 0.1, 0.22]} c="#E6E1D6" e="#FFD9A0" ei={night * 1.2} />
    {[0.3, 0.55, 0.8].map((k, i) => (
      <mesh key={i} position={[0.36 * (1 - k) + 0.05, 0.24 + h * k, 0.2]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={i % 2 ? '#FFF2C6' : '#FF5A3C'} toneMapped={false} transparent opacity={0.25 + 0.75 * night * (0.7 + 0.3 * Math.sin(t * 5 + i))} />
      </mesh>
    ))}
    <Box p={[0.9, 0.18, 0.1]} s={[0.9, 0.36, 0.4]} c="#D8D3C7" r={0.6} />
    <Box p={[-0.8, 0.16, -0.25]} s={[0.6, 0.32, 0.35]} c="#9C2E24" r={0.6} />
  </group>
);

const FracTruck: React.FC<{p: V3; ry?: number}> = ({p, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0.16, 0]} s={[0.7, 0.24, 0.24]} c="#E2DED4" r={0.5} />
    <Box p={[0.44, 0.17, 0]} s={[0.18, 0.26, 0.24]} c="#C9372C" r={0.5} />
  </group>
);

const plankPos = Array.from({length: 520}, (_, i) => [(rnd(i * 3 + 1) - 0.5) * 2 * BX * 0.96, rnd(i * 3 + 2), (rnd(i * 3 + 3) - 0.5) * 2 * BZ * 0.96] as V3);
const oilPos = Array.from({length: 420}, (_, i) => {
  // la mitad cerca de la cara frontal (se ven en el corte)
  const front = i % 2 === 0;
  return [(rnd(i * 5 + 11) - 0.5) * 2 * BX * 0.97, rnd(i * 5 + 12), front ? BZ - 0.03 : (rnd(i * 5 + 13) - 0.5) * 2 * BZ] as V3;
});

const sphereGeo = new THREE.SphereGeometry(1, 10, 8);
const plankMat = new THREE.MeshBasicMaterial({color: '#9CFFC4', toneMapped: false, transparent: true, opacity: 0.9});
const oilMat = new THREE.MeshStandardMaterial({color: '#0B0907', roughness: 0.12, metalness: 0.35, emissive: '#5A3208', emissiveIntensity: 0.25});
const sandMat = new THREE.MeshBasicMaterial({color: '#F3D58A', toneMapped: false});
const upMat = new THREE.MeshStandardMaterial({color: '#0B0907', roughness: 0.1, metalness: 0.4, emissive: '#FF9A2E', emissiveIntensity: 0.6});

export const GeoBlock: React.FC<{s: GeoState}> = ({s}) => {
  const {t} = s;
  const build = s.build ?? 1, vmK = s.vm ?? 1, sea = s.sea ?? 0, plank = s.plank ?? 0, fall = s.fall ?? 0, rock = s.rock ?? 1, heat = s.heat ?? 0;
  const oil = s.oil ?? 0, glow = s.glow ?? 0, well = s.well ?? 0, lat = s.lat ?? 0, frac = s.frac ?? 0, flow = s.flow ?? 0, lake = s.lake ?? 0;
  const surface = s.surface ?? 1, night = s.night ?? 0, press = s.press ?? 0;

  const plankIM = useInstanced(sphereGeo, plankMat, plankPos.length);
  const oilIM = useInstanced(sphereGeo, oilMat, oilPos.length);
  const sandIM = useInstanced(sphereGeo, sandMat, 200);
  const upIM = useInstanced(sphereGeo, upMat, 60);

  // --- capas
  const vmTopNow = VM_BOT + (VM_TOP - VM_BOT) * vmK;
  const over = LAYERS.slice(3);
  let topNow = vmTopNow;
  const layerMeshes = LAYERS.map((L, i) => {
    let y0 = L.y0, y1 = L.y1;
    if (L.id === 'vm') y1 = vmTopNow;
    if (i >= 3) {
      const k = easeOut(clamp(build * over.length - (i - 3)));
      if (k <= 0.001) return null;
      y1 = y0 + (L.y1 - L.y0) * k;
      topNow = Math.max(topNow, y1);
    }
    const h = y1 - y0;
    if (h <= 0.002) return null;
    let color = L.c;
    let e = '#000', ei = 0;
    if (L.id === 'vm') {
      color = lerpHex('#5B5246', L.c, rock);
      e = '#FF8A1F';
      ei = glow * 0.3 + heat * 0.18;
    } else if (i <= 1) {
      e = '#FF4A1A';
      ei = heat * (i === 0 ? 0.55 : 0.3);
    }
    const tex = strataTex(i + 1, color, L.lam);
    return (
      <mesh key={L.id} position={[0, (y0 + y1) / 2 - press * 0.04 * (3 - Math.min(i, 3)), 0]} receiveShadow castShadow>
        <boxGeometry args={[BX * 2, h, BZ * 2]} />
        <meshStandardMaterial map={tex} color="#ffffff" roughness={0.92} emissive={e} emissiveIntensity={ei} />
      </mesh>
    );
  });

  // --- plancton (en el agua, cae al fondo)
  const seaBot = vmTopNow, seaH = SEA_TOP - seaBot;
  plankPos.forEach((q, i) => {
    const vis = plank * (rnd(i + 0.5) < plank * 1.2 ? 1 : 0);
    const fk = easeIn(clamp(fall * 1.8 - rnd(i * 7) * 0.8));
    const y = mix(seaBot + 0.15 + q[1] * (seaH - 0.3), seaBot + 0.02, fk) + Math.sin(t * 0.8 + i) * 0.04 * (1 - fk);
    const x = q[0] + Math.sin(t * 0.5 + i * 1.7) * 0.08 * (1 - fk);
    setInst(plankIM, i, [x, y, q[2]], vis > 0 && sea > 0.02 ? 0.03 + rnd(i) * 0.025 : 0);
  });
  plankIM.instanceMatrix.needsUpdate = true;
  plankMat.opacity = 0.9 * clamp(sea * 1.5);

  // --- gotas de petróleo dentro de Vaca Muerta (y su viaje al pozo)
  const latY = VM_MID;
  oilPos.forEach((q, i) => {
    const a = clamp(oil * 1.6 - rnd(i * 9) * 0.6);
    let x = q[0], y = VM_BOT + 0.06 + q[1] * (vmTopNow - VM_BOT - 0.12), z = q[2];
    const inReach = q[2] > BZ - 0.1 && x > WX + BEND - 0.2 && x < LAT_END + 0.4;
    if (flow > 0 && inReach) {
      const fk = easeInOut(clamp(flow * 2 - rnd(i * 13) * 1.0));
      y = mix(y, latY, fk);
      if (fk >= 0.999) {
        setInst(oilIM, i, [x, y, z], 0);
        return;
      }
    }
    const sc = a * (0.045 + rnd(i * 3) * 0.05) * (vmK > 0.6 ? 1 : 0);
    setInst(oilIM, i, [x, y, z], sc);
  });
  oilIM.instanceMatrix.needsUpdate = true;

  // --- arena en las fracturas
  for (let i = 0; i < 200; i++) {
    const st = i % 5;
    const sk = clamp(frac * 5 - st);
    const hh = 0.42 * easeOut(sk);
    const y = VM_MID + (rnd(i * 17) - 0.5) * 2 * hh * 0.9;
    const x = FRAC_X[st] + (rnd(i * 19) - 0.5) * 0.09;
    setInst(sandIM, i, [x, y, BZ + 0.035], sk > 0.3 ? 0.012 + rnd(i) * 0.01 : 0);
  }
  sandIM.instanceMatrix.needsUpdate = true;

  // --- petróleo subiendo por el pozo
  const yBend = VM_MID + BEND;
  for (let i = 0; i < 60; i++) {
    if (flow <= 0.05) {
      setInst(upIM, i, [0, 0, 0], 0);
      continue;
    }
    const ph = (t * 0.55 + i / 60) % 1;
    let p: V3;
    const tot = LAT_LEN + (Math.PI / 2) * BEND + (0.15 - yBend);
    let d = ph * tot;
    if (d < LAT_LEN) p = [LAT_END - d, latY, BZ + 0.05];
    else if (d < LAT_LEN + (Math.PI / 2) * BEND) {
      const a = (d - LAT_LEN) / BEND;
      p = [WX + BEND - BEND * Math.sin(a), latY + BEND - BEND * Math.cos(a), BZ + 0.05];
    } else p = [WX, yBend + (d - LAT_LEN - (Math.PI / 2) * BEND), BZ + 0.05];
    setInst(upIM, i, p, 0.045 * clamp(flow * 2));
  }
  upIM.instanceMatrix.needsUpdate = true;

  // --- pozo
  const pts = wellPath(clamp(well), clamp(lat));
  const tubeGeo = useMemo(() => (pts.length > 1 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.01), Math.max(8, pts.length * 2), 0.065, 10, false) : null), [well, lat]);
  const tip = pts[pts.length - 1];
  const drilling = well > 0 && (well < 1 || (lat > 0 && lat < 1));

  // --- superficie
  const surfTop = topNow;
  const showSurf = build >= 0.999 ? surface : 0;
  return (
    <group>
      {layerMeshes}
      {/* resaltado de Vaca Muerta: bordes que brillan en la cara del corte */}
      {glow > 0.01 && vmK > 0.5 ? (
        <>
          {[VM_BOT, vmTopNow].map((y, i) => (
            <mesh key={i} position={[0, y, BZ + 0.012]}>
              <planeGeometry args={[BX * 2, 0.035]} />
              <meshBasicMaterial color="#FFB547" toneMapped={false} transparent opacity={glow} />
            </mesh>
          ))}
        </>
      ) : null}
      {/* mar jurásico */}
      {sea > 0.01 ? (
        <group>
          <mesh position={[0, (seaBot + SEA_TOP) / 2, 0]}>
            <boxGeometry args={[BX * 2, SEA_TOP - seaBot, BZ * 2]} />
            <meshStandardMaterial color="#1D6E8C" transparent opacity={0.36 * sea} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, SEA_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[BX * 2, BZ * 2, 1, 1]} />
            <meshStandardMaterial color="#5FB8D6" transparent opacity={0.3 * sea} roughness={0.05} metalness={0.2} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
      <primitive object={plankIM} />
      <primitive object={oilIM} />
      <primitive object={sandIM} />
      <primitive object={upIM} />
      {/* el "lago subterráneo" que no existe */}
      {lake > 0.01 ? (
        <mesh position={[1.6, -3.9, BZ - 0.02]} scale={[1.9 * lake, 0.55 * lake, 0.6 * lake]}>
          <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI]} />
          <meshStandardMaterial color="#070605" roughness={0.08} metalness={0.4} emissive="#3A2406" emissiveIntensity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      {/* fracturas */}
      {FRAC_X.map((x, i) => {
        const sk = clamp(frac * 5 - i);
        if (sk <= 0.01) return null;
        const h = 0.5 * easeOut(sk);
        const hot = clamp(flow * 2);
        return (
          <mesh key={i} position={[x, VM_MID, BZ + 0.03]} scale={[1, h / 0.5, 1]}>
            <shapeGeometry args={[crackShape(i * 31, 0.5)]} />
            <meshBasicMaterial color={lerpHex('#8FE3FF', '#FFB547', hot)} toneMapped={false} transparent opacity={0.9} />
          </mesh>
        );
      })}
      {/* caño */}
      {tubeGeo ? (
        <mesh geometry={tubeGeo}>
          <meshStandardMaterial color="#D5DAE0" metalness={0.75} roughness={0.25} emissive={flow > 0 ? '#FF9A2E' : '#203040'} emissiveIntensity={flow > 0 ? 0.35 * clamp(flow * 2) : 0.2} />
        </mesh>
      ) : null}
      {drilling && tip ? (
        <mesh position={[tip.x, tip.y, tip.z]}>
          <sphereGeometry args={[0.13 + 0.03 * Math.sin(t * 30), 16, 12]} />
          <meshBasicMaterial color="#FFB547" toneMapped={false} />
        </mesh>
      ) : null}
      {/* superficie: desierto con equipos */}
      {showSurf > 0.01 ? (
        <group>
          <mesh position={[0, surfTop + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[BX * 2, BZ * 2]} />
            <meshStandardMaterial map={sandTex()} roughness={0.95} transparent opacity={showSurf} />
          </mesh>
          <group scale={[1, showSurf, 1]} position={[0, surfTop, 0]}>
            <Rig p={[WX, 0, BZ - 0.55]} night={night} t={t} />
            <group scale={[0.55, 0.55, 0.55]} position={[WX + 1.5, 0, BZ - 1.2]}>
              <FracTruck p={[0, 0, 0]} ry={0.2} />
              <FracTruck p={[0.1, 0, -0.6]} ry={0.1} />
              <FracTruck p={[-0.1, 0, -1.2]} ry={0.3} />
              <FracTruck p={[0.05, 0, -1.8]} ry={0.15} />
            </group>
            <PumpJack p={[2.6, 0, -1.6]} t={t} s={0.9} ry={0.4} />
            <PumpJack p={[4.8, 0, 0.6]} t={t} s={0.9} ry={-0.3} ph={1.3} />
            <PumpJack p={[0.4, 0, -2.2]} t={t} s={0.8} ry={1.2} ph={2.1} />
            <PumpJack p={[5.6, 0, -2.0]} t={t} s={0.8} ry={0.9} ph={0.7} />
            <Box p={[3.4, 0.12, 1.9]} s={[0.5, 0.24, 0.5]} c="#C8C3B8" />
            <mesh position={[3.4, 0.45, 1.3]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.9, 20]} />
              <M c="#DCD8CF" r={0.45} m={0.2} />
            </mesh>
            <mesh position={[4.2, 0.45, 1.3]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.9, 20]} />
              <M c="#DCD8CF" r={0.45} m={0.2} />
            </mesh>
          </group>
        </group>
      ) : null}
    </group>
  );
};

/* =====================================================================================
   MAPA 3D: provincias extruidas (Natural Earth), área de Vaca Muerta, oleoducto
   1 unidad = 20 km.
   ===================================================================================== */
const LON0 = -67.5, LAT0 = -38.8;
const KX = (Math.cos((38.8 * Math.PI) / 180) * 111.32) / 20, KY = 110.57 / 20;
export const geoXZ = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX, -(lat - LAT0) * KY];
export const geo3 = (lon: number, lat: number, y = 0): V3 => {
  const [x, z] = geoXZ(lon, lat);
  return [x, y, z];
};
const ringShape = (ring: number[][], dx = 0, dz = 0) => {
  const s = new THREE.Shape();
  ring.forEach(([lon, lat], i) => {
    const [x, z] = geoXZ(lon, lat);
    if (i) s.lineTo(x + dx, -(z + dz));
    else s.moveTo(x + dx, -(z + dz));
  });
  return s;
};
const EXGEO: Record<string, THREE.ExtrudeGeometry> = {};
const extrude = (key: string, rings: number[][][], depth: number, dx = 0, dz = 0) =>
  (EXGEO[key + depth + dx + dz] ??= new THREE.ExtrudeGeometry(rings.map((r) => ringShape(r, dx, dz)), {depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 1}));
const LINEGEO: Record<string, THREE.BufferGeometry> = {};
const outline = (key: string, rings: number[][][], y: number, dx = 0, dz = 0) =>
  (LINEGEO[key + y + dx + dz] ??= new THREE.BufferGeometry().setFromPoints(
    rings.flatMap((r) =>
      r.slice(1).flatMap((c, i) => {
        const [x0, z0] = geoXZ(r[i][0], r[i][1]);
        const [x1, z1] = geoXZ(c[0], c[1]);
        return [new THREE.Vector3(x0 + dx, y, z0 + dz), new THREE.Vector3(x1 + dx, y, z1 + dz)];
      }),
    ),
  ));

const PROVS = provincias as Record<string, number[][][]>;
export const VM_AREA: number[][] = [
  [-69.55, -36.65], [-69.04, -36.43], [-68.53, -36.94], [-68.23, -37.53], [-68.09, -38.12], [-68.31, -38.63], [-68.82, -38.92], [-69.4, -38.77], [-69.77, -38.26], [-69.84, -37.53], [-69.55, -36.65],
];
const CHILE: number[][][] = (() => {
  const f = (countries as any).features.find((x: any) => x.properties.a3 === 'CHL');
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  return polys.map((p: number[][][]) => p[0]).filter((r: number[][]) => r.length > 30);
})();

export const PLACES: Record<string, [number, number]> = {
  anelo: [-68.79, -38.35],
  neuquen: [-68.06, -38.95],
  allen: [-67.83, -38.98],
  puntaColorada: [-65.03, -41.7],
  tucuman: [-65.22, -26.83],
};
export const VMOS: [number, number][] = [
  [-68.79, -38.35], [-68.3, -38.72], [-67.83, -38.98], [-67.3, -39.4], [-66.85, -39.85], [-66.4, -40.35], [-66.05, -40.8], [-65.6, -41.25], [-65.25, -41.55], [-65.03, -41.7],
];

const inPoly = (x: number, y: number, poly: number[][]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** 4.700 pozos dentro del área (más densos hacia el este, el núcleo de Añelo) */
const WELLS: V3[] = (() => {
  const out: V3[] = [];
  let i = 0;
  while (out.length < 4700 && i < 200000) {
    i++;
    const lon = -69.9 + rnd(i * 2.1) * 1.85, lat = -39.0 + rnd(i * 3.7) * 2.6;
    if (!inPoly(lon, lat, VM_AREA)) continue;
    const east = clamp((lon + 69.6) / 1.4);
    if (rnd(i * 5.3) > 0.18 + 0.82 * east * east) continue;
    out.push(geo3(lon, lat, 0));
  }
  return out;
})();
const lowGeo = new THREE.SphereGeometry(1, 6, 4);
const wellMat = new THREE.MeshBasicMaterial({color: '#FFC266', toneMapped: false});

export type MapState = {
  t: number;
  focus?: Record<string, {c: string; lift?: number}>;
  dim?: number; // oscurecer el resto del país
  vm?: number; // área de Vaca Muerta
  tuc?: number; // Tucumán llega para comparar (0→1)
  wells?: number; // 0→1 de los 4.700 pozos
  pipe?: number; // 0→1 trazado del oleoducto
  flow?: number; // petróleo circulando
  thick?: number; // grosor del caño (capacidad)
  ships?: number; // barcos en Punta Colorada
  chile?: number;
};
const flowMat = new THREE.MeshBasicMaterial({color: '#FFB547', toneMapped: false});
const pipeCurve = new THREE.CatmullRomCurve3(VMOS.map(([lon, lat]) => new THREE.Vector3(...geo3(lon, lat, 0.62))), false, 'catmullrom', 0.2);
const TUC_TARGET: [number, number] = [-66.55, -37.2];

export const ProvMap: React.FC<{s: MapState}> = ({s}) => {
  const {t} = s;
  const focus = s.focus ?? {}, dim = s.dim ?? 0, vm = s.vm ?? 0, tuc = s.tuc ?? 0, wells = s.wells ?? 0, pipe = s.pipe ?? 0, flow = s.flow ?? 0, thick = s.thick ?? 0.25, ships = s.ships ?? 0, chile = s.chile ?? 1;
  const wellIM = useInstanced(lowGeo, wellMat, WELLS.length);
  const nW = Math.round(wells * WELLS.length);
  WELLS.forEach((p, i) => setInst(wellIM, i, [p[0], 0.58 + 0.02 * Math.sin(t * 3 + i), p[2]], i < nW ? 0.05 : 0));
  wellIM.instanceMatrix.needsUpdate = true;
  const flowIM = useInstanced(lowGeo, flowMat, 90);
  for (let i = 0; i < 90; i++) {
    const u = (i / 90 + t * 0.06) % 1;
    const vis = flow > 0 && u <= pipe;
    const p = pipeCurve.getPointAt(Math.min(0.999, u));
    setInst(flowIM, i, [p.x, p.y + 0.05, p.z], vis ? 0.2 + thick * 0.3 : 0);
  }
  flowIM.instanceMatrix.needsUpdate = true;
  const tube = useMemo(() => {
    if (pipe <= 0.005) return null;
    const pts = pipeCurve.getSpacedPoints(160).slice(0, Math.max(2, Math.round(160 * pipe) + 1));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 2), 0.16 + thick * 0.3, 12, false);
  }, [Math.round(pipe * 400), Math.round(thick * 50)]);
  // Tucumán: misma escala, viaja desde su lugar real hasta al lado del área
  const [tx0, tz0] = geoXZ(...PLACES.tucuman), [tx1, tz1] = geoXZ(...TUC_TARGET);
  const tk = easeInOut(clamp(tuc));
  const tdx = mix(0, tx1 - tx0, tk), tdz = mix(0, tz1 - tz0, tk), ty = Math.sin(tk * Math.PI) * 3.5;
  return (
    <group>
      {/* mar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#0E2433" roughness={0.55} />
      </mesh>
      {chile > 0.01
        ? CHILE.map((r, i) => (
            <mesh key={'cl' + i} geometry={extrude('chl' + i, [r], 0.12)} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <meshStandardMaterial color="#151A1F" roughness={0.9} />
            </mesh>
          ))
        : null}
      {Object.entries(PROVS).map(([name, rings]) => {
        const f = focus[name];
        const lift = f?.lift ?? 0;
        const depth = 0.22 + lift;
        const col = f ? f.c : lerpHex('#2C3A47', '#1B242C', dim);
        return (
          <group key={name}>
            <mesh geometry={extrude(name, rings, 0.22)} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, depth / 0.22]} castShadow receiveShadow>
              <meshStandardMaterial color={col} roughness={0.85} metalness={0.05} />
            </mesh>
            <lineSegments geometry={outline(name, rings, 0)} position={[0, depth + 0.05, 0]}>
              <lineBasicMaterial color={f ? '#FFFFFF' : '#8FA3B5'} transparent opacity={f ? 0.9 : 0.6 * (1 - dim * 0.5)} />
            </lineSegments>
          </group>
        );
      })}
      {/* Vaca Muerta */}
      {vm > 0.01 ? (
        <group position={[0, 0.5 + 0.25 * (1 - easeOut(vm)), 0]}>
          <mesh geometry={extrude('vmA', [VM_AREA], 0.03)} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#F2A23A" emissive="#FF8A1F" emissiveIntensity={0.4} transparent opacity={0.62 * vm} roughness={0.5} depthWrite={false} />
          </mesh>
          <lineSegments geometry={outline('vmA', [VM_AREA], 0.09)}>
            <lineBasicMaterial color="#FFE2A8" transparent opacity={vm} />
          </lineSegments>
        </group>
      ) : null}
      {/* Tucumán a escala */}
      {tuc > 0.01 ? (
        <group position={[tdx, ty, tdz]}>
          <mesh geometry={extrude('tucX', PROVS['Tucumán'], 0.5)} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color="#74ACDF" emissive="#3B7FC4" emissiveIntensity={0.35} roughness={0.6} />
          </mesh>
        </group>
      ) : null}
      <primitive object={wellIM} />
      {tube ? (
        <mesh geometry={tube} castShadow>
          <meshStandardMaterial color="#F2C27A" metalness={0.5} roughness={0.3} emissive="#FF9A2E" emissiveIntensity={0.7 + 0.5 * flow} />
        </mesh>
      ) : null}
      <primitive object={flowIM} />
      {ships > 0.01
        ? [0, 1, 2].map((i) => {
            const [x, z] = geoXZ(-64.55 + i * 0.45, -41.9 - i * 0.22);
            const k = easeOut(clamp(ships * 3 - i));
            return <Ship key={i} p={[x + (1 - k) * 4, 0.02, z + (1 - k) * 2]} ry={-0.6} s={1.5 * k} />;
          })
        : null}
    </group>
  );
};

export const Ship: React.FC<{p: V3; ry?: number; s?: number}> = ({p, ry = 0, s = 1}) =>
  s <= 0.01 ? null : (
    <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
      <Box p={[0, 0.12, 0]} s={[2.4, 0.26, 0.5]} c="#7A1F1A" r={0.6} />
      <Box p={[0, 0.27, 0]} s={[2.3, 0.05, 0.46]} c="#2E3A40" r={0.6} />
      <Box p={[-0.95, 0.42, 0]} s={[0.3, 0.32, 0.4]} c="#F2EEE6" r={0.5} />
      <Box p={[1.25, 0.14, 0]} s={[0.3, 0.24, 0.32]} c="#7A1F1A" r={0.6} rot={[0, Math.PI / 4, 0]} />
    </group>
  );

/* =====================================================================================
   BARRILES
   ===================================================================================== */
const barrelGeo = (() => {
  const pts: THREE.Vector2[] = [];
  const H = 1.2, R = 0.42;
  pts.push(new THREE.Vector2(0, 0));
  for (let i = 0; i <= 16; i++) {
    const y = (i / 16) * H;
    const bulge = Math.sin((i / 16) * Math.PI) * 0.03;
    const rib = [H / 3, (2 * H) / 3].some((r) => Math.abs(y - r) < 0.04) ? 0.02 : 0;
    pts.push(new THREE.Vector2(R + bulge + rib, y));
  }
  pts.push(new THREE.Vector2(R - 0.03, H));
  pts.push(new THREE.Vector2(0, H - 0.02));
  const g = new THREE.LatheGeometry(pts, 20);
  g.computeVertexNormals();
  return g;
})();
export const BARREL_H = 1.2, BARREL_STEP = 0.9;
const barrelMat = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.32, metalness: 0.55});
const ghostMat = new THREE.MeshStandardMaterial({color: '#E5383B', roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.22, depthWrite: false, emissive: '#E5383B', emissiveIntensity: 0.4});

export type BarrelItem = {pos: V3; color: string; s?: number; rot?: V3};
/** pila de barriles: cols×rows por piso; n barriles; p = progreso de armado */
export const towerItems = (n: number, base: V3, p: number, color: string, cols = 2, rows = 2, t0 = 0): BarrelItem[] => {
  const out: BarrelItem[] = [];
  const per = cols * rows;
  const shown = p * n;
  for (let i = 0; i < Math.ceil(n); i++) {
    const a = clamp(shown - i);
    if (a <= 0) break;
    const layer = Math.floor(i / per), q = i % per;
    const x = (q % cols - (cols - 1) / 2) * BARREL_STEP, z = (Math.floor(q / cols) - (rows - 1) / 2) * BARREL_STEP;
    const frac = Math.min(1, n - i); // último barril parcial
    const fall = (1 - easeOut(a)) * 3;
    out.push({pos: [base[0] + x, base[1] + layer * (BARREL_H + 0.02) + fall, base[2] + z], color, s: frac < 1 ? 1 : 1, rot: [0, rnd(i + t0) * 6, 0]});
  }
  return out;
};
export const Barrels: React.FC<{items: BarrelItem[]; max?: number; ghost?: boolean}> = ({items, max = 4000, ghost}) => {
  const im = useInstanced(barrelGeo, ghost ? ghostMat : barrelMat, max);
  im.castShadow = !ghost;
  im.receiveShadow = !ghost;
  im.count = Math.min(items.length, max);
  for (let i = 0; i < im.count; i++) {
    const it = items[i];
    setInst(im, i, it.pos, it.s ?? 1, it.rot);
    im.setColorAt(i, tc.set(it.color));
  }
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  return <primitive object={im} />;
};

/* =====================================================================================
   LITRO DE NAFTA: vaso con combustible; la franja de arriba son los impuestos
   ===================================================================================== */
export const LiterGlass: React.FC<{fill: number; tax: number; pos?: V3; t: number}> = ({fill, tax, pos = [0, 0, 0], t}) => {
  const H = 3.4, R = 1.05;
  const h = H * 0.92 * clamp(fill);
  const hTax = h * 0.36 * clamp(tax);
  return (
    <group position={pos}>
      <mesh position={[0, (h - hTax) / 2 + 0.04, 0]}>
        <cylinderGeometry args={[R - 0.05, R - 0.05, Math.max(0.001, h - hTax), 48]} />
        <meshStandardMaterial color="#F2A93B" emissive="#C46A10" emissiveIntensity={0.45} roughness={0.15} metalness={0.1} transparent opacity={0.92} />
      </mesh>
      {hTax > 0.01 ? (
        <mesh position={[0, h - hTax / 2 + 0.04, 0]}>
          <cylinderGeometry args={[R - 0.05, R - 0.05, hTax, 48]} />
          <meshStandardMaterial color="#E5383B" emissive="#A3161B" emissiveIntensity={0.5} roughness={0.2} transparent opacity={0.94} />
        </mesh>
      ) : null}
      <mesh position={[0, h + 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R - 0.05, 48]} />
        <meshStandardMaterial color={tax > 0.5 ? '#FF6B6B' : '#FFC766'} emissive={tax > 0.5 ? '#E5383B' : '#FF9A2E'} emissiveIntensity={0.4 + 0.1 * Math.sin(t * 3)} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, H / 2, 0]}>
        <cylinderGeometry args={[R, R, H, 48, 1, true]} />
        <meshStandardMaterial color="#DDEBF5" transparent opacity={0.2} roughness={0.05} metalness={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[R, R, 0.04, 48]} />
        <meshStandardMaterial color="#DDEBF5" transparent opacity={0.35} roughness={0.1} />
      </mesh>
    </group>
  );
};
