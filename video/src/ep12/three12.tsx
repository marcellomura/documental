/* Escenas 3D del episodio 12 (ARA San Juan): el submarino TR-1700 modelado por partes (casco de revolución, vela,
   timones en cruz, hélice de 7 palas) con vista de rayos X (baterías de proa y popa, motores, conducto del snorkel),
   el agua profunda (luz que se apaga con la profundidad, rayos de luz, nieve marina), el fondo del Mar Argentino
   con batimetría real (SRTM15+, NOAA/Scripps), el robot con cámara, los vehículos autónomos y los restos. */
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import region from '../data/ep12/bati_region.json';
import local from '../data/ep12/bati_local.json';
import type {Cam, V3} from '../ep06/three6';
export {project, camPath, lerpCam} from '../ep06/three6';
export type {Cam, V3} from '../ep06/three6';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const col = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(k));

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: Cam; aspect?: number}> = ({cam, aspect = 1920 / 1080}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 35;
  c.aspect = aspect;
  c.near = 0.05;
  c.far = 600;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  return null;
};
export const Stage12: React.FC<{cam: Cam; bg?: string; fog?: [string, number]; exposure?: number; children: React.ReactNode; style?: React.CSSProperties; w?: number; h?: number}> = ({cam, bg, fog, exposure = 1, children, style, w = 1920, h = 1080}) => (
  <ThreeCanvas width={w} height={h} gl={{antialias: true, alpha: !bg, toneMappingExposure: exposure, preserveDrawingBuffer: true}} style={{position: 'absolute', left: 0, top: 0, ...style}}>
    <Rig cam={cam} aspect={w / h} />
    {bg ? <color attach="background" args={[bg]} /> : null}
    {fog ? <fogExp2 attach="fog" args={fog} /> : null}
    {children}
  </ThreeCanvas>
);

/* ------------------------------------------------------------------ texturas */
const TEX: Record<string, THREE.Texture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  TEX[key] = tx;
  return tx;
};
/** degradé vertical para conos de luz (opaco arriba, transparente abajo) */
const rayTex = () =>
  canvasTex('ray', 64, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(190,240,255,0.9)');
    gr.addColorStop(0.5, 'rgba(120,210,255,0.25)');
    gr.addColorStop(1, 'rgba(80,180,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 256);
  });
const glowTex = () =>
  canvasTex('glow', 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });

/* ================================================================== SUBMARINO TR-1700 */
export const SUB_L = 6.6; // 66 m → 1 unidad = 10 m
export const SUB_R = 0.37;
const hullProfile = (crushed = 0): THREE.Vector2[] => {
  const pts: THREE.Vector2[] = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const y = -SUB_L / 2 + (SUB_L * i) / N;
    let r: number;
    if (y < -1.5) {
      const s = (y + SUB_L / 2) / (SUB_L / 2 - 1.5); // 0 en la punta de popa → 1
      r = SUB_R * Math.pow(Math.sin((Math.PI / 2) * s), 0.75) * 0.94 + 0.03;
    } else if (y > 2.55) {
      const s = (y - 2.55) / (SUB_L / 2 - 2.55);
      r = SUB_R * Math.sqrt(Math.max(0, 1 - s * s));
    } else r = SUB_R;
    pts.push(new THREE.Vector2(Math.max(0.001, r * (1 - crushed)), y));
  }
  return pts;
};
let HULL_GEO: THREE.LatheGeometry | null = null;
const hullGeo = () => (HULL_GEO ??= new THREE.LatheGeometry(hullProfile(), 64));
let SAIL_GEO: THREE.BufferGeometry | null = null;
const sailGeo = () => (SAIL_GEO ??= new RoundedBoxGeometry(0.95, 0.62, 0.2, 4, 0.08));

export type SubState = {
  xray?: number; // 0 sólido · 1 rayos X
  snorkel?: number; // 0..1 mástil del snorkel arriba
  peri?: number; // periscopio
  prop?: number; // ángulo de la hélice
  bow?: 'ok' | 'fault' | 'off'; // baterías de proa
  stern?: 'ok' | 'use' | 'off';
  batt?: number; // 0..1 aparición de las celdas
  water?: number; // 0..1 agua que entra por el conducto
  sparks?: number; // chispas en proa
  t?: number;
  charge?: number; // 1 llena → 0 vacía (brillo de las celdas)
  air?: number; // flujo de aire por el snorkel hacia los motores
  engines?: number;
};

