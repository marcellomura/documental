/* 3D del ep16 (EL PUNTO DÉBIL). La Tierra real y el campo magnético calculado:
   - Tierra: Blue Marble (día), Black Marble (luces), nubes reales del 1/11/2025 (VIIRS), brillo del sol en el agua y
     detalles anidados para bajar hasta el monte chaqueño (Blue Marble de Sudamérica y Sentinel-2 en tres escalas)
   - Campo en superficie (IGRF-14, 1900-2030) con isolíneas, la zona débil y su umbral; el borde del núcleo (Br)
   - Líneas de campo trazadas con el IGRF, la superficie de rebote del cinturón interior (la abolladura), partículas
     atrapadas, las mediciones de protones del MetOp-A, órbitas, el núcleo en corte, el viento solar y Marte.
   Todo se precarga con useAssets16() en la raíz de la composición: el lienzo 3D de Remotion sólo se dibuja cuando
   cambia el cuadro, así que lo que llega tarde no saldría en la captura. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {continueRender, delayRender, staticFile} from 'remotion';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {clamp, rnd} from '../lib/anim';
import {altR, fromData, setupCamera, xyz, type GeoCam, type V3} from './lib16';
import CAMPO from '../data/ep16/campo.json';
import TEXJ from '../../public/ep16/tex/tex.json';

/* ------------------------------------------------------------------ recursos */
type Box = [number, number, number, number];
export const INSETS = TEXJ.insets as unknown as Record<string, {bbox: Box; src: string}>;
const TX: Record<string, THREE.Texture> = {};
const FIELD: Record<string, {tex: THREE.DataTexture; data: Float32Array; w: number; h: number}> = {};
export const YEARS = (CAMPO as unknown as {areas: {y: number}[]}).areas.map((a) => a.y);
let METOP: Float32Array | null = null;
let BELT_GEO: THREE.BufferGeometry | null = null;

const loadTex = (key: string, file: string, srgb = true) =>
  new Promise<void>((res) => {
    new THREE.TextureLoader().load(staticFile(file), (t) => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      TX[key] = t;
      res();
    }, undefined, () => { console.error('no cargó', file); res(); });
  });

/** PNG con 16 bits repartidos en R (alto) y G (bajo) → valores 0..1 (fila 0 = norte) */
const loadPng16 = (file: string) =>
  new Promise<{data: Float32Array; w: number; h: number}>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const g = c.getContext('2d', {willReadFrequently: true})!;
      g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, img.width, img.height).data;
      const out = new Float32Array(img.width * img.height);
      for (let i = 0; i < out.length; i++) out[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 65535;
      res({data: out, w: img.width, h: img.height});
    };
    img.onerror = rej;
    img.src = staticFile(file);
  });

/** valores físicos → textura de medio punto flotante, con la fila del sur primero (v = 0 en el polo sur) */
const fieldTex = (vals: Float32Array, w: number, h: number) => {
  const half = new Uint16Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) half[(h - 1 - y) * w + x] = THREE.DataUtils.toHalfFloat(vals[y * w + x]);
  const t = new THREE.DataTexture(half, w, h, THREE.RedFormat, THREE.HalfFloatType);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
};
/** F en nT/100.000 (la mitad flotante guarda bien 0,2-0,7), Br en mT, altura en miles de km */
const loadField = async (key: string, file: string, conv: (v: number) => number) => {
  const {data, w, h} = await loadPng16(file);
  const vals = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) vals[i] = conv(data[i]);
  FIELD[key] = {tex: fieldTex(vals, w, h), data: vals, w, h};
};

/** la superficie de |B| constante donde rebota el cinturón interior: esfera deformada con la altura de cada punto */
const buildBelt = () => {
  const f = FIELD.belt;
  const g = new THREE.SphereGeometry(1, 360, 180);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const hAttr = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const lat = Math.asin(clamp(y, -1, 1)) * 180 / Math.PI, lon = Math.atan2(-z, x) * 180 / Math.PI;
    // grilla de 1°: fila 0 = 89,5° N, columna 0 = 179,5° O
    const fy = clamp(89.5 - lat, 0, f.h - 1), fx = ((lon + 179.5) % 360 + 360) % 360;
    const y0 = Math.floor(fy), x0 = Math.floor(fx) % f.w, y1 = Math.min(y0 + 1, f.h - 1), x1 = (x0 + 1) % f.w;
    const ky = fy - y0, kx = fx - Math.floor(fx);
    const v = (f.data[y0 * f.w + x0] * (1 - kx) + f.data[y0 * f.w + x1] * kx) * (1 - ky) + (f.data[y1 * f.w + x0] * (1 - kx) + f.data[y1 * f.w + x1] * kx) * ky;
    const hk = v * 4000; // km
    hAttr[i] = hk;
    const r = 1 + hk / 6371.2;
    pos.setXYZ(i, x * r, y * r, z * r);
  }
  g.setAttribute('hkm', new THREE.BufferAttribute(hAttr, 1));
  g.computeVertexNormals();
  BELT_GEO = g;
};

/** altura (km) de la superficie de rebote del cinturón interior en (lat, lon), del mapa de 1° */
export const beltH = (lat: number, lon: number) => {
  const f = FIELD.belt;
  if (!f) return 0;
  const fy = clamp(89.5 - lat, 0, f.h - 1), fx = (((lon + 179.5) % 360) + 360) % 360;
  const y0 = Math.floor(fy), x0 = Math.floor(fx) % f.w, y1 = Math.min(y0 + 1, f.h - 1), x1 = (x0 + 1) % f.w;
  const ky = fy - y0, kx = fx - Math.floor(fx);
  return ((f.data[y0 * f.w + x0] * (1 - kx) + f.data[y0 * f.w + x1] * kx) * (1 - ky) + (f.data[y1 * f.w + x0] * (1 - kx) + f.data[y1 * f.w + x1] * kx) * ky) * 4000;
};
let preP: Promise<void> | null = null;
const preload16 = () => {
  preP = preP ?? Promise.all([
    loadTex('day', 'ep16/tex/day.jpg'), loadTex('night', 'ep16/tex/night.jpg'), loadTex('clouds', 'ep16/tex/clouds.jpg', false),
    loadTex('water', 'ep16/tex/water.png', false), loadTex('sa', 'ep16/tex/sa.jpg'), loadTex('c9', 'ep16/tex/s2_chaco9.jpg'),
    loadTex('c2', 'ep16/tex/s2_chaco2.jpg'), loadTex('c05', 'ep16/tex/s2_chaco05.jpg'), loadTex('mars', 'ep16/tex/mars.jpg'),
    ...YEARS.map((y) => loadField(`F${y}`, `ep16/data/F_${y}.png`, (v) => (15000 + v * 55000) / 100000)),
    loadField('br2025', 'ep16/data/br_cmb_2025.png', (v) => v * 2 - 1),
    ...[1900, 1960, 2025].map((y) => loadField(`br10_${y}`, `ep16/data/br_cmb10_${y}.png`, (v) => v * 2 - 1)),
    loadField('belt', 'ep16/data/belt_h.png', (v) => v).then(buildBelt),
    fetch(staticFile('ep16/data/metop_p16.bin')).then((r) => r.arrayBuffer()).then((b) => { METOP = new Float32Array(b); }),
  ]).then(() => undefined);
  return preP;
};
let assetsOk = false;
/** en la raíz de cada composición: true cuando todo el 3D está listo */
export const useAssets16 = () => {
  const [ok, setOk] = React.useState(assetsOk);
  const [h] = React.useState(() => (assetsOk ? null : delayRender('recursos del 3D (ep16)', {timeoutInMilliseconds: 240000})));
  React.useEffect(() => {
    if (ok) return;
    preload16().then(() => { assetsOk = true; setOk(true); }).catch((e) => { console.error(e); assetsOk = true; setOk(true); });
  }, [ok]);
  React.useEffect(() => { if (ok && h !== null) continueRender(h); }, [ok, h]);
  return ok;
};

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: GeoCam; w: number; h: number}> = ({cam, w, h}) => {
  const {camera} = useThree();
  setupCamera(camera as THREE.PerspectiveCamera, cam, w, h);
  return null;
};
/** lienzo 3D con fondo de espacio y estrellas; los hijos usan las coordenadas de lib16 */
export const Stage16: React.FC<{cam: GeoCam; w: number; h: number; exposure?: number; stars?: number; bg?: string; children: React.ReactNode}> = ({cam, w, h, exposure = 1, stars = 1, bg = '#010207', children}) => (
  <ThreeCanvas width={w} height={h} gl={{antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}} style={{position: 'absolute', left: 0, top: 0}}>
    <Rig cam={cam} w={w} h={h} />
    <color attach="background" args={[bg]} />
    {stars > 0 ? <Stars k={stars} /> : null}
    {children}
  </ThreeCanvas>
);

