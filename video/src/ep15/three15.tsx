/* 3D del ep15 (EL HOMBRE DE LAS MIL CARAS). Todo es propio y procedural, salvo la imagen satelital (Sentinel-2):
   - Cabeza: un maniquí sin rostro sobre el que se proyectan nombres, huellas y una grilla biométrica; se desarma en
     triángulos al cambiar de identidad (las mil caras)
   - Tierra: vuelo sobre la imagen satelital real del Bermejo y el Impenetrable, con el contorno del parque
   - Pueblo: la casa humilde de Castelli al amanecer, sombras largas, el jeep tapado con arpillera y tres siluetas
   - Yate: el Paraná de noche con el Trasulag II; Cadenas: cadenas y dos anclas que se hunden en el agua turbia
   - Pabellón: el pasillo de una cárcel de máxima seguridad
   - Tambores: dos tambores oxidados en la orilla de una laguna, de noche, con linternas
   Reutiliza del reel 01 el agua, la vegetación instanciada, la bruma y la cámara por tramos. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {continueRender, delayRender, staticFile} from 'remotion';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import {Water, Marsh, Mist, Stars, Egrets, softTex, camPath, lerpCam, project, type Cam, type V3} from '../reel01/three';
import SATJ from '../../public/ep15/sat/sat.json';

export {camPath, lerpCam, project};
export type {Cam, V3};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const sstep = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

/* ------------------------------------------------------------------ atmósferas */
export type Atm = {zen: string; hor: string; low: string; sun: string; sunDir: V3; sunK: number; fog: string; fogD: number; hemi: [string, string, number]; key: [string, number]; rim?: [string, number]};
export const ATM: Record<string, Atm> = {
  // amanecer en el pueblo: bruma tibia, sol bajo y rasante
  alba: {zen: '#2E4258', hor: '#EBA978', low: '#3A2E26', sun: '#FFD9A6', sunDir: [0.82, 0.16, 0.55], sunK: 1, fog: '#C79A78', fogD: 0.012, hemi: ['#F3CDA6', '#2A2420', 0.5], key: ['#FFC892', 3.2], rim: ['#8FB3D0', 0.35]},
  // vista aérea del monte: calima azulada, sol de la mañana
  tierra: {zen: '#3E6E9E', hor: '#B9C6CB', low: '#2E3A26', sun: '#FFF0D2', sunDir: [0.45, 0.35, -0.82], sunK: 0.8, fog: '#AEBBBB', fogD: 0.0025, hemi: ['#E8E4D8', '#2C3A24', 0.9], key: ['#FFE9C8', 1.2]},
  // el río de noche, con luna
  rio: {zen: '#03070D', hor: '#13283A', low: '#05090D', sun: '#C7D8F2', sunDir: [-0.5, 0.3, -0.81], sunK: 0.6, fog: '#0A1620', fogD: 0.0065, hemi: ['#2C4058', '#040608', 0.55], key: ['#A9C2E6', 0.8], rim: ['#E6A15C', 0.12]},
  // la laguna de noche (más luz de luna para que se lea)
  laguna: {zen: '#040912', hor: '#22334A', low: '#05080B', sun: '#A9BCD9', sunDir: [0.35, 0.28, -0.89], sunK: 0.35, fog: '#101B26', fogD: 0.018, hemi: ['#3A4E68', '#05070A', 0.7], key: ['#9FB6D8', 0.6], rim: ['#C46A3A', 0.1]},
  // estudio negro para la cabeza: luz cálida de costado, contraluz frío
  void: {zen: '#050607', hor: '#0B0D10', low: '#030304', sun: '#000000', sunDir: [-0.72, 0.38, 0.58], sunK: 0, fog: '#050607', fogD: 0.0, hemi: ['#3A3F46', '#000000', 0.2], key: ['#FFD3AA', 2.0], rim: ['#86AECB', 2.8]},
  // bajo el agua del Paraná: verde pardo y turbio
  agua: {zen: '#14201A', hor: '#1C2A22', low: '#06090A', sun: '#000000', sunDir: [0.1, 1, 0.2], sunK: 0, fog: '#1D2B23', fogD: 0.075, hemi: ['#8FB09A', '#05080A', 0.9], key: ['#C9E0C8', 1.6]},
  // pabellón: sin cielo, tubos fluorescentes
  celda: {zen: '#0A0D0F', hor: '#0A0D0F', low: '#0A0D0F', sun: '#000000', sunDir: [0, 1, 0], sunK: 0, fog: '#0E1316', fogD: 0.045, hemi: ['#9FB4B8', '#101213', 0.55], key: ['#D8E6E2', 0.3]},
};

const TEX: Record<string, THREE.Texture> = {};
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true, repeat = true) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  if (repeat) tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  TEX[key] = tx;
  return tx;
};
const equirect = (name: string, a: Atm) =>
  canvasTex(`eq15_${name}`, 512, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, a.zen); gr.addColorStop(0.47, a.hor); gr.addColorStop(0.53, a.hor); gr.addColorStop(1, a.low);
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    const [x, y, z] = a.sunDir;
    const u = 0.5 + Math.atan2(x, -z) / (Math.PI * 2), v = 0.5 - Math.asin(y) / Math.PI;
    const rg = g.createRadialGradient(u * 512, v * 256, 0, u * 512, v * 256, 90);
    rg.addColorStop(0, a.sun); rg.addColorStop(0.12, a.sun + 'CC'); rg.addColorStop(1, a.sun + '00');
    g.globalAlpha = a.sunK; g.fillStyle = rg; g.fillRect(0, 0, 512, 256); g.globalAlpha = 1;
  }, true, false);

/* ------------------------------------------------------------------ recursos asíncronos (fuentes, imágenes) */
/* El lienzo 3D de Remotion sólo se vuelve a dibujar cuando cambia el cuadro: lo que carga tarde (fuentes para las
   texturas de texto, la imagen satelital) no llegaría a la captura. Por eso todo se precarga en la raíz de la
   composición con useAssets15() y, recién entonces, se monta el 3D. Las cabezas también se calculan acá. */
