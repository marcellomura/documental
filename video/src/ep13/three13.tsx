/* Escenas 3D del episodio 13 (EL LOTE 31.202): las fetas del modelo del queso suizo como placas de acrílico ámbar con
   agujeros (el agujero de la falla se abre y se corre hasta alinearse con los demás), la ampolla de fentanilo (vidrio
   torneado con líquido, etiqueta del lote y anillo de corte), la décima barrera del hospital en verde quirúrgico y la
   línea de llenado de la sala limpia. */
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {clamp, easeInOut, rnd} from '../lib/anim';
import type {Cam, V3} from '../ep06/three6';
export {project, camPath, lerpCam} from '../ep06/three6';
export type {Cam, V3} from '../ep06/three6';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: Cam; aspect: number}> = ({cam, aspect}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 35;
  c.aspect = aspect;
  c.near = 0.05;
  c.far = 400;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  return null;
};
/** estudio de producto: fondo negro con cajas de luz (cenital, dos tiras laterales y un contraluz cálido); en el vidrio
 *  deja reflejos nítidos sobre negro en vez del velo gris parejo de la habitación */
const studioScene = () => {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color('#030607');
  const panel = (w: number, h: number, pos: V3, rot: V3, k: number, color = '#FFFFFF') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide}));
    m.position.set(...pos);
    m.rotation.set(...rot);
    sc.add(m);
  };
  panel(5, 5, [0, 7, 0], [Math.PI / 2, 0, 0], 2.4);
  panel(1.1, 9, [-5.5, 0.5, 2.0], [0, Math.PI / 2, 0], 5.0);
  panel(0.7, 9, [5.5, 0.5, -0.5], [0, -Math.PI / 2, 0], 3.2, '#DDF4FF');
  panel(7, 0.7, [0, 1.6, -6.5], [0, 0, 0], 2.4, '#FFE1B5');
  panel(16, 16, [0, -5, 0], [-Math.PI / 2, 0, 0], 0.08);
  return sc;
};
/** entorno de reflejos (vidrio y acrílico): se arma una sola vez por lienzo */
const EnvSetup: React.FC<{k: number; kind: 'room' | 'studio'}> = ({k, kind}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(kind === 'studio' ? studioScene() : new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  }, [gl, scene, kind]);
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = k;
  return null;
};
export const Stage13: React.FC<{cam: Cam; bg?: string; fog?: [string, number, number]; exposure?: number; children: React.ReactNode; style?: React.CSSProperties; w?: number; h?: number; env?: number; envKind?: 'room' | 'studio'}> = ({
  cam, bg, fog, exposure = 1, children, style, w = 1920, h = 1080, env = 0.6, envKind = 'room',
}) => (
  <ThreeCanvas width={w} height={h} gl={{antialias: true, alpha: !bg, toneMappingExposure: exposure, preserveDrawingBuffer: true}} style={{position: 'absolute', left: 0, top: 0, ...style}}>
    <Rig cam={cam} aspect={w / h} />
    {env > 0 ? <EnvSetup k={env} kind={envKind} /> : null}
    {bg ? <color attach="background" args={[bg]} /> : null}
    {fog ? <fog attach="fog" args={fog} /> : null}
    {children}
  </ThreeCanvas>
);

/** luces de estudio clínico: cenital fría, relleno verdoso, contraluz cálido */
export const Lights13: React.FC<{key0?: V3; keyI?: number; fill?: number; rim?: number; rimColor?: string; warm?: number}> = ({key0 = [4, 7, 6], keyI = 2.2, fill = 0.55, rim = 1.4, rimColor = '#FFC870', warm = 0}) => (
  <>
    <hemisphereLight args={['#DDF6F1', '#0B1A1A', fill]} />
    <directionalLight position={key0} intensity={keyI} color="#F4FFFC" />
    <directionalLight position={[-6, 3, -8]} intensity={rim} color={rimColor} />
    <directionalLight position={[0, -4, 6]} intensity={0.35 + warm} color="#FFB45C" />
  </>
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
  tx.anisotropy = 4;
  TEX[key] = tx;
  return tx;
};
export const glowTex = () =>
  canvasTex('glow13', 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });
/** etiqueta genérica de la ampolla (sin marcas): droga, concentración, lote y código de barras */
const labelTex = (lot: string) =>
  canvasTex('label' + lot, 1024, 256, (g) => {
    g.fillStyle = '#F6F7F2';
    g.fillRect(0, 0, 1024, 256);
    g.fillStyle = '#0E7F72';
    g.fillRect(0, 0, 1024, 26);
    g.fillRect(0, 230, 1024, 26);
    g.fillStyle = '#0B1416';
    g.font = '700 74px Geist, Arial, sans-serif';
    g.fillText('FENTANILO', 40, 112);
    g.font = '500 30px Geist, Arial, sans-serif';
    g.fillText('citrato · 0,05 mg/ml · iny. IV', 42, 156);
    g.font = '600 34px "Geist Mono", monospace';
    g.fillText('LOTE ' + lot, 42, 206);
    for (let i = 0; i < 46; i++) {
      const w = 2 + ((i * 7) % 5);
      g.fillRect(620 + i * 8.4, 70, w, 120);
    }
    g.font = '500 22px "Geist Mono", monospace';
    g.fillText('7 7 9 3 1 2 0 2 0 0 4 1', 640, 214);
  });

/* ================================================================== FETA */
export const SLICE_W = 3.2;
export const SLICE_H = 2.2;
export const SLICE_D = 0.1;
/** posición del agujero alineado (por donde pasa la ampolla) */
export const PATH_XY: [number, number] = [0.32, -0.05];

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};
/** posición del agujero de la falla cuando NO está alineado (cada feta lo tiene en otro lugar) */
export const missPos = (i: number): [number, number] => {
  const a = rnd(i * 3 + 101) * Math.PI * 2;
  return [PATH_XY[0] + Math.cos(a) * 0.85 - 0.25, PATH_XY[1] + Math.sin(a) * 0.55];
};
/** distancia de un punto al segmento a–b */
const segDist = (x: number, y: number, a: [number, number], b: [number, number]) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(x - (a[0] + dx * t), y - (a[1] + dy * t));
};
/** agujeros fijos de cada feta (deterministas por índice), lejos del recorrido del agujero de la falla:
 *  si se tocan, la triangulación del ExtrudeGeometry deja triángulos sueltos */
export const sliceHoles = (i: number): [number, number, number][] => {
  const out: [number, number, number][] = [];
  const mp = missPos(i);
  for (let k = 0; out.length < 5 && k < 80; k++) {
    const x = (rnd(i * 31 + k * 7) - 0.5) * (SLICE_W - 0.7);
    const y = (rnd(i * 17 + k * 13 + 5) - 0.5) * (SLICE_H - 0.6);
    const r = 0.1 + rnd(i * 5 + k) * 0.17;
    if (Math.abs(x) + r > SLICE_W / 2 - 0.12 || Math.abs(y) + r > SLICE_H / 2 - 0.12) continue;
    if (Math.hypot(x - PATH_XY[0], y - PATH_XY[1]) < 0.75) continue;
    if (segDist(x, y, mp, PATH_XY) < 0.3 + r + 0.1) continue;
    if (out.some(([a, b, c]) => Math.hypot(a - x, b - y) < c + r + 0.12)) continue;
    out.push([x, y, r]);
  }
  return out;
};

