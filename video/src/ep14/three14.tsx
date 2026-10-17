/* Escenas 3D del episodio 14 (CAMPO DEL CIELO): la masa de hierro (geometría procedural con regmagliptos, las
   "huellas de dedos" que deja la fusión del aire, y textura de óxido tomada de una foto real de El Chaco), el monte
   chaqueño (claro con árboles instanciados), la Tierra vista desde el espacio con su atmósfera, el bólido con su estela,
   la fragmentación, la lluvia de hierro con sus impactos y el humo de la voladura. Todo es determinístico: depende
   solo del tiempo t. */
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import type {Cam, V3} from '../ep06/three6';
export {project, camPath, lerpCam} from '../ep06/three6';
export type {Cam, V3} from '../ep06/three6';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------------ ruido */
const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (v: number) => v * v * (3 - 2 * v);
/** ruido de valor 3D suave en [0,1] */
export const noise3 = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  const x00 = mix(c(0, 0, 0), c(1, 0, 0), xf), x10 = mix(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = mix(c(0, 0, 1), c(1, 0, 1), xf), x11 = mix(c(0, 1, 1), c(1, 1, 1), xf);
  return mix(mix(x00, x10, yf), mix(x01, x11, yf), zf);
};
export const fbm3 = (x: number, y: number, z: number, oct = 4) => {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise3(x * f, y * f, z * f);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
};

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: Cam; aspect: number}> = ({cam, aspect}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 35;
  c.aspect = aspect;
  c.near = 0.05;
  c.far = 900;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  return null;
};
const EnvSetup: React.FC<{k: number}> = ({k}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  }, [gl, scene]);
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = k;
  return null;
};
/** lienzo 3D transparente (el cielo 2D va detrás) con tonemapping ACES y niebla opcional */
export const Stage14: React.FC<{cam: Cam; fog?: [string, number, number]; exposure?: number; env?: number; children: React.ReactNode; style?: React.CSSProperties; w?: number; h?: number}> = ({
  cam, fog, exposure = 1, env = 0.5, children, style, w = 1920, h = 1080,
}) => (
  <ThreeCanvas
    width={w}
    height={h}
    gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}}
    style={{position: 'absolute', left: 0, top: 0, ...style}}
  >
    <Rig cam={cam} aspect={w / h} />
    {env > 0 ? <EnvSetup k={env} /> : null}
    {fog ? <fog attach="fog" args={fog} /> : null}
    {children}
  </ThreeCanvas>
);

/* ------------------------------------------------------------------ texturas */
const IMG_TEX: Record<string, THREE.Texture> = {};
const IMGS = ['ep05/globe/day.jpg', 'ep05/globe/night.jpg', 'ep14/img/tex_hierro.jpg', 'ep14/img/tex_hierro2.jpg'];
if (typeof document !== 'undefined' && !(window as any).__ep14tex) {
  (window as any).__ep14tex = true;
  const h = delayRender('texturas 3D ep14', {timeoutInMilliseconds: 120000});
  Promise.all(
    IMGS.map(
      (src) =>
        new Promise<void>((res, rej) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const tx = new THREE.Texture(img);
            tx.colorSpace = THREE.SRGBColorSpace;
            tx.anisotropy = 8;
            tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
            tx.needsUpdate = true;
            IMG_TEX[src] = tx;
            res();
          };
          img.onerror = rej;
          img.src = staticFile(src);
        }),
    ),
  ).then(() => continueRender(h));
}
const TEX: Record<string, THREE.Texture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  TEX[key] = tx;
  return tx;
};
/** brillo radial (estelas, chispas, destellos) */
export const glowTex = () =>
  canvasTex('glow14', 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.22, 'rgba(255,255,255,0.6)');
    gr.addColorStop(0.55, 'rgba(255,255,255,0.12)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });
/** bocanada de humo (borde irregular) */
const smokeTex = () =>
  canvasTex('smoke14', 256, 256, (g) => {
    const img = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const dx = (x - 128) / 128, dy = (y - 128) / 128;
        const r = Math.sqrt(dx * dx + dy * dy);
        const n = fbm3(x * 0.03, y * 0.03, 1.7, 4);
        const a = clamp((1 - r) * 1.6 - 0.25 + (n - 0.5) * 1.1) * clamp(1 - r);
        const i = (y * 256 + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a * 255);
      }
    g.putImageData(img, 0, 0);
  });