let fontsOk = false;
const TEXC: Record<string, THREE.Texture> = {};
const SAT_FILES = ['ep15/sat/region.jpg', 'ep15/sat/rio.jpg'];
const loadTex = (file: string) => new Promise<void>((res, rej) => new THREE.TextureLoader().load(staticFile(file), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; TEXC[file] = t; res(); }, undefined, rej));
let preP: Promise<void> | null = null;
const preload15 = () => {
  preP = preP ?? Promise.all([
    Promise.all([
      new FontFace('IBM Plex Mono', `url(${staticFile('fonts/IBMPlexMono-Medium.ttf')})`, {weight: '500'}).load(),
      new FontFace('Anton', `url(${staticFile('fonts/Anton-Regular.ttf')})`).load(),
    ]).then((fs) => { fs.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f)); fontsOk = true; }),
    ...SAT_FILES.map(loadTex),
  ]).then(() => { HEADS.forEach((_, k) => buildHead(k)); });
  return preP;
};
let assetsOk = false;
/** en la raíz de cada composición que use el 3D: devuelve true cuando todo está listo */
export const useAssets15 = () => {
  const [ok, setOk] = React.useState(assetsOk);
  const [h] = React.useState(() => (assetsOk ? null : delayRender('recursos del 3D (ep15)', {timeoutInMilliseconds: 180000})));
  React.useEffect(() => {
    if (ok) return;
    preload15().then(() => { assetsOk = true; setOk(true); }).catch((e) => { console.error(e); assetsOk = true; setOk(true); });
  }, [ok]);
  React.useEffect(() => { if (ok && h !== null) continueRender(h); }, [ok, h]);
  return ok;
};
const useFonts15 = () => fontsOk;
const useTex = (file: string) => TEXC[file] ?? null;

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: Cam; aspect: number; near: number}> = ({cam, aspect, near}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 40; c.aspect = aspect; c.near = near; c.far = 4000;
  c.position.set(...cam.pos); c.lookAt(...cam.look); c.updateProjectionMatrix();
  return null;
};
const Env: React.FC<{name: string; k: number}> = ({name, k}) => {
  const {gl, scene} = useThree();
  React.useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tx = equirect(name, ATM[name]);
    tx.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pm.fromEquirectangular(tx).texture;
    pm.dispose();
  }, [gl, scene, name]);
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = k;
  return null;
};
export type Shadow = {size: number; center?: V3; map?: number; dist?: number};
/** lienzo 3D del tamaño de la composición, con tonemapping ACES, la atmósfera elegida y (opcional) sombras del sol */
export const Stage15: React.FC<{cam: Cam; atm: keyof typeof ATM; w: number; h: number; exposure?: number; env?: number; fog?: number; sky?: boolean; key?: number; shadow?: Shadow; near?: number; children: React.ReactNode}> = ({
  cam, atm, w, h, exposure = 1, env = 0.8, fog = 1, sky = true, key = 1, shadow, near = 0.05, children,
}) => {
  const a = ATM[atm];
  const c = shadow?.center ?? [0, 0, 0];
  const dist = shadow?.dist ?? 120;
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight(a.key[0], a.key[1]);
    if (shadow) {
      l.castShadow = true;
      l.shadow.mapSize.set(shadow.map ?? 2048, shadow.map ?? 2048);
      l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
      const cam = l.shadow.camera as THREE.OrthographicCamera;
      cam.left = -shadow.size; cam.right = shadow.size; cam.top = shadow.size; cam.bottom = -shadow.size; cam.near = 1; cam.far = dist * 2.2;
      cam.updateProjectionMatrix();
    }
    return l;
  }, [atm, shadow?.size, shadow?.map, dist]);
  sun.position.set(c[0] + a.sunDir[0] * dist, c[1] + Math.max(a.sunDir[1], 0.06) * dist, c[2] + a.sunDir[2] * dist);
  sun.target.position.set(c[0], c[1], c[2]);
  sun.intensity = a.key[1] * key;
  return (
    <ThreeCanvas width={w} height={h} shadows={!!shadow} gl={{antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}} style={{position: 'absolute', left: 0, top: 0}}>
      <Rig cam={cam} aspect={w / h} near={near} />
      <Env name={atm as string} k={env} />
      <color attach="background" args={[a.zen]} />
      {fog > 0 && a.fogD > 0 ? <fogExp2 attach="fog" args={[a.fog, a.fogD * fog]} /> : null}
      {sky ? <Sky a={a} /> : null}
      <hemisphereLight args={[a.hemi[0], a.hemi[1], a.hemi[2]]} />
      {a.key[1] > 0 && key > 0 ? (
        <>
          <primitive object={sun} />
          <primitive object={sun.target} />
        </>
      ) : null}
      {a.rim ? <directionalLight position={[-a.sunDir[0] * 60, 30, -a.sunDir[2] * 60]} intensity={a.rim[1]} color={a.rim[0]} /> : null}
      {children}
    </ThreeCanvas>
  );
};
const SKY_VS = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const SKY_FS = `uniform vec3 zen; uniform vec3 hor; uniform vec3 low; uniform vec3 sun; uniform vec3 sunDir; uniform float sunK;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 c = mix(hor, zen, smoothstep(0.0, 0.55, h));
  c = mix(c, low, smoothstep(0.0, -0.2, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  c += sun * sunK * (pow(s, 900.0) * 4.0 + pow(s, 30.0) * 0.5 + pow(s, 4.0) * 0.16);
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const Sky: React.FC<{a: Atm}> = ({a}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {zen: {value: new THREE.Color(a.zen)}, hor: {value: new THREE.Color(a.hor)}, low: {value: new THREE.Color(a.low)}, sun: {value: new THREE.Color(a.sun)}, sunDir: {value: new THREE.Vector3(...a.sunDir)}, sunK: {value: a.sunK}},
  }), [a]);
  return <mesh renderOrder={-10} frustumCulled={false} material={mat}><sphereGeometry args={[2400, 32, 16]} /></mesh>;
};

/* ------------------------------------------------------------------ la cabeza (las mil caras) */
type HeadP = {W: number; J: number; nose: number; noseW: number; brow: number; cheek: number; chin: number; lips: number};
/** identidades: la primera es la «original»; las otras, las caras que fue cambiando */
export const HEADS: HeadP[] = [
  {W: 1, J: 1, nose: 0, noseW: 0, brow: 0, cheek: 0, chin: 0, lips: 0},
  {W: 0.93, J: 1.12, nose: 0.07, noseW: -0.012, brow: 0.05, cheek: -0.03, chin: 0.06, lips: -0.02},
  {W: 1.07, J: 0.88, nose: -0.04, noseW: 0.022, brow: -0.02, cheek: 0.06, chin: -0.03, lips: 0.025},
];
const ell = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
  const a = x / rx, b = y / ry, c = z / rz;
  const k0 = Math.sqrt(a * a + b * b + c * c);
  const a1 = a / rx, b1 = b / ry, c1 = c / rz;
  const k1 = Math.sqrt(a1 * a1 + b1 * b1 + c1 * c1);
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz);
};
const smin = (a: number, b: number, k: number) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);
const cap = (px: number, py: number, pz: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r1: number, r2: number) => {
  const pax = px - ax, pay = py - ay, paz = pz - az, bax = bx - ax, bay = by - ay, baz = bz - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz));
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - mix(r1, r2, h);
};
/** maniquí: distancia con signo a la superficie de la cabeza (mirando a +z, y arriba; mentón en y≈-1, coronilla y≈1.08) */
const headSDF = (x: number, y: number, z: number, P: HeadP) => {
  const ax = Math.abs(x);
  let d = ell(x, y - 0.2, z + 0.1, 0.72, 0.82, 0.9);                                  // cráneo
  d = smin(d, ell(x, y + 0.2, z - 0.13, 0.6 * P.W, 0.8, 0.7), 0.3);                     // macizo facial
  d = smin(d, ell(x, y + 0.6, z - 0.12, 0.5 * P.J, 0.32, 0.58), 0.26);                 // mandíbula
  d = smin(d, ell(x, y + 0.86, z - 0.54, 0.21, 0.15, 0.16 + P.chin), 0.18);              // mentón
  d = smin(d, ell(x, y - 0.19, z - 0.71, 0.47, 0.085, 0.15 + P.brow), 0.12);            // arco superciliar
  d = smin(d, ell(ax - 0.4, y + 0.13, z - 0.55, 0.19, 0.13, 0.2 + P.cheek), 0.14);      // pómulos
  d = smax(d, -ell(ax - 0.25, y - 0.03, z - 0.84, 0.15, 0.085, 0.13), 0.1);            // órbitas
  d = smin(d, ell(ax - 0.25, y - 0.03, z - 0.665, 0.11, 0.06, 0.1), 0.06);             // globos oculares
  d = smin(d, cap(x, y, z, 0, 0.1, 0.79, 0, -0.33, 0.96 + P.nose, 0.05, 0.085 + P.noseW), 0.07); // nariz
  d = smin(d, ell(ax - 0.085, y + 0.36, z - 0.85, 0.07 + P.noseW * 0.5, 0.055, 0.065), 0.05);   // aletas
  d = smin(d, ell(x, y + 0.53, z - 0.79, 0.15, 0.042, 0.065 + P.lips), 0.09);           // labio superior
  d = smin(d, ell(x, y + 0.635, z - 0.775, 0.13, 0.045, 0.06 + P.lips), 0.09);          // labio inferior
  d = smax(d, -ell(x, y + 0.583, z - 0.88, 0.16, 0.009, 0.1), 0.02);                   // comisura
  d = smin(d, ell(ax - 0.68, y + 0.04, z + 0.06, 0.06, 0.2, 0.12), 0.12);              // orejas
  d = smin(d, cap(x, y, z, 0, -0.55, -0.15, 0, -2.6, -0.28, 0.46, 0.56), 0.32);          // cuello
  return d;
};
type HeadMesh = {pos: Float32Array; nrm: Float32Array; index: Uint32Array};
const HEAD_CACHE: Record<number, HeadMesh> = {};
/** una esfera cuyos vértices se proyectan (desde adentro) hasta la superficie del maniquí; normales del gradiente */
const buildHead = (k: number, seg = 200, rings = 150): HeadMesh => {
  if (HEAD_CACHE[k]) return HEAD_CACHE[k];
  const P = HEADS[k];
  const g = new THREE.SphereGeometry(1, seg, rings);
  const src = g.attributes.position.array as Float32Array;
  const pos = new Float32Array(src.length), nrm = new Float32Array(src.length);
  const C = [0, -0.3, 0.05];
  const f = (x: number, y: number, z: number) => headSDF(x, y, z, P);
  for (let i = 0; i < src.length; i += 3) {
    const dx = -src[i + 2], dy = src[i + 1], dz = src[i];     // la costura de la esfera queda en la nuca
    let r = 3.4;
    for (let s = 0; s < 90; s++) {
      const d = f(C[0] + dx * r, C[1] + dy * r, C[2] + dz * r);
      if (Math.abs(d) < 0.0005) break;
      r -= d > 0 ? Math.max(d * 0.8, 0.002) : d;                // de afuera hacia adentro; si se pasa, vuelve
      if (r < 0.02) { r = 0.02; break; }
    }
    const px = C[0] + dx * r, py = C[1] + dy * r, pz = C[2] + dz * r;
    pos[i] = px; pos[i + 1] = py; pos[i + 2] = pz;
    const e = 0.003;
    const nx = f(px + e, py, pz) - f(px - e, py, pz), ny = f(px, py + e, pz) - f(px, py - e, pz), nz = f(px, py, pz + e) - f(px, py, pz - e);
    const l = Math.hypot(nx, ny, nz) || 1;
    nrm[i] = nx / l; nrm[i + 1] = ny / l; nrm[i + 2] = nz / l;
  }
  const idx = g.index!.array;
  const index = new Uint32Array(idx.length);
  index.set(idx as ArrayLike<number>);
  g.dispose();
  HEAD_CACHE[k] = {pos, nrm, index};
  return HEAD_CACHE[k];
};
/** lo que se proyecta sobre la cabeza: nombres, una huella digital o una grilla biométrica */
export type ProjMode = 'nombres' | 'huella' | 'grilla' | 'jara';
const projTex = (mode: ProjMode) => canvasTex('proj15_' + mode, 1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024);
  if (mode === 'nombres' || mode === 'jara') {
    const names = mode === 'jara' ? ['HUGO JARA', 'HUGO JARA', 'HUGO JARA'] : ['LUIS RAÚL MENOCCHIO', 'EL GUSANO', 'HUGO JARA', 'EL NIÑO RAÚL', 'RAÚL'];
    g.font = '500 30px "IBM Plex Mono"';
    g.fillStyle = '#FFFFFF';
    for (let row = 0; row < 26; row++) {
      let x = -((row * 137) % 400);
      let k = row;
      while (x < 1024) {
        const s = names[k % names.length] + '  ·  ';
        g.globalAlpha = 0.55 + 0.45 * rnd(row * 7 + k);
        g.fillText(s, x, 30 + row * 39);
        x += g.measureText(s).width;
        k++;
      }
    }
    g.globalAlpha = 1;
  } else if (mode === 'huella') {
    // crestas papilares: lazos concéntricos deformados, con cortes (minucias)
    g.strokeStyle = '#FFFFFF'; g.lineCap = 'round';
    for (let r = 14; r < 520; r += 15) {
      g.lineWidth = 5.5;
      g.beginPath();
      let pen = false;
      for (let a = 0; a <= 360; a += 2) {
        const th = (a * Math.PI) / 180;
        const brk = rnd(Math.floor(a / 24) * 13.7 + r * 0.37) < 0.08;
        const rr = r * (1 + 0.1 * Math.sin(th * 2 + r * 0.01)) + 7 * Math.sin(th * 5 + r * 0.05);
        const x = 512 + Math.cos(th) * rr * 0.82, y = 540 - Math.sin(th) * rr * (th > Math.PI ? 1.25 : 1.05) - (th < Math.PI ? r * 0.18 : 0);
        if (brk) { pen = false; continue; }
        if (!pen) { g.moveTo(x, y); pen = true; } else g.lineTo(x, y);
      }
      g.stroke();
    }
  } else {
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.6; g.globalAlpha = 0.7;
    for (let i = 0; i <= 1024; i += 48) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = '#FFFFFF';
    // marcas de puntos de referencia (ojos, nariz, boca, mentón)
    [[380, 470], [644, 470], [512, 600], [430, 700], [594, 700], [512, 860], [300, 520], [724, 520]].forEach(([x, y]) => {
      g.fillRect(x - 14, y - 1.5, 28, 3); g.fillRect(x - 1.5, y - 14, 3, 28);
    });
    g.font = '500 22px "IBM Plex Mono"';
    g.fillText('ID 0001 · COINCIDENCIA 34 %', 40, 990);
  }
}, true, true);
const PROJ = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
/** el maniquí. id: identidad (con decimales mezcla dos); scatter: 0-1 se desarma en triángulos (de derecha a izquierda);
    proj: proyección (k, modo, desplazamiento vertical); scan: altura de la línea roja de escaneo */
export const Cabeza: React.FC<{t: number; id?: number; scatter?: number; proj?: {k: number; mode: ProjMode; off?: number; color?: string}; scan?: {y: number; k: number}; wire?: number; pos?: V3; rotY?: number; rotX?: number; scale?: number}> = ({
  t, id = 0, scatter = 0, proj, scan, wire = 0, pos = [0, 0, 0], rotY = 0, rotX = 0, scale = 1,
}) => {
  const fontsReady = useFonts15();
  const res = useMemo(() => {
    const H = HEADS.map((_, k) => buildHead(k));
    const n = H[0].pos.length;
    const live = new THREE.BufferGeometry();
    live.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n), 3));
    live.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n), 3));
    live.setIndex(new THREE.BufferAttribute(H[0].index, 1));
    const m = H[0].index.length;
    const shards = new THREE.BufferGeometry();
    shards.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m * 3), 3));
    shards.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(m * 3), 3));
    const U = {
      projMap: {value: null as THREE.Texture | null}, projMat: {value: new THREE.Matrix4()}, projK: {value: 0}, projOff: {value: new THREE.Vector2()},
      projColor: {value: new THREE.Color('#FFE3C4')}, scanY: {value: -9}, scanK: {value: 0},
    };
    const mat = new THREE.MeshPhysicalMaterial({color: '#D2CDC6', roughness: 0.42, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.45});
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform mat4 projMat;\nvarying vec4 vProj;\nvarying vec3 vWP;')
        .replace('#include <fog_vertex>', '#include <fog_vertex>\n{ vec4 wq = modelMatrix * vec4(transformed, 1.0); vProj = projMat * wq; vWP = wq.xyz; }');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D projMap; uniform float projK; uniform vec2 projOff; uniform vec3 projColor; uniform float scanY; uniform float scanK;\nvarying vec4 vProj;\nvarying vec3 vWP;')
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          if (projK > 0.001 && vProj.w > 0.0) {
            vec2 puv = vProj.xy / vProj.w * 0.5 + 0.5;
            if (puv.x > 0.0 && puv.x < 1.0 && puv.y > 0.0 && puv.y < 1.0) {
              vec4 pc = texture2D(projMap, puv + projOff);
              float edge = smoothstep(0.0, 0.1, puv.x) * smoothstep(1.0, 0.9, puv.x) * smoothstep(0.0, 0.1, puv.y) * smoothstep(1.0, 0.9, puv.y);
              totalEmissiveRadiance += pc.rgb * pc.a * projColor * projK * edge;
            }
          }
          if (scanK > 0.001) {
            float sb = exp(-pow((vWP.y - scanY) * 26.0, 2.0)) + 0.22 * exp(-pow((vWP.y - scanY) * 5.0, 2.0));
            totalEmissiveRadiance += vec3(1.0, 0.2, 0.14) * sb * scanK;
          }`);
    };
    mat.customProgramCacheKey = () => 'cabeza15';
    const wm = new THREE.MeshBasicMaterial({color: '#C0352B', wireframe: true, transparent: true, opacity: 0, depthWrite: false});
    return {H, live, shards, U, mat, wm};
  }, []);
  const {H, live, shards, U, mat, wm} = res;
  // identidad: mezcla de dos cabezas precalculadas
  const n = H.length;
  const i0 = ((Math.floor(id) % n) + n) % n, i1 = (i0 + 1) % n, fr = easeInOut(id - Math.floor(id));
  const P = live.attributes.position.array as Float32Array, N = live.attributes.normal.array as Float32Array;
  const A = H[i0], B = H[i1];
  for (let i = 0; i < P.length; i++) { P[i] = A.pos[i] + (B.pos[i] - A.pos[i]) * fr; N[i] = A.nrm[i] + (B.nrm[i] - A.nrm[i]) * fr; }
  live.attributes.position.needsUpdate = true; live.attributes.normal.needsUpdate = true;
  live.computeBoundingSphere();
  if (scatter > 0) {
    const SP = shards.attributes.position.array as Float32Array, SN = shards.attributes.normal.array as Float32Array;
    const I = A.index;
    for (let tri = 0; tri < I.length / 3; tri++) {
      const a = I[tri * 3] * 3, b = I[tri * 3 + 1] * 3, c = I[tri * 3 + 2] * 3;
      const cx = (P[a] + P[b] + P[c]) / 3, cy = (P[a + 1] + P[b + 1] + P[c + 1]) / 3, cz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
      const nx = (N[a] + N[b] + N[c]) / 3, ny = (N[a + 1] + N[b + 1] + N[c + 1]) / 3, nz = (N[a + 2] + N[b + 2] + N[c + 2]) / 3;
      // umbral: se desarma de derecha a izquierda, con ruido
      const th = (1 - (cx + 0.8) / 1.6) * 0.55 + rnd(tri * 0.37) * 0.45;
      const k = clamp((scatter * 1.5 - th) / 0.5);
      const e = k * k;
      const r1 = rnd(tri * 1.13) - 0.5, r2 = rnd(tri * 2.71) - 0.5, r3 = rnd(tri * 3.97) - 0.5;
      const ox = (nx * 1.4 + r1 * 1.2 + 0.6) * e * 1.6, oy = (ny * 1.4 + r2 * 1.2 + 0.5) * e * 1.6, oz = (nz * 1.4 + r3 * 1.2) * e * 1.6;
      const sh = 1 - e * 0.7;
      for (let v = 0; v < 3; v++) {
        const s = (tri * 3 + v) * 3, q = I[tri * 3 + v] * 3;
        SP[s] = cx + (P[q] - cx) * sh + ox; SP[s + 1] = cy + (P[q + 1] - cy) * sh + oy; SP[s + 2] = cz + (P[q + 2] - cz) * sh + oz;
        SN[s] = N[q]; SN[s + 1] = N[q + 1]; SN[s + 2] = N[q + 2];
      }
    }
    shards.attributes.position.needsUpdate = true; shards.attributes.normal.needsUpdate = true;
    shards.computeBoundingSphere();
  }
  // proyector fijo delante de la cara (no gira con la cabeza: como un proyector de verdad)
  PROJ.position.set(0.15, 0.05, 5.5); PROJ.lookAt(0, -0.15, 0); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  U.projMat.value.multiplyMatrices(PROJ.projectionMatrix, PROJ.matrixWorldInverse);
  U.projK.value = fontsReady && proj ? proj.k : 0;
  if (fontsReady && proj) U.projMap.value = projTex(proj.mode);
  U.projOff.value.set(0, proj?.off ?? 0);
  U.projColor.value.set(proj?.color ?? '#FFE3C4');
  U.scanY.value = scan ? scan.y : -9; U.scanK.value = scan ? scan.k : 0;
  wm.opacity = wire * 0.35;
  if (!fontsReady) return null;
  return (
    <group position={pos} rotation={[rotX, rotY, 0]} scale={scale}>
      {scatter > 0 ? <mesh geometry={shards} material={mat} frustumCulled={false} /> : <mesh geometry={live} material={mat} />}
      {wire > 0.01 && scatter <= 0 ? <mesh geometry={live} material={wm} scale={1.002} /> : null}
    </group>
  );
};
/** polvo en suspensión iluminado (puntos) */
export const Motes: React.FC<{t: number; n?: number; box?: [number, number, number]; center?: V3; color?: string; size?: number; k?: number}> = ({t, n = 400, box = [6, 4, 4], center = [0, 0, 0], color = '#FFD9A8', size = 2.2, k = 1}) => {
  const geo = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)), [n]);
  const a = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < n; i++) {
    a[i * 3] = center[0] + (rnd(i * 1.3) - 0.5) * box[0] + Math.sin(t * 0.3 + i) * 0.05 * box[0] * 0.1;
    a[i * 3 + 1] = center[1] + ((rnd(i * 2.7) + t * 0.01 * (0.5 + rnd(i))) % 1 - 0.5) * box[1];
    a[i * 3 + 2] = center[2] + (rnd(i * 4.1) - 0.5) * box[2] + Math.cos(t * 0.25 + i * 0.7) * 0.05 * box[2] * 0.1;
  }
  geo.attributes.position.needsUpdate = true;
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={size} sizeAttenuation={false} color={color} transparent opacity={0.55 * k} depthWrite={false} map={softTex()} fog={false} /></points>;
};
/** fondo de estudio: un telón lejano con un halo apenas más claro detrás de la cabeza */
const backdropTex = () => canvasTex('backdrop15', 512, 512, (g) => {
  const gr = g.createRadialGradient(256, 230, 10, 256, 256, 300);
  gr.addColorStop(0, '#1E2328'); gr.addColorStop(0.5, '#0D1013'); gr.addColorStop(1, '#040506');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
}, true, false);
/** la escena de la cabeza: estudio negro, luz cálida de costado, contraluz frío y un rojo que sube desde abajo */
export const CabezaScene: React.FC<{t: number; w: number; h: number; cam: Cam; red?: number; key?: number; children?: React.ReactNode} & React.ComponentProps<typeof Cabeza>> = ({w, h, cam, red = 0.35, key = 1, children, ...head}) => (
  <Stage15 cam={cam} atm="void" w={w} h={h} sky={false} env={0.22} exposure={1.0} key={key}>
    <mesh position={[0, 0, -9]}><planeGeometry args={[40, 40]} /><meshBasicMaterial map={backdropTex()} toneMapped={false} /></mesh>
    <pointLight position={[0.4, -2.4, 1.8]} intensity={14 * red} distance={9} decay={1.6} color="#C0352B" />
    <Cabeza {...head} />
    <Motes t={head.t} n={600} box={[8, 6, 6]} k={0.55} size={2} />
    {children}
  </Stage15>
);

