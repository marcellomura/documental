/* Ep16 (EL PUNTO DÉBIL): tiempos atados a la locución, geografía y cámara orbital.
   Convención 3D: la Tierra es una esfera de radio 1 centrada en el origen; +Y es el norte, +X apunta a lat 0° lon 0°
   y −Z a lon 90° E (así coincide con las coordenadas UV de THREE.SphereGeometry y las texturas equirectangulares). */
import * as THREE from 'three';
import wL from '../data/ep16/words.json';
import tL from '../data/ep16/timeline.json';
import wV from '../data/ep16v/words.json';
import tV from '../data/ep16v/timeline.json';
import {clamp} from '../lib/anim';

export type Word = {w: string; s: number; e: number};
export type TLData = {fps: number; orden: string[]; starts: Record<string, number>; durations: Record<string, number>; inserts: Record<string, [number, number][]>; end: number; total: number};
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const makeTL = (TL: TLData, W: Record<string, Word[]>) => {
  /** tiempo ABSOLUTO (s) en que se dice una frase del segmento; n = ocurrencia; which = inicio o fin */
  const at = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's'): number => {
    const list = W[seg];
    if (!list) throw new Error(`segmento ${seg} no está en esta línea de tiempo`);
    const target = norm(phrase);
    let found = -1;
    for (let i = 0; i < list.length; i++) {
      let acc = '';
      for (let j = i; j < list.length && acc.length < target.length + 40; j++) {
        acc += norm(list[j].w);
        if (acc === target || (j === i && acc.startsWith(target))) {
          found++;
          if (found === n) return TL.starts[seg] + (which === 's' ? list[i].s : list[j].e);
          break;
        }
        if (!target.startsWith(acc)) break;
      }
    }
    throw new Error(`frase no encontrada: ${seg} "${phrase}" #${n}`);
  };
  return {
    TL, W, at,
    atE: (seg: string, phrase: string, n = 0) => at(seg, phrase, n, 'e'),
    start: (seg: string) => TL.starts[seg],
    end: (seg: string) => TL.starts[seg] + TL.durations[seg],
    has: (seg: string) => seg in TL.starts,
    TOTAL: TL.total,
    words: () => TL.orden.flatMap((k) => (W[k] ?? []).map((x) => ({w: x.w, s: TL.starts[k] + x.s, e: TL.starts[k] + x.e}))),
  };
};
export type TLx = ReturnType<typeof makeTL>;
export const L = makeTL(tL as unknown as TLData, wL as Record<string, Word[]>);
export const V = makeTL(tV as unknown as TLData, wV as Record<string, Word[]>);

/* ------------------------------------------------------------------ geografía */
export type V3 = [number, number, number];
const D = Math.PI / 180;
export const xyz = (lat: number, lon: number, r = 1): V3 => [r * Math.cos(lat * D) * Math.cos(lon * D), r * Math.sin(lat * D), -r * Math.cos(lat * D) * Math.sin(lon * D)];
/** del sistema de los datos (x a lon 0°, y a 90° E, z al norte) al de la escena */
export const fromData = (x: number, y: number, z: number): V3 => [x, z, -y];
export const latlonOf = (p: V3): [number, number] => {
  const r = Math.hypot(...p);
  return [Math.asin(p[1] / r) / D, Math.atan2(-p[2], p[0]) / D];
};
export const RE = 6371.2;
export const altR = (km: number) => 1 + km / RE;
export const sunFrom = (lat: number, lon: number): V3 => xyz(lat, lon, 1);
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const nrm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const mixV = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/* ------------------------------------------------------------------ cámara orbital */
/** blanco en (lat, lon) a radio r0 (0 = centro de la Tierra); la cámara está a `range` del blanco, inclinada `tilt`
 *  grados respecto de la vertical del lugar y mirando hacia el rumbo `head` (0 = norte). dx/dy corren el blanco en
 *  pantalla (fracción del ancho/alto, + a la derecha/abajo). */