/* ------------------------------------------------------------------ estrellas */
const STAR_VS = `attribute float sz; attribute vec3 col; varying vec3 vC; uniform float k;
void main(){ vC = col * k; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = sz; }`;
const STAR_FS = `varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vC * a, 1.0);
#include <colorspace_fragment>
}`;
let STAR_GEO: THREE.BufferGeometry | null = null;
const Stars: React.FC<{k: number}> = ({k}) => {
  const geo = useMemo(() => {
    if (STAR_GEO) return STAR_GEO;
    const n = 7000, p = new Float32Array(n * 3), s = new Float32Array(n), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rnd(i * 3.1 + 1) * 2 - 1, th = rnd(i * 7.7 + 2) * Math.PI * 2, r = 150;
      const q = Math.sqrt(1 - u * u);
      p.set([r * q * Math.cos(th), r * u, r * q * Math.sin(th)], i * 3);
      const m = Math.pow(rnd(i * 1.3 + 5), 6);
      s[i] = 1.2 + m * 3.2;
      const temp = rnd(i * 9.1 + 3), b = 0.25 + m * 1.6;
      c.set([b * (0.85 + temp * 0.25), b * 0.92, b * (1.15 - temp * 0.3)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('sz', new THREE.BufferAttribute(s, 1));
    g.setAttribute('col', new THREE.BufferAttribute(c, 3));
    STAR_GEO = g;
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: STAR_VS, fragmentShader: STAR_FS, uniforms: {k: {value: 1}}, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true}), []);
  mat.uniforms.k.value = k;
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={-20} />;
};

/* ------------------------------------------------------------------ la Tierra */
const EARTH_VS = `varying vec3 vPos; varying vec3 vWorld; varying vec2 vUv; varying vec3 vN;
void main(){ vPos = position; vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const EARTH_FS = `
uniform sampler2D tDay, tNight, tClouds, tWater, tSA, tC9, tC2, tC05, tFA, tFB;
uniform vec4 bSA, bC9, bC2, bC05, kIns;
uniform vec3 sunDir, camPos, spot, cutN1, cutN2;
uniform float cloudK, cloudShift, nightK, dayK, specK, atmK, dim, desat, alpha, cutK, gridK;
uniform float fMix, fK, fFull, fThr, fHi, fIso, fTime, spotR, spotK, warm;
varying vec3 vPos; varying vec3 vWorld; varying vec2 vUv; varying vec3 vN;
vec3 ins(sampler2D t, vec4 b, float lon, float lat, out float w){
  vec2 uv = vec2((lon - b.x) / (b.z - b.x), (lat - b.y) / (b.w - b.y));
  vec2 e = smoothstep(0.0, 0.06, uv) * smoothstep(0.0, 0.06, 1.0 - uv);
  w = e.x * e.y;
  return texture2D(t, clamp(uv, 0.001, 0.999)).rgb;
}
// rampa del campo: débil = caliente (blanco, ámbar, rojo), fuerte = frío (azul, turquesa)
vec3 ramp(float F){
  vec3 c = vec3(0.95, 0.80, 0.45);
  c = mix(c, vec3(0.90, 0.40, 0.08), smoothstep(21500.0, 25000.0, F));
  c = mix(c, vec3(0.62, 0.08, 0.16), smoothstep(25000.0, 31000.0, F));
  c = mix(c, vec3(0.16, 0.06, 0.24), smoothstep(31000.0, 38000.0, F));
  c = mix(c, vec3(0.06, 0.18, 0.55), smoothstep(40000.0, 52000.0, F));
  c = mix(c, vec3(0.10, 0.62, 0.58), smoothstep(54000.0, 65000.0, F));
  return c;
}
void main(){
  vec3 p = normalize(vPos);
  if (cutK > 0.5 && dot(p, cutN1) > 0.0 && dot(p, cutN2) > 0.0) discard;
  float lat = degrees(asin(clamp(p.y, -1.0, 1.0)));
  float lon = degrees(atan(-p.z, p.x));
  vec3 day = texture2D(tDay, vUv).rgb;
  float w; vec3 c;
  if (kIns.x > 0.0) { c = ins(tSA, bSA, lon, lat, w); day = mix(day, c, w * kIns.x); }
  if (kIns.y > 0.0) { c = ins(tC9, bC9, lon, lat, w) * vec3(1.18, 1.12, 1.05); day = mix(day, c, w * kIns.y); }
  if (kIns.z > 0.0) { c = ins(tC2, bC2, lon, lat, w) * vec3(1.18, 1.12, 1.05); day = mix(day, c, w * kIns.z); }
  if (kIns.w > 0.0) { c = ins(tC05, bC05, lon, lat, w) * vec3(1.18, 1.12, 1.05); day = mix(day, c, w * kIns.w); }
  vec3 N = normalize(vN); vec3 L = normalize(sunDir); vec3 V = normalize(camPos - vWorld);
  float ndl = dot(N, L);
  float lit = smoothstep(-0.10, 0.14, ndl) * dayK;
  vec2 cuv = vUv + vec2(cloudShift, 0.0);
  float cl = texture2D(tClouds, cuv).r * cloudK;
  float sh = texture2D(tClouds, cuv + vec2(0.0009, 0.0005)).r * cloudK;
  vec3 surf = day * (0.015 + 1.15 * max(ndl, 0.0) * dayK) * (1.0 - 0.38 * sh);
  float wat = texture2D(tWater, vUv).r;
  vec3 H = normalize(L + V);
  float sp = pow(max(dot(N, H), 0.0), 160.0) * 0.7;
  surf += vec3(1.0, 0.86, 0.66) * sp * wat * specK * lit * (1.0 - cl);
  vec3 cloudCol = vec3(1.0, 0.99, 0.97) * (0.008 + 1.05 * max(ndl, 0.0) * dayK);
  surf = mix(surf, cloudCol, cl * 0.92);
  vec3 nl = texture2D(tNight, vUv).rgb;
  surf += nl * nl * vec3(1.0, 0.72, 0.42) * 2.6 * (1.0 - lit) * nightK * (1.0 - cl * 0.75);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  float term = smoothstep(-0.25, 0.05, ndl) * (1.0 - smoothstep(0.05, 0.45, ndl));
  surf += mix(vec3(0.22, 0.48, 1.0), vec3(1.0, 0.45, 0.18), term * 0.75) * fres * atmK * (0.06 + 0.94 * smoothstep(-0.3, 0.35, ndl));
  float g = dot(surf, vec3(0.299, 0.587, 0.114));
  surf = mix(surf, vec3(g) * vec3(0.85, 0.92, 1.1), desat) * dim;
  surf *= mix(vec3(1.0), vec3(1.08, 0.98, 0.86), warm);
  if (fK > 0.0) {
    float F = mix(texture2D(tFA, vUv).r, texture2D(tFB, vUv).r, fMix) * 100000.0;
    // adentro del umbral: de rojo oscuro en el borde a ámbar y blanco en el mínimo
    float depth = clamp((fThr - F) / max(fThr - 22000.0, 500.0), 0.0, 1.0);
    float inside = clamp((fThr - F) / 500.0, 0.0, 1.0);
    vec3 hotc = mix(vec3(0.26, 0.02, 0.08), vec3(0.85, 0.18, 0.04), smoothstep(0.0, 0.5, depth));
    hotc = mix(hotc, vec3(0.95, 0.55, 0.10), smoothstep(0.62, 1.0, depth));
    vec3 over = mix(ramp(F), hotc, inside);
    float a = fK * max(fFull * 0.45, inside * (0.22 + 0.33 * depth));
    surf = mix(surf * (1.0 - fK * max(0.6 * fFull, 0.4 * inside)), over * (0.35 + 0.65 * max(lit, 0.3)), a);
    float st = mix(2000.0, 1000.0, inside);
    float lv = F / st; float d = abs(fract(lv - 0.5) - 0.5) / max(fwidth(lv), 1e-4);
    float iso = (1.0 - clamp(d - 0.2, 0.0, 1.0)) * max(fFull, inside);
    surf += mix(over, vec3(1.0, 0.8, 0.55), inside * 0.4) * iso * fIso * fK * mix(0.28, 0.6, inside);
    float lt = (F - fThr) / 400.0; float dt = abs(lt) / max(fwidth(lt), 1e-4);
    float thrLine = 1.0 - clamp(dt - 0.9, 0.0, 1.0);
    float breathe = 0.7 + 0.3 * sin(fTime * 2.2);
    surf += vec3(1.0, 0.62, 0.30) * thrLine * fHi * fK * 0.9;
    surf += hotc * inside * fHi * fK * 0.10 * breathe;
  }
  if (gridK > 0.0) {
    vec2 ll = vec2(lon, lat) / 10.0;
    vec2 dd = abs(fract(ll - 0.5) - 0.5) / max(fwidth(ll), vec2(1e-4));
    float gl = 1.0 - clamp(min(dd.x, dd.y) - 0.3, 0.0, 1.0);
    surf += vec3(0.55, 0.75, 1.0) * gl * gridK * 0.18;
  }
  if (spotK > 0.0) {
    // distancia por cuerda (precisa a escala de kilómetros; acos pierde precisión con ángulos chicos)
    float a = length(p - normalize(spot));
    float ring = abs(a - spotR) / max(fwidth(a), 1e-9);
    surf += vec3(1.0, 0.82, 0.5) * (1.0 - clamp(ring - 0.8, 0.0, 1.0)) * spotK * 1.2;
    surf += vec3(1.0, 0.55, 0.2) * (1.0 - smoothstep(0.0, spotR, a)) * spotK * 0.12;
  }
  gl_FragColor = vec4(surf, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
let EARTH_GEO: THREE.SphereGeometry | null = null;
const earthGeo = () => (EARTH_GEO = EARTH_GEO ?? new THREE.SphereGeometry(1, 320, 160));
const fieldPair = (year: number): [THREE.Texture, THREE.Texture, number] => {
  const ys = YEARS.filter((y) => y <= 2025);
  const yy = clamp(year, ys[0], 2030);
  if (yy >= 2025) return [FIELD.F2025.tex, FIELD.F2030.tex, (yy - 2025) / 5];
  let i = ys.findIndex((y) => y > yy) - 1;
  if (i < 0) i = ys.length - 2;
  return [FIELD[`F${ys[i]}`].tex, FIELD[`F${ys[i + 1]}`].tex, (yy - ys[i]) / (ys[i + 1] - ys[i])];
};
export type EarthP = {
  t: number; sun: V3; cam: GeoCam;
  clouds?: number; night?: number; day?: number; spec?: number; atm?: number; dim?: number; desat?: number; alpha?: number; warm?: number;
  /** detalles anidados: Sudamérica, Chaco 9°, 2° y 0,5° (0..1) */
  ins?: [number, number, number, number];
  /** campo: año, intensidad, colorear todo (1) o sólo lo débil (0), umbral, brillo de lo débil, isolíneas */
  field?: {year: number; k: number; full?: number; thr?: number; hi?: number; iso?: number};
  grid?: number; spot?: {lat: number; lon: number; r: number; k: number};
  cut?: {lon: number; width: number; k: number};
  cloudDrift?: number;
};
export const Earth: React.FC<EarthP> = (p) => {
  const mat = useMemo(() => {
    const u: Record<string, THREE.IUniform> = {};
    for (const k of ['tDay', 'tNight', 'tClouds', 'tWater', 'tSA', 'tC9', 'tC2', 'tC05', 'tFA', 'tFB']) u[k] = {value: null};
    for (const k of ['bSA', 'bC9', 'bC2', 'bC05', 'kIns']) u[k] = {value: new THREE.Vector4()};
    for (const k of ['sunDir', 'camPos', 'spot', 'cutN1', 'cutN2']) u[k] = {value: new THREE.Vector3()};
    for (const k of ['cloudK', 'cloudShift', 'nightK', 'dayK', 'specK', 'atmK', 'dim', 'desat', 'alpha', 'cutK', 'gridK', 'fMix', 'fK', 'fFull', 'fThr', 'fHi', 'fIso', 'fTime', 'spotR', 'spotK', 'warm']) u[k] = {value: 0};
    return new THREE.ShaderMaterial({vertexShader: EARTH_VS, fragmentShader: EARTH_FS, uniforms: u, transparent: true});
  }, []);
  const U = mat.uniforms;
  U.tDay.value = TX.day; U.tNight.value = TX.night; U.tClouds.value = TX.clouds; U.tWater.value = TX.water;
  U.tSA.value = TX.sa; U.tC9.value = TX.c9; U.tC2.value = TX.c2; U.tC05.value = TX.c05;
  const bb = (k: string) => new THREE.Vector4(...INSETS[k].bbox);
  U.bSA.value = bb('sa'); U.bC9.value = bb('s2_chaco9'); U.bC2.value = bb('s2_chaco2'); U.bC05.value = bb('s2_chaco05');
  U.kIns.value.set(...(p.ins ?? [0, 0, 0, 0]));
  U.sunDir.value.set(...p.sun);
  const cp = setupCamera(new THREE.PerspectiveCamera(), p.cam, 16, 9).position;
  U.camPos.value.copy(cp);
  U.cloudK.value = p.clouds ?? 0.88; U.cloudShift.value = (p.cloudDrift ?? 0.0012) * p.t; U.nightK.value = p.night ?? 1; U.dayK.value = p.day ?? 1;
  U.specK.value = (p.spec ?? 1) * 0.6; U.atmK.value = (p.atm ?? 1) * 0.7; U.dim.value = p.dim ?? 1; U.desat.value = p.desat ?? 0; U.alpha.value = p.alpha ?? 1; U.warm.value = p.warm ?? 0;
  mat.depthWrite = (p.alpha ?? 1) > 0.98;
  if (p.field && p.field.k > 0) {
    const [a, b, k] = fieldPair(p.field.year);
    U.tFA.value = a; U.tFB.value = b; U.fMix.value = k;
    U.fK.value = p.field.k; U.fFull.value = p.field.full ?? 1; U.fThr.value = p.field.thr ?? 32000; U.fHi.value = p.field.hi ?? 0; U.fIso.value = p.field.iso ?? 1;
  } else { U.fK.value = 0; U.tFA.value = FIELD.F2025.tex; U.tFB.value = FIELD.F2025.tex; }
  U.fTime.value = p.t;
  U.gridK.value = p.grid ?? 0;
  if (p.spot) { U.spot.value.set(...xyz(p.spot.lat, p.spot.lon)); U.spotR.value = p.spot.r * Math.PI / 180; U.spotK.value = p.spot.k; } else U.spotK.value = 0;
  if (p.cut && p.cut.k > 0.5) {
    const a = (p.cut.lon - p.cut.width / 2) * Math.PI / 180, b = (p.cut.lon + p.cut.width / 2) * Math.PI / 180;
    // semiespacios: del lado "adentro" de cada plano meridiano que limita la cuña
    // adentro de la cuña: al este del meridiano a (normal = este en a) y al oeste del meridiano b (normal = oeste en b)
    U.cutN1.value.set(-Math.sin(a), 0, -Math.cos(a));
    U.cutN2.value.set(Math.sin(b), 0, Math.cos(b));
    U.cutK.value = 1;
  } else U.cutK.value = 0;
  return <mesh geometry={earthGeo()} material={mat} renderOrder={0} />;
};

/* ------------------------------------------------------------------ atmósfera (halo) */
const ATM_VS = `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
}`;
const ATM_FS = `
uniform vec3 sunDir, camPos, col; uniform float k, night, R;
varying vec3 vN; varying vec3 vW;
void main(){
  vec3 P = normalize(vW); vec3 V = normalize(camPos - vW);
  // cara trasera de la cáscara: |N·V| va de 0 (borde de la cáscara) a sqrt(1-1/R²) (justo sobre el limbo terrestre)
  float x = clamp(abs(dot(P, V)) / sqrt(1.0 - 1.0 / (R * R)), 0.0, 1.0);
  float I = pow(x, 2.2) * (0.35 + 0.65 * x);
  float sl = dot(P, normalize(sunDir));
  float sunf = smoothstep(-0.28, 0.45, sl);
  vec3 c = mix(vec3(1.0, 0.42, 0.16), col, smoothstep(-0.05, 0.4, sl));
  gl_FragColor = vec4(c * I * k * (night + (1.0 - night) * sunf) * 1.1, 1.0);
  #include <colorspace_fragment>
}`;
export const Atmosphere: React.FC<{sun: V3; cam: GeoCam; k?: number; night?: number; r?: number; color?: string}> = ({sun, cam, k = 1, night = 0.03, r = 1.055, color = '#4F8DFF'}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: ATM_VS, fragmentShader: ATM_FS, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {sunDir: {value: new THREE.Vector3()}, camPos: {value: new THREE.Vector3()}, col: {value: new THREE.Color()}, k: {value: 1}, night: {value: 0}, R: {value: 1.055}}}), []);
  mat.uniforms.sunDir.value.set(...sun);
  mat.uniforms.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  const cp = mat.uniforms.camPos.value as THREE.Vector3;
  mat.uniforms.col.value.set(color); mat.uniforms.k.value = k * clamp((cp.length() - r) / 0.06); mat.uniforms.night.value = night; mat.uniforms.R.value = r;
  return <mesh material={mat} scale={r} renderOrder={5}><sphereGeometry args={[1, 128, 64]} /></mesh>;
};