/* ------------------------------------------------------------------ la Tierra: imagen satelital real */
type Crop = {w: number; h: number; m_per_px: number; points: Record<string, [number, number]>; parque: [number, number][]};
const SAT = SATJ as unknown as {crops: Record<'region' | 'rio', Crop>; credit: string; date: string};
export const SAT_CREDIT = SAT.credit;
export type CropName = 'region' | 'rio';
/** 1 unidad = 100 m. Plano centrado en el origen: x al este, z al sur */
export const satDims = (crop: CropName) => {
  const c = SAT.crops[crop];
  return {W: (c.w * c.m_per_px) / 100, H: (c.h * c.m_per_px) / 100};
};
export const satXZ = (crop: CropName, px: number, py: number, y = 0): V3 => {
  const c = SAT.crops[crop];
  const {W, H} = satDims(crop);
  return [(px * c.m_per_px) / 100 - W / 2, y, (py * c.m_per_px) / 100 - H / 2];
};
export const satPoint = (crop: CropName, name: string, y = 0): V3 => {
  const p = SAT.crops[crop].points[name];
  return satXZ(crop, p[0], p[1], y);
};
/** cinta plana sobre el suelo a lo largo de una polilínea (para el contorno del parque, que se dibuja de a poco) */
const ribbon = (pts: V3[], width: number) => {
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[2] - a[2];
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    pos.push(p[0] - dz * width / 2, p[1], p[2] + dx * width / 2, p[0] + dz * width / 2, p[1], p[2] - dx * width / 2);
    if (i < pts.length - 1) { const o = i * 2; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};
/** vuelo sobre la imagen satelital: el plano texturizado, un suelo de relleno, la calima y el contorno del parque */
export const Tierra: React.FC<{t: number; crop: CropName; outline?: number; outlineO?: number; glow?: number; pins?: {name: string; o: number}[]}> = ({t, crop, outline = 0, outlineO = 1, glow = 1, pins = []}) => {
  const tex = useTex(`ep15/sat/${crop}.jpg`);
  const {W, H} = satDims(crop);
  const res = useMemo(() => {
    const pts = SAT.crops[crop].parque.map(([x, y]) => satXZ(crop, x, y, 0.35));
    pts.push(pts[0]);
    const wLine = crop === 'region' ? 2.6 : 1.4;
    return {line: ribbon(pts, wLine), halo: ribbon(pts.map((p) => [p[0], p[1] - 0.05, p[2]] as V3), wLine * 5), n: pts.length};
  }, [crop]);
  const cnt = Math.floor((res.n - 1) * clamp(outline)) * 6;
  res.line.setDrawRange(0, cnt); res.halo.setDrawRange(0, cnt);
  if (!tex) return null;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}><planeGeometry args={[9000, 9000, 30, 30]} /><meshBasicMaterial color="#2C3D22" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[W, H]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      {outline > 0 ? (
        <>
          <mesh geometry={res.halo} renderOrder={3}><meshBasicMaterial color="#E39B47" transparent opacity={0.22 * outlineO * glow} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>
          <mesh geometry={res.line} renderOrder={4}><meshBasicMaterial color="#F2B467" transparent opacity={0.95 * outlineO} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
        </>
      ) : null}
      {pins.map((p) => {
        const at = satPoint(crop, p.name, 0);
        return p.o > 0 ? (
          <group key={p.name} position={at}>
            <mesh position={[0, 6, 0]}><cylinderGeometry args={[0.18, 0.18, 12, 6]} /><meshBasicMaterial color="#EEE7D9" transparent opacity={0.85 * p.o} toneMapped={false} /></mesh>
            <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.6 + (t * 3) % 4, 2.0 + (t * 3) % 4, 32]} /><meshBasicMaterial color="#E39B47" transparent opacity={p.o * (1 - ((t * 3) % 4) / 4)} toneMapped={false} depthWrite={false} /></mesh>
          </group>
        ) : null;
      })}
    </>
  );
};