const CELLS_BOW = (() => {
  const a: V3[] = [];
  for (let i = 0; i < 14; i++) for (let j = 0; j < 6; j++) for (let k = 0; k < 2; k++) a.push([1.45 + i * 0.075, -0.24 + k * 0.1, -0.2 + j * 0.08]);
  return a;
})();
const CELLS_STERN = (() => {
  const a: V3[] = [];
  for (let i = 0; i < 14; i++) for (let j = 0; j < 6; j++) for (let k = 0; k < 2; k++) a.push([-0.55 + i * 0.075, -0.24 + k * 0.1, -0.2 + j * 0.08]);
  return a;
})();
const _m = new THREE.Matrix4();
const Cells: React.FC<{pos: V3[]; color: string; emissive: string; e: number; appear: number}> = ({pos, color, emissive, e, appear}) => {
  const n = Math.round(pos.length * clamp(appear));
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(0.062, 0.085, 0.066), new THREE.MeshStandardMaterial(), pos.length), [pos]);
  for (let i = 0; i < pos.length; i++) {
    _m.makeTranslation(...pos[i]);
    if (i >= n) _m.scale(new THREE.Vector3(0, 0, 0));
    mesh.setMatrixAt(i, _m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  const mat = mesh.material as THREE.MeshStandardMaterial;
  mat.color.set(color);
  mat.emissive.set(emissive);
  mat.emissiveIntensity = e;
  mat.roughness = 0.5;
  return <primitive object={mesh} />;
};

/** conducto del snorkel/ventilación: del cabezal del mástil a la batería de proa */
export const DUCT = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.62, SUB_R + 1.25, 0),
  new THREE.Vector3(0.62, SUB_R + 0.5, 0),
  new THREE.Vector3(0.62, SUB_R - 0.05, 0),
  new THREE.Vector3(0.9, 0.12, 0),
  new THREE.Vector3(1.4, 0.05, 0),
  new THREE.Vector3(1.85, -0.08, 0),
]);
export const VALVE_POS: V3 = [0.62, SUB_R + 0.02, 0];
export const BOW_BATT_POS: V3 = [1.95, -0.19, 0];
export const STERN_BATT_POS: V3 = [-0.05, -0.19, 0];