export type GeoCam = {lat: number; lon: number; r0?: number; range: number; tilt?: number; head?: number; fov?: number; roll?: number; dx?: number; dy?: number};
export const camBasis = (c: GeoCam) => {
  const la = c.lat * D, lo = c.lon * D;
  const up: V3 = [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)];
  const east: V3 = [-Math.sin(lo), 0, -Math.cos(lo)];
  const north: V3 = [-Math.sin(la) * Math.cos(lo), Math.cos(la), Math.sin(la) * Math.sin(lo)];
  const h = (c.head ?? 0) * D, tl = (c.tilt ?? 0) * D;
  const dirH = nrm(add(north.map((v) => v * Math.cos(h)) as V3, east, Math.sin(h)));
  const T: V3 = up.map((v) => v * (c.r0 ?? 0)) as V3;
  const P = add(T, add(up.map((v) => v * Math.cos(tl)) as V3, dirH, -Math.sin(tl)), c.range);
  const U = nrm(add(up.map((v) => v * Math.sin(tl)) as V3, dirH, Math.cos(tl)));
  return {T, P, U};
};
const _cam = new THREE.PerspectiveCamera();
export const setupCamera = (cam: THREE.PerspectiveCamera, c: GeoCam, w: number, h: number) => {
  const {T, P, U} = camBasis(c);
  // en vertical, el ancho cubre lo que en horizontal cubre el alto (el globo llena el ancho)
  const f = c.fov ?? 35;
  cam.fov = w < h ? (2 * Math.atan(Math.tan((f * D) / 2) * (h / w) * 0.82)) / D : f;
  cam.aspect = w / h;
  const dist = c.range;
  cam.near = Math.max(1e-5, Math.min(0.05, dist * 0.02));
  cam.far = 200;
  cam.position.set(...P);
  cam.up.set(...U);
  cam.lookAt(...T);
  if (c.roll) cam.rotateZ(c.roll * D);
  if (c.dx || c.dy) cam.setViewOffset(w, h, -(c.dx ?? 0) * w, -(c.dy ?? 0) * h, w, h);
  else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  return cam;
};
/** punto 3D → píxeles de pantalla (y si está delante de la cámara y del lado visible del globo) */
export const project = (c: GeoCam, p: V3, w: number, h: number, occlude = true): {x: number; y: number; vis: number} => {
  setupCamera(_cam, c, w, h);
  const v = new THREE.Vector3(...p).project(_cam);
  let vis = v.z < 1 ? 1 : 0;
  if (occlude) {
    // detrás del globo: el rayo cámara→punto corta la esfera de radio 1 antes de llegar
    const o = _cam.position, d = new THREE.Vector3(...p).sub(o);
    const L = d.length(); d.normalize();
    const b = o.dot(d), cc = o.lengthSq() - 1, disc = b * b - cc;
    if (disc > 0) {
      const t0 = -b - Math.sqrt(disc);
      if (t0 > 1e-4 && t0 < L - 1e-3) vis = 0;
    }
  }
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, vis};
};

const angLerp = (a: number, b: number, k: number) => {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * k;
};
export const lerpCam = (a: GeoCam, b: GeoCam, k: number): GeoCam => ({
  lat: a.lat + (b.lat - a.lat) * k,
  lon: angLerp(a.lon, b.lon, k),
  r0: (a.r0 ?? 0) + ((b.r0 ?? 0) - (a.r0 ?? 0)) * k,
  range: Math.exp(Math.log(a.range) + (Math.log(b.range) - Math.log(a.range)) * k),
  tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * k,
  head: angLerp(a.head ?? 0, b.head ?? 0, k),
  fov: (a.fov ?? 35) + ((b.fov ?? 35) - (a.fov ?? 35)) * k,
  roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * k,
  dx: (a.dx ?? 0) + ((b.dx ?? 0) - (a.dx ?? 0)) * k,
  dy: (a.dy ?? 0) + ((b.dy ?? 0) - (a.dy ?? 0)) * k,
});
const smooth = (k: number) => k * k * k * (k * (k * 6 - 15) + 10);
/** recorrido de cámara por llaves [t, cam]; entre llaves, suavizado (o lineal si ease=false) */
export const camPath = (t: number, keys: [number, GeoCam][], ease: (k: number) => number = smooth): GeoCam => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) return lerpCam(a, b, ease(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
  }
  return keys[keys.length - 1][1];
};

/* ------------------------------------------------------------------ formatos */
export const fmtN = (n: number, dec = 0) => {
  const s = Math.abs(n).toFixed(dec);
  const [i, d] = s.split('.');
  const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '−' : '') + (d ? `${ii},${d}` : ii);
};
export const fmtLat = (v: number, dec = 2) => `${fmtN(Math.abs(v), dec)}° ${v < 0 ? 'S' : 'N'}`;
export const fmtLon = (v: number, dec = 2) => `${fmtN(Math.abs(v), dec)}° ${v < 0 ? 'O' : 'E'}`;