/* ------------------------------------------------------------------ el pueblo al amanecer */
const plasterTex = () => canvasTex('plaster15', 512, 256, (g) => {
  g.fillStyle = '#CDB896'; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) {   // manchas grandes y suaves (revoque parcheado)
    const x = rnd(i * 3.1) * 512, y = rnd(i * 5.3) * 256, r = 20 + rnd(i * 7.7) * 70;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const c = rnd(i) > 0.5 ? '255,240,215' : '110,85,60';
    gr.addColorStop(0, `rgba(${c},${0.08 + rnd(i * 2) * 0.1})`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 2600; i++) { g.fillStyle = rnd(i * 1.7) > 0.5 ? 'rgba(255,245,225,0.07)' : 'rgba(70,55,40,0.08)'; g.fillRect(rnd(i * 3.1) * 512, rnd(i * 5.7) * 256, 1 + rnd(i * 9) * 3, 1 + rnd(i * 4) * 3); }
  // humedad que sube desde el piso
  g.beginPath(); g.moveTo(0, 256);
  for (let x = 0; x <= 512; x += 8) g.lineTo(x, 196 - Math.sin(x * 0.03) * 10 - rnd(x) * 14);
  g.lineTo(512, 256); g.closePath(); g.fillStyle = 'rgba(95,72,50,0.42)'; g.fill();
  // descascarados con ladrillo a la vista
  for (let i = 0; i < 3; i++) {
    const x = rnd(i * 11.3) * 470, y = 60 + rnd(i * 13.1) * 120, w = 16 + rnd(i * 2.9) * 30, h = 10 + rnd(i * 4.3) * 16;
    g.fillStyle = '#8E6A52'; g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(210,190,160,0.6)'; g.lineWidth = 1.2;
    for (let yy = y + 6; yy < y + h; yy += 7) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  }
  // grietas
  g.strokeStyle = 'rgba(60,45,30,0.45)'; g.lineWidth = 1;
  for (let i = 0; i < 9; i++) { let x = rnd(i * 17) * 512, y = rnd(i * 19) * 120; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (rnd(i * 31 + k) - 0.5) * 14; y += 6 + rnd(k + i) * 6; g.lineTo(x, y); } g.stroke(); }
});
const burlapTex = () => canvasTex('burlap15', 256, 256, (g) => {
  g.fillStyle = '#A88B5E'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 4) {
    g.fillStyle = `rgba(80,60,35,${0.22 + rnd(i) * 0.15})`; g.fillRect(0, i, 256, 1.6);
    g.fillStyle = `rgba(80,60,35,${0.18 + rnd(i * 3) * 0.15})`; g.fillRect(i, 0, 1.6, 256);
  }
  for (let i = 0; i < 1500; i++) { g.fillStyle = rnd(i) > 0.5 ? 'rgba(220,200,160,0.12)' : 'rgba(60,45,25,0.14)'; g.fillRect(rnd(i * 2.3) * 256, rnd(i * 4.1) * 256, 2, 2); }
  for (let i = 0; i < 5; i++) { const x = rnd(i * 7) * 256, y = rnd(i * 9) * 256; const gr = g.createRadialGradient(x, y, 0, x, y, 50); gr.addColorStop(0, 'rgba(60,45,30,0.3)'); gr.addColorStop(1, 'rgba(60,45,30,0)'); g.fillStyle = gr; g.fillRect(x - 50, y - 50, 100, 100); }
});
/** el jeep viejo tapado con bolsas de arpillera */
export const JeepTapado: React.FC<{pos: V3; yaw?: number}> = ({pos, yaw = 0}) => {
  const tx = burlapTex();
  const bags: [V3, V3, V3, string][] = useMemo(() => Array.from({length: 9}, (_, i) => [
    [(rnd(i * 2.1) - 0.5) * 1.2, 1.45 + rnd(i * 3.3) * 0.25, -1.6 + i * 0.4] as V3,
    [rnd(i) * 0.3 - 0.15, rnd(i * 5) * 0.6, rnd(i * 7) * 0.3 - 0.15] as V3,
    [1.0 + rnd(i * 4) * 0.5, 0.18 + rnd(i * 6) * 0.1, 0.7 + rnd(i * 8) * 0.3] as V3,
    ['#B0946A', '#9E8259', '#A68A60', '#8F7650'][i % 4],
  ]), []);
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.95, -0.2]} castShadow receiveShadow><boxGeometry args={[1.75, 1.1, 3.0]} /><meshStandardMaterial map={tx} color="#B39669" roughness={1} /></mesh>
      <mesh position={[0, 0.72, 1.55]} castShadow receiveShadow><boxGeometry args={[1.6, 0.62, 1.2]} /><meshStandardMaterial map={tx} color="#A88D63" roughness={1} /></mesh>
      {bags.map(([p, r, s, c], i) => (
        <mesh key={i} position={p} rotation={r} scale={s} castShadow><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial map={tx} color={c} roughness={1} /></mesh>
      ))}
      {[[-0.86, -1.2], [0.86, -1.2], [-0.86, 1.4], [0.86, 1.4]].map(([x, z], i) => (
        <mesh key={'w' + i} position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.38, 0.38, 0.26, 18]} /><meshStandardMaterial color="#141414" roughness={0.9} /></mesh>
      ))}
    </group>
  );
};
const House: React.FC<{pos: V3; w?: number; h?: number; d?: number; color?: string; door?: number; main?: boolean}> = ({pos, w = 9, h = 3.4, d = 8, color = '#FFFFFF', door = 0, main = false}) => {
  const tex = plasterTex();
  return (
    <group position={pos}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial map={tex} color={color} roughness={0.95} /></mesh>
      {/* borde de la chapa del techo */}
      <mesh position={[0, h + 0.08, 0.2]} rotation={[0.06, 0, 0]} castShadow><boxGeometry args={[w + 0.4, 0.08, d + 0.5]} /><meshStandardMaterial color="#6E6A62" metalness={0.5} roughness={0.55} /></mesh>
      {main ? (
        <>
          {/* puerta de madera que se abre hacia adentro */}
          <group position={[-1.2, 0, d / 2 + 0.02]}>
            <mesh position={[0.55, 1.1, -0.05]}><boxGeometry args={[1.25, 2.25, 0.08]} /><meshStandardMaterial color="#070605" /></mesh>
            <group rotation={[0, -door * 1.3, 0]}>
              <mesh position={[0.55, 1.1, 0]} castShadow><boxGeometry args={[1.1, 2.15, 0.08]} /><meshStandardMaterial color="#5A3C26" roughness={0.8} /></mesh>
            </group>
          </group>
          {/* ventanas con reja */}
          {[1.6, 3.4].map((x) => (
            <group key={x} position={[x, 1.6, d / 2 + 0.02]}>
              <mesh><planeGeometry args={[1.2, 1.2]} /><meshStandardMaterial color="#15181A" roughness={0.15} metalness={0.2} /></mesh>
              {[-0.45, -0.15, 0.15, 0.45].map((bx) => <mesh key={bx} position={[bx, 0, 0.06]} castShadow><boxGeometry args={[0.04, 1.3, 0.04]} /><meshStandardMaterial color="#222" metalness={0.5} /></mesh>)}
            </group>
          ))}
          <mesh position={[0.25, 2.55, d / 2 + 0.03]}><planeGeometry args={[0.6, 0.22]} /><meshStandardMaterial color="#E9E1CF" /></mesh>
        </>
      ) : (
        <mesh position={[0, 1.4, d / 2 + 0.02]}><planeGeometry args={[1.4, 1.1]} /><meshStandardMaterial color="#1B1E20" roughness={0.2} /></mesh>
      )}
    </group>
  );
};
/** silueta humana sin rostro: cápsula y cabeza, con un balanceo de caminata */
export const Figure: React.FC<{pos: V3; t: number; walk?: number; color?: string; yaw?: number; scale?: number}> = ({pos, t, walk = 1, color = '#0A0B0C', yaw = 0, scale = 1}) => {
  const ph = t * 5.6;
  return (
    <group position={[pos[0], pos[1] + Math.abs(Math.sin(ph)) * 0.05 * walk, pos[2]]} rotation={[0, yaw, Math.sin(ph) * 0.02 * walk]} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow><capsuleGeometry args={[0.27, 0.95, 4, 10]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh position={[0, 1.95, 0]} castShadow><sphereGeometry args={[0.17, 12, 10]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.12, 0.38, Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.18 * walk]} rotation={[Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.45 * walk, 0, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 3, 8]} /><meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
/** silueta de árbol del monte chaqueño dibujada en un lienzo: tronco, ramas que se abren y copas irregulares */
const treeCardTex = (v: number) => canvasTex('treecard15_' + v, 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#FFFFFF'; g.lineCap = 'round';
  let seed = v * 97;
  const r = () => rnd(seed++ * 1.37);
  const branch = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
    const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
    g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * 10, (y + y2) / 2, x2, y2); g.stroke();
    if (depth > 0) {
      branch(x2, y2, ang + 0.35 + r() * 0.35, len * (0.62 + r() * 0.15), w * 0.68, depth - 1);
      branch(x2, y2, ang - 0.4 - r() * 0.35, len * (0.6 + r() * 0.15), w * 0.68, depth - 1);
      if (r() < 0.4) branch(x2, y2, ang + (r() - 0.5) * 0.3, len * 0.55, w * 0.6, depth - 1);
    } else {
      for (let k = 0; k < 10; k++) { g.beginPath(); g.ellipse(x2 + (r() - 0.5) * 34, y2 + (r() - 0.5) * 18, 7 + r() * 12, 5 + r() * 8, 0, 0, Math.PI * 2); g.fill(); }
    }
  };
  branch(128, 256, Math.PI / 2 + (r() - 0.5) * 0.15, 62 + r() * 18, 9, 4);
}, true, false);
/** el monte detrás de las casas: tarjetas de siluetas de árboles, oscuras y con la bruma del amanecer */
const TreeCards: React.FC<{n?: number; area?: [number, number, number, number]; size?: [number, number]; color?: string}> = ({n = 1500, area = [-240, 240, -170, -26], size = [9, 16], color = '#3A4130'}) => {
  const meshes = useMemo(() => [0, 1, 2].map((v) => {
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({map: treeCardTex(v), color, transparent: true, alphaTest: 0.45, roughness: 1, side: THREE.DoubleSide});
    const k = Math.floor(n / 3);
    const m = new THREE.InstancedMesh(geo, mat, k);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < k; i++) {
      const j = i * 3 + v;
      const x = mix(area[0], area[1], rnd(j * 1.37)), z = mix(area[2], area[3], rnd(j * 2.91) ** 0.8);
      const s = mix(size[0], size[1], rnd(j * 7.7));
      q.setFromEuler(new THREE.Euler(0, (rnd(j * 5.1) - 0.5) * 0.5, 0));
      m4.compose(new THREE.Vector3(x, -0.3, z), q, new THREE.Vector3(s * (0.8 + rnd(j * 3.3) * 0.5), s, 1));
      m.setMatrixAt(i, m4); m.setColorAt(i, c.setHSL(0.2 + rnd(j) * 0.06, 0.18, 0.75 + rnd(j * 9.1) * 0.25));
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return m;
  }), [n, color]);
  return <>{meshes.map((m, i) => <primitive key={i} object={m} />)}</>;
};
/** copa de árbol en lienzo: cientos de hojas en verdes distintos, más claras arriba a la derecha (el sol) */
const canopyTex = () => canvasTex('canopy15', 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const a = rnd(i * 1.3) * Math.PI * 2, r = Math.sqrt(rnd(i * 2.7)) * 230;
    const x = 256 + Math.cos(a) * r * 1.05, y = 250 + Math.sin(a) * r * 0.82;
    const lit = clamp(0.5 + (x - 256) / 600 - (y - 250) / 500 + (rnd(i * 5.1) - 0.5) * 0.5);
    const c = [Math.round(mix(38, 120, lit)), Math.round(mix(52, 140, lit)), Math.round(mix(26, 60, lit))];
    g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    g.beginPath(); g.ellipse(x, y, 5 + rnd(i * 3.3) * 7, 3 + rnd(i * 4.4) * 4, rnd(i) * Math.PI, 0, Math.PI * 2); g.fill();
  }
}, true, false);
/** el paraíso de la vereda: tronco y tres tarjetas cruzadas con la copa (con sombra recortada por las hojas) */
const Paraiso: React.FC<{pos: V3}> = ({pos}) => {
  const res = useMemo(() => {
    const map = canopyTex();
    const mat = new THREE.MeshStandardMaterial({map, alphaTest: 0.5, transparent: false, side: THREE.DoubleSide, roughness: 0.95});
    const depth = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5});
    return {mat, depth};
  }, []);
  return (
    <group position={pos}>
      <mesh position={[0, 1.7, 0]} castShadow><cylinderGeometry args={[0.15, 0.24, 3.4, 8]} /><meshStandardMaterial color="#3A2C21" roughness={1} /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 4.4, 0]} rotation={[0, (i * Math.PI) / 3, 0]} material={res.mat} customDepthMaterial={res.depth} castShadow receiveShadow>
          <planeGeometry args={[5.6, 4.6]} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0]} rotation={[-Math.PI / 2, 0, 0.4]} material={res.mat} customDepthMaterial={res.depth} castShadow><planeGeometry args={[5.0, 4.4]} /></mesh>
    </group>
  );
};
/** la calle de tierra, la casa, los vecinos, el jeep, un paraíso, el poste de luz y tres siluetas que llegan */
export const Pueblo: React.FC<{t: number; door?: number; walkers?: {t0: number; from: V3; to: V3; dur: number; vanish?: boolean}[]; jeep?: boolean; dust?: number}> = ({t, door = 0, walkers = [], jeep = true, dust = 1}) => {
  const ground = useMemo(() => canvasTex('dirt15', 256, 256, (g) => {
    g.fillStyle = '#8A6A4A'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5000; i++) { g.fillStyle = rnd(i) > 0.5 ? 'rgba(170,135,95,0.25)' : 'rgba(55,40,28,0.25)'; g.fillRect(rnd(i * 2.3) * 256, rnd(i * 4.1) * 256, 1 + rnd(i * 7) * 3, 1 + rnd(i * 9) * 3); }
    g.strokeStyle = 'rgba(60,42,28,0.25)'; g.lineWidth = 3;   // huellas de ruedas
    [70, 92, 160, 182].forEach((y) => { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.05) * 3); g.stroke(); });
  }), []);
  ground.repeat.set(30, 30);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[500, 500]} /><meshStandardMaterial map={ground} roughness={1} /></mesh>
      <mesh position={[0, 0.06, 6.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[220, 2.4]} /><meshStandardMaterial color="#9A9184" roughness={0.95} /></mesh>
      <mesh position={[0, 0.1, 7.85]} receiveShadow><boxGeometry args={[220, 0.2, 0.15]} /><meshStandardMaterial color="#B5AC9C" roughness={0.9} /></mesh>
      <House pos={[0, 0, 0]} main door={door} />
      <House pos={[-11, 0, -0.5]} w={10} h={3.1} color="#E2D6C4" />
      <House pos={[11.5, 0, 0.5]} w={11} h={3.6} color="#EFE3CF" />
      <House pos={[-24, 0, -1]} w={12} h={3.0} color="#D8C9B0" />
      <House pos={[25, 0, -0.5]} w={12} h={3.3} color="#E8D9BF" />
      <House pos={[-38, 0, -0.8]} w={12} h={3.2} color="#DCCDB5" />
      <House pos={[39, 0, 0]} w={12} h={3.4} color="#E3D4BA" />
      <TreeCards />
      {jeep ? <JeepTapado pos={[6.8, 0, 9.4]} yaw={Math.PI / 2 + 0.05} /> : null}
      {/* paraíso frente a la casa */}
      <Paraiso pos={[-4.6, 0, 9.2]} />
      {/* poste y cables */}
      <mesh position={[-9, 3.8, 8.6]} castShadow><cylinderGeometry args={[0.12, 0.16, 7.6, 6]} /><meshStandardMaterial color="#5B4A3A" /></mesh>
      <mesh position={[-9, 7.2, 8.6]} castShadow><boxGeometry args={[1.6, 0.1, 0.1]} /><meshStandardMaterial color="#5B4A3A" /></mesh>
      {[-0.7, 0.7].map((o) => <mesh key={o} position={[-9 + o, 7.15, 8.6]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.014, 0.014, 220, 3]} /><meshBasicMaterial color="#1A1A1A" /></mesh>)}
      {walkers.map((w, i) => {
        if (t < w.t0) return null;
        const k = clamp((t - w.t0) / w.dur);
        if (w.vanish && k >= 1) return null;
        const p: V3 = [mix(w.from[0], w.to[0], k), 0, mix(w.from[2], w.to[2], k)];
        return <Figure key={i} pos={p} t={t + i * 0.37} walk={k < 1 ? 1 : 0} yaw={Math.atan2(w.to[0] - w.from[0], w.to[2] - w.from[2])} />;
      })}
      <Motes t={t} n={700} box={[40, 7, 22]} center={[0, 3.5, 7]} color="#FFE2B8" size={2} k={0.8 * dust} />
    </>
  );
};