/* ------------------------------------------------------------------ líneas de campo (tubos que fluyen) */
type Line = {m: number; p: number[]};
const lines = (CAMPO as unknown as {lineas: Line[]}).lineas.filter((l) => l.m > -60);
const TUBE_VS = `attribute float seed; varying float vS; varying float vSeed; varying vec3 vN; varying vec3 vW;
void main(){ vS = uv.x; vSeed = seed; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
}`;
const TUBE_FS = `
uniform float t, k, reveal, flow, flip; uniform vec3 colA, colB, camPos;
varying float vS; varying float vSeed; varying vec3 vN; varying vec3 vW;
void main(){
  float s = mix(vS, 1.0 - vS, flip);
  if (s > reveal) discard;
  vec3 V = normalize(camPos - vW);
  float core = pow(abs(dot(normalize(vN), V)), 1.4);
  float pulse = pow(0.5 + 0.5 * sin((s * 9.0 - t * flow + vSeed * 6.283) * 6.283 / 3.0), 6.0);
  float tip = smoothstep(reveal - 0.06, reveal, s) * step(reveal, 0.999);
  vec3 c = mix(colA, colB, s);
  float foot = smoothstep(0.0, 0.12, s) * (1.0 - smoothstep(0.88, 1.0, s));
  // delante del disco de la Tierra las líneas se atenúan (se apilaban en rayas blancas sobre la cara del planeta)
  vec3 dir = normalize(vW - camPos); float tca = dot(-camPos, dir);
  float over = 1.0 - smoothstep(0.9, 1.04, length(camPos + dir * tca));
  float a = k * core * (0.32 + 0.9 * pulse + 1.4 * tip) * mix(0.15, 1.0, foot) * mix(1.0, 0.3, over);
  gl_FragColor = vec4(c * a, 1.0);
  #include <colorspace_fragment>
}`;
let TUBES: THREE.BufferGeometry | null = null;
const tubeGeo = () => {
  if (TUBES) return TUBES;
  const gs: THREE.BufferGeometry[] = [];
  lines.forEach((l, i) => {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j < l.p.length; j += 3) pts.push(new THREE.Vector3(...fromData(l.p[j], l.p[j + 1], l.p[j + 2])));
    if (pts.length < 4) return;
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, Math.min(220, pts.length * 3), 0.0042 + 0.0016 * Math.abs(l.m) / 64, 5, false);
    const n = g.attributes.position.count;
    g.setAttribute('seed', new THREE.BufferAttribute(new Float32Array(n).fill(rnd(i * 4.7 + 1)), 1));
    gs.push(g);
  });
  TUBES = mergeGeometries(gs, false)!;
  return TUBES;
};
export const FieldLines: React.FC<{t: number; cam: GeoCam; k?: number; reveal?: number; flow?: number; colA?: string; colB?: string; flip?: number; scale?: number}> = ({t, cam, k = 1, reveal = 1, flow = 0.35, colA = '#48F3D2', colB = '#6E8BFF', flip = 0, scale = 1}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: TUBE_VS, fragmentShader: TUBE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {t: {value: 0}, k: {value: 1}, reveal: {value: 1}, flow: {value: 0.3}, flip: {value: 0}, colA: {value: new THREE.Color()}, colB: {value: new THREE.Color()}, camPos: {value: new THREE.Vector3()}}}), []);
  const u = mat.uniforms;
  u.t.value = t; u.k.value = k; u.reveal.value = reveal; u.flow.value = flow; u.flip.value = flip;
  u.colA.value.set(colA); u.colB.value.set(colB);
  u.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  return <mesh geometry={tubeGeo()} material={mat} renderOrder={6} scale={scale} />;
};

