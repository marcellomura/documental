/* Escenas 3D del episodio 11: la isla Huemul en el lago, el reactor de hormigón que Richter mandó demoler,
   el Sol con su núcleo y la fusión de dos núcleos de hidrógeno, y el stellarator de Spitzer. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill} from 'remotion';
import {Stage, project} from '../ep06/three6';
import type {Cam, V3} from '../ep06/three6';
import {clamp, easeIn, easeInOut, easeOut, rnd} from '../lib/anim';
export {Stage, project, camPath, lerpCam} from '../ep06/three6';
export type {Cam, V3} from '../ep06/three6';

/* ---------- texturas generadas en canvas (sin archivos) ---------- */
const TEX: Record<string, THREE.Texture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(...repeat);
  }
  TEX[key] = tx;
  return tx;
};
/** brillo radial para coronas y destellos */
const glowTex = (color: string) =>
  canvasTex('glow' + color, 256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, color);
    gr.addColorStop(0.25, color + 'AA');
    gr.addColorStop(0.6, color + '33');
    gr.addColorStop(1, color + '00');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  });
/** superficie solar: granulación y manchas */
const sunTex = () =>
  canvasTex('sun', 1024, 512, (g) => {
    g.fillStyle = '#FFA236';
    g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 9000; i++) {
      const x = rnd(i) * 1024, y = rnd(i + 9000) * 512, r = 1.5 + rnd(i + 3000) * 5;
      const c = rnd(i + 7000);
      g.fillStyle = c > 0.55 ? 'rgba(255,236,160,0.30)' : c > 0.2 ? 'rgba(255,176,70,0.30)' : 'rgba(210,90,10,0.25)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 9; i++) {
      const x = 100 + rnd(i + 50) * 820, y = 160 + rnd(i + 80) * 200;
      g.fillStyle = 'rgba(120,40,0,0.45)';
      g.beginPath();
      g.arc(x, y, 5 + rnd(i) * 9, 0, Math.PI * 2);
      g.fill();
    }
  });