export const Submarine: React.FC<{s: SubState; pos?: V3; rot?: V3; scale?: number}> = ({s, pos = [0, 0, 0], rot = [0, 0, 0], scale = 1}) => {
  const xr = s.xray ?? 0;
  const t = s.t ?? 0;
  const hullMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#1A2228', roughness: 0.62, metalness: 0.35}), []);
  hullMat.transparent = xr > 0.01;
  hullMat.opacity = mix(1, 0.1, xr);
  hullMat.depthWrite = xr < 0.5;
  hullMat.color.set(xr > 0 ? col('#1A2228', '#4FD0FF', xr) : '#1A2228');
  hullMat.emissive.set('#0B4A66');
  hullMat.emissiveIntensity = xr * 0.6;
  const ductGeo = useMemo(() => new THREE.TubeGeometry(DUCT, 60, 0.035, 10, false), []);
  const lines = useMemo(() => {
    // líneas de "plano técnico": cuadernas cada 40 cm y tres generatrices
    const g = new THREE.BufferGeometry();
    const v: number[] = [];
    const prof = hullProfile();
    const rAt = (x: number) => {
      const y = x;
      let best = prof[0];
      for (const p of prof) if (Math.abs(p.y - y) < Math.abs(best.y - y)) best = p;
      return best.x;
    };
    for (let x = -3.0; x <= 3.1; x += 0.4) {
      const r = rAt(x);
      for (let i = 0; i < 48; i++) {
        const a0 = (i / 48) * Math.PI * 2, a1 = ((i + 1) / 48) * Math.PI * 2;
        v.push(x, Math.cos(a0) * r, Math.sin(a0) * r, x, Math.cos(a1) * r, Math.sin(a1) * r);
      }
    }
    for (const a of [Math.PI / 2, 0, Math.PI, -Math.PI / 2]) {
      for (let x = -3.3; x < 3.28; x += 0.05) {
        const r0 = rAt(x), r1 = rAt(x + 0.05);
        v.push(x, Math.cos(a) * r0, Math.sin(a) * r0, x + 0.05, Math.cos(a) * r1, Math.sin(a) * r1);
      }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return g;
  }, []);
  const snork = s.snorkel ?? 0;
  const bowCol = s.bow === 'fault' ? '#FF4B3A' : s.bow === 'off' ? '#3A444C' : '#56D8FF';
  const sternCol = s.stern === 'off' ? '#3A444C' : s.stern === 'use' ? '#3DFFB2' : '#56D8FF';
  const charge = s.charge ?? 1;
  const flick = s.bow === 'fault' ? 0.6 + 0.8 * rnd(Math.floor(t * 18)) : 1;
  const waterN = 26;
  return (
    <group position={pos} rotation={rot} scale={scale}>
      {/* casco */}
      <mesh geometry={hullGeo()} material={hullMat} rotation={[0, 0, -Math.PI / 2]} castShadow />
      {xr > 0.02 ? (
        <lineSegments geometry={lines}>
          <lineBasicMaterial color="#7FE3FF" transparent opacity={0.55 * xr} />
        </lineSegments>
      ) : null}
      {/* vela y timones de vela */}
      <mesh geometry={sailGeo()} material={hullMat} position={[0.85, SUB_R + 0.25, 0]} />
      <mesh material={hullMat} position={[1.05, SUB_R + 0.4, 0]}>
        <boxGeometry args={[0.26, 0.025, 0.62]} />
      </mesh>
      {/* mástiles: periscopio y snorkel */}
      <mesh material={hullMat} position={[0.98, SUB_R + 0.55 + 0.25 * (s.peri ?? 0), 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 10]} />
      </mesh>
      <group position={[0.62, SUB_R + 0.5 + 0.75 * snork, 0]}>
        <mesh material={hullMat}>
          <cylinderGeometry args={[0.04, 0.045, 0.9, 12]} />
        </mesh>
        <mesh material={hullMat} position={[0, 0.48, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.1]} />
        </mesh>
      </group>
      {/* timones en cruz y hélice */}
      {[0, Math.PI / 2].map((a, i) => (
        <mesh key={i} material={hullMat} position={[-2.75, 0, 0]} rotation={[a, 0, 0]}>
          <boxGeometry args={[0.5, 0.025, 1.0]} />
        </mesh>
      ))}
      <group position={[-3.33, 0, 0]} rotation={[(s.prop ?? 0), 0, 0]}>
        <mesh material={hullMat} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.07, 0.12, 12]} />
        </mesh>
        {Array.from({length: 7}, (_, i) => (
          <mesh key={i} material={hullMat} rotation={[(i / 7) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.42, 0.09]} />
          </mesh>
        ))}
      </group>
      {/* interior (solo con rayos X) */}
      {xr > 0.05 ? (
        <group>
          <Cells pos={CELLS_BOW} color={bowCol} emissive={bowCol} e={(s.bow === 'off' ? 0.05 : 0.9 * charge) * flick * xr} appear={s.batt ?? 1} />
          <Cells pos={CELLS_STERN} color={sternCol} emissive={sternCol} e={(s.stern === 'off' ? 0.05 : 0.9 * charge) * xr} appear={s.batt ?? 1} />
          {/* motores diésel y motor eléctrico */}
          {[-1.55, -1.25, -0.95].map((x, i) => (
            <mesh key={i} position={[x, -0.12, 0]}>
              <boxGeometry args={[0.22, 0.24, 0.3]} />
              <meshStandardMaterial color="#FFB547" emissive="#FFB547" emissiveIntensity={(0.15 + 0.85 * (s.engines ?? 0)) * xr} transparent opacity={0.9 * xr} />
            </mesh>
          ))}
          <mesh position={[-2.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.36, 20]} />
            <meshStandardMaterial color="#9FB4C2" emissive="#56D8FF" emissiveIntensity={0.3 * xr} transparent opacity={0.85 * xr} />
          </mesh>
          {/* conducto */}
          <mesh geometry={ductGeo}>
            <meshStandardMaterial color="#BFE9FF" emissive="#56D8FF" emissiveIntensity={0.4 * xr} transparent opacity={0.5 * xr} />
          </mesh>
          {/* agua que baja por el conducto */}
          {(s.water ?? 0) > 0
            ? Array.from({length: waterN}, (_, i) => {
                const u = (((t * 0.55 + i / waterN) % 1) + 1) % 1;
                if (u > (s.water ?? 0)) return null;
                const p = DUCT.getPointAt(u);
                return (
                  <mesh key={i} position={[p.x, p.y, p.z + Math.sin(i * 3.1) * 0.015]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color="#2EA8FF" />
                  </mesh>
                );
              })
            : null}
          {/* aire hacia los motores */}
          {(s.air ?? 0) > 0
            ? Array.from({length: 16}, (_, i) => {
                const u = (((t * 0.7 + i / 16) % 1) + 1) % 1;
                const p = DUCT.getPointAt(clamp(u * 0.45));
                const q: V3 = u < 0.45 ? [p.x, p.y, p.z] : [mix(0.62, -1.25, (u - 0.45) / 0.55), mix(SUB_R - 0.05, 0.0, (u - 0.45) / 0.55), 0];
                return (
                  <mesh key={i} position={q}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8 * (s.air ?? 0)} />
                  </mesh>
                );
              })
            : null}
          {/* chispas */}
          {(s.sparks ?? 0) > 0 ? (
            <group position={BOW_BATT_POS}>
              <pointLight color="#FF6A3A" intensity={6 * (s.sparks ?? 0) * flick} distance={3} />
              {Array.from({length: 18}, (_, i) => {
                const ph = (t * 2.2 + rnd(i)) % 1;
                return (
                  <mesh key={i} position={[(rnd(i + 3) - 0.5) * 0.5 + ph * (rnd(i + 9) - 0.5) * 0.4, 0.1 + ph * 0.35 * rnd(i + 5), (rnd(i + 7) - 0.5) * 0.4]}>
                    <sphereGeometry args={[0.012 + 0.012 * rnd(i), 6, 6]} />
                    <meshBasicMaterial color={rnd(i + 2) > 0.5 ? '#FFD27A' : '#FF7A3A'} transparent opacity={(1 - ph) * (s.sparks ?? 0)} />
                  </mesh>
                );
              })}
            </group>
          ) : null}
        </group>
      ) : null}
    </group>
  );
};