/** relieve fino del hierro (grano y picaduras) */
const ironBump = () =>
  canvasTex(
    'ironbump14',
    512,
    512,
    (g) => {
      const img = g.createImageData(512, 512);
      for (let y = 0; y < 512; y++)
        for (let x = 0; x < 512; x++) {
          const u = x / 512, v = y / 512;
          // periódico en u (envuelve la esfera)
          const a = u * Math.PI * 2;
          const n = fbm3(Math.cos(a) * 3, Math.sin(a) * 3, v * 9, 5);
          const pit = noise3(Math.cos(a) * 26, Math.sin(a) * 26, v * 70) > 0.82 ? -0.35 : 0;
          const val = clamp(n + pit);
          const i = (y * 512 + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(val * 255);
          img.data[i + 3] = 255;
        }
      g.putImageData(img, 0, 0);
    },
    false,
  );

/* ================================================================== LA MASA DE HIERRO */
type MassShape = {size: V3; seed: number; dents?: number; boxy?: number; rough?: number; tilt?: number; flat?: number};
const GEO: Record<string, THREE.BufferGeometry> = {};
/** roca de hierro: esfera escalada al tamaño, deformada con ruido en dos escalas, techo aplanado (flat: la "mesa") y
    regmagliptos (huecos ovalados). El color va por vértice (óxido y hierro según ruido 3D): sin costuras de textura */
export const massGeometry = ({size, seed, dents = 70, boxy = 0.7, rough = 0.05, flat = 0}: MassShape) => {
  const key = `${size.join(',')}|${seed}|${dents}|${boxy}|${rough}|${flat}`;
  if (GEO[key]) return GEO[key];
  const g = new THREE.SphereGeometry(1, 200, 110);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const hs = size.map((v) => v / 2) as V3;
  const D = Array.from({length: dents}, (_, i) => {
    const th = rnd(seed * 31 + i * 7) * Math.PI * 2, ph = Math.acos(2 * rnd(seed * 17 + i * 13) - 1);
    return {d: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), r: 0.07 + rnd(seed + i * 3) * 0.13, k: 0.3 + rnd(seed * 5 + i) * 0.7};
  });
  const col = new Float32Array(pos.count * 3);
  const cIron = new THREE.Color('#3A3633'), cRust = new THREE.Color('#6B3A1F'), cRust2 = new THREE.Color('#8E5128'), cDark = new THREE.Color('#1E1B19'), cHi = new THREE.Color('#77706A');
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const dir = v.clone().normalize();
    // superelipsoide suave (boxy < 1 = más cuadrado)
    const e = boxy;
    const p = new THREE.Vector3(Math.sign(dir.x) * Math.abs(dir.x) ** e * hs[0], Math.sign(dir.y) * Math.abs(dir.y) ** e * hs[1], Math.sign(dir.z) * Math.abs(dir.z) ** e * hs[2]);
    const big = (fbm3(dir.x * 1.1 + seed, dir.y * 1.1, dir.z * 1.1, 3) - 0.5) * 0.36;
    const fine = (fbm3(dir.x * 7 + seed * 3, dir.y * 7, dir.z * 7, 3) - 0.5) * rough;
    let dent = 0;
    for (const dd of D) {
      const ang = dir.angleTo(dd.d);
      if (ang < dd.r * 2) dent += dd.k * Math.exp(-(ang * ang) / (2 * (dd.r * 0.5) ** 2));
    }
    p.multiplyScalar(1 + big + fine);
    // techo aplanado: la cara de arriba de la "mesa"
    if (flat > 0 && p.y > hs[1] * 0.35) p.y = hs[1] * 0.35 + (p.y - hs[1] * 0.35) * (1 - flat) + (fbm3(p.x * 2, 9, p.z * 2, 2) - 0.5) * 0.05;
    // hueco hacia adentro a lo largo de la dirección
    p.addScaledVector(dir, -dent * 0.045);
    pos.setXYZ(i, p.x, p.y, p.z);
    // color
    const n1 = fbm3(p.x * 1.6 + seed, p.y * 1.6, p.z * 1.6, 4), n2 = fbm3(p.x * 6 + 3, p.y * 6, p.z * 6, 3);
    const c = cIron.clone().lerp(cRust, clamp((n1 - 0.42) * 2.6)).lerp(cRust2, clamp((n2 - 0.6) * 3) * 0.7).lerp(cHi, clamp((n2 - 0.75) * 4) * 0.5).lerp(cDark, clamp(dent * 1.2));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  GEO[key] = g;
  return g;
};
/** material del hierro (color por vértice, relieve fino procedural); heat > 0 lo pone incandescente */
export const IronMass: React.FC<{shape: MassShape; pos?: V3; rot?: V3; s?: number; heat?: number; tex?: 'rust' | 'dark' | 'polished'; o?: number; emissive?: string}> = ({
  shape, pos = [0, 0, 0], rot = [0, 0, 0], s = 1, heat = 0, tex = 'rust', o = 1, emissive = '#FF5A10',
}) => {
  const geo = massGeometry(shape);
  const color = tex === 'dark' ? '#8A8A90' : tex === 'polished' ? '#C9CED6' : '#FFFFFF';
  return (
    <mesh geometry={geo} position={pos} rotation={rot} scale={[s, s, s]} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors={tex !== 'polished'}
        color={color}
        metalness={tex === 'polished' ? 0.95 : 0.35}
        roughness={tex === 'polished' ? 0.28 : 0.82}
        bumpMap={ironBump()}
        bumpScale={2.5}
        emissive={emissive}
        emissiveIntensity={heat * 2.2}
        transparent={o < 1}
        opacity={o}
      />
    </mesh>
  );
};
/** el Mesón de Fierro: losa de unos 2,5 × 2,1 m, chata (una "mesa"), enterrada en parte */
export const MESON: MassShape = {size: [2.6, 0.95, 2.15], seed: 14, dents: 110, boxy: 0.75, rough: 0.07, flat: 0.75};
export const BLOQUE: MassShape = {size: [1.25, 0.9, 1.0], seed: 3, dents: 40, boxy: 0.8, rough: 0.06};
export const GIGANTE: MassShape = {size: [3.4, 2.1, 2.5], seed: 37, dents: 120, boxy: 0.8, rough: 0.07};
export const ROCA: MassShape = {size: [1.6, 1.3, 1.4], seed: 51, dents: 50, boxy: 0.95, rough: 0.09};