/* ------------------------------------------------------------------ el yate en el Paraná */
const HULL_L0 = -7, HULL_L1 = 7.4;
const hullStation = (u: number) => {
  const bow = sstep(0.5, 1, u);
  return {
    b: 2.15 * (1 - Math.pow(bow, 1.7) * 0.985) * (1 - 0.05 * (1 - u)),
    sheer: 1.25 + 0.5 * bow * bow,
    keel: -0.75 + 0.6 * Math.pow(bow, 2.4),
  };
};
/** casco por secciones (forma en V, proa que sube y se afina) + cubierta + espejo de popa */
const hullGeo = () => {
  const NZ = 56, NS = 10, row = NS * 2 + 1;
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NZ; i++) {
    const u = i / NZ, z = mix(HULL_L0, HULL_L1, u);
    const {b, sheer, keel} = hullStation(u);
    for (let j = 0; j < row; j++) {
      const v = j / (row - 1), side = v < 0.5 ? 1 : -1, w = Math.abs(v - 0.5) * 2;
      const yy = keel + (sheer - keel) * Math.pow(w, 1.25);
      const xx = b * (w < 0.5 ? Math.pow(w / 0.5, 0.65) * 0.94 : 0.94 + 0.06 * (w - 0.5) / 0.5) * side;
      pos.push(xx, yy, z);
    }
  }
  for (let i = 0; i < NZ; i++) for (let j = 0; j < row - 1; j++) { const a = i * row + j, b = a + 1, c = a + row, d = c + 1; idx.push(a, b, c, b, d, c); }
  // cubierta: franja entre las dos bordas
  const d0 = pos.length / 3;
  for (let i = 0; i <= NZ; i++) {
    const u = i / NZ, z = mix(HULL_L0, HULL_L1, u);
    const {b, sheer} = hullStation(u);
    pos.push(b, sheer - 0.05, z, -b, sheer - 0.05, z, 0, sheer + 0.04, z);
  }
  for (let i = 0; i < NZ; i++) { const a = d0 + i * 3, c = a + 3; idx.push(a, c, a + 2, a + 2, c, c + 2, a + 2, c + 2, a + 1, a + 1, c + 2, c + 1); }
  // espejo de popa
  const s0 = pos.length / 3;
  const {sheer: sh0} = hullStation(0);
  pos.push(0, sh0, HULL_L0);
  for (let j = 0; j < row; j++) idx.push(s0, j, j + 1 < row ? j + 1 : j);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
