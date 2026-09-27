/* Kit 3D del episodio 6 (La paradoja de la carne): three.js real (WebGL) con @remotion/three.
   Escenario con luz cálida y sombras, cubos de "pesos", bandejas de carne, balanza, diorama del viaje y globo. */
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import countries from '../data/ep04/countries50.json';

export type V3 = [number, number, number];
export type Cam = {pos: V3; look: V3; fov?: number};

const W = 1920, H = 1080;
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov ?? 35, b.fov ?? 35, k)});

/** cámara por tramos: keys = [[t, cam], ...]; entre claves interpola con easeInOut */
export const camPath = (t: number, keys: [number, Cam][], dur = 1.4): Cam => {
  let c = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, ck] = keys[i];
    const k = easeInOut(clamp((t - tk) / dur));
    if (k > 0) c = lerpCam(c, ck, k);
  }
  return c;
};

const _cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 400);
/** proyecta un punto 3D a píxeles de la composición (1920×1080) */
export const project = (cam: Cam, p: V3, w = W, h = H): [number, number] => {
  _cam.fov = cam.fov ?? 35;
  _cam.aspect = w / h;
  _cam.position.set(...cam.pos);
  _cam.lookAt(...cam.look);
  _cam.updateProjectionMatrix();
  _cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(_cam);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
};

const Rig: React.FC<{cam: Cam; aspect: number}> = ({cam, aspect}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 35;
  c.aspect = aspect;
  c.near = 0.1;
  c.far = 400;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  return null;
};

/** escenario: lienzo transparente con luz cálida principal (con sombra), relleno y contraluz */
export const Stage: React.FC<{
  cam: Cam; children: React.ReactNode; key0?: V3; shadow?: number; keyI?: number; fill?: number; rimColor?: string; exposure?: number; target?: V3; style?: React.CSSProperties; w?: number; h?: number;
}> = ({cam, children, key0 = [7, 14, 9], shadow = 14, keyI = 2.3, fill = 0.55, rimColor = '#FF8A4C', exposure = 1.05, target = [0, 0, 0], style, w = W, h = H}) => (
  <ThreeCanvas
    width={w}
    height={h}
    shadows
    gl={{antialias: true, alpha: true, toneMappingExposure: exposure, preserveDrawingBuffer: true}}
    style={{position: 'absolute', left: 0, top: 0, ...style}}
  >
    <Rig cam={cam} aspect={w / h} />
    <hemisphereLight args={['#FFE9CF', '#20160F', fill]} />
    <directionalLight
      position={[key0[0] + target[0], key0[1] + target[1], key0[2] + target[2]]}
      intensity={keyI}
      color="#FFE3BD"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0005}
      shadow-normalBias={0.03}
      shadow-camera-left={-shadow}
      shadow-camera-right={shadow}
      shadow-camera-top={shadow}
      shadow-camera-bottom={-shadow}
      shadow-camera-near={0.5}
      shadow-camera-far={90}
    >
      <object3D attach="target" position={target} />
    </directionalLight>
    <directionalLight position={[target[0] - 9, 6, target[2] - 12]} intensity={0.9} color={rimColor} />
    {children}
  </ThreeCanvas>
);

/** piso que solo recibe sombra (deja ver el fondo CSS) */
export const ShadowFloor: React.FC<{y?: number; o?: number; size?: number; x?: number}> = ({y = 0, o = 0.42, size = 160, x = 0}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <shadowMaterial transparent opacity={o} />
  </mesh>
);

/* ------------------------------------------------------------------ texturas */
const IMG_TEX: Record<string, THREE.Texture> = {};
const IMGS = ['ep05/globe/day.jpg'];
if (typeof document !== 'undefined' && !(window as any).__ep6tex) {
  (window as any).__ep6tex = true;
  const h = delayRender('texturas 3D ep6', {timeoutInMilliseconds: 120000});
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

const CANVAS_TEX: Record<string, THREE.CanvasTexture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  if (CANVAS_TEX[key]) return CANVAS_TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  CANVAS_TEX[key] = tx;
  return tx;
};