/* ================================================================== EL MONTE */
const TERR: Record<string, THREE.BufferGeometry> = {};
export type Crater = {x: number; z: number; r: number; d: number};
/** suelo del monte: ondulación suave, claro aplanado en el centro y cráteres opcionales; colores por vértice */
export const terrainGeometry = (size = 260, seg = 220, craters: Crater[] = [], clearing = 7) => {
  const key = `${size}|${seg}|${clearing}|${craters.map((c) => [c.x, c.z, c.r, c.d].join(':')).join(';')}`;
  if (TERR[key]) return TERR[key];
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const soil = new THREE.Color('#7A6247'), dry = new THREE.Color('#8C7A55'), grass = new THREE.Color('#4F5A33'), dark = new THREE.Color('#2E3420');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);
    let y = (fbm3(x * 0.035, 0.3, z * 0.035, 4) - 0.5) * 2.2 + (fbm3(x * 0.4, 1.7, z * 0.4, 2) - 0.5) * 0.12;
    const flat = clamp((r - clearing) / (clearing * 1.5));
    y *= flat;
    let crater = 0;
    for (const c of craters) {
      const dd = Math.hypot(x - c.x, z - c.z) / c.r;
      if (dd < 2.2) crater += dd < 1 ? -c.d * (1 - dd * dd) : c.d * 0.35 * Math.exp(-((dd - 1) ** 2) / 0.12);
    }
    y += crater;
    pos.setY(i, y);
    const n = fbm3(x * 0.15, 4.2, z * 0.15, 3);
    const c = soil.clone().lerp(dry, n).lerp(grass, clamp((r - clearing * 0.8) / (clearing * 2)) * (0.6 + 0.4 * n)).lerp(dark, clamp(-crater * 0.9));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  TERR[key] = g;
  return g;
};
export const Terrain: React.FC<{size?: number; seg?: number; craters?: Crater[]; clearing?: number; y?: number; tint?: string}> = ({size = 260, seg = 220, craters = [], clearing = 7, y = 0, tint = '#FFFFFF'}) => (
  <mesh geometry={terrainGeometry(size, seg, craters, clearing)} position={[0, y, 0]} receiveShadow>
    <meshStandardMaterial vertexColors color={tint} roughness={0.96} metalness={0} />
  </mesh>
);