/** cabina: perfil lateral (parabrisas inclinado) extruido a lo ancho */
const cabinGeo = (len: number, h: number, w: number, rake: number) => {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(len, 0); s.lineTo(len - rake, h); s.lineTo(0.25, h); s.lineTo(0, h - 0.25); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: w, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2});
  g.rotateY(-Math.PI / 2); g.translate(w / 2, 0, 0);
  return g;
};
const nameTex = (txt: string, color = '#1B2A36') => canvasTex(`name_${txt}_${color}`, 512, 96, (g) => {
  g.clearRect(0, 0, 512, 96);
  g.font = '60px Anton, Impact, sans-serif'; g.fillStyle = color; g.textAlign = 'center'; g.fillText(txt, 256, 72);
}, true, false);
export const Yacht: React.FC<{t: number; pos?: V3; yaw?: number; lights?: number}> = ({t, pos = [0, 0, 0], yaw = 0, lights = 1}) => {
  const fontsReady = useFonts15();
  const g = useMemo(() => ({hull: hullGeo(), cabin: cabinGeo(6.4, 1.25, 3.3, 1.4), fly: cabinGeo(3.6, 0.55, 2.9, 0.9), glass: cabinGeo(6.5, 0.5, 3.36, 0.75)}), []);
  const bob = Math.sin(t * 0.9) * 0.06, roll = Math.sin(t * 0.7 + 1) * 0.018, pitch = Math.sin(t * 0.55) * 0.008;
  const white = <meshStandardMaterial color="#E9EDEF" roughness={0.3} metalness={0.05} />;
  if (!fontsReady) return null;
  return (
    <group position={[pos[0], pos[1] + bob, pos[2]]} rotation={[pitch, yaw, roll]}>
      <mesh geometry={g.hull}><meshStandardMaterial color="#E6EAEC" roughness={0.32} metalness={0.05} side={THREE.DoubleSide} /></mesh>
      {/* franja azul a lo largo del casco */}
      {[1, -1].map((sd) => (
        <mesh key={sd} position={[sd * 2.08, 0.62, -0.6]} rotation={[0, sd * Math.PI / 2, 0]}><planeGeometry args={[11.2, 0.22]} /><meshStandardMaterial color="#1B2A36" roughness={0.4} side={THREE.DoubleSide} /></mesh>
      ))}
      {[1, -1].map((sd) => (
        <mesh key={'n' + sd} position={[sd * 2.1, 0.95, -4.6]} rotation={[0, sd * Math.PI / 2, 0]}><planeGeometry args={[2.6, 0.5]} /><meshBasicMaterial map={nameTex('TRASULAG II')} transparent toneMapped={false} side={THREE.DoubleSide} /></mesh>
      ))}
      <mesh position={[0, 0.85, HULL_L0 - 0.03]} rotation={[0, Math.PI, 0]}><planeGeometry args={[2.8, 0.52]} /><meshBasicMaterial map={nameTex('TRASULAG II')} transparent toneMapped={false} /></mesh>
      {/* cabina, ventanas encendidas, flybridge y bimini */}
      <mesh geometry={g.cabin} position={[0, 1.2, -4.6]}>{white}</mesh>
      <mesh geometry={g.glass} position={[0, 1.62, -4.65]}><meshStandardMaterial color="#0E151A" emissive="#F2B56B" emissiveIntensity={0.7 * lights} roughness={0.08} metalness={0.3} /></mesh>
      <mesh geometry={g.fly} position={[0, 2.5, -4.2]}>{white}</mesh>
      {[[-1.3, -4.0], [1.3, -4.0], [-1.3, -1.6], [1.3, -1.6]].map(([x, z], i) => <mesh key={'p' + i} position={[x, 3.6, z]}><cylinderGeometry args={[0.03, 0.03, 1.5, 6]} /><meshStandardMaterial color="#C9CFD3" metalness={0.7} roughness={0.25} /></mesh>)}
      <mesh position={[0, 4.36, -2.8]}><boxGeometry args={[2.9, 0.06, 3.0]} /><meshStandardMaterial color="#1F2C38" roughness={0.8} /></mesh>
      {/* barandas */}
      {[-1, 1].map((sd) => <mesh key={'r' + sd} position={[sd * 1.9, 1.85, 2.4]} rotation={[0.04, 0, 0]}><boxGeometry args={[0.04, 0.04, 7.2]} /><meshStandardMaterial color="#C9CFD3" metalness={0.7} roughness={0.25} /></mesh>)}
      {/* mástil y luces de navegación: babor (rojo) a la izquierda mirando a proa (+x), estribor (verde) */}
      <mesh position={[0, 5.0, -2.2]}><cylinderGeometry args={[0.04, 0.05, 1.3, 6]} /><meshStandardMaterial color="#B8BEC2" /></mesh>
      <mesh position={[0, 5.7, -2.2]}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#FFFFFF" toneMapped={false} /></mesh>
      <mesh position={[1.62, 2.55, -0.9]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#FF3B30" toneMapped={false} /></mesh>
      <mesh position={[-1.62, 2.55, -0.9]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color="#30D158" toneMapped={false} /></mesh>
      <pointLight position={[0, 2.0, -1.0]} intensity={18 * lights} distance={16} decay={1.6} color="#F2B56B" />
      <pointLight position={[0, 1.6, -6.4]} intensity={10 * lights} distance={10} decay={1.6} color="#F2B56B" />
    </group>
  );
};
/** reflejos de las luces sobre el agua: rayas verticales que tiemblan (estiradas hacia la cámara) */
export const LightPaths: React.FC<{t: number; cam: Cam; lights: {p: V3; color: string; k?: number; len?: number}[]}> = ({t, cam, lights}) => {
  const tex = useMemo(() => canvasTex('streak15', 64, 256, (g) => {
    for (let y = 0; y < 256; y += 2) {
      const a = (1 - y / 256) ** 1.5 * (0.5 + 0.5 * rnd(y * 0.7));
      const w = 10 + rnd(y * 1.3) * 34;
      const gr = g.createLinearGradient(32 - w / 2, 0, 32 + w / 2, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, y, 64, 2);
    }
  }, true, false), []);
  return (
    <>
      {lights.map((l, i) => {
        const dx = cam.pos[0] - l.p[0], dz = cam.pos[2] - l.p[2];
        const ang = Math.atan2(dx, dz), len = l.len ?? 7;
        return (
          <mesh key={i} position={[l.p[0] + Math.sin(ang) * len / 2, 0.03, l.p[2] + Math.cos(ang) * len / 2]} rotation={[-Math.PI / 2, 0, ang + Math.PI]} renderOrder={6}>
            <planeGeometry args={[0.9 + 0.2 * Math.sin(t * 3 + i), len]} />
            <meshBasicMaterial map={tex} color={l.color} transparent opacity={(l.k ?? 1) * (0.75 + 0.25 * Math.sin(t * 5.3 + i * 2))} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
          </mesh>
        );
      })}
    </>
  );
};
/** costa lejana con luces y la cúpula de la basílica de Itatí recortada contra el cielo */
export const Shore: React.FC<{z?: number; k?: number; x?: number}> = ({z = -260, k = 1, x = 70}) => {
  const lights = useMemo(() => {
    const n = 160, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(rnd(i * 2.1) - 0.5) * 700, 1 + rnd(i * 5.3) * 5, z + 6 + rnd(i * 3.7) * 30], i * 3);
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(p, 3));
  }, [z]);
  return (
    <group>
      <mesh position={[0, 2.5, z + 15]}><boxGeometry args={[1400, 7, 30]} /><meshStandardMaterial color="#05080A" roughness={1} /></mesh>
      <group position={[x, 0, z + 12]}>
        <mesh position={[0, 12, 0]}><boxGeometry args={[26, 18, 16]} /><meshStandardMaterial color="#0A1016" /></mesh>
        <mesh position={[0, 24, 0]}><cylinderGeometry args={[6.5, 6.5, 8, 24]} /><meshStandardMaterial color="#0C1218" /></mesh>
        <mesh position={[0, 28, 0]}><sphereGeometry args={[6.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#0E151C" emissive="#5A6A7A" emissiveIntensity={0.28 * k} /></mesh>
        <mesh position={[0, 36, 0]}><cylinderGeometry args={[1.1, 1.1, 3, 10]} /><meshStandardMaterial color="#0E151C" emissive="#E8C27A" emissiveIntensity={0.9 * k} /></mesh>
        {[-11, 11].map((dx) => <mesh key={dx} position={[dx, 26, 4]}><boxGeometry args={[3.2, 22, 3.2]} /><meshStandardMaterial color="#0B1117" emissive="#3A4652" emissiveIntensity={0.18 * k} /></mesh>)}
      </group>
      <points geometry={lights}><pointsMaterial size={3.2} sizeAttenuation={false} color="#F4C27A" transparent opacity={0.85 * k} map={softTex()} depthWrite={false} fog={false} /></points>
    </group>
  );
};
/** reflejo de la luna sobre el agua: un reguero de brillos */
export const MoonGlitter: React.FC<{t: number; from?: V3; to?: V3; k?: number}> = ({t, from = [-30, 0.05, -60], to = [-160, 0.05, -400], k = 1}) => {
  const geo = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(700 * 3), 3)), []);
  const a = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < 700; i++) {
    const u = rnd(i * 1.9) ** 0.7, sp = (rnd(i * 3.3) - 0.5) * (5 + u * 45);
    a.set([mix(from[0], to[0], u) + sp, 0.06, mix(from[2], to[2], u) + (rnd(i * 7.1) - 0.5) * 4], i * 3);
  }
  geo.attributes.position.needsUpdate = true;
  return <points geometry={geo}><pointsMaterial size={2.6} sizeAttenuation={false} color="#DCE7F7" transparent opacity={0.55 * k * (0.6 + 0.4 * Math.sin(t * 7))} map={softTex()} depthWrite={false} fog={false} /></points>;
};