const concreteTex = () =>
  canvasTex(
    'concrete',
    512,
    512,
    (g) => {
      g.fillStyle = '#8E8A82';
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) {
        const v = 110 + Math.floor(rnd(i) * 60);
        g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.35)`;
        g.fillRect(rnd(i + 1) * 512, rnd(i + 2) * 512, 2, 2);
      }
      g.strokeStyle = 'rgba(60,58,54,0.5)';
      g.lineWidth = 2;
      for (let y = 0; y < 512; y += 64) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(512, y);
        g.stroke();
      }
    },
    [2, 2],
  );

/* ================================================================== ISLA */
export type IslandState = {
  t: number;
  build: number; // 0..1 edificios que aparecen
  reactor?: number; // 0..1 cilindro grande
  night?: number; // 0 atardecer, 1 noche
  boat?: number; // 0..1 lancha cruzando
  search?: number; // reflectores militares
  lit?: number; // ventanas iluminadas
  ruin?: number; // 0..1 abandono (bosque que tapa)
  sunGlow?: number; // pequeño "sol" sobre la isla
};
const TREES = Array.from({length: 520}, (_, i) => {
  const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 1000));
  const x = Math.cos(a) * r * 15.5, z = Math.sin(a) * r * 6.2;
  return {x, z, s: 0.55 + rnd(i + 2000) * 0.7, c: rnd(i + 3000)};
});
const islandY = (x: number, z: number) => {
  const d = (x / 16) ** 2 + (z / 6.6) ** 2;
  return Math.max(-0.4, 2.6 * (1 - d) + 0.5 * Math.sin(x * 0.5) * Math.cos(z * 0.7));
};
const BUILDINGS: {p: [number, number]; s: V3; c: string; at: number}[] = [
  {p: [-6, 0.6], s: [3.2, 1.0, 1.6], c: '#B9B2A4', at: 0.1},
  {p: [-2.5, -1.8], s: [2.4, 0.9, 1.4], c: '#C7C0B2', at: 0.25},
  {p: [2.2, 1.6], s: [2.8, 1.2, 1.6], c: '#B0A99C', at: 0.4},
  {p: [6.5, -0.6], s: [2.0, 0.8, 1.2], c: '#C2BBAE', at: 0.55},
  {p: [-9.5, -1.2], s: [1.6, 0.7, 1.0], c: '#BDB6A9', at: 0.7},
  {p: [9.8, 1.4], s: [1.8, 0.7, 1.1], c: '#B7B0A2', at: 0.82},
];
export const REACTOR_XZ: [number, number] = [0.2, -0.4];
const near = (x: number, z: number) =>
  BUILDINGS.some((b) => Math.abs(x - b.p[0]) < b.s[0] * 0.75 + 0.5 && Math.abs(z - b.p[1]) < b.s[2] * 0.75 + 0.5) || Math.hypot(x - REACTOR_XZ[0], z - REACTOR_XZ[1]) < 2.0;

const Island: React.FC<{s: IslandState}> = ({s}) => {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 96, 0, Math.PI * 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    // círculo en XY → isla en XZ con relieve
    const out = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const wob = 1 + 0.12 * Math.sin(Math.atan2(v.y, v.x) * 5) + 0.06 * Math.sin(Math.atan2(v.y, v.x) * 11);
      const x = v.x * 16.5 * wob, z = v.y * 6.9 * wob;
      out[i * 3] = x;
      out[i * 3 + 1] = islandY(x, z);
      out[i * 3 + 2] = z;
    }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.BufferAttribute(out, 3));
    gg.setIndex(g.index);
    gg.computeVertexNormals();
    return gg;
  }, []);
  const ruin = s.ruin ?? 0;
  const trees = TREES.filter((tr) => ruin > 0.5 || !near(tr.x, tr.z) || s.build < 0.02);
  return (
    <group>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial color="#3E5B3A" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* costa rocosa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} scale={[17.6, 7.6, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#9A9078" roughness={1} />
      </mesh>
      {trees.map((tr, i) => {
        const y = islandY(tr.x, tr.z);
        const col = tr.c > 0.66 ? '#2F5A3A' : tr.c > 0.33 ? '#3C6B45' : '#4A7A4C';
        return (
          <group key={i} position={[tr.x, y, tr.z]} scale={[tr.s, tr.s, tr.s]}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <coneGeometry args={[0.55, 1.9, 6]} />
              <meshStandardMaterial color={col} roughness={0.9} flatShading />
            </mesh>
          </group>
        );
      })}
      {BUILDINGS.map((b, i) => {
        const k = easeOut(clamp((s.build - b.at) / 0.2));
        if (k <= 0) return null;
        const y = islandY(b.p[0], b.p[1]);
        const lit = s.lit ?? 0;
        return (
          <group key={i} position={[b.p[0], y + (b.s[1] * k) / 2 - 0.05, b.p[1]]}>
            <mesh scale={[b.s[0], b.s[1] * k, b.s[2]]} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={ruin > 0.5 ? '#7E786D' : '#ECE6D8'} roughness={0.85} emissive="#FFC46A" emissiveIntensity={lit * 0.18} />
            </mesh>
            <mesh position={[0, (b.s[1] * k) / 2 + 0.06, 0]} scale={[b.s[0] * 1.06, 0.12, b.s[2] * 1.08]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={ruin > 0.5 ? '#3E3B36' : '#A4523A'} roughness={0.9} />
            </mesh>
          </group>
        );
      })}
      {(s.reactor ?? 0) > 0 ? (
        <group position={[REACTOR_XZ[0], islandY(...REACTOR_XZ) - 0.1, REACTOR_XZ[1]]}>
          <mesh position={[0, (1.8 * easeOut(s.reactor!)) / 2, 0]} scale={[1, easeOut(s.reactor!), 1]} castShadow receiveShadow>
            <cylinderGeometry args={[1.25, 1.3, 1.8, 40]} />
            <meshStandardMaterial map={concreteTex()} color="#C8C2B6" roughness={0.95} emissive="#FFB070" emissiveIntensity={(s.sunGlow ?? 0) * 0.25} />
          </mesh>
        </group>
      ) : null}
      {(s.sunGlow ?? 0) > 0 ? (
        <sprite position={[REACTOR_XZ[0], 3.4, REACTOR_XZ[1]]} scale={[7 * s.sunGlow!, 7 * s.sunGlow!, 1]}>
          <spriteMaterial map={glowTex('#FFB040')} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={s.sunGlow} />
        </sprite>
      ) : null}
    </group>
  );
};

const Mountains: React.FC<{night: number}> = ({night}) => (
  <group>
    {Array.from({length: 26}, (_, i) => {
      const a = Math.PI * 0.95 + (i / 25) * Math.PI * 1.1;
      const R = 150 + rnd(i) * 40;
      const h = 10 + rnd(i + 7) * 14;
      const x = Math.cos(a) * R, z = Math.sin(a) * R * 0.75 - 10;
      const c = new THREE.Color('#5E6E8A').lerp(new THREE.Color('#121A26'), night);
      return (
        <group key={i} position={[x, -1, z]}>
          <mesh position={[0, h / 2, 0]}>
            <coneGeometry args={[22 + rnd(i + 3) * 14, h, 6]} />
            <meshStandardMaterial color={c} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, h * 0.86, 0]}>
            <coneGeometry args={[(22 + rnd(i + 3) * 14) * 0.28, h * 0.28, 6]} />
            <meshStandardMaterial color={night > 0.5 ? '#6C7A90' : '#E8EEF4'} roughness={0.8} flatShading />
          </mesh>
        </group>
      );
    })}
  </group>
);

const Boat: React.FC<{p: number; t: number}> = ({p, t}) => {
  const x = -40 + p * 26, z = 14 - p * 5;
  return (
    <group position={[x, 0.15 + Math.sin(t * 2) * 0.05, z]} rotation={[0, -0.3, Math.sin(t * 1.7) * 0.03]}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.5, 0.9]} />
        <meshStandardMaterial color="#D9D3C5" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.7]} />
        <meshStandardMaterial color="#5E6B78" roughness={0.6} />
      </mesh>
      {/* estela */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.6, -0.12, 0]}>
        <planeGeometry args={[3.6, 0.7]} />
        <meshBasicMaterial color="#DDEBF5" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

const SearchBeams: React.FC<{k: number; t: number}> = ({k, t}) => (
  <group>
    {[-8, 4, 11].map((x, i) => {
      const ang = Math.sin(t * 0.7 + i * 2) * 0.6;
      return (
        <group key={i} position={[x, islandY(x, 0) + 0.3, i === 1 ? 2.5 : -1]} rotation={[0.5 + 0.15 * Math.sin(t * 0.5 + i), ang, 0]}>
          <mesh position={[0, 12, 0]}>
            <coneGeometry args={[2.6, 24, 24, 1, true]} />
            <meshBasicMaterial color="#F4F0D8" transparent opacity={0.09 * k} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      );
    })}
  </group>
);

export const Island3D: React.FC<{s: IslandState}> = ({s}) => {
  const night = s.night ?? 0;
  const water = new THREE.Color('#2A5470').lerp(new THREE.Color('#0A1826'), night);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={water} roughness={0.75} metalness={0} />
      </mesh>
      <Mountains night={night} />
      <Island s={s} />
      {(s.boat ?? 0) > 0 ? <Boat p={s.boat!} t={s.t} /> : null}
      {(s.search ?? 0) > 0 ? <SearchBeams k={s.search!} t={s.t} /> : null}
    </group>
  );
};

export const ISL_WIDE: Cam = {pos: [6, 17, 44], look: [0, 1, 0], fov: 38};
export const ISL_HIGH: Cam = {pos: [0, 40, 30], look: [0, 0, 0], fov: 40};
export const ISL_LOW: Cam = {pos: [-14, 4.5, 20], look: [0, 1.5, 0], fov: 36};
export const ISL_REACT: Cam = {pos: [5, 6, 10], look: [REACTOR_XZ[0], 2, REACTOR_XZ[1]], fov: 36};

export const IslandShot: React.FC<{s: IslandState; cam: Cam; o?: number; w?: number; h?: number}> = ({s, cam, o = 1, w, h}) => {
  const night = s.night ?? 0;
  const sky = night > 0.5 ? 'linear-gradient(180deg, #050A14 0%, #0C1828 55%, #142236 100%)' : 'linear-gradient(180deg, #1C2B4A 0%, #4A5F86 30%, #C9A383 44%, #6E7E98 60%, #2A4258 100%)';
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{background: sky}} />
      <Stage cam={cam} key0={night > 0.5 ? [-20, 30, -10] : [-30, 26, 18]} keyI={night > 0.5 ? 0.6 : 2.0} fill={night > 0.5 ? 0.4 : 1.15} shadow={30} rimColor={night > 0.5 ? '#6C8CFF' : '#FFB070'} exposure={1.05} w={w} h={h}>
        <fog attach="fog" args={[night > 0.5 ? '#0B1626' : '#7C8CA6', 70, 260]} />
        <Island3D s={s} />
      </Stage>
    </AbsoluteFill>
  );
};

/* ================================================================== REACTOR DE HORMIGÓN (escala 1 = 1 m) */
const SEG = 12;
const R_OUT = 6, R_IN = 2, H_R = 9;
const wedgeGeo = (() => {
  let g: THREE.ExtrudeGeometry | null = null;
  return () => {
    if (g) return g;
    const da = (Math.PI * 2) / SEG;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, R_OUT, -da / 2, da / 2, false);
    sh.absarc(0, 0, R_IN, da / 2, -da / 2, true);
    sh.closePath();
    g = new THREE.ExtrudeGeometry(sh, {depth: H_R, bevelEnabled: false, curveSegments: 10});
    g.rotateX(-Math.PI / 2); // la extrusión sube por +y
    return g;
  };
})();
export const Reactor3D: React.FC<{t: number; build: number; crack: number; demolish: number}> = ({t, build, crack, demolish}) => {
  const geo = wedgeGeo();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#6E6A60" roughness={1} />
      </mesh>
      {Array.from({length: SEG}, (_, i) => {
        const a = (i / SEG) * Math.PI * 2 + Math.PI / 2;
        const k = easeOut(clamp(build * 1.3 - (i / SEG) * 0.3));
        const d = easeIn(clamp(demolish * 1.5 - rnd(i) * 0.5));
        const out = d * (2 + rnd(i + 5) * 5);
        const fall = d * d * 1.2;
        const tilt = d * (0.5 + rnd(i + 9) * 0.8);
        if (k <= 0) return null;
        return (
          <group key={i} rotation={[0, -a, 0]}>
            <group position={[out, -fall, 0]} rotation={[0, 0, -tilt]}>
              <mesh geometry={geo} scale={[1, k, 1]} castShadow receiveShadow>
                <meshStandardMaterial map={concreteTex()} color="#DAD4C8" roughness={0.95} />
              </mesh>
            </group>
          </group>
        );
      })}
      {/* grieta: línea quebrada roja que sube por la pared que mira a cámara */}
      {crack > 0 && demolish < 0.05 ? (
        <group position={[0, 0, R_OUT + 0.03]}>
          {Array.from({length: 14}, (_, i) => {
            const k = clamp(crack * 14 - i);
            if (k <= 0) return null;
            const y0 = 0.3 + i * 0.62, x0 = (rnd(i) - 0.5) * 0.9;
            const y1 = y0 + 0.62 * k, x1 = ((rnd(i + 1) - 0.5) * 0.9) * k + x0 * (1 - k);
            const len = Math.hypot(x1 - x0, y1 - y0);
            return (
              <mesh key={i} position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2]}>
                <planeGeometry args={[0.07, len + 0.04]} />
                <meshBasicMaterial color="#FF5030" toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      ) : null}
      {demolish > 0
        ? Array.from({length: 30}, (_, i) => {
            const k = clamp(demolish * 1.2 - rnd(i) * 0.2);
            const a = rnd(i + 30) * Math.PI * 2, r = 3 + k * (4 + rnd(i + 40) * 7);
            return (
              <sprite key={i} position={[Math.cos(a) * r, 0.8 + k * (2 + rnd(i + 50) * 5), Math.sin(a) * r]} scale={[4 + k * 6, 4 + k * 6, 1]}>
                <spriteMaterial map={glowTex('#C9C1B2')} transparent opacity={0.55 * k * (1 - clamp((demolish - 0.7) / 0.3))} depthWrite={false} />
              </sprite>
            );
          })
        : null}
      {/* persona de 1,80 m para la escala */}
      <group position={[8.2, 0, 3.4]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <capsuleGeometry args={[0.22, 1.0, 6, 12]} />
          <meshStandardMaterial color="#2E3A50" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#C99E7C" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
export const RX_CAM: Cam = {pos: [14, 9, 20], look: [0, 3.5, 0], fov: 38};
export const RX_TOP: Cam = {pos: [0.01, 26, 6], look: [0, 0, 0], fov: 40};
export const RX_LOW: Cam = {pos: [5, 2.2, 16], look: [0, 4.5, 0], fov: 40};

/* ================================================================== SOL */
export const Sun3D: React.FC<{t: number; r?: number; core?: number; pos?: V3}> = ({t, r = 3, core = 0, pos = [0, 0, 0]}) => (
  <group position={pos}>
    <mesh rotation={[0.2, t * 0.05, 0]}>
      <sphereGeometry args={[r, 96, 64]} />
      <meshBasicMaterial map={sunTex()} color="#FFFFFF" toneMapped={false} transparent opacity={1 - core * 0.5} blending={core > 0 ? THREE.AdditiveBlending : THREE.NormalBlending} depthWrite={core === 0} />
    </mesh>
    {core > 0 ? (
      <>
        <mesh>
          <sphereGeometry args={[r * 0.24 * (0.5 + 0.5 * core), 48, 32]} />
          <meshBasicMaterial color="#FFFBEA" toneMapped={false} />
        </mesh>
        <sprite scale={[r * 1.3 * core, r * 1.3 * core, 1]}>
          <spriteMaterial map={glowTex('#FFF4D0')} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      </>
    ) : null}
    {[2.25, 3.0, 4.4].map((s, i) => (
      <sprite key={i} scale={[r * s * (1 + 0.03 * Math.sin(t * (1.1 + i))), r * s * (1 + 0.03 * Math.sin(t * (1.1 + i))), 1]}>
        <spriteMaterial map={glowTex(i === 0 ? '#FFD27A' : i === 1 ? '#FF9A3A' : '#FF6A1A')} transparent opacity={[0.7, 0.45, 0.25][i]} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
    ))}
  </group>
);

/* ---------- fusión: deuterio + tritio → helio + neutrón + energía ---------- */
const Nucleon: React.FC<{p: V3; proton: boolean; r?: number}> = ({p, proton, r = 0.34}) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 32, 24]} />
    <meshStandardMaterial color={proton ? '#E84A3A' : '#B8BCC6'} roughness={0.35} metalness={0.1} emissive={proton ? '#7A1408' : '#30343C'} emissiveIntensity={0.6} />
  </mesh>
);
export const FUSE_T = {approach: 2.2, merge: 0.35};
/** k: 0 separados → 1 se tocan; f: 0..1 después del choque (helio + neutrón que sale + destello) */
export const Fusion3D: React.FC<{t: number; k: number; f: number}> = ({t, k, f}) => {
  const d = 4.2 * (1 - easeInOut(k));
  const shake = k > 0.9 && f === 0 ? Math.sin(t * 60) * 0.05 : 0;
  const D: V3[] = [[0, 0.2, 0], [0.32, -0.2, 0.1]];
  const T: V3[] = [[0, 0.25, 0], [-0.3, -0.2, 0.1], [0.25, -0.15, -0.3]];
  const flash = f > 0 ? Math.max(0, 1 - f * 1.6) : 0;
  const nx = f * 9;
  return (
    <group>
      {f === 0 ? (
        <>
          <group position={[-d - 0.4 + shake, 0, 0]} rotation={[t * 0.6, t * 0.9, 0]}>
            <Nucleon p={D[0]} proton />
            <Nucleon p={D[1]} proton={false} />
          </group>
          <group position={[d + 0.45 - shake, 0, 0]} rotation={[-t * 0.5, t * 0.7, 0]}>
            <Nucleon p={T[0]} proton />
            <Nucleon p={T[1]} proton={false} />
            <Nucleon p={T[2]} proton={false} />
          </group>
        </>
      ) : (
        <>
          <group position={[-f * 1.2, f * 0.6, 0]} rotation={[t * 0.4, t * 0.6, 0]}>
            <Nucleon p={[0.22, 0.22, 0]} proton />
            <Nucleon p={[-0.22, -0.22, 0]} proton />
            <Nucleon p={[-0.22, 0.22, 0.2]} proton={false} />
            <Nucleon p={[0.22, -0.22, -0.2]} proton={false} />
          </group>
          <Nucleon p={[nx, -nx * 0.25, 0]} proton={false} />
        </>
      )}
      {flash > 0 ? (
        <sprite scale={[3 + f * 22, 3 + f * 22, 1]}>
          <spriteMaterial map={glowTex('#FFF2C0')} transparent opacity={flash} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ) : null}
      {f > 0 ? (
        <mesh scale={[1 + f * 10, 1 + f * 10, 1]}>
          <torusGeometry args={[0.6, 0.03, 8, 64]} />
          <meshBasicMaterial color="#FFD27A" transparent opacity={Math.max(0, 0.9 - f)} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
export const FUSION_CAM: Cam = {pos: [0, 0.4, 6.2], look: [0, 0, 0], fov: 40};

/* ================================================================== STELLARATOR */
const N_P = 5; // períodos de campo
const stelPt = (phi: number, R = 3.2, a = 0.42): V3 => {
  const rr = R + a * Math.cos(N_P * phi);
  return [rr * Math.cos(phi), a * 1.2 * Math.sin(N_P * phi), rr * Math.sin(phi)];
};
export const Stellarator3D: React.FC<{t: number; coils: number; plasma: number; spin?: number}> = ({t, coils, plasma, spin = 0}) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(Array.from({length: 240}, (_, i) => new THREE.Vector3(...stelPt((i / 240) * Math.PI * 2))), true), []);
  const NC = 50;
  return (
    <group rotation={[0.42, spin, 0]}>
      {plasma > 0 ? (
        <>
          <mesh>
            <tubeGeometry args={[curve, 480, 0.36, 24, true]} />
            <meshStandardMaterial color="#FFB86A" emissive="#FF7A2A" emissiveIntensity={1.6 * plasma} transparent opacity={0.85 * plasma} roughness={0.3} toneMapped={false} />
          </mesh>
          <mesh>
            <tubeGeometry args={[curve, 480, 0.6, 24, true]} />
            <meshBasicMaterial color="#FF9A50" transparent opacity={0.16 * plasma} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </>
      ) : null}
      {Array.from({length: NC}, (_, i) => {
        const k = clamp(coils * 1.25 - (i / NC) * 0.25);
        if (k <= 0) return null;
        const phi = (i / NC) * Math.PI * 2;
        const p = stelPt(phi);
        const tg = curve.getTangentAt(((i / NC) % 1 + 1) % 1);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg);
        const e = new THREE.Euler().setFromQuaternion(q);
        const sq = 1 + 0.25 * Math.sin(N_P * phi + i);
        return (
          <mesh key={i} position={[p[0], p[1] + (1 - easeOut(k)) * 5, p[2]]} rotation={e} scale={[sq * easeOut(k), (2 - sq) * easeOut(k), 1]}>
            <torusGeometry args={[0.86, 0.09, 10, 40]} />
            <meshStandardMaterial color="#3E7FD8" metalness={0.75} roughness={0.28} emissive="#0A2246" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};
export const STEL_CAM: Cam = {pos: [0, 5.2, 9.6], look: [0, -0.2, 0], fov: 42};

/* ---------- utilidades ---------- */
export const proj = project;