/** árboles del monte chaqueño (quebrachos y algarrobos: tronco y copa ancha y chata), instanciados en un anillo */
const TREES: Record<string, {trunks: THREE.Matrix4[]; crowns: THREE.Matrix4[]}> = {};
const treeLayout = (n: number, rMin: number, rMax: number, seed: number) => {
  const key = `${n}|${rMin}|${rMax}|${seed}`;
  if (TREES[key]) return TREES[key];
  const trunks: THREE.Matrix4[] = [], crowns: THREE.Matrix4[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd(seed + i * 3.1) * Math.PI * 2, r = rMin + Math.sqrt(rnd(seed * 7 + i * 1.7)) * (rMax - rMin);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = 3.2 + rnd(i * 5 + seed) * 4.5, cw = 2.2 + rnd(i * 11 + seed) * 3.2;
    const ground = (fbm3(x * 0.035, 0.3, z * 0.035, 4) - 0.5) * 2.2;
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, ground + h / 2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd(i) - 0.5) * 0.2, 0, (rnd(i * 2) - 0.5) * 0.2)), new THREE.Vector3(0.22, h, 0.22));
    trunks.push(m);
    for (let k = 0; k < 3; k++) {
      const ox = (rnd(i * 13 + k) - 0.5) * cw * 0.8, oz = (rnd(i * 17 + k) - 0.5) * cw * 0.8;
      const s = cw * (0.55 + rnd(i * 19 + k) * 0.45);
      crowns.push(new THREE.Matrix4().compose(new THREE.Vector3(x + ox, ground + h + (rnd(i * 23 + k) - 0.3) * 0.8, z + oz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rnd(i + k) * 3, 0)), new THREE.Vector3(s, s * 0.42, s)));
    }
  }
  TREES[key] = {trunks, crowns};
  return TREES[key];
};
const Instanced: React.FC<{mats: THREE.Matrix4[]; geo: THREE.BufferGeometry; color: string; rough?: number}> = ({mats, geo, color, rough = 0.95}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({color, roughness: rough, metalness: 0, flatShading: true}), mats.length);
    mats.forEach((mx, i) => m.setMatrixAt(i, mx));
    m.instanceMatrix.needsUpdate = true;
    m.castShadow = true;
    return m;
  }, [mats, geo, color, rough]);
  return <primitive object={mesh} />;
};
const TRUNK_GEO = new THREE.CylinderGeometry(0.6, 1, 1, 6);
const CROWN_GEO = new THREE.IcosahedronGeometry(0.5, 1);
export const Monte: React.FC<{n?: number; rMin?: number; rMax?: number; seed?: number; crown?: string; trunk?: string}> = ({n = 320, rMin = 10, rMax = 95, seed = 5, crown = '#33402A', trunk = '#3A2C20'}) => {
  const L = treeLayout(n, rMin, rMax, seed);
  return (
    <group>
      <Instanced mats={L.trunks} geo={TRUNK_GEO} color={trunk} />
      <Instanced mats={L.crowns} geo={CROWN_GEO} color={crown} />
    </group>
  );
};