/** carne con vetas de grasa (procedural, determinística) */
const meatTex = (kind: 'vaca' | 'asado' | 'pollo') =>
  canvasTex('meat-' + kind, 512, 320, (g) => {
    let s = kind === 'vaca' ? 11 : kind === 'asado' ? 37 : 71;
    const R = () => rnd(s++);
    if (kind === 'pollo') {
      const gr = g.createLinearGradient(0, 0, 512, 320);
      gr.addColorStop(0, '#F0CFA8');
      gr.addColorStop(1, '#E2B48A');
      g.fillStyle = gr;
      g.fillRect(0, 0, 512, 320);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(${200 + R() * 40},${150 + R() * 40},${110 + R() * 30},${0.12 + R() * 0.18})`;
        g.beginPath();
        g.arc(R() * 512, R() * 320, 2 + R() * 7, 0, Math.PI * 2);
        g.fill();
      }
      // dos presas con borde dorado
      for (let k = 0; k < 2; k++) {
        g.strokeStyle = 'rgba(190,120,70,0.55)';
        g.lineWidth = 6;
        g.beginPath();
        g.ellipse(140 + k * 230, 160, 105, 120, 0.3 - k * 0.6, 0, Math.PI * 2);
        g.stroke();
      }
      return;
    }
    const gr = g.createLinearGradient(0, 0, 512, 320);
    gr.addColorStop(0, '#B92B24');
    gr.addColorStop(0.5, '#A11E1B');
    gr.addColorStop(1, '#C03A2E');
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 320);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(${120 + R() * 80},${10 + R() * 30},${15 + R() * 25},${0.18 + R() * 0.2})`;
      g.fillRect(R() * 512, R() * 320, 3 + R() * 18, 2 + R() * 6);
    }
    // vetas
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(245,228,210,${0.35 + R() * 0.4})`;
      g.lineWidth = 1 + R() * 3.5;
      g.beginPath();
      let x = R() * 512, y = R() * 320;
      g.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        const nx = x + (R() - 0.5) * 120, ny = y + (R() - 0.5) * 80;
        g.quadraticCurveTo(x + (R() - 0.5) * 60, y + (R() - 0.5) * 60, nx, ny);
        x = nx; y = ny;
      }
      g.stroke();
    }
    // tapa de grasa
    g.fillStyle = 'rgba(246,232,214,0.95)';
    g.beginPath();
    g.moveTo(0, 0);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, 18 + Math.sin(x * 0.05) * 7 + R() * 5);
    g.lineTo(512, 0);
    g.fill();
    if (kind === 'asado') {
      // cortes de hueso de la tira
      for (let k = 0; k < 4; k++) {
        const cx = 70 + k * 125;
        g.fillStyle = '#EFE6D6';
        g.beginPath();
        g.ellipse(cx, 175, 26, 44, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(160,120,95,0.8)';
        g.beginPath();
        g.ellipse(cx, 175, 11, 22, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  });

/** etiqueta de texto como textura (carteles de los edificios del diorama) */
const signTex = (text: string, bg: string, fg: string, w = 1024, h = 256) =>
  canvasTex(`sign-${text}-${bg}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `${Math.round(h * 0.62)}px Anton, Impact, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h * 0.54);
  });

/* ------------------------------------------------------------------ geometrías compartidas */
const GEO: Record<string, THREE.BufferGeometry> = {};
const rbox = (w: number, h: number, d: number, r = 0.06, seg = 3) => {
  const k = `rb${w}-${h}-${d}-${r}`;
  return (GEO[k] ??= new RoundedBoxGeometry(w, h, d, seg, r));
};

/* ------------------------------------------------------------------ 100 pesos en cubos */
export type Group = {n: number; color: string; p: number; lift?: number; dx?: number; glow?: number; drop?: number; dim?: number};
const tmpA = new THREE.Color(), tmpB = new THREE.Color();

/** 10×10 cubos = $100. Cada grupo se pinta en orden (columna por columna) según su progreso p. */
export const Grid100: React.FC<{groups: Group[]; base?: string; appear?: number; pos?: V3; spread?: number; t?: number; dimRest?: number}> = ({
  groups, base = '#D9CCB2', appear = 1, pos = [0, 0, 0], spread = 1, t = 0, dimRest = 0,
}) => {
  const geo = rbox(0.86, 0.86, 0.86, 0.1);
  const cubes: React.ReactNode[] = [];
  let k = 0;
  const owner: {g: number; i: number}[] = [];
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.n; i++) owner.push({g: gi, i});
  });
  for (let c = 0; c < 10; c++)
    for (let r = 0; r < 10; r++, k++) {
      const o = owner[k];
      const g = o ? groups[o.g] : undefined;
      // aparición en ola desde la esquina
      const wave = clamp(appear * 2.2 - (c + r) / 18 * 1.2);
      const sa = easeOut(wave);
      let cp = 0, lift = 0, dx = 0, glow = 0, dropY = 0, dim = 0;
      if (g) {
        cp = easeOut(clamp(g.p * g.n - o.i));
        lift = (g.lift ?? 0) * cp;
        dx = (g.dx ?? 0);
        glow = (g.glow ?? 0) * cp;
        dim = g.dim ?? 0;
        if (g.drop !== undefined) {
          const dk = clamp(g.drop * 1.6 - (o.i / g.n) * 0.6);
          dropY = (1 - easeIn2(dk)) * 9;
          if (dk <= 0) dropY = 99;
        }
      } else dim = dimRest;
      tmpA.set(base);
      if (g) tmpA.lerp(tmpB.set(g.color), cp);
      if (dim) tmpA.lerp(tmpB.set('#2A2320'), dim);
      const x = (c - 4.5) * spread + dx, z = (r - 4.5) * spread;
      const bob = glow ? Math.sin(t * 3 + c * 0.7 + r * 0.4) * 0.04 * glow : 0;
      if (dropY > 50 || sa <= 0.001) continue;
      cubes.push(
        <mesh key={k} geometry={geo} position={[x, 0.43 * sa + lift + dropY + bob, z]} scale={[sa, sa, sa]} castShadow receiveShadow>
          <meshStandardMaterial color={tmpA.getHex()} roughness={0.42} metalness={0.05} emissive={g ? g.color : '#000'} emissiveIntensity={glow * 0.55} />
        </mesh>,
      );
    }
  return <group position={pos}>{cubes}</group>;
};
const easeIn2 = (k: number) => k * k;

/* ------------------------------------------------------------------ bandeja de carne */
export const Tray: React.FC<{kind?: 'vaca' | 'asado' | 'pollo'; pos?: V3; rot?: V3; s?: number; half?: boolean; price?: string}> = ({kind = 'vaca', pos = [0, 0, 0], rot = [0, 0, 0], s = 1, half}) => {
  const tex = meatTex(kind);
  const sx = half ? 0.5 : 1;
  return (
    <group position={pos} rotation={rot} scale={[s * sx, s, s]}>
      <mesh geometry={rbox(1, 0.1, 0.7, 0.035)} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F3F1EC" roughness={0.75} />
      </mesh>
      <mesh geometry={rbox(0.84, 0.13, 0.54, 0.05)} position={[0, 0.16, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0} />
      </mesh>
      {/* film */}
      <mesh geometry={rbox(0.98, 0.2, 0.68, 0.06)} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.1} roughness={0.08} metalness={0.2} depthWrite={false} />
      </mesh>
      {/* etiqueta de precio */}
      <mesh geometry={rbox(0.26, 0.012, 0.16, 0.005)} position={[0.3, 0.232, 0.17]} rotation={[0, 0.2, 0]}>
        <meshStandardMaterial color={kind === 'pollo' ? '#FFD34D' : '#FFFFFF'} roughness={0.6} />
      </mesh>
    </group>
  );
};

/** pila de bandejas: 2×2 por piso; n bandejas, p = progreso de armado (0→1) */
export const TrayTower: React.FC<{n: number; p: number; pos?: V3; kind?: 'vaca' | 'pollo'; ghost?: number}> = ({n, p, pos = [0, 0, 0], kind = 'vaca'}) => {
  const items: React.ReactNode[] = [];
  const shown = p * n;
  for (let i = 0; i < n; i++) {
    const a = clamp(shown - i);
    if (a <= 0) break;
    const layer = Math.floor(i / 4), q = i % 4;
    const x = (q % 2 ? 0.53 : -0.53), z = (q < 2 ? -0.37 : 0.37);
    const fall = (1 - easeOut(a)) * 2.5;
    items.push(<Tray key={i} kind={kind} pos={[x, layer * 0.245 + fall, z]} rot={[0, (rnd(i) - 0.5) * 0.08, 0]} />);
  }
  return <group position={pos}>{items}</group>;
};

/* ------------------------------------------------------------------ balanza de dos platos */
const BRASS = '#C79A45';
export const Balance: React.FC<{angle: number; left: React.ReactNode; right: React.ReactNode; pos?: V3}> = ({angle, left, right, pos = [0, 0, 0]}) => {
  const L = 2.9, topY = 3.6, hang = 1.55;
  const ends: [number, number][] = [-1, 1].map((sd) => [sd * L * Math.cos(angle), topY + sd * L * Math.sin(angle)]);
  const pan = (i: number, content: React.ReactNode) => {
    const [x, y] = ends[i];
    const py = y - hang;
    return (
      <group key={i}>
        {[0, 1, 2].map((j) => {
          const a = (j / 3) * Math.PI * 2 + 0.5;
          const bx = x + Math.cos(a) * 1.05, bz = Math.sin(a) * 1.05;
          const dx = bx - x, dy = py - y, dz = bz;
          const len = Math.hypot(dx, dy, dz);
          const mid: V3 = [(x + bx) / 2, (y + py) / 2, bz / 2];
          const dir = new THREE.Vector3(dx, dy, dz).normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          const e = new THREE.Euler().setFromQuaternion(q);
          return (
            <mesh key={j} position={mid} rotation={[e.x, e.y, e.z]}>
              <cylinderGeometry args={[0.012, 0.012, len, 6]} />
              <meshStandardMaterial color="#8C7A55" metalness={0.6} roughness={0.4} />
            </mesh>
          );
        })}
        <mesh position={[x, py, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.25, 1.12, 0.08, 48]} />
          <meshStandardMaterial color={BRASS} metalness={0.55} roughness={0.32} />
        </mesh>
        <group position={[x, py + 0.04, 0]}>{content}</group>
      </group>
    );
  };
  return (
    <group position={pos}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.2, 48]} />
        <meshStandardMaterial color="#3B2A1E" roughness={0.6} />
      </mesh>
      <mesh position={[0, topY / 2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, topY, 24]} />
        <meshStandardMaterial color={BRASS} metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, topY, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.28} />
      </mesh>
      <mesh position={[0, topY, 0]} rotation={[0, 0, angle]} castShadow>
        <boxGeometry args={[L * 2 + 0.2, 0.1, 0.14]} />
        <meshStandardMaterial color={BRASS} metalness={0.55} roughness={0.3} />
      </mesh>
      {/* fiel */}
      <mesh position={[Math.sin(angle) * 0.55, topY + Math.cos(angle) * 0.55, 0]} rotation={[0, 0, angle]}>
        <boxGeometry args={[0.04, 0.9, 0.04]} />
        <meshStandardMaterial color="#E23B2E" roughness={0.4} />
      </mesh>
      {pan(0, left)}
      {pan(1, right)}
    </group>
  );
};

/* ------------------------------------------------------------------ diorama del viaje */
export const STX = [-16, -8, 0, 8, 16]; // campo, feedlot, frigorífico, carnicería, tu mesa
export const STATION_NAMES = ['CAMPO DE CRÍA', 'INVERNADA / FEEDLOT', 'FRIGORÍFICO', 'CARNICERÍA', 'TU MESA'];

const M: React.FC<{c: string; r?: number; m?: number; e?: string; ei?: number; o?: number}> = ({c, r = 0.7, m = 0, e, ei = 0, o}) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? '#000'} emissiveIntensity={ei} transparent={o !== undefined} opacity={o ?? 1} />
);
const Box: React.FC<{p: V3; s: V3; c: string; r?: number; rot?: V3; m?: number; e?: string; ei?: number; round?: number; noShadow?: boolean}> = ({p, s, c, r, rot, m, e, ei, round, noShadow}) => (
  <mesh position={p} rotation={rot} castShadow={!noShadow} receiveShadow geometry={round ? rbox(s[0], s[1], s[2], round) : undefined}>
    {round ? null : <boxGeometry args={s} />}
    <M c={c} r={r} m={m} e={e} ei={ei} />
  </mesh>
);
const Cyl: React.FC<{p: V3; r: number; h: number; c: string; seg?: number; rt?: number; rot?: V3; m?: number; ro?: number}> = ({p, r, h, c, seg = 20, rt, rot, m, ro}) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[rt ?? r, r, h, seg]} />
    <M c={c} m={m} r={ro} />
  </mesh>
);

/** vaca low-poly (tipo Aberdeen Angus o Hereford) */
export const Cow: React.FC<{p: V3; ry?: number; s?: number; c?: string; face?: string; bob?: number}> = ({p, ry = 0, s = 1, c = '#1E1A18', face, bob = 0}) => (
  <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
    <Box p={[0, 0.62, 0]} s={[1.05, 0.5, 0.46]} c={c} round={0.1} />
    <Box p={[0.6, 0.72 + bob, 0]} s={[0.34, 0.3, 0.3]} c={face ?? c} round={0.07} rot={[0, 0, -0.25 + bob]} />
    <Box p={[0.78, 0.66 + bob, 0]} s={[0.12, 0.16, 0.24]} c="#C99A8A" round={0.04} />
    {[[-0.38, -0.15], [-0.38, 0.15], [0.36, -0.15], [0.36, 0.15]].map(([x, z], i) => (
      <Box key={i} p={[x, 0.2, z]} s={[0.12, 0.42, 0.12]} c={c} round={0.03} />
    ))}
    <Box p={[-0.56, 0.62, 0]} s={[0.05, 0.4, 0.05]} c={c} rot={[0, 0, 0.35]} />
  </group>
);

const Fence: React.FC<{from: [number, number]; to: [number, number]; y?: number; c?: string}> = ({from, to, y = 0, c = '#8A6A4A'}) => {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const n = Math.max(2, Math.round(len / 0.9) + 1);
  const cx = (from[0] + to[0]) / 2, cz = (from[1] + to[1]) / 2;
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const k = i / (n - 1);
        return <Box key={i} p={[mix(from[0], to[0], k), y + 0.3, mix(from[1], to[1], k)]} s={[0.08, 0.6, 0.08]} c={c} />;
      })}
      {[0.22, 0.45].map((h, i) => (
        <Box key={'r' + i} p={[cx, y + h, cz]} s={[len, 0.04, 0.04]} c={c} rot={[0, -ang, 0]} noShadow />
      ))}
    </group>
  );
};

/** molino pampeano */
const Windmill: React.FC<{p: V3; t: number}> = ({p, t}) => (
  <group position={p}>
    <mesh position={[0, 1.6, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.55, 3.2, 4, 6, true]} />
      <meshStandardMaterial color="#9EA3A6" metalness={0.5} roughness={0.5} wireframe />
    </mesh>
    <group position={[0, 3.25, 0.12]} rotation={[0, 0, t * 1.4]}>
      {Array.from({length: 14}, (_, i) => (
        <Box key={i} p={[Math.cos((i / 14) * Math.PI * 2) * 0.45, Math.sin((i / 14) * Math.PI * 2) * 0.45, 0]} s={[0.62, 0.13, 0.02]} rot={[0.3, 0, (i / 14) * Math.PI * 2]} c="#C8CCCF" m={0.4} />
      ))}
      <Cyl p={[0, 0, 0]} r={0.08} h={0.14} c="#6E7478" rot={[Math.PI / 2, 0, 0]} />
    </group>
    <Box p={[0, 3.25, -0.55]} s={[0.04, 0.35, 0.7]} c="#B03A2E" />
    <Cyl p={[0.9, 0.35, 0.4]} r={0.6} h={0.7} c="#8C9296" m={0.4} seg={28} />
  </group>
);

const Silo: React.FC<{p: V3; h?: number}> = ({p, h = 2.2}) => (
  <group position={p}>
    <Cyl p={[0, h / 2, 0]} r={0.55} h={h} c="#C9CED2" m={0.5} ro={0.35} seg={28} />
    <mesh position={[0, h + 0.25, 0]} castShadow>
      <coneGeometry args={[0.6, 0.5, 28]} />
      <M c="#B8BEC2" m={0.5} r={0.35} />
    </mesh>
  </group>
);

const Truck: React.FC<{p: V3; ry?: number}> = ({p, ry = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[-0.35, 0.62, 0]} s={[2.2, 0.9, 0.8]} c="#F2F2EE" round={0.05} />
    <Box p={[-0.35, 0.62, 0.405]} s={[2.1, 0.12, 0.01]} c="#C0392B" noShadow />
    <Box p={[1.05, 0.5, 0]} s={[0.6, 0.66, 0.78]} c="#B83A2C" round={0.08} />
    <Box p={[1.3, 0.62, 0]} s={[0.1, 0.3, 0.66]} c="#1C2A36" noShadow />
    {[-1.1, -0.5, 1.1].map((x, i) =>
      [-0.4, 0.4].map((z, j) => <Cyl key={`${i}${j}`} p={[x, 0.16, z]} r={0.16} h={0.1} c="#1A1A1A" rot={[Math.PI / 2, 0, 0]} />),
    )}
  </group>
);

/** una estación = baldosa + maqueta */
const Tile: React.FC<{x: number; c: string; children?: React.ReactNode; lift?: number}> = ({x, c, children, lift = 0}) => (
  <group position={[x, lift, 0]}>
    <Box p={[0, -0.2, -0.9]} s={[6.2, 0.4, 5.2]} c={c} r={0.9} round={0.12} />
    {children}
  </group>
);

const Station: React.FC<{i: number; t: number; truckX?: number}> = ({i, t, truckX = 0}) => {
  const x = STX[i];
  if (i === 0)
    return (
      <Tile x={x} c="#5C8A3C">
        <Windmill p={[-1.9, 0, -2.4]} t={t} />
        <Cow p={[0.6, 0, -1.9]} ry={0.5} />
        <Cow p={[1.9, 0, -2.6]} ry={-2.4} c="#6B3A22" face="#EDE6DA" />
        <Cow p={[1.2, 0, -1.4]} ry={0.2} s={0.55} c="#6B3A22" face="#EDE6DA" bob={Math.sin(t * 2) * 0.05} />
        <Fence from={[-3, -3.35]} to={[3, -3.35]} />
        <Fence from={[-3, -3.35]} to={[-3, 1.2]} />
      </Tile>
    );
  if (i === 1)
    return (
      <Tile x={x} c="#7B5B3E">
        <Fence from={[-2.8, -3.2]} to={[2.2, -3.2]} c="#9A9A96" />
        <Fence from={[-2.8, -1.05]} to={[2.2, -1.05]} c="#9A9A96" />
        <Fence from={[-0.3, -3.2]} to={[-0.3, -1.05]} c="#9A9A96" />
        <Fence from={[-2.8, -3.2]} to={[-2.8, -1.05]} c="#9A9A96" />
        <Fence from={[2.2, -3.2]} to={[2.2, -1.05]} c="#9A9A96" />
        {[[-2.1, -2.5, 0.3], [-1.3, -1.8, 2.6], [-1.0, -2.7, 1.2], [0.5, -2.4, -0.6], [1.4, -1.7, 2.9], [1.5, -2.8, 0.9], [-2.2, -1.6, -1.2]].map(([cx, cz, r], k) => (
          <Cow key={k} p={[cx, 0, cz]} ry={r} s={0.8} c={k % 3 ? '#1E1A18' : '#5A3320'} face={k % 3 ? undefined : '#EDE6DA'} bob={Math.sin(t * 2 + k) * 0.04} />
        ))}
        <Box p={[-0.3, 0.18, -0.85]} s={[4.8, 0.2, 0.3]} c="#B9A27A" />
        <Silo p={[2.7, 0, -2.6]} />
        <Silo p={[2.7, 0, -1.3]} h={1.7} />
      </Tile>
    );
  if (i === 2)
    return (
      <Tile x={x} c="#8B8D8F">
        <Box p={[-0.6, 0.95, -2.3]} s={[3.8, 1.9, 1.9]} c="#E7E3DA" r={0.8} />
        {[-2, -0.8, 0.4].map((dx, k) => (
          <mesh key={k} position={[dx + 0.6 - 0.6, 2.15, -2.3]} rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 1.9, 3]} />
            <M c="#B9BDC0" m={0.3} r={0.5} />
          </mesh>
        ))}
        <Cyl p={[1.7, 1.7, -2.9]} r={0.2} h={3.4} c="#9A5040" />
        <mesh position={[-0.6, 1.25, -1.33]}>
          <planeGeometry args={[3.0, 0.55]} />
          <meshStandardMaterial map={signTex('FRIGORÍFICO', '#1E3348', '#EAF2F8')} roughness={0.6} />
        </mesh>
        <Box p={[-0.6, 0.4, -1.34]} s={[1.1, 0.8, 0.02]} c="#38444F" noShadow />
        <Truck p={[1.4 + truckX, 0, -0.1 + (truckX ? 0.9 : 0)]} ry={0} />
      </Tile>
    );
  if (i === 3)
    return (
      <Tile x={x} c="#B7AFA2">
        <Box p={[-0.2, 0.85, -2.3]} s={[3.4, 1.7, 1.8]} c="#EFE7D8" r={0.8} />
        <Box p={[-0.2, 0.62, -1.39]} s={[2.4, 0.9, 0.02]} c="#2B3238" m={0.3} r={0.2} noShadow />
        {Array.from({length: 8}, (_, k) => (
          <Box key={k} p={[-1.8 + 0.2 + k * 0.4, 1.3, -1.12]} s={[0.4, 0.04, 0.62]} rot={[0.42, 0, 0]} c={k % 2 ? '#F4F1EA' : '#C23B2E'} r={0.8} />
        ))}
        <mesh position={[-0.2, 1.62, -1.39]}>
          <planeGeometry args={[2.6, 0.42]} />
          <meshStandardMaterial map={signTex('CARNICERÍA', '#7A1F18', '#FFF3E0')} roughness={0.6} />
        </mesh>
        {/* medias reses en la vidriera */}
        {[-1, -0.2, 0.6].map((dx, k) => (
          <Box key={k} p={[dx, 0.62, -1.5]} s={[0.22, 0.6, 0.1]} c="#B8403A" round={0.05} />
        ))}
      </Tile>
    );
  return (
    <Tile x={x} c="#6E4C35">
      {/* parrilla + mesa */}
      <Box p={[-1.6, 0.45, -2.5]} s={[1.6, 0.9, 1.0]} c="#A5503A" r={0.9} />
      <Box p={[-1.6, 0.95, -2.5]} s={[1.5, 0.05, 0.9]} c="#2A2A2A" m={0.6} r={0.4} />
      <pointLight position={[-1.6, 1.25, -2.5]} intensity={2.2 + Math.sin(t * 9) * 0.4} distance={3.5} color="#FF7A2B" />
      <Box p={[-1.6, 1.0, -2.5]} s={[0.9, 0.06, 0.5]} c="#B23A2A" e="#FF4A1A" ei={0.35} />
      <Box p={[1.1, 0.78, -2.1]} s={[2.4, 0.08, 1.4]} c="#8A5A3A" r={0.8} />
      {[[-0.0, -1.5], [2.2, -1.5], [0.0, -2.7], [2.2, -2.7]].map(([dx, dz], k) => (
        <Box key={k} p={[dx, 0.38, dz]} s={[0.08, 0.76, 0.08]} c="#5E3D28" />
      ))}
      {[0.5, 1.7].map((dx, k) => (
        <Cyl key={k} p={[dx, 0.84, -2.1]} r={0.3} h={0.03} c="#F4F2EE" seg={32} />
      ))}
    </Tile>
  );
};

/** peaje del Estado entre estaciones */
const Toll: React.FC<{x: number; p: number; t: number}> = ({x, p, t}) => {
  if (p <= 0) return null;
  const drop = (1 - easeOut(clamp(p * 1.3))) * 7;
  const arm = easeOut(clamp(p * 1.6 - 0.5));
  return (
    <group position={[x, drop, 0]}>
      <Box p={[0, 0.7, -1.3]} s={[0.7, 1.4, 0.7]} c="#E9E3D8" round={0.05} />
      <Box p={[0, 1.45, -1.3]} s={[0.9, 0.12, 0.9]} c="#C0392B" />
      <mesh position={[0, 1.62, -1.3]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial color="#FF3B2B" emissive="#FF2A1A" emissiveIntensity={1.6 + Math.sin(t * 8) * 0.8} />
      </mesh>
      <group position={[0.25, 0.75, -0.95]} rotation={[0, 0, (1 - arm) * 1.3]}>
        {Array.from({length: 6}, (_, k) => (
          <Box key={k} p={[0, 0, 0.12 + k * 0.33]} s={[0.07, 0.07, 0.33]} c={k % 2 ? '#F4F1EA' : '#D63A2C'} noShadow />
        ))}
      </group>
    </group>
  );
};

export type DioramaState = {
  t: number;
  /** progreso de aparición de cada estación (0→1) */
  show?: number[];
  /** altura de las columnas de precio (0→1) por estación */
  cols?: number[];
  /** peajes (0→1) */
  tolls?: number[];
  /** posición del kilo de carne sobre la ruta (x) */
  tokenX?: number | null;
  truckX?: number;
  /** estaciones tachadas (el Estado "no cría, no engorda...") */
  dim?: number[];
};

/** montos acumulados en cada estación (sin impuestos hasta la carnicería; con impuestos en la mesa) */
export const CUM = [6475, 9435, 9620, 13320, 18500];
export const PARTS = [6475, 2960, 185, 3700, 5180];
export const LINK_COLORS = ['#7DB356', '#E3B341', '#7FB6E6', '#EE82A8', '#E23B2E'];
const COL_H = 7 / 18500;

export const colTop = (i: number, k = 1): V3 => [STX[i] + 2.35, 0.1 + CUM[i] * COL_H * k + 0.35, -3.3];

export const Diorama: React.FC<{s: DioramaState}> = ({s}) => {
  const {t, show = [1, 1, 1, 1, 1], cols = [0, 0, 0, 0, 0], tolls = [0, 0, 0, 0], tokenX = null, truckX = 0} = s;
  return (
    <group>
      {/* ruta */}
      <Box p={[0, 0.02, 0]} s={[46, 0.06, 1.5]} c="#2B2724" r={0.95} />
      {Array.from({length: 23}, (_, k) => (
        <Box key={k} p={[-22 + k * 2, 0.06, 0]} s={[0.9, 0.012, 0.08]} c="#E8D9A8" noShadow />
      ))}
      {STX.map((_, i) => {
        const a = easeOut(clamp(show[i]));
        if (a <= 0.001) return null;
        return (
          <group key={i} position={[0, (1 - a) * -3, 0]} scale={[1, a, 1]}>
            <Station i={i} t={t} truckX={i === 2 ? truckX : 0} />
          </group>
        );
      })}
      {/* columnas de precio acumulado: segmentos de cada eslabón */}
      {STX.map((x, i) => {
        const k = easeOut(clamp(cols[i]));
        if (k <= 0.001) return null;
        let y = 0.1;
        const segs: React.ReactNode[] = [];
        for (let j = 0; j <= i; j++) {
          if (i < 4 && j === 4) continue;
          const part = j === 4 ? PARTS[4] : PARTS[j];
          if (i === 4 || j < 4) {
            const h = part * COL_H * k;
            segs.push(
              <mesh key={j} position={[x + 2.35, y + h / 2, -3.3]} castShadow>
                <boxGeometry args={[0.9, Math.max(0.001, h), 0.9]} />
                <meshStandardMaterial color={LINK_COLORS[j]} roughness={0.35} metalness={0.05} emissive={LINK_COLORS[j]} emissiveIntensity={0.18} />
              </mesh>,
            );
            y += h;
          }
        }
        return <group key={'c' + i}>{segs}</group>;
      })}
      {[-12, -4, 4, 12].map((x, i) => (
        <Toll key={'toll' + i} x={x} p={tolls[i]} t={t} />
      ))}
      {tokenX !== null ? (
        <group position={[tokenX, 0.1 + Math.abs(Math.sin(tokenX * 0.8)) * 0.25, 0.1]}>
          <Tray kind="vaca" s={0.8} />
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ globo */
const RAD = Math.PI / 180;
export const ll2v = (lon: number, lat: number, r = 1): V3 => {
  const phi = (lon + 180) * RAD;
  return [-r * Math.cos(lat * RAD) * Math.cos(phi), r * Math.sin(lat * RAD), r * Math.cos(lat * RAD) * Math.sin(phi)];
};
/** rotación del globo para que (lon, lat) mire a la cámara (+z) */
export const globeRot = (lon: number, lat: number): V3 => [lat * RAD, Math.PI / 2 - (lon + 180) * RAD, 0];
export const globePoint = (lon: number, lat: number, r: number, rot: V3, center: V3 = [0, 0, 0]): V3 => {
  const v = new THREE.Vector3(...ll2v(lon, lat, r)).applyEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'XYZ'));
  return [v.x + center[0], v.y + center[1], v.z + center[2]];
};

/** textura equirectangular transparente con un país pintado (relleno + borde) */
const countryTex = (a3: string, color: string) =>
  canvasTex('ctry-' + a3 + color, 2048, 1024, (g) => {
    const f = (countries as any).features.find((x: any) => x.properties.a3 === a3);
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const X = (lon: number) => ((lon + 180) / 360) * 2048, Y = (lat: number) => ((90 - lat) / 180) * 1024;
    g.beginPath();
    for (const poly of polys)
      for (const ring of poly) {
        ring.forEach((c: number[], i: number) => (i ? g.lineTo(X(c[0]), Y(c[1])) : g.moveTo(X(c[0]), Y(c[1]))));
        g.closePath();
      }
    g.fillStyle = color + '8C';
    g.fill('evenodd');
    g.lineWidth = 3;
    g.strokeStyle = color;
    g.stroke();
  });

/** ruta sobre la superficie que pasa por puntos intermedios (rutas marítimas), levemente elevada */
const routeCurve = (pts: [number, number][], r: number, h: number) => {
  const out: THREE.Vector3[] = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const A = new THREE.Vector3(...ll2v(pts[s][0], pts[s][1], 1)), B = new THREE.Vector3(...ll2v(pts[s + 1][0], pts[s + 1][1], 1));
    const om = Math.max(1e-4, A.angleTo(B));
    for (let i = 0; i < 24; i++) {
      const k = i / 24;
      const v = A.clone().multiplyScalar(Math.sin((1 - k) * om) / Math.sin(om)).add(B.clone().multiplyScalar(Math.sin(k * om) / Math.sin(om)));
      out.push(v.normalize());
    }
  }
  const last = pts[pts.length - 1];
  out.push(new THREE.Vector3(...ll2v(last[0], last[1], 1)));
  const n = out.length - 1;
  return new THREE.CatmullRomCurve3(out.map((v, i) => v.multiplyScalar(r * (1.004 + h * Math.sin((Math.PI * i) / n)))));
};

export type Route = {pts: [number, number][]; p: number; color: string; h?: number};
export const Globe3D: React.FC<{r: number; rot: V3; pos?: V3; countries?: {a3: string; color: string; o: number}[]; routes?: Route[]; t?: number}> = ({
  r, rot, pos = [0, 0, 0], countries: cs = [], routes = [], t = 0,
}) => {
  const tex = IMG_TEX['ep05/globe/day.jpg'];
  const curves = useMemo(() => routes.map((a) => routeCurve(a.pts, r, a.h ?? 0.03)), [JSON.stringify(routes.map((a) => [a.pts, a.h])), r]);
  return (
    <group position={pos} rotation={rot}>
      <mesh>
        <sphereGeometry args={[r, 160, 80]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.28} />
      </mesh>
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[r, 64, 32]} />
        <meshBasicMaterial color="#7FC0FF" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      {cs.map((c) =>
        c.o > 0.01 ? (
          <mesh key={c.a3} scale={[1.002, 1.002, 1.002]}>
            <sphereGeometry args={[r, 160, 80]} />
            <meshBasicMaterial map={countryTex(c.a3, c.color)} transparent opacity={c.o} depthWrite={false} toneMapped={false} />
          </mesh>
        ) : null,
      )}
      {curves.map((curve, i) => {
        const a = routes[i];
        const k = clamp(a.p);
        if (k <= 0.005) return null;
        const all = curve.getPoints(160);
        const pts = all.slice(0, Math.max(2, Math.round(160 * k) + 1));
        const sub = new THREE.CatmullRomCurve3(pts);
        const head = pts[pts.length - 1];
        return (
          <group key={i}>
            <mesh>
              <tubeGeometry args={[sub, Math.max(8, pts.length), r * 0.009, 8, false]} />
              <meshBasicMaterial color={a.color} toneMapped={false} />
            </mesh>
            <mesh position={head}>
              <sphereGeometry args={[r * (0.02 + 0.006 * Math.sin(t * 6)), 16, 12]} />
              <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