/* ------------------------------------------------------------------ la abolladura: superficie de rebote del cinturón */
const BELT_VS = `attribute float hkm; varying float vH; varying vec3 vN; varying vec3 vW; varying vec3 vP;
void main(){ vH = hkm; vP = normalize(position); vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
}`;
const BELT_FS = `
uniform vec3 camPos, axis; uniform float k, t, band, hot, mlat;
varying float vH; varying vec3 vN; varying vec3 vW; varying vec3 vP;
void main(){
  vec3 V = normalize(camPos - vW); vec3 N = normalize(vN);
  float fres = pow(1.0 - abs(dot(N, V)), 1.6) * (1.0 - pow(1.0 - abs(dot(N, V)), 12.0));
  float ml = abs(asin(clamp(dot(vP, normalize(axis)), -1.0, 1.0))) * 57.2958;
  float mask = 1.0 - smoothstep(mlat - 22.0, mlat, ml);
  float x = clamp((vH - 200.0) / 1500.0, 0.0, 1.0);
  vec3 cool = vec3(0.28, 0.78, 1.0), warmc = vec3(1.0, 0.42, 0.10), white = vec3(1.0, 0.9, 0.7);
  vec3 c = mix(mix(white, warmc, smoothstep(0.0, 0.18, x)), cool, smoothstep(0.12, 0.6, x));
  float lv = vH / 200.0; float d = abs(fract(lv - 0.5) - 0.5) / max(fwidth(lv), 1e-4);
  float iso = (1.0 - clamp(d - 0.6, 0.0, 1.0)) * band * (1.0 - smoothstep(900.0, 1150.0, vH));
  float low = 1.0 - smoothstep(0.0, 0.55, x);
  float glow = (1.0 - smoothstep(0.0, 0.14, x)) * hot * (0.8 + 0.2 * sin(t * 3.0));
  float a = k * mask * (iso * (0.30 + 0.70 * low) + 0.03 * low + 0.22 * glow + 0.02 * fres);
  gl_FragColor = vec4(c * a, 1.0);
  #include <colorspace_fragment>
}`;
const DIP = (CAMPO as unknown as {dipolo: {y: number; polo: [number, number]; off: [number, number, number]; tilt: number; off_km: number; off_dir: [number, number]}[]}).dipolo;
export const DIPOLE = DIP[DIP.length - 1];
export const DIPOLE_1900 = DIP[0];
export const BeltShell: React.FC<{t: number; cam: GeoCam; k?: number; band?: number; hot?: number; mlat?: number}> = ({t, cam, k = 1, band = 1, hot = 1, mlat = 42}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: BELT_VS, fragmentShader: BELT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: {camPos: {value: new THREE.Vector3()}, axis: {value: new THREE.Vector3()}, k: {value: 1}, t: {value: 0}, band: {value: 0.6}, hot: {value: 1}, mlat: {value: 42}}}), []);
  const u = mat.uniforms;
  u.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  u.axis.value.set(...xyz(DIPOLE.polo[0], DIPOLE.polo[1]));
  u.k.value = k; u.t.value = t; u.band.value = band; u.hot.value = hot; u.mlat.value = mlat;
  return BELT_GEO ? <mesh geometry={BELT_GEO} material={mat} renderOrder={7} /> : null;
};