/** luz de época: dusk (atardecer recién caído), night (luna fría), golden (sol bajo), day */
export const SkyLights: React.FC<{mood: 'dusk' | 'night' | 'golden' | 'day'; k?: number; sunDir?: V3}> = ({mood, k = 1, sunDir}) => {
  const P = {
    dusk: {hemi: ['#5C6FA8', '#2A2018', 0.55], sun: ['#FF8A4A', 1.6], dir: [-30, 6, -40] as V3, rim: ['#7FA0FF', 0.6]},
    night: {hemi: ['#3A4F86', '#100C0A', 0.4], sun: ['#AFC4FF', 0.9], dir: [20, 40, 30] as V3, rim: ['#6F8BD6', 0.5]},
    golden: {hemi: ['#FFD9A8', '#3A2A1C', 0.65], sun: ['#FFB060', 2.6], dir: [-40, 12, 25] as V3, rim: ['#9FC2FF', 0.7]},
    day: {hemi: ['#DCEBFF', '#5A4A38', 0.9], sun: ['#FFF4E0', 2.4], dir: [20, 50, 25] as V3, rim: ['#BFD6FF', 0.5]},
  }[mood];
  return (
    <>
      <hemisphereLight args={[P.hemi[0] as string, P.hemi[1] as string, (P.hemi[2] as number) * k]} />
      <directionalLight position={sunDir ?? P.dir} intensity={(P.sun[1] as number) * k} color={P.sun[0] as string} />
      <directionalLight position={[-(sunDir ?? P.dir)[0], 8, -(sunDir ?? P.dir)[2]]} intensity={(P.rim[1] as number) * k} color={P.rim[0] as string} />
    </>
  );
};

/* ================================================================== PARTÍCULAS */
/** sprite aditivo (brillos, estelas, chispas) */
export const Glow: React.FC<{pos: V3; s: number; color: string; o?: number}> = ({pos, s, color, o = 1}) =>
  o <= 0.004 ? null : (
    <sprite position={pos} scale={[s, s, s]}>
      <spriteMaterial map={glowTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  );
/** humo y tierra de una explosión: bocanadas que crecen, suben y se disipan; chispas balísticas; terrones */
export const Blast: React.FC<{t: number; t0: number; pos?: V3; s?: number; n?: number; color?: string; sparks?: number; seed?: number}> = ({t, t0, pos = [0, 0, 0], s = 1, n = 46, color = '#8A7660', sparks = 36, seed = 1}) => {
  const a = t - t0;
  if (a < 0 || a > 9) return null;
  const tx = smokeTex();
  return (
    <group position={pos}>
      {Array.from({length: n}, (_, i) => {
        const dir = new THREE.Vector3(rnd(i * 3 + seed) - 0.5, 0.35 + rnd(i * 5 + seed) * 0.9, rnd(i * 7 + seed) - 0.5).normalize();
        const sp = (2.2 + rnd(i * 11) * 4.5) * s;
        const k = 1 - Math.exp(-a * 2.2);
        const p: V3 = [dir.x * sp * k, (dir.y * sp * k + a * 0.35 * s), dir.z * sp * k];
        const sz = (0.9 + rnd(i * 13) * 1.6 + a * 0.9) * s;
        const o = clamp(a * 6) * clamp(1 - a / (5.5 + rnd(i) * 3)) * 0.85;
        return (
          <sprite key={i} position={p} scale={[sz, sz, sz]}>
            <spriteMaterial map={tx} color={color} transparent opacity={o} depthWrite={false} rotation={rnd(i * 17) * 6.28 + a * 0.2} />
          </sprite>
        );
      })}
      {Array.from({length: sparks}, (_, i) => {
        const v = new THREE.Vector3(rnd(i * 19 + seed) - 0.5, 0.6 + rnd(i * 23) * 1.2, rnd(i * 29 + seed) - 0.5).normalize().multiplyScalar((5 + rnd(i * 31) * 7) * s);
        const tt = Math.min(a, 1.6);
        const p: V3 = [v.x * tt, v.y * tt - 4.9 * tt * tt * 0.6, v.z * tt];
        const o = clamp(1 - a / (0.6 + rnd(i) * 0.9));
        return <Glow key={'s' + i} pos={p} s={0.18 * s} color="#FFB060" o={o} />;
      })}
      <Glow pos={[0, 0.6 * s, 0]} s={9 * s * clamp(1 - a / 0.7)} color="#FFC27A" o={clamp(1 - a / 0.7)} />
      {a < 0.6 ? <pointLight position={[0, 1.2 * s, 0]} intensity={60 * (1 - a / 0.6)} distance={30 * s} color="#FFB060" /> : null}
    </group>
  );
};

/** estrellas 3D (para el espacio y para planos en que la cámara se mueve mucho) */
const STAR_GEO: Record<string, THREE.BufferGeometry> = {};
export const Stars3D: React.FC<{n?: number; r?: number; o?: number; size?: number}> = ({n = 2600, r = 400, o = 1, size = 1.6}) => {
  const key = `${n}|${r}`;
  if (!STAR_GEO[key]) {
    const p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rnd(i * 3 + 1) * Math.PI * 2, ph = Math.acos(2 * rnd(i * 7 + 2) - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.cos(ph);
      p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      const b = 0.35 + rnd(i * 11) ** 3 * 0.65, hue = rnd(i * 13);
      c[i * 3] = b * (hue > 0.8 ? 1 : 0.9);
      c[i * 3 + 1] = b * 0.92;
      c[i * 3 + 2] = b * (hue < 0.25 ? 1 : 0.85);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    STAR_GEO[key] = g;
  }
  return (
    <points geometry={STAR_GEO[key]}>
      <pointsMaterial vertexColors size={size} sizeAttenuation={false} transparent opacity={o} depthWrite={false} toneMapped={false} />
    </points>
  );
};

/* ================================================================== LA TIERRA Y EL BÓLIDO */
const atmoMat = (color: string, power: number, k: number) =>
  new THREE.ShaderMaterial({
    uniforms: {c: {value: new THREE.Color(color)}, p: {value: power}, k: {value: k}},
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float p; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), p); gl_FragColor = vec4(c*k, f*k); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
  });