/* ================================================================== AGUA */
export type WaterState = {t: number; depth: number; rays?: number; snow?: number; surface?: number};
const SNOW_N = 1400;
const snowBase = (() => {
  const a = new Float32Array(SNOW_N * 3);
  for (let i = 0; i < SNOW_N; i++) {
    a[i * 3] = (rnd(i) - 0.5) * 40;
    a[i * 3 + 1] = (rnd(i + 5000) - 0.5) * 24;
    a[i * 3 + 2] = (rnd(i + 9000) - 0.5) * 40;
  }
  return a;
})();
/** luz y partículas del agua; `depth` en metros controla cuánta luz queda */
export const Water: React.FC<{s: WaterState; center?: V3}> = ({s, center = [0, 0, 0]}) => {
  const k = Math.exp(-s.depth / 140);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SNOW_N * 3), 3));
    return g;
  }, []);
  const arr = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < SNOW_N; i++) {
    const y = snowBase[i * 3 + 1] - s.t * (0.08 + rnd(i) * 0.12);
    arr.setXYZ(i, center[0] + snowBase[i * 3] + Math.sin(s.t * 0.3 + i) * 0.2, center[1] + ((((y + 12) % 24) + 24) % 24) - 12, center[2] + snowBase[i * 3 + 2]);
  }
  arr.needsUpdate = true;
  return (
    <group>
      <hemisphereLight args={[col('#1A3A50', '#9FE6FF', k), '#020509', 0.35 + 1.1 * k]} />
      <directionalLight position={[3, 30, 8]} intensity={0.25 + 2.2 * k} color="#BDEBFF" />
      <points geometry={geo}>
        <pointsMaterial size={0.045} color="#CFEFFF" transparent opacity={0.55 * (s.snow ?? 1)} sizeAttenuation depthWrite={false} />
      </points>
      {(s.rays ?? 1) * k > 0.02
        ? Array.from({length: 7}, (_, i) => (
            <mesh key={i} position={[center[0] - 12 + i * 4 + Math.sin(s.t * 0.2 + i) * 0.6, center[1] + 9, center[2] - 6 + rnd(i) * 6]} rotation={[0.12 * Math.sin(i), 0, 0.15 * Math.sin(s.t * 0.15 + i)]}>
              <coneGeometry args={[1.2 + rnd(i) * 1.2, 26, 24, 1, true]} />
              <meshBasicMaterial map={rayTex()} transparent opacity={0.11 * k * (s.rays ?? 1)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
      {(s.surface ?? 0) > 0 ? <Surface t={s.t} y={center[1] + (s.surface ?? 0)} o={k} /> : null}
    </group>
  );
};
/** superficie vista desde abajo (brillante y ondulada) */
const Surface: React.FC<{t: number; y: number; o: number}> = ({t, y, o}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(120, 120, 80, 80), []);
  const p = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getY(i);
    p.setZ(i, 0.25 * Math.sin(x * 0.4 + t * 1.3) + 0.18 * Math.sin(z * 0.55 - t * 1.1) + 0.08 * Math.sin((x + z) * 1.3 + t * 2));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#8FE3FF" emissive="#3AA7D6" emissiveIntensity={0.8 * o} transparent opacity={0.55 * o} side={THREE.DoubleSide} roughness={0.2} metalness={0.4} />
    </mesh>
  );
};

/* ================================================================== MAR CON TORMENTA (vista desde la superficie) */
export const StormSea: React.FC<{t: number; flash?: number; size?: number; amp?: number; lights?: boolean}> = ({t, flash = 0, size = 80, amp = 1, lights = true}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(size, size, 140, 140), [size]);
  const p = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getY(i);
    const h =
      0.55 * Math.sin(x * 0.32 + t * 1.25) +
      0.38 * Math.sin(z * 0.41 - t * 1.05 + x * 0.12) +
      0.16 * Math.sin((x - z) * 0.9 + t * 2.1) +
      0.07 * Math.sin(x * 2.3 + z * 1.7 + t * 3.4);
    p.setZ(i, h * amp);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group>
      {lights ? <ambientLight intensity={0.12 + 2.5 * flash} color="#9FB8D0" /> : null}
      {lights ? <directionalLight position={[-10, 14, -18]} intensity={0.55 + 4 * flash} color="#C9D9EA" /> : null}
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0C2232" roughness={0.18} metalness={0.55} />
      </mesh>
    </group>
  );
};
/** espuma/rocío alrededor del cabezal del snorkel */
export const Spray: React.FC<{t: number; pos: V3; o?: number; n?: number}> = ({t, pos, o = 1, n = 140}) => (
  <group position={pos}>
    {Array.from({length: n}, (_, i) => {
      const ph = (t * (0.9 + rnd(i) * 0.6) + rnd(i + 1)) % 1;
      const a = rnd(i + 2) * Math.PI * 2, sp = 0.4 + rnd(i + 3) * 0.9;
      return (
        <sprite key={i} position={[Math.cos(a) * sp * ph, 0.2 + ph * (1.2 - ph) * 2.2 * rnd(i + 4), Math.sin(a) * sp * ph]} scale={[0.12 + rnd(i + 5) * 0.2, 0.12 + rnd(i + 5) * 0.2, 1]}>
          <spriteMaterial map={glowTex()} color="#DDEFFA" transparent opacity={(1 - ph) * 0.45 * o} depthWrite={false} />
        </sprite>
      );
    })}
  </group>
);