/* ------------------------------------------------------------------ partículas atrapadas en el cinturón interior */
type BeltL = {L: number; hmin: number; p: number[]};
const beltLines = (CAMPO as unknown as {cinturon: {lineas: BeltL[]}}).cinturon.lineas;
const PART_VS = `attribute vec3 a; attribute vec3 b; attribute vec3 m; attribute float ph; attribute float sp;
uniform float t, size; varying float vG;
void main(){
  float s = 0.5 + 0.5 * sin(t * sp + ph * 6.283);
  // rebote entre los puntos espejo: la partícula va de a a b pasando por m (cerca del ecuador)
  vec3 p = mix(mix(a, m, s * 2.0), mix(m, b, s * 2.0 - 1.0), step(0.5, s));
  vG = 1.0 - abs(s - 0.5) * 1.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(size * (0.6 + vG) / max(-mv.z, 0.2), 10.0);
}`;
const PART_FS = `
uniform vec3 col; uniform float k; varying float vG;
void main(){
  vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d));
  gl_FragColor = vec4(col * a * k * (0.5 + vG), 1.0);
  #include <colorspace_fragment>
}`;
let PART_GEO: THREE.BufferGeometry | null = null;
const partGeo = () => {
  if (PART_GEO) return PART_GEO;
  const per = 14, n = beltLines.length * per;
  const A = new Float32Array(n * 3), B = new Float32Array(n * 3), Mm = new Float32Array(n * 3), PH = new Float32Array(n), SP = new Float32Array(n);
  let i = 0;
  beltLines.forEach((l, li) => {
    const pts: V3[] = [];
    for (let j = 0; j < l.p.length; j += 3) pts.push(fromData(l.p[j], l.p[j + 1], l.p[j + 2]));
    if (pts.length < 3) return;
    for (let q = 0; q < per; q++) {
      const r = rnd(li * 31 + q * 7 + 1);
      // cada partícula rebota entre dos puntos del tramo atrapado, más o menos cerca de los extremos
      const ia = Math.floor(r * 0.45 * (pts.length - 1)), ib = pts.length - 1 - Math.floor(rnd(li * 13 + q * 3 + 2) * 0.45 * (pts.length - 1));
      const im = Math.floor((ia + ib) / 2);
      const jit = (v: V3, s: number): V3 => [v[0] + (rnd(s) - 0.5) * 0.012, v[1] + (rnd(s + 1) - 0.5) * 0.012, v[2] + (rnd(s + 2) - 0.5) * 0.012];
      A.set(jit(pts[ia], li * 5 + q), i * 3); B.set(jit(pts[ib], li * 9 + q), i * 3); Mm.set(jit(pts[im], li * 11 + q), i * 3);
      PH[i] = rnd(li * 3 + q * 17); SP[i] = 0.8 + rnd(li + q * 29) * 1.8;
      i++;
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(Mm.slice(0, i * 3), 3));
  g.setAttribute('a', new THREE.BufferAttribute(A.slice(0, i * 3), 3));
  g.setAttribute('b', new THREE.BufferAttribute(B.slice(0, i * 3), 3));
  g.setAttribute('m', new THREE.BufferAttribute(Mm.slice(0, i * 3), 3));
  g.setAttribute('ph', new THREE.BufferAttribute(PH.slice(0, i), 1));
  g.setAttribute('sp', new THREE.BufferAttribute(SP.slice(0, i), 1));
  PART_GEO = g;
  return g;
};
export const BeltParticles: React.FC<{t: number; k?: number; size?: number; color?: string}> = ({t, k = 1, size = 9, color = '#FFC27A'}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: PART_VS, fragmentShader: PART_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {t: {value: 0}, size: {value: 9}, col: {value: new THREE.Color()}, k: {value: 1}}}), []);
  mat.uniforms.t.value = t; mat.uniforms.size.value = size; mat.uniforms.k.value = k; mat.uniforms.col.value.set(color);
  return <points geometry={partGeo()} material={mat} frustumCulled={false} renderOrder={8} />;
};