const ATMO: Record<string, THREE.ShaderMaterial> = {};
/** la Tierra: mapa diurno, luces nocturnas y halo atmosférico; sun = dirección de la luz */
export const Earth: React.FC<{r: number; pos?: V3; rot?: V3; sun?: V3; atmo?: number}> = ({r, pos = [0, 0, 0], rot = [0, 0, 0], sun = [-1, 0.3, 0.6], atmo = 1}) => {
  const day = IMG_TEX['ep05/globe/day.jpg'];
  const night = IMG_TEX['ep05/globe/night.jpg'];
  if (!ATMO.a) ATMO.a = atmoMat('#5FA0FF', 3.6, 1);
  ATMO.a.uniforms.k.value = atmo;
  return (
    <group position={pos}>
      <directionalLight position={sun.map((v) => v * 100) as V3} intensity={3.2} color="#FFF4E6" />
      <group rotation={rot}>
        <mesh>
          <sphereGeometry args={[r, 160, 90]} />
          <meshStandardMaterial map={day} roughness={0.85} metalness={0} emissive="#FFD9A0" emissiveMap={night} emissiveIntensity={0.9} />
        </mesh>
      </group>
      <mesh scale={[1.13, 1.13, 1.13]} material={ATMO.a}>
        <sphereGeometry args={[r, 96, 48]} />
      </mesh>
    </group>
  );
};

/** bólido: roca incandescente con estela de plasma detrás; vel = dirección del movimiento (normalizada adentro) */
export const Meteor: React.FC<{pos: V3; vel: V3; s?: number; heat?: number; trail?: number; t: number; shape?: MassShape}> = ({pos, vel, s = 1, heat = 1, trail = 1, t, shape = ROCA}) => {
  const v = new THREE.Vector3(...vel).normalize();
  const n = 34;
  return (
    <group>
      <IronMass shape={shape} pos={pos} rot={[t * 0.7, t * 0.4, 0]} s={s * 0.5} heat={heat} tex="dark" />
      {/* frente de choque */}
      <Glow pos={pos} s={s * 3.2 * (0.9 + 0.1 * Math.sin(t * 40))} color="#FFE2B0" o={0.9 * heat} />
      <Glow pos={pos} s={s * 6.5} color="#FF7A2A" o={0.45 * heat} />
      {/* estela */}
      {Array.from({length: n}, (_, i) => {
        const k = (i + 1) / n;
        const d = k * 22 * s * trail;
        const jit = (rnd(i * 7 + Math.floor(t * 30)) - 0.5) * 0.25 * s;
        const p: V3 = [pos[0] - v.x * d + jit, pos[1] - v.y * d + jit, pos[2] - v.z * d];
        const c = k < 0.25 ? '#FFD49A' : k < 0.6 ? '#FF7A2A' : '#C2441A';
        return <Glow key={i} pos={p} s={s * (2.6 - k * 1.7)} color={c} o={heat * trail * (1 - k) * 0.55} />;
      })}
    </group>
  );
};