/* ------------------------------------------------------------------ cadenas y anclas bajo el agua (sin cuerpo) */
const rustMat = (c = '#5E4A38') => new THREE.MeshStandardMaterial({color: c, metalness: 0.65, roughness: 0.62});
const anchorGeo = () => {
  // ancla de cepo: caña, cruz, dos brazos curvos con uñas y el arganeo
  const parts: THREE.BufferGeometry[] = [];
  const shank = new THREE.CylinderGeometry(0.07, 0.08, 1.7, 10); parts.push(shank);
  const ring = new THREE.TorusGeometry(0.17, 0.045, 8, 16); ring.translate(0, 0.98, 0); parts.push(ring);
  const stock = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8); stock.rotateX(Math.PI / 2); stock.translate(0, 0.7, 0); parts.push(stock);
  const arms = new THREE.TorusGeometry(0.62, 0.065, 8, 22, Math.PI); arms.rotateZ(Math.PI); arms.translate(0, -0.2, 0); parts.push(arms);
  [-1, 1].forEach((sd) => { const fl = new THREE.ConeGeometry(0.16, 0.42, 4); fl.rotateZ(sd * 0.5); fl.translate(sd * 0.62, -0.05, 0); parts.push(fl); });
  const ni = parts.map((g) => g.toNonIndexed());
  const n = ni.reduce((s, g) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3); let off = 0;
  ni.forEach((g) => { pos.set(g.attributes.position.array as Float32Array, off * 3); off += g.attributes.position.count; });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.computeVertexNormals();
  return out;
};
/** la cadena baja desde la superficie hasta dos anclas viejas que se hunden en lo turbio */
export const Cadenas: React.FC<{t: number; t0: number; sink?: number}> = ({t, t0, sink = 3.2}) => {
  const res = useMemo(() => {
    const link = new THREE.TorusGeometry(0.2, 0.055, 8, 18); link.scale(1, 1.55, 1);
    return {link, mat: rustMat('#6A5440'), anchor: anchorGeo(), amat: rustMat('#4F4033')};
  }, []);
  const k = clamp((t - t0) / 10);
  const dy = easeOut(k) * sink;
  const links = 46;
  return (
    <group position={[0, -dy, 0]}>
      {Array.from({length: links}, (_, i) => {
        const u = i / links;
        const sw = Math.sin(u * 3 + t * 0.4) * 0.25 * u;
        return <mesh key={i} geometry={res.link} material={res.mat} position={[sw, 0.35 + i * 0.5, Math.cos(u * 4 + t * 0.3) * 0.12 * u]} rotation={[0, i % 2 ? Math.PI / 2 : 0, Math.sin(u * 4 + t * 0.5) * 0.06]} />;
      })}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[sd * 0.75, -0.75, sd * 0.2]} rotation={[sd * 0.15, sd * 0.6, sd * 0.22 + Math.sin(t * 0.5 + sd) * 0.04]}>
          <mesh geometry={res.anchor} material={res.amat} />
        </group>
      ))}
    </group>
  );
};
/** rayos de luz que bajan desde la superficie */
export const Shafts: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  const tex = useMemo(() => canvasTex('shaft15', 64, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, 64, 256);
  }, true, false), []);
  return (
    <>
      {Array.from({length: 9}, (_, i) => (
        <mesh key={i} position={[(rnd(i * 3.1) - 0.5) * 14, 6, -4 + (rnd(i * 5.3) - 0.5) * 8]} rotation={[0, rnd(i) * 0.8 - 0.4, (rnd(i * 7) - 0.5) * 0.35]} renderOrder={8}>
          <planeGeometry args={[0.8 + rnd(i * 2) * 1.6, 16]} />
          <meshBasicMaterial map={tex} color="#BFD9B8" transparent opacity={k * (0.1 + 0.06 * Math.sin(t * 0.8 + i * 1.7))} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </>
  );
};
/** burbujas que suben */
export const Bubbles: React.FC<{t: number; n?: number; k?: number}> = ({t, n = 160, k = 1}) => {
  const geo = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)), [n]);
  const a = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < n; i++) a.set([(rnd(i) - 0.5) * 3 + Math.sin(t * 2 + i) * 0.1, ((rnd(i * 2.3) * 14 + t * (1 + rnd(i * 3.1))) % 14) - 5, (rnd(i * 4.7) - 0.5) * 2], i * 3);
  geo.attributes.position.needsUpdate = true;
  return <points geometry={geo}><pointsMaterial size={5} sizeAttenuation={false} color="#CFE6E0" transparent opacity={0.5 * k} map={softTex()} depthWrite={false} fog={false} /></points>;
};