/* ------------------------------------------------------------------ cinturones de Van Allen (esquema: dos toros de partículas) */
const VA_VS = `attribute vec3 seedv; uniform float t, size; uniform vec3 axis; varying float vI; varying float vO;
mat3 basis(vec3 z){ vec3 x = normalize(cross(abs(z.y) < 0.9 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0), z)); vec3 y = cross(z, x); return mat3(x, y, z); }
void main(){
  // L-shell dipolar: r = L cos²(λ); la partícula deriva alrededor del eje y rebota en latitud
  float L = seedv.x; float ph0 = seedv.y; float lam0 = seedv.z;
  float lam = lam0 * sin(t * (1.2 + fract(ph0 * 7.0)) + ph0 * 31.0);
  float phi = ph0 * 6.283 + t * 0.12 / L;
  float r = L * cos(lam) * cos(lam);
  vec3 q = vec3(r * cos(lam) * cos(phi), r * cos(lam) * sin(phi), r * sin(lam));
  vec3 p = basis(normalize(axis)) * q;
  vO = step(2.6, L); vI = 1.0 - abs(lam) / 1.2;
  vec4 mv = modelViewMatrix * vec4(p.x, p.z, -p.y, 1.0);
  gl_Position = projectionMatrix * mv; gl_PointSize = min(size / max(-mv.z, 0.3), 12.0);
}`;
const VA_FS = `
uniform vec3 cIn, cOut; uniform float kIn, kOut; varying float vI; varying float vO;
void main(){
  vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d));
  vec3 c = mix(cIn * kIn, cOut * kOut, vO);
  gl_FragColor = vec4(c * a * (0.4 + vI), 1.0);
  #include <colorspace_fragment>
}`;
let VA_GEO: THREE.BufferGeometry | null = null;
export const VanAllen: React.FC<{t: number; kIn?: number; kOut?: number; size?: number}> = ({t, kIn = 1, kOut = 1, size = 40}) => {
  const geo = useMemo(() => {
    if (VA_GEO) return VA_GEO;
    const n = 26000, s = new Float32Array(n * 3), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const outer = i % 3 !== 0;
      const L = outer ? 3.2 + Math.pow(rnd(i * 1.7), 0.8) * 3.0 : 1.25 + Math.pow(rnd(i * 2.3), 1.3) * 1.15;
      s.set([L, rnd(i * 5.1 + 3), (outer ? 0.55 : 0.42) * (0.3 + 0.7 * rnd(i * 9.3 + 7))], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('seedv', new THREE.BufferAttribute(s, 3));
    VA_GEO = g;
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: VA_VS, fragmentShader: VA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {t: {value: 0}, size: {value: 7}, axis: {value: new THREE.Vector3()}, cIn: {value: new THREE.Color('#FF9A3C')}, cOut: {value: new THREE.Color('#5FB8FF')}, kIn: {value: 1}, kOut: {value: 1}}}), []);
  const u = mat.uniforms;
  u.t.value = t; u.size.value = size; u.kIn.value = kIn; u.kOut.value = kOut;
  // eje del dipolo en coordenadas de datos (x lon 0, y lon 90 E, z norte)
  const [la, lo] = DIPOLE.polo;
  const D = Math.PI / 180;
  u.axis.value.set(Math.cos(la * D) * Math.cos(lo * D), Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D));
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={8} />;
};

/* ------------------------------------------------------------------ protones medidos por el MetOp-A (marzo de 2014) */
const MP_VS = `attribute float flux; attribute float day; uniform float reveal, size, hot, calm; varying float vF; varying float vA;
void main(){
  vF = flux;
  float on = step(day, reveal);
  float lf = clamp(log(flux + 0.02) / log(30.0), -1.0, 1.0);
  float big = smoothstep(0.5, 12.0, flux);
  vA = on * mix(calm, 0.8, big) * (1.0 + hot * big * 0.8);
  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  gl_PointSize = min(on * size * (0.7 + big * (1.2 + 2.6 * hot)) / max(-mv.z, 0.3), 26.0);
}`;
const MP_FS = `
varying float vF; varying float vA;
vec3 heat(float f){
  vec3 c = vec3(0.16, 0.36, 0.85);
  c = mix(c, vec3(0.30, 0.95, 0.95), smoothstep(0.05, 0.5, f));
  c = mix(c, vec3(1.0, 0.55, 0.12), smoothstep(0.8, 5.0, f));
  c = mix(c, vec3(1.0, 0.95, 0.75), smoothstep(8.0, 22.0, f));
  return c;
}
void main(){
  vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0;
  float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.85, 1.0, r));
  gl_FragColor = vec4(heat(vF) * a * vA, 1.0);
  #include <colorspace_fragment>
}`;
let MP_GEO: THREE.BufferGeometry | null = null;
export const METOP_N = () => (METOP ? METOP.length / 4 : 0);
export const Metop: React.FC<{reveal: number; k?: number; size?: number; hot?: number; calm?: number}> = ({reveal, k = 1, size = 6, hot = 0, calm = 0.22}) => {
  const geo = useMemo(() => {
    if (MP_GEO || !METOP) return MP_GEO;
    const n = METOP.length / 4, p = new Float32Array(n * 3), f = new Float32Array(n), d = new Float32Array(n);
    const r = altR(835);
    for (let i = 0; i < n; i++) {
      p.set(xyz(METOP[i * 4 + 1], METOP[i * 4], r), i * 3);
      f[i] = METOP[i * 4 + 2]; d[i] = METOP[i * 4 + 3];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('flux', new THREE.BufferAttribute(f, 1));
    g.setAttribute('day', new THREE.BufferAttribute(d, 1));
    MP_GEO = g;
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: MP_VS, fragmentShader: MP_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {reveal: {value: 0}, size: {value: 6}, hot: {value: 0}, calm: {value: 0.22}}}), []);
  const u = mat.uniforms;
  u.reveal.value = reveal; u.size.value = size * k; u.hot.value = hot; u.calm.value = calm * k;
  return geo ? <points geometry={geo} material={mat} frustumCulled={false} renderOrder={9} /> : null;
};