/** fragmentos: N trozos que se separan del cuerpo principal en un abanico, cada uno con su estela */
export const Fragments: React.FC<{t: number; t0: number; base: V3; vel: V3; n?: number; spread?: number; s?: number; heat?: number}> = ({t, t0, base, vel, n = 18, spread = 1, s = 1, heat = 1}) => {
  const a = Math.max(0, t - t0);
  const v = new THREE.Vector3(...vel).normalize();
  const side = new THREE.Vector3(0, 1, 0).cross(v).normalize();
  const up = v.clone().cross(side).normalize();
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const ang = rnd(i * 5) * Math.PI * 2, rr = (0.3 + rnd(i * 9) * 0.7) * spread;
        const off = side.clone().multiplyScalar(Math.cos(ang) * rr).add(up.clone().multiplyScalar(Math.sin(ang) * rr)).multiplyScalar(a * 2.4 * s);
        const p: V3 = [base[0] + off.x - v.x * rnd(i * 3) * a * 1.5 * s, base[1] + off.y - v.y * rnd(i * 3) * a * 1.5 * s, base[2] + off.z - v.z * rnd(i * 3) * a * 1.5 * s];
        const sz = (0.18 + rnd(i * 13) * 0.4) * s;
        return <Meteor key={i} pos={p} vel={vel} s={sz} heat={heat} trail={0.55} t={t + i} />;
      })}
    </group>
  );
};

/** lluvia de hierro: rayos que caen al suelo en distintos puntos, con destello e impacto al llegar */
export type Drop = {x: number; z: number; at: number; s: number};
export const IronRain: React.FC<{t: number; drops: Drop[]; dir?: V3; len?: number}> = ({t, drops, dir = [0.55, -1, 0.25], len = 60}) => {
  const d = new THREE.Vector3(...dir).normalize();
  return (
    <group>
      {drops.map((dr, i) => {
        const a = t - dr.at;
        if (a > 7 || a < -1.2) return null;
        if (a < 0) {
          // en vuelo: la cabeza se acerca al suelo en 1,2 s
          const k = 1 + a / 1.2; // 0 → 1
          const head: V3 = [dr.x - d.x * len * (1 - k), -d.y * len * (1 - k), dr.z - d.z * len * (1 - k)];
          return (
            <group key={i}>
              {Array.from({length: 10}, (_, j) => {
                const q = j / 10;
                const p: V3 = [head[0] - d.x * q * 8 * dr.s, head[1] - d.y * q * 8 * dr.s, head[2] - d.z * q * 8 * dr.s];
                return <Glow key={j} pos={p} s={dr.s * (1.8 - q * 1.2)} color={q < 0.3 ? '#FFE0B0' : '#FF6A1A'} o={(1 - q) * 0.75} />;
              })}
            </group>
          );
        }
        // impacto: destello, onda de choque (anillo) y polvo
        const ring = 1 + a * 9 * dr.s;
        return (
          <group key={i} position={[dr.x, 0.15, dr.z]}>
            <Glow pos={[0, 1.2 * dr.s, 0]} s={14 * dr.s * clamp(1 - a / 0.5)} color="#FFC27A" o={clamp(1 - a / 0.5)} />
            {a < 1.6 ? (
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[ring * 0.86, ring, 64]} />
                <meshBasicMaterial color="#FFD9A6" transparent opacity={0.55 * clamp(1 - a / 1.6)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            ) : null}
            <Blast t={t} t0={dr.at} s={dr.s * 1.4} n={16} sparks={10} color="#7A6A58" seed={i * 3 + 1} />
          </group>
        );
      })}
    </group>
  );
};