/* ================================================================== FONDO MARINO (batimetría real) */
type Grid = {lat0: number; lat1: number; lon0: number; lon1: number; nlat: number; nlon: number; z: number[]};
const R_KM_LAT = 111.2;
export const TERR = {unit: 10, exag: 14}; // 1 unidad = 10 km; profundidad exagerada ×14
const kmLon = (lat: number) => R_KM_LAT * Math.cos((lat * Math.PI) / 180);
const C_LAT = -46.0, C_LON = -61.5;
/** lon/lat → posición 3D sobre el plano del mapa regional (y = profundidad exagerada) */
export const geoXZ = (lon: number, lat: number): [number, number] => [((lon - C_LON) * kmLon(C_LAT)) / TERR.unit, (-(lat - C_LAT) * R_KM_LAT) / TERR.unit];
const yOf = (zm: number, exag = TERR.exag) => ((zm / 1000) * exag) / TERR.unit;
const sample = (g: Grid, lon: number, lat: number) => {
  const fi = ((lat - g.lat0) / (g.lat1 - g.lat0)) * (g.nlat - 1), fj = ((lon - g.lon0) / (g.lon1 - g.lon0)) * (g.nlon - 1);
  const i = clamp(Math.floor(fi), 0, g.nlat - 2), j = clamp(Math.floor(fj), 0, g.nlon - 2);
  const a = fi - i, b = fj - j;
  const z = (ii: number, jj: number) => g.z[ii * g.nlon + jj];
  return mix(mix(z(i, j), z(i, j + 1), b), mix(z(i + 1, j), z(i + 1, j + 1), b), a);
};
export const depthAt = (lon: number, lat: number) => sample(region as Grid, lon, lat);
export const geoPos = (lon: number, lat: number, lift = 0): V3 => {
  const [x, z] = geoXZ(lon, lat);
  return [x, yOf(Math.min(0, depthAt(lon, lat))) + lift, z];
};
const RAMP: [number, string][] = [
  [-6000, '#03070E'],
  [-3500, '#081628'],
  [-1500, '#10304A'],
  [-600, '#1A4C66'],
  [-180, '#2B6D7E'],
  [-60, '#3F8A92'],
  [0, '#55A2A2'],
];
const rampColor = (zm: number, out: THREE.Color) => {
  if (zm > 0) return out.set('#2A2722').lerp(new THREE.Color('#4A4236'), clamp(zm / 900));
  for (let i = 1; i < RAMP.length; i++) {
    if (zm <= RAMP[i][0]) {
      const k = (zm - RAMP[i - 1][0]) / (RAMP[i][0] - RAMP[i - 1][0]);
      return out.set(RAMP[i - 1][1]).lerp(new THREE.Color(RAMP[i][1]), clamp(k));
    }
  }
  return out.set(RAMP[RAMP.length - 1][1]);
};
const TERR_GEO: Record<string, THREE.BufferGeometry> = {};
const buildTerrain = (key: string, g: Grid, exag: number, contour = 250) => {
  if (TERR_GEO[key]) return TERR_GEO[key];
  const pos: number[] = [], colr: number[] = [], idx: number[] = [];
  const c = new THREE.Color();
  for (let i = 0; i < g.nlat; i++) {
    const lat = g.lat0 + ((g.lat1 - g.lat0) * i) / (g.nlat - 1);
    for (let j = 0; j < g.nlon; j++) {
      const lon = g.lon0 + ((g.lon1 - g.lon0) * j) / (g.nlon - 1);
      const zm = g.z[i * g.nlon + j];
      const [x, z] = geoXZ(lon, lat);
      pos.push(x, yOf(zm > 0 ? zm * 0.25 : zm, exag), z);
      rampColor(zm, c);
      if (zm < -40 && Math.abs(zm % contour) < contour * 0.06) c.offsetHSL(0, 0, 0.07);
      colr.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < g.nlat - 1; i++)
    for (let j = 0; j < g.nlon - 1; j++) {
      const a = i * g.nlon + j, b = a + 1, d = a + g.nlon, e = d + 1;
      idx.push(a, b, d, b, e, d);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  TERR_GEO[key] = geo;
  return geo;
};
/** el Mar Argentino "vaciado": plataforma, talud y llanura abisal con datos reales */
export const Seafloor: React.FC<{which?: 'region' | 'local'; sea?: number; light?: number}> = ({which = 'region', sea = 0, light = 1}) => {
  const geo = which === 'region' ? buildTerrain('region', region as Grid, TERR.exag) : buildTerrain('local', local as Grid, TERR.exag * 3, 100);
  return (
    <group>
      <hemisphereLight args={['#9FD8FF', '#05080C', 0.55 * light]} />
      <directionalLight position={[-30, 22, -10]} intensity={1.6 * light} color="#E6F4FF" />
      <directionalLight position={[25, 10, 30]} intensity={0.35 * light} color="#56D8FF" />
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0} />
      </mesh>
      {sea > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#56D8FF" transparent opacity={0.12 * sea} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
};
/** baliza vertical sobre un punto del mapa 3D */
export const Beacon: React.FC<{lon: number; lat: number; h?: number; color?: string; o?: number; pulse?: number}> = ({lon, lat, h = 3, color = '#FFB547', o = 1, pulse = 0}) => {
  if (o <= 0) return null;
  const p = geoPos(lon, lat);
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, h, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85 * o} />
      </mesh>
      <mesh position={[0, h, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={o} />
      </mesh>
      <sprite position={[0, h, 0]} scale={[1.6 + pulse, 1.6 + pulse, 1]}>
        <spriteMaterial map={glowTex()} color={color} transparent opacity={0.7 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.3 + pulse * 2, 0.36 + pulse * 2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={o * (1 - clamp(pulse / 2))} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/* ================================================================== ROBOTS */
/** ROV: bloque de flotación amarillo, chasis de tubos, propulsores, cámara y dos focos */
let FLOAT_GEO: THREE.BufferGeometry | null = null;
export const ROV: React.FC<{pos: V3; rot?: V3; t: number; lights?: number; scale?: number}> = ({pos, rot = [0, 0, 0], t, lights = 1, scale = 1}) => {
  const frame = useMemo(() => new THREE.MeshStandardMaterial({color: '#B9C2C8', roughness: 0.35, metalness: 0.8}), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({color: '#1B2024', roughness: 0.6, metalness: 0.4}), []);
  const tube = (p: V3, r: V3, len: number, key: string) => (
    <mesh key={key} material={frame} position={p} rotation={r}>
      <cylinderGeometry args={[0.025, 0.025, len, 10]} />
    </mesh>
  );
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh geometry={(FLOAT_GEO ??= new RoundedBoxGeometry(1.1, 0.34, 0.78, 4, 0.06))} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#F2B21B" roughness={0.55} />
      </mesh>
      {[[-0.5, -0.33], [0.5, -0.33], [-0.5, 0.33], [0.5, 0.33]].map(([x, z], i) => tube([x, -0.05, z], [0, 0, 0], 0.55, 'v' + i))}
      {[-0.33, 0.33].map((z, i) => tube([0, -0.32, z], [0, 0, Math.PI / 2], 1.12, 'h' + i))}
      {[-0.5, 0.5].map((x, i) => tube([x, -0.32, 0], [Math.PI / 2, 0, 0], 0.7, 'd' + i))}
      {[[-0.38, 0.05, 0.4], [0.38, 0.05, 0.4], [-0.38, 0.05, -0.4], [0.38, 0.05, -0.4]].map((p, i) => (
        <mesh key={'t' + i} material={dark} position={p as V3} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.16, 16, 1, true]} />
        </mesh>
      ))}
      <mesh material={dark} position={[0, -0.12, 0.36]}>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>
      {[-0.32, 0.32].map((x, i) => (
        <group key={'l' + i} position={[x, -0.2, 0.42]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.06, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <sprite scale={[0.7 * lights, 0.7 * lights, 1]} position={[0, 0, 0.05]}>
            <spriteMaterial map={glowTex()} color="#DFF4FF" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        </group>
      ))}
      <spotLight position={[0, -0.2, 0.5]} intensity={60 * lights} distance={14} angle={0.6} penumbra={0.6} color="#E8F6FF">
        <object3D attach="target" position={[0, -2.2, 4]} />
      </spotLight>
      <mesh position={[0, 0.9 + Math.sin(t * 2) * 0.01, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.0, 6]} />
        <meshBasicMaterial color="#C8D2DA" />
      </mesh>
    </group>
  );
};
/** vehículo autónomo (AUV) con el abanico del sonar de barrido lateral */
export const AUV: React.FC<{pos: V3; heading?: number; swath?: number; scale?: number}> = ({pos, heading = 0, swath = 1, scale = 1}) => (
  <group position={pos} rotation={[0, heading, 0]} scale={scale}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.12, 0.9, 8, 16]} />
      <meshStandardMaterial color="#F7C21C" roughness={0.45} />
    </mesh>
    <mesh position={[-0.55, 0, 0]}>
      <boxGeometry args={[0.12, 0.3, 0.02]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    {swath > 0 ? (
      <mesh position={[0, -1.2, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2.4, 2.4, 3, 1, true]} />
        <meshBasicMaterial color="#3DFFB2" transparent opacity={0.08 * swath} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    ) : null}
  </group>
);

/* ================================================================== RESTOS (recreación) */
const WRECK_GEO: Record<string, THREE.BufferGeometry> = {};
/** tramo de casco aplastado: lóbulos de pandeo hacia adentro (modo n = 3) */
const crushedHull = (key: string, y0: number, y1: number, amt: number) => {
  if (WRECK_GEO[key]) return WRECK_GEO[key];
  const prof = hullProfile().filter((p) => p.y >= y0 && p.y <= y1);
  const g = new THREE.LatheGeometry(prof, 64);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const th = Math.atan2(z, x);
    const mid = Math.sin(clamp((y - y0) / (y1 - y0)) * Math.PI);
    const k = 1 - amt * mid * (0.55 * (1 + Math.cos(3 * th + 0.4)) / 2 + 0.25 * rnd(i % 977));
    p.setX(i, x * k);
    p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  WRECK_GEO[key] = g;
  return g;
};
const SEABED_GEO = (() => {
  let g: THREE.PlaneGeometry | null = null;
  return () => {
    if (g) return g;
    g = new THREE.PlaneGeometry(60, 60, 120, 120);
    const p = g.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, 0.35 * Math.sin(x * 0.35) * Math.cos(y * 0.28) + 0.12 * Math.sin(x * 1.3 + y * 0.9) + 0.05 * (rnd(i) - 0.5) - y * 0.17);
    }
    g.computeVertexNormals();
    return g;
  };
})();
export const Wreck: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({color: '#3C454B', roughness: 0.88, metalness: 0.35}), []);
  const sed = useMemo(() => new THREE.MeshStandardMaterial({color: '#6E6A5C', roughness: 1}), []);
  return (
    <group>
      <mesh geometry={SEABED_GEO()} material={sed} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} />
      {/* proa */}
      <mesh geometry={crushedHull('proa', 1.2, 3.3, 0.12)} material={mat} rotation={[0.06, 0.1, -Math.PI / 2 + 0.18]} position={[2.0, -0.32, 0.4]} />
      {/* centro aplastado */}
      <mesh geometry={crushedHull('centro', -1.4, 1.2, 0.62)} material={mat} rotation={[-0.08, 0.25, -Math.PI / 2 - 0.12]} position={[-0.6, -0.42, -0.2]} />
      {/* vela caída */}
      <mesh geometry={sailGeo()} material={mat} position={[0.35, -0.26, 0.85]} rotation={[0.9, 0.4, 0.2]} />
      {/* popa con hélice */}
      <group position={[-3.6, -0.35, -0.9]} rotation={[0.1, 0.7, -0.18]}>
        <mesh geometry={crushedHull('popa', -3.3, -1.4, 0.18)} material={mat} rotation={[0, 0, -Math.PI / 2]} position={[2.35, 0, 0]} />
        {Array.from({length: 7}, (_, i) => (
          <mesh key={i} material={mat} rotation={[(i / 7) * Math.PI * 2, 0, 0]} position={[-0.98, 0, 0]}>
            <boxGeometry args={[0.04, 0.42, 0.09]} />
          </mesh>
        ))}
      </group>
      {/* restos sueltos */}
      {Array.from({length: 46}, (_, i) => (
        <mesh key={i} material={mat} position={[(rnd(i) - 0.4) * 9, -0.5 + rnd(i + 2) * 0.08, (rnd(i + 4) - 0.5) * 6]} rotation={[rnd(i + 5) * 3, rnd(i + 6) * 3, rnd(i + 7) * 3]}>
          <boxGeometry args={[0.06 + rnd(i + 8) * 0.4, 0.02 + rnd(i + 9) * 0.05, 0.05 + rnd(i + 10) * 0.25]} />
        </mesh>
      ))}
    </group>
  );
};