/* ------------------------------------------------------------------ el pabellón */
export const Pabellon: React.FC<{t: number; len?: number; flicker?: number; figure?: boolean}> = ({t, len = 60, flicker = 1, figure = true}) => {
  const res = useMemo(() => {
    const bar = new THREE.CylinderGeometry(0.035, 0.035, 3, 6);
    const barM = new THREE.MeshStandardMaterial({color: '#5E666B', metalness: 0.8, roughness: 0.35});
    const n = Math.floor(len / 4) * 2 * 14;
    const inst = new THREE.InstancedMesh(bar, barM, n);
    const m4 = new THREE.Matrix4(); let k = 0;
    for (let c = 0; c < Math.floor(len / 4); c++)
      for (const sd of [-1, 1])
        for (let b = 0; b < 14; b++) { m4.makeTranslation(sd * 2.2, 1.5, -c * 4 - 0.4 - b * 0.24); inst.setMatrixAt(k++, m4); }
    inst.count = k; inst.instanceMatrix.needsUpdate = true;
    return {inst};
  }, [len]);
  const lights = Math.floor(len / 8);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -len / 2]}><planeGeometry args={[4.4, len + 10]} /><meshStandardMaterial color="#3B4144" roughness={0.25} metalness={0.1} envMapIntensity={0.6} /></mesh>
      <mesh position={[0, 3.2, -len / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[4.4, len + 10]} /><meshStandardMaterial color="#202426" roughness={0.9} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 3.4, 1.6, -len / 2]} rotation={[0, -sd * Math.PI / 2, 0]}><planeGeometry args={[len + 10, 3.2]} /><meshStandardMaterial color="#2C3133" roughness={0.95} /></mesh>)}
      <primitive object={res.inst} />
      {Array.from({length: lights}, (_, i) => {
        const fl = flicker > 0 && i === 2 ? (Math.sin(t * 37) > 0.6 || Math.sin(t * 5.3) > 0.9 ? 0.2 : 1) : 1;
        return (
          <group key={i} position={[0, 3.12, -i * 8 - 2]}>
            <mesh><boxGeometry args={[0.18, 0.06, 2.2]} /><meshBasicMaterial color="#E6F2EF" toneMapped={false} transparent opacity={fl} /></mesh>
            <pointLight position={[0, -0.3, 0]} intensity={4 * fl} distance={9} color="#D6EBE6" />
          </group>
        );
      })}
      {figure ? <Figure pos={[2.9, 0, -26]} t={t} walk={0} yaw={-Math.PI / 2} color="#050607" /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ la laguna y los tambores */
const rustTex = () => canvasTex('rust15', 256, 256, (g) => {
  g.fillStyle = '#5A3A24'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const x = rnd(i * 1.7) * 256, y = rnd(i * 2.9) * 256, r = 6 + rnd(i * 4.1) * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const c = ['150,80,40', '90,55,35', '40,30,25', '170,110,60'][i % 4];
    gr.addColorStop(0, `rgba(${c},0.6)`); gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 40; i++) { const x = rnd(i * 9.3) * 256; g.fillStyle = 'rgba(40,25,15,0.25)'; g.fillRect(x, 0, 1 + rnd(i) * 3, 256); }   // chorreaduras
});
const Drum: React.FC<{pos: V3; rot: V3; cement?: boolean}> = ({pos, rot, cement = true}) => {
  const tx = rustTex();
  return (
    <group position={pos} rotation={rot}>
      <mesh castShadow><cylinderGeometry args={[0.29, 0.29, 0.88, 28]} /><meshStandardMaterial map={tx} color="#B07A55" metalness={0.45} roughness={0.8} /></mesh>
      {[0.25, 0.5, 0.75].map((r) => <mesh key={r} position={[0, (r - 0.5) * 0.88, 0]}><torusGeometry args={[0.296, 0.014, 6, 28]} /><meshStandardMaterial map={tx} color="#9A6A48" metalness={0.5} roughness={0.75} /></mesh>)}
      <mesh position={[0, 0.441, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.285, 28]} /><meshStandardMaterial color={cement ? '#8C8880' : '#3A2A1E'} roughness={1} /></mesh>
      {cement ? <mesh position={[0, 0.447, 0]} rotation={[-Math.PI / 2, 0, 0.6]}><planeGeometry args={[0.5, 0.012]} /><meshBasicMaterial color="#2A2724" /></mesh> : null}
    </group>
  );
};
/** dos tambores de 200 litros en el barro de la orilla; linternas de la policía que barren la escena */
export const Tambores: React.FC<{t: number; beams?: number; police?: number}> = ({t, beams = 1, police = 0.6}) => {
  const tg = useMemo(() => [new THREE.Object3D(), new THREE.Object3D()], []);
  const sw = [Math.sin(t * 0.45) * 0.8, Math.sin(t * 0.33 + 2) * 0.9];
  const pl = Math.sin(t * 9) > 0 ? 1 : 0.15;
  return (
    <>
      <Water mood="night" t={t} size={500} opacity={0.9} y={0} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.03, 3.2]} receiveShadow><circleGeometry args={[4.5, 40]} /><meshStandardMaterial color="#2A251E" roughness={0.6} metalness={0.05} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.035, 5.5]} receiveShadow><circleGeometry args={[6, 40]} /><meshStandardMaterial color="#231F1A" roughness={0.75} /></mesh>
      <Drum pos={[-0.45, 0.36, 3.1]} rot={[0.06, 0, 0.08]} />
      <Drum pos={[0.42, 0.24, 2.55]} rot={[Math.PI / 2 - 0.12, 0.6, 0]} cement={false} />
      <Marsh t={t} mood="night" seed={4} lane={2.6} dense={0.5} far area={[-40, 40, -60, -2]} />
      <Mist t={t} color="#9FB2C4" k={1.0} z={-18} />
      {tg.map((o, i) => <primitive key={i} object={o} position={[sw[i] + (i ? 0.5 : -0.4), 0.3, 2.9]} />)}
      {beams > 0 ? (
        <>
          <spotLight position={[-5, 2.2, 9]} target={tg[0]} angle={0.16} penumbra={0.6} intensity={140 * beams} distance={30} decay={1.4} color="#F6EEDA" />
          <spotLight position={[4.5, 2.0, 9.5]} target={tg[1]} angle={0.14} penumbra={0.7} intensity={110 * beams} distance={30} decay={1.4} color="#F2F0E6" />
        </>
      ) : null}
      {police > 0 ? (
        <>
          <pointLight position={[-14, 2, -8]} intensity={40 * police * pl} distance={40} decay={1.4} color="#3D6BFF" />
          <pointLight position={[-12, 2, -9]} intensity={40 * police * (1.15 - pl)} distance={40} decay={1.4} color="#FF3B30" />
        </>
      ) : null}
      <mesh position={[0, 26, -300]}><planeGeometry args={[900, 70]} /><meshBasicMaterial color="#2F3A4A" transparent opacity={0.3} fog={false} /></mesh>
    </>
  );
};
export {Water, Marsh, Mist, Stars, Egrets};