/* ================================================================== SUELO LOCAL (se funde con el monte 2D) */
const groundTex = () =>
  canvasTex('ground14', 1024, 1024, (g) => {
    const img = g.createImageData(1024, 1024);
    for (let y = 0; y < 1024; y++)
      for (let x = 0; x < 1024; x++) {
        const n = fbm3(x * 0.012, y * 0.012, 0.5, 5), m = fbm3(x * 0.09, y * 0.09, 2.5, 3);
        const grass = clamp((n - 0.42) * 3.2);
        const r = mix(118, 66, grass) * (0.82 + m * 0.36), gg = mix(96, 74, grass) * (0.82 + m * 0.36), b = mix(70, 44, grass) * (0.82 + m * 0.36);
        const i = (y * 1024 + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = gg;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
  });
const fadeTex = () =>
  canvasTex(
    'fade14',
    256,
    256,
    (g) => {
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, '#fff');
      gr.addColorStop(0.55, '#fff');
      gr.addColorStop(1, '#000');
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
    },
    false,
  );
/** suelo del claro: disco con textura de tierra y pasto que se desvanece en el borde */
export const Ground: React.FC<{r?: number; tint?: string; y?: number; dig?: number}> = ({r = 26, tint = '#FFFFFF', y = 0, dig = 0}) => (
  <group position={[0, y, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[r, 96]} />
      <meshStandardMaterial map={groundTex()} alphaMap={fadeTex()} transparent depthWrite={false} color={tint} roughness={1} metalness={0} />
    </mesh>
    {dig > 0 ? (
      // tierra removida alrededor de la mesa (la excavación de Rubín de Celis)
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 1.5 + 1.4 * dig, 64]} />
        <meshStandardMaterial color="#22180F" roughness={1} transparent opacity={0.55 * clamp(dig * 2)} depthWrite={false} />
      </mesh>
    ) : null}
  </group>
);
const contactTex = () =>
  canvasTex(
    'contact14',
    256,
    256,
    (g) => {
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(0,0,0,0.85)');
      gr.addColorStop(0.5, 'rgba(0,0,0,0.5)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
    },
    false,
  );
/** sombra de contacto (oclusión) bajo una masa apoyada en el suelo */
export const ContactShadow: React.FC<{w: number; d: number; pos?: V3; o?: number; rot?: number}> = ({w, d, pos = [0, 0.02, 0], o = 1, rot = 0}) => (
  <mesh rotation={[-Math.PI / 2, 0, rot]} position={pos}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={contactTex()} transparent opacity={o} depthWrite={false} color="#000000" />
  </mesh>
);
/** matas de pasto seco alrededor (escala y textura cerca de la cámara) */
const TUFTS: Record<string, THREE.Matrix4[]> = {};
const TUFT_GEO = new THREE.ConeGeometry(0.05, 1, 4);
export const Tufts: React.FC<{n?: number; r0?: number; r1?: number; seed?: number; color?: string}> = ({n = 1400, r0 = 1.8, r1 = 22, seed = 3, color = '#4B4A2C'}) => {
  const key = `${n}|${r0}|${r1}|${seed}`;
  if (!TUFTS[key]) {
    const out: THREE.Matrix4[] = [];
    for (let i = 0; i < n; i++) {
      const a = rnd(seed + i * 1.3) * Math.PI * 2, r = r0 + Math.sqrt(rnd(seed * 3 + i * 2.1)) * (r1 - r0);
      const h = 0.15 + rnd(i * 7 + seed) ** 2 * 0.55;
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * r, h / 2, Math.sin(a) * r), new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd(i) - 0.5) * 0.6, 0, (rnd(i * 2) - 0.5) * 0.6)), new THREE.Vector3(1, h, 1)));
    }
    TUFTS[key] = out;
  }
  return <Instanced mats={TUFTS[key]} geo={TUFT_GEO} color={color} rough={1} />;
};
/** altura en pantalla (px) del horizonte para una cámara: para alinear el monte 2D con el suelo 3D */
export const horizonY = (cam: Cam, h = 1080) => {
  const dx = cam.look[0] - cam.pos[0], dy = cam.look[1] - cam.pos[1], dz = cam.look[2] - cam.pos[2];
  const pitch = Math.atan2(dy, Math.hypot(dx, dz));
  const f = Math.tan(((cam.fov ?? 35) * Math.PI) / 360);
  return h / 2 + (Math.tan(pitch) / f) * (h / 2);
};