/* ================================================================== ANILLO DE CASCO BAJO PRESIÓN */
/** sección de casco que pandea hacia adentro (b 0..1) con flechas de presión alrededor */
export const HullRing: React.FC<{b: number; press: number; t: number; flash?: number}> = ({b, press, t, flash = 0}) => {
  const geo = useMemo(() => new THREE.CylinderGeometry(1, 1, 2.6, 120, 30, true), []);
  const base = useMemo(() => Float32Array.from((geo.getAttribute('position') as THREE.BufferAttribute).array as Float32Array), [geo]);
  const p = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
    const th = Math.atan2(z, x);
    const mid = Math.cos((y / 1.3) * (Math.PI / 2));
    const lobes = (1 + Math.cos(4 * th + 0.5)) / 2;
    const k = 1 - b * mid * (0.72 * lobes + 0.12) - b * b * 0.05 * Math.sin(th * 9 + y * 4);
    p.setXYZ(i, x * k, y, z * k);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  const stress = clamp(press);
  return (
    <group>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#E6F4FF" />
      <directionalLight position={[-5, -2, -4]} intensity={0.6} color="#56D8FF" />
      <mesh geometry={geo} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color={col('#5E6B74', '#B33A2C', stress * 0.7)} roughness={0.42} metalness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* cuadernas */}
      {[-1.0, -0.5, 0, 0.5, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1 - b * 0.4, 1 - b * 0.4, 1]}>
          <torusGeometry args={[1.0, 0.035, 8, 64]} />
          <meshStandardMaterial color="#8C979F" metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {/* flechas de presión */}
      {Array.from({length: 36}, (_, i) => {
        const a = ((i % 12) / 12) * Math.PI * 2 + (Math.floor(i / 12) % 2) * 0.26, x = (Math.floor(i / 12) - 1) * 0.85;
        const r = 1.55 - 0.1 * Math.sin(t * 5 + i) * stress;
        return (
          <mesh key={i} position={[x, Math.cos(a) * r, Math.sin(a) * r]} rotation={[a + Math.PI, 0, 0]} scale={0.32 + stress * 0.3}>
            <coneGeometry args={[0.07, 0.28, 10]} />
            <meshBasicMaterial color={col('#56D8FF', '#FF4B3A', stress)} transparent opacity={0.85 * (1 - clamp(b * 2))} />
          </mesh>
        );
      })}
      {flash > 0 ? (
        <sprite scale={[6 * flash, 6 * flash, 1]}>
          <spriteMaterial map={glowTex()} color="#FFFFFF" transparent opacity={flash} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ) : null}
    </group>
  );
};

/* ================================================================== GLOBO (estaciones hidroacústicas) */
export const EarthGlobe: React.FC<{rot: number; tilt?: number; tex: THREE.Texture | null; o?: number}> = ({rot, tilt = 0.3, tex, o = 1}) => (
  <group rotation={[tilt, rot, 0]}>
    <mesh>
      <sphereGeometry args={[2, 96, 96]} />
      <meshStandardMaterial map={tex ?? undefined} color={tex ? '#FFFFFF' : '#123'} roughness={0.9} transparent opacity={o} />
    </mesh>
  </group>
);
export const latLonToV3 = (lat: number, lon: number, r = 2): V3 => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)];
};
export {easeInOut, easeOut};