export type SliceProps = {
  i: number; pos: V3; open?: number; align?: number; color?: string; o?: number; glow?: number; tilt?: number; solid?: boolean; edge?: string; scale?: number; hole?: [number, number] | null;
};
/** feta: placa de acrílico translúcido con agujeros; open = radio del agujero de la falla (0–1), align = cuánto se corrió hacia el camino */
export const Slice: React.FC<SliceProps> = ({i, pos, open = 0, align = 0, color = '#F2C14E', o = 1, glow = 0, tilt = 0, solid = false, edge = '#FFE7A8', scale = 1, hole = null}) => {
  const mp = missPos(i);
  const hx = hole ? hole[0] : mix(mp[0], PATH_XY[0], align);
  const hy = hole ? hole[1] : mix(mp[1], PATH_XY[1], align);
  const r = 0.3 * clamp(open);
  const key = `${i}|${r.toFixed(3)}|${hx.toFixed(3)}|${hy.toFixed(3)}|${solid ? 1 : 0}`;
  const geo = useMemo(() => {
    const s = roundedRect(SLICE_W, SLICE_H, 0.2);
    if (!solid) {
      for (const [x, y, rr] of sliceHoles(i)) {
        const p = new THREE.Path();
        p.absarc(x, y, rr, 0, Math.PI * 2, true);
        s.holes.push(p);
      }
    }
    if (r > 0.012) {
      const p = new THREE.Path();
      p.absarc(hx, hy, r, 0, Math.PI * 2, true);
      s.holes.push(p);
    }
    const g = new THREE.ExtrudeGeometry(s, {depth: SLICE_D, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 2, curveSegments: 40});
    g.translate(0, 0, -SLICE_D / 2);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 30), [geo]);
  return (
    <group position={pos} rotation={[0, tilt, 0]} scale={scale}>
      <mesh geometry={geo} renderOrder={2}>
        <meshPhysicalMaterial color={color} roughness={0.32} metalness={0} clearcoat={0.6} clearcoatRoughness={0.25} transparent opacity={0.8 * o} emissive={color} emissiveIntensity={0.06 + glow * 0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges} renderOrder={3}>
        <lineBasicMaterial color={edge} transparent opacity={0.55 * o} />
      </lineSegments>
      {r > 0.012 ? (
        <mesh position={[hx, hy, SLICE_D / 2 + 0.03]} renderOrder={4}>
          <ringGeometry args={[r * 1.0, r * 1.12, 48]} />
          <meshBasicMaterial color="#FF3B30" transparent opacity={o * clamp(open * 1.6)} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** distancia entre fetas a lo largo de z */
export const GAP_Z = 1.15;
export const sliceZ = (i: number, n = 9) => (i - (n - 1) / 2) * GAP_Z;

/* ================================================================== AMPOLLA */
const AMP_PROFILE: [number, number][] = [
  [0.0, 0.0], [0.15, 0.0], [0.19, 0.025], [0.2, 0.06], [0.2, 0.56], [0.19, 0.6], [0.15, 0.645], [0.1, 0.68], [0.068, 0.715],
  [0.064, 0.735], [0.075, 0.76], [0.105, 0.8], [0.112, 0.84], [0.1, 0.9], [0.07, 0.955], [0.035, 0.99], [0.0, 1.0],
];
const LIQ_PROFILE: [number, number][] = [[0.0, 0.015], [0.17, 0.015], [0.185, 0.04], [0.185, 0.46], [0.0, 0.46]];
const lathe = (pts: [number, number][], seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/** ampolla de vidrio (altura 1): líquido, etiqueta del lote y anillo de corte rojo; cloud = turbidez/contaminación */
export const Ampoule: React.FC<{pos?: V3; rot?: V3; s?: number; lot?: string; cloud?: number; glow?: number; o?: number; label?: boolean; studio?: boolean}> = ({pos = [0, 0, 0], rot = [0, 0, 0], s = 1, lot = '31202', cloud = 0, glow = 0, o = 1, label = true, studio = false}) => {
  const glass = useMemo(() => lathe(AMP_PROFILE), []);
  const liq = useMemo(() => lathe(LIQ_PROFILE), []);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh geometry={glass} renderOrder={5}>
        <meshPhysicalMaterial color="#F2FFFC" roughness={0.02} metalness={0} transparent opacity={(studio ? 0.1 : 0.2) * o} clearcoat={1} clearcoatRoughness={0.03} specularIntensity={1} envMapIntensity={1.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={glass} scale={[1.004, 1, 1.004]} renderOrder={6}>
        <meshBasicMaterial color="#E9FFFA" transparent opacity={(studio ? 0.025 : 0.08) * o} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {studio ? (
        // reflejos puros del estudio sumados encima: el negro no suma nada y las cajas de luz dibujan el vidrio
        <mesh geometry={glass} scale={[1.006, 1.001, 1.006]} renderOrder={10}>
          <meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0.07} envMapIntensity={1.15} transparent opacity={0.95 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ) : null}
      <mesh geometry={liq} renderOrder={4}>
        <meshPhysicalMaterial
          color={new THREE.Color('#CFF3EC').lerp(new THREE.Color('#E8B3A8'), clamp(cloud))}
          roughness={0.2 + cloud * 0.5}
          transparent
          opacity={(0.38 + cloud * 0.45) * o}
          emissive={new THREE.Color('#FF3B30')}
          emissiveIntensity={glow * 0.8}
          depthWrite={false}
        />
      </mesh>
      {label ? (
        <mesh position={[0, 0.3, 0]} renderOrder={7}>
          <cylinderGeometry args={[0.203, 0.203, 0.3, 48, 1, true]} />
          <meshStandardMaterial map={labelTex(lot)} roughness={0.6} transparent opacity={o} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
      <mesh position={[0, 0.722, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={8}>
        <torusGeometry args={[0.068, 0.009, 10, 40]} />
        <meshStandardMaterial color="#D9372E" roughness={0.4} transparent opacity={o} />
      </mesh>
      {glow > 0 ? (
        <sprite scale={[1.4, 1.4, 1]} position={[0, 0.4, 0]} renderOrder={9}>
          <spriteMaterial map={glowTex()} color="#FF4A3D" transparent opacity={0.55 * glow * o} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ) : null}
    </group>
  );
};

/** bacterias en suspensión (bastoncitos rojos) alrededor de un punto */
export const Microbes: React.FC<{t: number; center?: V3; n?: number; spread?: number; o?: number; size?: number; color?: string}> = ({t, center = [0, 0, 0], n = 40, spread = 1, o = 1, size = 0.05, color = '#FF5A4E'}) => (
  <group position={center}>
    {Array.from({length: n}, (_, i) => {
      const a = rnd(i) * Math.PI * 2, b = (rnd(i + 3) - 0.5) * Math.PI, rr = spread * (0.3 + rnd(i + 7) * 0.7);
      const x = Math.cos(a) * Math.cos(b) * rr + Math.sin(t * 0.7 + i) * 0.04;
      const y = Math.sin(b) * rr + Math.cos(t * 0.5 + i * 1.3) * 0.04;
      const z = Math.sin(a) * Math.cos(b) * rr;
      return (
        <mesh key={i} position={[x, y, z]} rotation={[t * 0.4 + i, i * 0.7, t * 0.3]}>
          <capsuleGeometry args={[size * 0.35, size * 1.4, 4, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={o} />
        </mesh>
      );
    })}
  </group>
);

/* ================================================================== SALA LIMPIA */
/** sala limpia con línea de llenado: piso de epoxi, paneles, filtros HEPA, cinta con ampollas y agujas que suben y bajan */
export const CleanRoom: React.FC<{t: number; speed?: number; red?: number; arsenic?: number; dirty?: number}> = ({t, speed = 0.35, red = 0, arsenic = 0, dirty = 0}) => {
  const spacing = 0.42;
  const n = 26;
  const shift = (t * speed) % spacing;
  return (
    <group>
      {/* piso y paredes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#CBD8D5" roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[0, 3, -4]}>
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#E3EBE9" roughness={0.6} />
      </mesh>
      {Array.from({length: 13}, (_, i) => (
        <mesh key={'p' + i} position={[-12 + i * 2, 3, -3.99]}>
          <planeGeometry args={[0.02, 8]} />
          <meshBasicMaterial color="#9FB3AF" />
        </mesh>
      ))}
      {/* techo con filtros HEPA luminosos */}
      {Array.from({length: 6}, (_, i) => (
        <mesh key={'h' + i} position={[-7.5 + i * 3, 3.6, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshBasicMaterial color={new THREE.Color('#F4FFFD').lerp(new THREE.Color('#FFB3AA'), red * 0.6)} toneMapped={false} />
        </mesh>
      ))}
      {/* flujo laminar: hilos que bajan */}
      {Array.from({length: 60}, (_, i) => {
        const x = -9 + (i % 20) * 0.95 + rnd(i) * 0.3;
        const z = -2.2 + Math.floor(i / 20) * 1.1;
        const y = 3.4 - (((t * 0.9 + rnd(i + 9) * 4) % 3.4));
        return (
          <mesh key={'f' + i} position={[x, y, z]}>
            <boxGeometry args={[0.006, 0.5, 0.006]} />
            <meshBasicMaterial color={red > 0.3 ? '#FF6A5E' : '#BFF6EC'} transparent opacity={0.22} />
          </mesh>
        );
      })}
      {/* cinta transportadora */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[14, 0.08, 0.7]} />
        <meshStandardMaterial color="#9AA8A7" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[14, 0.8, 0.5]} />
        <meshStandardMaterial color="#C9D3D1" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* estación de llenado con 4 agujas */}
      <mesh position={[0.2, 2.05, 0]}>
        <boxGeometry args={[2.0, 0.7, 1.0]} />
        <meshStandardMaterial color="#D8E0DE" metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({length: 4}, (_, k) => {
        const dip = Math.max(0, Math.sin(t * Math.PI * 1.6)) * 0.28;
        return (
          <mesh key={'n' + k} position={[-0.45 + k * 0.42 + 0.2, 1.55 - dip, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
            <meshStandardMaterial color="#EEF2F1" metalness={1} roughness={0.15} />
          </mesh>
        );
      })}
      {/* ampollas en la cinta */}
      {Array.from({length: n}, (_, k) => {
        const x = -6.5 + k * spacing + shift;
        const filled = x > 0.6;
        return <Ampoule key={'a' + k} pos={[x, 0.86, 0]} s={0.42} label={false} cloud={filled ? dirty : 0} glow={filled ? dirty * 0.3 : 0} />;
      })}
      {/* cañería de agua para inyectables (se marca en rojo con el arsénico) */}
      <mesh position={[0, 0.25, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 14, 20]} />
        <meshStandardMaterial color={new THREE.Color('#B7C4C2').lerp(new THREE.Color('#FF3B30'), arsenic)} emissive={new THREE.Color('#FF3B30')} emissiveIntensity={arsenic * 0.6} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

/** cámara que respira (leve deriva) */
export const breathe = (cam: Cam, t: number, k = 1): Cam => ({
  ...cam,
  pos: [cam.pos[0] + Math.sin(t * 0.21) * 0.06 * k, cam.pos[1] + Math.sin(t * 0.17 + 1) * 0.04 * k, cam.pos[2] + Math.sin(t * 0.13 + 2) * 0.05 * k],
});
export const ease = easeInOut;