/* ------------------------------------------------------------------ líneas y tubos sobre o sobre la superficie */
const GLOW_FS = `
uniform vec3 col; uniform float k, reveal, dash, t; varying float vS;
void main(){
  if (vS > reveal) discard;
  float on = dash > 0.0 ? step(0.45, fract(vS * dash - t)) : 1.0;
  gl_FragColor = vec4(col * k * on, 1.0);
  #include <colorspace_fragment>
}`;
const GLOW_VS = `varying float vS; void main(){ vS = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const tubeCache: Record<string, THREE.TubeGeometry> = {};
/** tubo luminoso por una lista de puntos 3D (se arma una vez por clave) */
export const GlowTube: React.FC<{id: string; pts: V3[]; radius?: number; color?: string; k?: number; reveal?: number; dash?: number; t?: number; closed?: boolean; seg?: number}> = ({id, pts, radius = 0.004, color = '#FFB25C', k = 1, reveal = 1, dash = 0, t = 0, closed = false, seg}) => {
  const geo = useMemo(() => {
    const key = `${id}|${radius}`;
    if (!tubeCache[key]) tubeCache[key] = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), seg ?? Math.max(64, pts.length * 4), radius, 6, closed);
    return tubeCache[key];
  }, [id, radius]);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: GLOW_VS, fragmentShader: GLOW_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {col: {value: new THREE.Color()}, k: {value: 1}, reveal: {value: 1}, dash: {value: 0}, t: {value: 0}}}), []);
  const u = mat.uniforms;
  u.col.value.set(color); u.k.value = k; u.reveal.value = reveal; u.dash.value = dash; u.t.value = t;
  return <mesh geometry={geo} material={mat} renderOrder={10} />;
};
/** puntos de un camino sobre la superficie (gran círculo entre pares) a una altura h (km) */
export const surfPath = (ll: [number, number][], hkm = 8, sub = 12): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i < ll.length - 1; i++) {
    const a = new THREE.Vector3(...xyz(ll[i][0], ll[i][1])), b = new THREE.Vector3(...xyz(ll[i + 1][0], ll[i + 1][1]));
    for (let s = 0; s < sub; s++) {
      const k = s / sub, v = a.clone().lerp(b, k).normalize().multiplyScalar(altR(hkm));
      out.push([v.x, v.y, v.z]);
    }
  }
  const z = xyz(ll[ll.length - 1][0], ll[ll.length - 1][1], altR(hkm));
  out.push(z);
  return out;
};
/** órbita circular: inclinación, longitud del nodo ascendente (en el marco de la Tierra), altura en km */
export const orbitPts = (inc: number, node: number, hkm: number, n = 256): V3[] => {
  const D = Math.PI / 180, r = altR(hkm), pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * Math.PI * 2;
    const x = Math.cos(u), y = Math.sin(u) * Math.cos(inc * D), z = Math.sin(u) * Math.sin(inc * D);
    const lon = Math.atan2(y, x) / D + node, lat = Math.asin(z) / D;
    pts.push(xyz(lat, lon, r));
  }
  return pts;
};
export const orbitPos = (inc: number, node: number, hkm: number, u: number): V3 => {
  const D = Math.PI / 180;
  const x = Math.cos(u), y = Math.sin(u) * Math.cos(inc * D), z = Math.sin(u) * Math.sin(inc * D);
  return xyz(Math.asin(z) / D, Math.atan2(y, x) / D + node, altR(hkm));
};

/* ------------------------------------------------------------------ marcadores */
const DOT_FS = `
uniform vec3 col; uniform float k; void main(){
  vec2 d = gl_PointCoord - 0.5; float r = length(d); float a = smoothstep(0.5, 0.0, r) * 0.6 + smoothstep(0.16, 0.08, r);
  gl_FragColor = vec4(col * a * k, 1.0);
  #include <colorspace_fragment>
}`;
const DOT_VS = `uniform float size; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size;
}`;
/** punto luminoso de tamaño fijo en pantalla (satélites, ciudades) */
export const Dots: React.FC<{pts: V3[]; size?: number; color?: string; k?: number}> = ({pts, size = 14, color = '#FFFFFF', k = 1}) => {
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts.flat()), 3));
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, uniforms: {col: {value: new THREE.Color()}, k: {value: 1}, size: {value: 14}}}), []);
  mat.uniforms.col.value.set(color); mat.uniforms.k.value = k; mat.uniforms.size.value = size;
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={12} />;
};

/* ------------------------------------------------------------------ el núcleo en corte */
const SEC_VS = `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SEC_FS = `
uniform float t, k, conv, mirror; varying vec2 vP;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  float r = length(vP);
  if (r > 1.0 || vP.x * mirror < 0.0) discard;
  vec3 c;
  float ang = atan(vP.y, vP.x);
  if (r < 0.1915) {                      // núcleo interno sólido
    c = mix(vec3(1.0, 0.95, 0.80), vec3(1.0, 0.78, 0.40), r / 0.1915) * 1.05;
  } else if (r < 0.547) {                // núcleo externo: hierro líquido que se mueve
    vec2 q = vec2(ang * 3.0, r * 9.0);
    float sw = fbm(q + vec2(t * 0.25 * conv, -t * 0.18 * conv) + fbm(q * 1.7 - t * 0.1 * conv));
    float cells = 0.5 + 0.5 * sin(ang * 8.0 + sw * 6.0 + t * 0.6 * conv);
    vec3 a = vec3(0.95, 0.30, 0.04), b = vec3(1.0, 0.62, 0.16);
    c = mix(a, b, sw * 0.8 + cells * 0.2) * (0.55 + 0.45 * sw) * (0.7 + 0.3 * cells);
  } else if (r < 0.985) {                // manto
    float m = fbm(vec2(ang * 5.0, r * 6.0) + t * 0.02);
    c = mix(vec3(0.22, 0.05, 0.03), vec3(0.50, 0.16, 0.05), smoothstep(0.985, 0.55, r)) * (0.55 + 0.6 * m);
  } else {                               // corteza
    c = vec3(0.38, 0.30, 0.24);
  }
  float edge = smoothstep(0.004, 0.0, abs(r - 0.547)) * 0.35 + smoothstep(0.004, 0.0, abs(r - 0.1915)) * 0.25;
  c += vec3(1.0, 0.85, 0.5) * edge;
  gl_FragColor = vec4(c * k, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
/** las dos caras del corte en cuña (planos meridianos que limitan la cuña quitada a la Tierra) */
export const Section: React.FC<{t: number; lon: number; width: number; k?: number; conv?: number}> = ({t, lon, width, k = 1, conv = 1}) => {
  const mk = () => new THREE.ShaderMaterial({vertexShader: SEC_VS, fragmentShader: SEC_FS, side: THREE.DoubleSide, uniforms: {t: {value: 0}, k: {value: 1}, conv: {value: 1}, mirror: {value: 1}}});
  const m1 = useMemo(mk, []), m2 = useMemo(mk, []);
  for (const m of [m1, m2]) { m.uniforms.t.value = t; m.uniforms.k.value = k; m.uniforms.conv.value = conv; }
  // cada plano contiene el eje polar (Y); la cara es el semidisco del lado de la cuña
  const D = Math.PI / 180;
  const a = (lon - width / 2) * D, b = (lon + width / 2) * D;
  m1.uniforms.mirror.value = 1; m2.uniforms.mirror.value = 1;
  return (
    <group>
      <mesh material={m1} rotation={[0, a, 0]} renderOrder={1}><planeGeometry args={[2, 2, 1, 1]} /></mesh>
      <mesh material={m2} rotation={[0, b, 0]} renderOrder={1}><planeGeometry args={[2, 2, 1, 1]} /></mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ el borde del núcleo con el campo radial */
const CMB_FS = `
uniform sampler2D tA, tB; uniform float mixk, k, t, rev, alpha; uniform vec3 camPos, sunDir;
varying vec3 vPos; varying vec3 vWorld; varying vec2 vUv; varying vec3 vN;
void main(){
  float br = mix(texture2D(tA, vUv).r, texture2D(tB, vUv).r, mixk);
  float x = clamp(br / 0.75, -1.0, 1.0);
  vec3 outc = vec3(0.62, 0.11, 0.04), inc = vec3(0.03, 0.13, 0.55);
  vec3 c = x > 0.0 ? mix(vec3(0.05, 0.03, 0.04), outc, pow(x, 0.8)) : mix(vec3(0.05, 0.03, 0.04), inc, pow(-x, 0.8));
  float lat = degrees(asin(clamp(normalize(vPos).y, -1.0, 1.0)));
  float south = smoothstep(-5.0, -15.0, lat);
  float reversed = south * smoothstep(0.0, -0.08, br);
  float l0 = br / 0.08; float d0 = abs(l0) / max(fwidth(l0), 1e-4);
  float zero = 1.0 - clamp(d0 - 0.5, 0.0, 1.0);
  vec3 N = normalize(vN); vec3 V = normalize(camPos - vWorld);
  float shade = 0.55 + 0.45 * max(dot(N, V), 0.0);
  c = c * shade + vec3(0.25, 0.6, 1.0) * reversed * rev * (0.45 + 0.25 * sin(t * 4.0)) + vec3(0.9) * zero * 0.18;
  c += vec3(1.0, 0.5, 0.25) * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.25;
  gl_FragColor = vec4(c * k, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export const CoreSphere: React.FC<{t: number; cam: GeoCam; year?: number; deg10?: boolean; k?: number; rev?: number; alpha?: number; r?: number}> = ({t, cam, year = 2025, deg10 = false, k = 1, rev = 0, alpha = 1, r = 0.547}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: EARTH_VS, fragmentShader: CMB_FS, transparent: true,
    uniforms: {tA: {value: null}, tB: {value: null}, mixk: {value: 0}, k: {value: 1}, t: {value: 0}, rev: {value: 0}, alpha: {value: 1}, camPos: {value: new THREE.Vector3()}, sunDir: {value: new THREE.Vector3(1, 0, 0)}}}), []);
  const u = mat.uniforms;
  if (deg10) {
    const [a, b, kk] = year <= 1960 ? ['br10_1900', 'br10_1960', (year - 1900) / 60] : ['br10_1960', 'br10_2025', (year - 1960) / 65];
    u.tA.value = FIELD[a].tex; u.tB.value = FIELD[b].tex; u.mixk.value = clamp(kk);
  } else { u.tA.value = FIELD.br2025.tex; u.tB.value = FIELD.br2025.tex; u.mixk.value = 0; }
  u.k.value = k; u.t.value = t; u.rev.value = rev; u.alpha.value = alpha;
  u.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  mat.depthWrite = alpha > 0.98;
  return <mesh geometry={earthGeo()} material={mat} scale={r} renderOrder={2} />;
};

/* ------------------------------------------------------------------ la mancha africana (LLSVP, esquema) */
const BLOB_FS = `
uniform float k; uniform vec3 camPos; varying vec3 vN; varying vec3 vW;
void main(){
  vec3 V = normalize(camPos - vW); float f = pow(1.0 - abs(dot(normalize(vN), V)), 1.6);
  gl_FragColor = vec4(vec3(0.55, 0.12, 0.08) * (0.06 + 0.45 * f) * k, 1.0);
  #include <colorspace_fragment>
}`;
export const Blob: React.FC<{lat: number; lon: number; cam: GeoCam; k?: number; t: number}> = ({lat, lon, cam, k = 1, t}) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 5);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
      const n = Math.sin(v.x * 3.1 + 1.3) * Math.sin(v.y * 2.7 + 0.4) * Math.sin(v.z * 3.3 + 2.1);
      v.multiplyScalar(1 + 0.25 * n + 0.08 * Math.sin(v.x * 9 + v.z * 7));
      v.y *= 0.42;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: ATM_VS.replace('vN = normalize', 'vN = normalize'), fragmentShader: BLOB_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {k: {value: 1}, camPos: {value: new THREE.Vector3()}}}), []);
  mat.uniforms.k.value = k;
  mat.uniforms.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  // apoyada sobre el núcleo (r 0,547), hacia arriba ~ 800-1000 km
  const c = xyz(lat, lon, 0.6);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...xyz(lat, lon)));
  return <mesh geometry={geo} material={mat} position={c} quaternion={q} scale={[0.16, 0.16 * (1 + 0.03 * Math.sin(t)), 0.12]} renderOrder={3} />;
};

/* ------------------------------------------------------------------ viento solar */
const SW_VS = `attribute vec3 seed; uniform float t, speed, a, x0; uniform vec3 dir; varying float vA;
void main(){
  // flujo axial que rodea un paraboloide (magnetopausa esquemática): ρ² = b² + ρc², con ρc² = 4a(x - x0)
  float b = seed.x, th = seed.y * 6.283;
  float x = 10.0 - mod(seed.z * 20.0 + t * speed, 20.0);
  float rc2 = max(0.0, 4.0 * a * (x0 - x));
  float rho = sqrt(b * b + rc2);
  vec3 q = vec3(x, rho * cos(th), rho * sin(th));
  vec3 X = normalize(dir); vec3 Y = normalize(cross(abs(X.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), X)); vec3 Z = cross(X, Y);
  vec3 p = X * q.x + Y * q.y + Z * q.z;
  vA = (1.0 - smoothstep(7.0, 10.0, x)) * smoothstep(-10.0, -6.0, x);
  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = min(26.0 / max(-mv.z, 0.4), 9.0);
}`;
const SW_FS = `
uniform vec3 col; uniform float k; varying float vA;
void main(){
  vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d));
  gl_FragColor = vec4(col * a * vA * k, 1.0);
  #include <colorspace_fragment>
}`;
let SW_GEO: THREE.BufferGeometry | null = null;
/** viento solar (esquema, no a escala): llega desde el lado del Sol (`sunDir`) y se abre alrededor del escudo; sin escudo choca con el planeta */
export const SolarWind: React.FC<{t: number; sunDir: V3; k?: number; shield?: number; color?: string}> = ({t, sunDir, k = 1, shield = 1, color = '#FFD08A'}) => {
  const geo = useMemo(() => {
    if (SW_GEO) return SW_GEO;
    const n = 18000, s = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) s.set([Math.sqrt(rnd(i * 1.1)) * 4.2, rnd(i * 2.9 + 1), rnd(i * 4.3 + 2)], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('seed', new THREE.BufferAttribute(s, 3));
    SW_GEO = g;
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: SW_VS, fragmentShader: SW_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {t: {value: 0}, speed: {value: 3}, a: {value: 1}, x0: {value: 9}, dir: {value: new THREE.Vector3()}, col: {value: new THREE.Color()}, k: {value: 1}}}), []);
  const u = mat.uniforms;
  u.t.value = t; u.speed.value = 3.2; u.k.value = k; u.col.value.set(color);
  // con escudo la nariz queda a ~10 radios; sin escudo (Marte) el flujo llega hasta la superficie
  u.x0.value = 1.0 + 2.6 * shield; u.a.value = 0.25 + 0.75 * shield;
  u.dir.value.set(sunDir[0], sunDir[1], sunDir[2]);
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={11} />;
};

/* ------------------------------------------------------------------ Marte */
const MARS_FS = `
uniform sampler2D tMap; uniform vec3 sunDir, camPos; uniform float k, atm;
varying vec3 vPos; varying vec3 vWorld; varying vec2 vUv; varying vec3 vN;
void main(){
  vec3 N = normalize(vN); vec3 L = normalize(sunDir); vec3 V = normalize(camPos - vWorld);
  vec3 c = texture2D(tMap, vUv).rgb * (0.03 + 1.1 * max(dot(N, L), 0.0));
  c += vec3(1.0, 0.55, 0.35) * pow(1.0 - max(dot(N, V), 0.0), 3.0) * atm * smoothstep(-0.2, 0.4, dot(N, L));
  gl_FragColor = vec4(c * k, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export const Mars: React.FC<{sun: V3; cam: GeoCam; pos?: V3; r?: number; k?: number; atm?: number; spin?: number}> = ({sun, cam, pos = [0, 0, 0], r = 1, k = 1, atm = 0.3, spin = 0}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({vertexShader: EARTH_VS, fragmentShader: MARS_FS, uniforms: {tMap: {value: null}, sunDir: {value: new THREE.Vector3()}, camPos: {value: new THREE.Vector3()}, k: {value: 1}, atm: {value: 0.3}}}), []);
  const u = mat.uniforms;
  u.tMap.value = TX.mars; u.sunDir.value.set(...sun); u.k.value = k; u.atm.value = atm;
  u.camPos.value.copy(setupCamera(new THREE.PerspectiveCamera(), cam, 16, 9).position);
  return <mesh geometry={earthGeo()} material={mat} position={pos} scale={r} rotation={[0, spin, 0]} />;
};

/* ------------------------------------------------------------------ ejes del dipolo */
export const dipoleAxis = (year = 2025) => {
  const d = year < 1950 ? DIPOLE_1900 : DIPOLE;
  const c = fromData(d.off[0], d.off[1], d.off[2]);
  const ax = xyz(d.polo[0], d.polo[1]);
  return {c, ax, tilt: d.tilt, offKm: d.off_km};
};
