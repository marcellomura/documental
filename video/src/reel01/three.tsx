/* Escenas 3D del reel 01 (LA MAESTRA QUE IBA A CABALLO): el bañado de Esquina (agua que refleja el cielo, juncos que se
   mecen, matas de malezal, islas de monte, garzas y bruma), el caballo con su jinete (modelo CC0 de Quaternius con
   animación de paso y de galope; el jinete es propio), la escuela rural con su bandera, el aula vacía, la tormenta
   nocturna y las ondas en el agua. Todo es determinístico: depende solo del tiempo t. */
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {staticFile} from 'remotion';
import {clamp, easeInOut, rnd} from '../lib/anim';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------------ cámara (propia: no importa otros episodios, que
   precargan sus texturas al importarse) */
export type V3 = [number, number, number];
export type Cam = {pos: V3; look: V3; fov?: number};
const mix3 = (a: V3, b: V3, k: number): V3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: mix(a.fov ?? 40, b.fov ?? 40, k)});
/** cámara por tramos: keys = [[t, cam], ...]; entre claves interpola con easeInOut en dur segundos */
export const camPath = (t: number, keys: [number, Cam][], dur = 1.4): Cam => {
  let c = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, ck] = keys[i];
    const k = easeInOut(clamp((t - tk) / dur));
    if (k > 0) c = lerpCam(c, ck, k);
  }
  return c;
};
const _pc = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 1200);
/** proyecta un punto 3D a píxeles del cuadro vertical */
export const project = (cam: Cam, p: V3, w = 1080, h = 1920): [number, number] => {
  _pc.fov = cam.fov ?? 40;
  _pc.aspect = w / h;
  _pc.position.set(...cam.pos);
  _pc.lookAt(...cam.look);
  _pc.updateProjectionMatrix();
  _pc.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(_pc);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h];
};

/* ------------------------------------------------------------------ climas */
export type Mood = 'dawn' | 'cold' | 'night' | 'storm' | 'dusk';
type Sky = {zen: string; hor: string; sun: string; sunDir: V3; sunK: number; fog: string; fogD: number; hemi: [string, string, number]; key: [string, number]; water: string; stars: number};
export const SKY: Record<Mood, Sky> = {
  // amanecer: contraluz cálido, el sol bajo detrás del jinete
  dawn: {zen: '#22344A', hor: '#E9A56A', sun: '#FFD9A0', sunDir: [0.55, 0.1, -0.83], sunK: 1, fog: '#C58A62', fogD: 0.011, hemi: ['#F2C9A0', '#1D2A2E', 0.42], key: ['#FFC48A', 2.8], water: '#3E5257', stars: 0},
  // mañana fría (la búsqueda): cielo plano y gris azulado
  cold: {zen: '#5D7484', hor: '#C7CFCB', sun: '#F2F0E6', sunDir: [-0.4, 0.35, -0.85], sunK: 0.35, fog: '#AEB8B6', fogD: 0.016, hemi: ['#DCE3E2', '#2A3432', 1.0], key: ['#F4F1E8', 1.3], water: '#5E6D6E', stars: 0},
  night: {zen: '#03060B', hor: '#13202A', sun: '#9FB6D6', sunDir: [-0.3, 0.45, -0.84], sunK: 0.25, fog: '#0B141A', fogD: 0.02, hemi: ['#30425A', '#05080B', 0.55], key: ['#9DB4D8', 0.45], water: '#0C161C', stars: 1},
  storm: {zen: '#070B10', hor: '#2A3843', sun: '#8EA2B8', sunDir: [0.2, 0.4, -0.9], sunK: 0.05, fog: '#16212A', fogD: 0.024, hemi: ['#3A4A5C', '#06080B', 0.75], key: ['#9FB6D4', 0.45], water: '#101A21', stars: 0},
  dusk: {zen: '#1C2238', hor: '#D9855A', sun: '#FFB27A', sunDir: [-0.6, 0.06, -0.8], sunK: 0.9, fog: '#9C6A57', fogD: 0.012, hemi: ['#E7A88A', '#18181E', 0.45], key: ['#FFAA70', 2.2], water: '#2F3946', stars: 0.25},
};

/* ------------------------------------------------------------------ texturas de lienzo */
const TEX: Record<string, THREE.Texture> = {};
const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, c: HTMLCanvasElement) => void, srgb = true, repeat = true) => {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, c);
  const tx = new THREE.CanvasTexture(c);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  if (repeat) tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  TEX[key] = tx;
  return tx;
};
/** cielo equirectangular (gradiente + sol) para los reflejos del agua */
const skyEquirect = (m: Mood) =>
  canvasTex(`sky_${m}`, 512, 256, (g) => {
    const s = SKY[m];
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, s.zen);
    gr.addColorStop(0.47, s.hor);
    gr.addColorStop(0.53, s.hor);
    gr.addColorStop(1, s.water);
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 256);
    // el sol: dirección -> coordenadas equirectangulares
    const [x, y, z] = s.sunDir;
    const u = 0.5 + Math.atan2(x, -z) / (Math.PI * 2), v = 0.5 - Math.asin(y) / Math.PI;
    const rg = g.createRadialGradient(u * 512, v * 256, 0, u * 512, v * 256, 90);
    rg.addColorStop(0, s.sun);
    rg.addColorStop(0.12, s.sun + 'CC');
    rg.addColorStop(1, s.sun + '00');
    g.globalAlpha = s.sunK;
    g.fillStyle = rg;
    g.fillRect(0, 0, 512, 256);
    g.globalAlpha = 1;
  }, true, false);
/** relieve de ondas para el agua (ruido suave, periódico) */
const rippleNormal = () =>
  canvasTex('ripplesN', 256, 256, (g) => {
    const img = g.createImageData(256, 256);
    const hgt = (x: number, y: number) => {
      let v = 0;
      for (let k = 1; k <= 4; k++) {
        const f = k * 2;
        v += (Math.sin(((x * f + rnd(k * 3) * 256) / 256) * Math.PI * 2 + Math.sin((y * f) / 256 * Math.PI * 2) * 1.3) +
          Math.sin(((y * f * 1.3 + rnd(k * 7) * 256) / 256) * Math.PI * 2 + Math.cos((x * f) / 256 * Math.PI * 2))) / k;
      }
      return v;
    };
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const dx = hgt(x + 1, y) - hgt(x - 1, y), dy = hgt(x, y + 1) - hgt(x, y - 1);
        const n = new THREE.Vector3(-dx * 0.35, -dy * 0.35, 1).normalize();
        const i = (y * 256 + x) * 4;
        img.data[i] = (n.x * 0.5 + 0.5) * 255;
        img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
        img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    g.putImageData(img, 0, 0);
  }, false);
/** brillo radial suave (bruma, destellos, gotas) */
export const softTex = () =>
  canvasTex('soft', 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  }, true, false);
/** pared de ladrillo encalada: hiladas apenas marcadas bajo la cal, manchas de humedad que suben desde el piso y
    descascarados que dejan ver el ladrillo (la escuela por fuera y por dentro) */
const wallTex = (key: string, base: string, stain: string) =>
  canvasTex(key, 512, 256, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 256);
    // hiladas de ladrillo bajo la cal
    g.strokeStyle = `rgba(${stain},0.07)`;
    g.lineWidth = 1;
    for (let y = 0; y < 256; y += 12) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(512, y);
      g.stroke();
      for (let x = (y / 12) % 2 ? 0 : 18; x < 512; x += 36) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + 12);
        g.stroke();
      }
    }
    for (let i = 0; i < 140; i++) {
      const x = rnd(i * 3.1) * 512, y = rnd(i * 7.7) * 256, r = 3 + rnd(i * 1.3) * 22;
      g.fillStyle = `rgba(${stain},${0.02 + rnd(i * 5.3) * 0.04})`;
      g.beginPath();
      g.ellipse(x, y, r * 1.8, r, 0, 0, Math.PI * 2);
      g.fill();
    }
    // humedad que sube desde el piso
    const gr = g.createLinearGradient(0, 256, 0, 170);
    gr.addColorStop(0, `rgba(${stain},0.38)`);
    gr.addColorStop(1, `rgba(${stain},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 170, 512, 86);
    // descascarado: se ve el ladrillo
    for (let i = 0; i < 14; i++) {
      const x = rnd(i * 11.1 + 4) * 512, y = 40 + rnd(i * 13.9 + 2) * 200, w = 10 + rnd(i) * 34, h = 6 + rnd(i * 2) * 16;
      g.fillStyle = 'rgba(150,96,70,0.35)';
      g.beginPath();
      g.ellipse(x, y, w / 2, h / 2, rnd(i * 5) * 0.6, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.stroke();
    }
  });
/** chapa acanalada (techo) */
const tinTex = () =>
  canvasTex('tin', 256, 256, (g) => {
    for (let x = 0; x < 256; x++) {
      const v = 0.5 + 0.5 * Math.sin((x / 256) * Math.PI * 2 * 16);
      const c = Math.round(110 + v * 70);
      g.fillStyle = `rgb(${c},${c + 4},${c + 8})`;
      g.fillRect(x, 0, 1, 256);
    }
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(120,60,30,${0.05 + rnd(i * 3) * 0.12})`;
      g.fillRect(rnd(i * 5) * 256, rnd(i * 9) * 256, 3 + rnd(i) * 30, 2 + rnd(i * 4) * 10);
    }
  });
/** bandera argentina de ceremonia (con el sol de mayo) */
const flagTex = () =>
  canvasTex('flagAR', 384, 240, (g) => {
    g.fillStyle = '#74ACDF';
    g.fillRect(0, 0, 384, 240);
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 80, 384, 80);
    g.translate(192, 120);
    g.fillStyle = '#F6B40E';
    for (let i = 0; i < 32; i++) {
      g.rotate(Math.PI / 16);
      g.beginPath();
      g.moveTo(-3, 18);
      g.lineTo(0, i % 2 ? 34 : 30);
      g.lineTo(3, 18);
      g.fill();
    }
    g.beginPath();
    g.arc(0, 0, 17, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#85340A';
    g.lineWidth = 1.5;
    g.stroke();
  }, true, false);
/** pizarrón con tiza borrada */
const boardTex = () =>
  canvasTex('board', 512, 256, (g) => {
    g.fillStyle = '#23352C';
    g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(230,235,225,${0.03 + rnd(i * 2.3) * 0.05})`;
      g.beginPath();
      g.ellipse(rnd(i * 4.1) * 512, rnd(i * 6.7) * 256, 20 + rnd(i) * 70, 6 + rnd(i * 3) * 18, rnd(i * 9) * 0.4 - 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = '#6A4A2E';
    g.lineWidth = 14;
    g.strokeRect(0, 0, 512, 256);
  }, true, false);

/* ------------------------------------------------------------------ recursos (el caballo) */
type Gltf = {scene: THREE.Group; clips: THREE.AnimationClip[]};
let HORSE: Gltf | null = null;
let horseP: Promise<void> | null = null;
/** carga el caballo una sola vez; el componente raíz espera esta promesa antes de dibujar (ver useAssets en kit.tsx) */
export const loadHorse = () => {
  if (!horseP)
    horseP = new Promise<void>((res, rej) => {
      new GLTFLoader().load(
        staticFile('reel01/3d/horse.gltf'),
        (g) => {
          HORSE = {scene: g.scene, clips: g.animations};
          res();
        },
        undefined,
        rej,
      );
    });
  return horseP;
};

/* ------------------------------------------------------------------ escenario */
const Rig: React.FC<{cam: Cam; aspect: number}> = ({cam, aspect}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = cam.fov ?? 40;
  c.aspect = aspect;
  c.near = 0.05;
  c.far = 1200;
  c.position.set(...cam.pos);
  c.lookAt(...cam.look);
  c.updateProjectionMatrix();
  c.updateMatrixWorld();
  return null;
};
const EnvSky: React.FC<{mood: Mood; k: number}> = ({mood, k}) => {
  const {gl, scene} = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tx = skyEquirect(mood);
    tx.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pm.fromEquirectangular(tx).texture;
    pm.dispose();
  }, [gl, scene, mood]);
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = k;
  return null;
};
/** lienzo 3D vertical (1080×1920) con tonemapping ACES y el cielo del clima elegido como entorno */
export const Stage: React.FC<{cam: Cam; mood: Mood; exposure?: number; env?: number; children: React.ReactNode; w?: number; h?: number; fog?: number}> = ({
  cam, mood, exposure = 1, env = 0.9, children, w = 1080, h = 1920, fog = 1,
}) => (
  <ThreeCanvas
    width={w}
    height={h}
    gl={{antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}}
    style={{position: 'absolute', left: 0, top: 0}}
  >
    <Rig cam={cam} aspect={w / h} />
    <EnvSky mood={mood} k={env} />
    {fog > 0 ? <fogExp2 attach="fog" args={[SKY[mood].fog, SKY[mood].fogD * fog]} /> : null}
    {children}
  </ThreeCanvas>
);

/* ------------------------------------------------------------------ cielo y luces */
const SKY_VS = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const SKY_FS = `uniform vec3 zen; uniform vec3 hor; uniform vec3 low; uniform vec3 sun; uniform vec3 sunDir; uniform float sunK; uniform float flash;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 c = mix(hor, zen, smoothstep(0.0, 0.55, h));
  c = mix(c, low, smoothstep(0.0, -0.25, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  c += sun * sunK * (pow(s, 600.0) * 3.0 + pow(s, 24.0) * 0.55 + pow(s, 4.0) * 0.18);
  c += vec3(0.75, 0.8, 0.95) * flash * (0.5 + 0.5 * smoothstep(-0.1, 0.4, h));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export const SkyDome: React.FC<{mood: Mood; flash?: number}> = ({mood, flash = 0}) => {
  const s = SKY[mood];
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VS,
        fragmentShader: SKY_FS,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          zen: {value: new THREE.Color(s.zen)}, hor: {value: new THREE.Color(s.hor)}, low: {value: new THREE.Color(s.water)}, sun: {value: new THREE.Color(s.sun)},
          sunDir: {value: new THREE.Vector3(...s.sunDir)}, sunK: {value: s.sunK}, flash: {value: 0},
        },
      }),
    [mood],
  );
  mat.uniforms.flash.value = flash;
  return (
    <mesh renderOrder={-10} frustumCulled={false} material={mat}>
      <sphereGeometry args={[900, 32, 16]} />
    </mesh>
  );
};
export const Lights: React.FC<{mood: Mood; flash?: number; k?: number}> = ({mood, flash = 0, k = 1}) => {
  const s = SKY[mood];
  const d = new THREE.Vector3(...s.sunDir).normalize().multiplyScalar(60);
  return (
    <>
      <hemisphereLight args={[s.hemi[0], s.hemi[1], s.hemi[2] * k + flash * 2.5]} />
      <directionalLight position={[d.x, Math.max(d.y, 0.08) * 60, d.z]} intensity={s.key[1] * k} color={s.key[0]} />
      {/* contraluz frío del lado opuesto: recorta las siluetas */}
      <directionalLight position={[-d.x, 18, -d.z]} intensity={0.35 * k + flash * 3} color="#9DB7D0" />
    </>
  );
};
/** estrellas (noche) */
export const Stars: React.FC<{k: number}> = ({k}) => {
  const geo = useMemo(() => {
    const n = 900, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rnd(i * 3.3) * Math.PI * 2, y = 0.05 + Math.pow(rnd(i * 7.1), 0.6) * 0.95, r = Math.sqrt(1 - y * y);
      p.set([Math.cos(th) * r * 800, y * 800, Math.sin(th) * r * 800], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  if (k <= 0.01) return null;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={2.2} sizeAttenuation={false} color="#DDE6F5" transparent opacity={0.85 * k} fog={false} depthWrite={false} />
    </points>
  );
};

/* ------------------------------------------------------------------ el agua */
export const Water: React.FC<{mood: Mood; t: number; size?: number; opacity?: number; y?: number}> = ({mood, t, size = 900, opacity = 0.8, y = 0}) => {
  const s = SKY[mood];
  const mat = useMemo(() => {
    const n = rippleNormal().clone();
    n.wrapS = n.wrapT = THREE.RepeatWrapping;
    n.repeat.set(size / 7, size / 7);
    n.needsUpdate = true;
    return new THREE.MeshStandardMaterial({color: s.water, roughness: 0.08, metalness: 0.0, normalMap: n, normalScale: new THREE.Vector2(0.18, 0.18), transparent: true, opacity, envMapIntensity: 1.4, depthWrite: true});
  }, [mood, size, opacity]);
  (mat.normalMap as THREE.Texture).offset.set(t * 0.004, t * 0.0025);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={mat} renderOrder={1}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};
/** fondo del bañado (barro) bajo el agua, para que el reflejo del caballo tenga contra qué recortarse */
export const MudFloor: React.FC<{color?: string}> = ({color = '#1A1E18'}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
    <planeGeometry args={[1200, 1200]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

/* ------------------------------------------------------------------ vegetación instanciada */
/** inyecta el balanceo del viento en un material estándar (según la altura del vértice y la posición de la instancia) */
const swayMat = (color: string, amp: number, rough = 0.85, uniforms: {uT: {value: number}} = {uT: {value: 0}}) => {
  const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: 0, vertexColors: false});
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = uniforms.uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uT;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #else
          vec3 ip = vec3(0.0);
        #endif
        float hk = max(position.y, 0.0);
        float w = sin(uT * 1.4 + ip.x * 0.31 + ip.z * 0.17) * 0.6 + sin(uT * 2.7 + ip.x * 0.9) * 0.25;
        transformed.x += w * ${amp.toFixed(3)} * hk * hk;
        transformed.z += cos(uT * 1.1 + ip.z * 0.4) * ${(amp * 0.5).toFixed(3)} * hk * hk;`,
      );
  };
  (m as unknown as {_u: typeof uniforms})._u = uniforms;
  return m;
};
/** junco: varilla fina y alta (3 caras) */
const reedGeo = () => {
  const g = new THREE.ConeGeometry(0.03, 1, 3, 1, true);
  g.translate(0, 0.5, 0);
  return g;
};
/** mata de malezal: siete hojas largas en abanico */
const tuftGeo = () => {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.ConeGeometry(0.05, 1, 3, 1, true);
    b.translate(0, 0.5, 0);
    b.rotateZ((rnd(i * 3.7) - 0.5) * 0.9);
    b.rotateY(rnd(i * 9.1) * Math.PI * 2);
    parts.push(b);
  }
  return mergeGeos(parts);
};
const mergeGeos = (gs: THREE.BufferGeometry[]) => {
  const pos: number[] = [], nor: number[] = [];
  for (const g0 of gs) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    pos.push(...(g.attributes.position.array as Float32Array));
    nor.push(...(g.attributes.normal.array as Float32Array));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
};
/** árbol bajo del monte correntino: copa ancha y achatada sobre un tronco corto */
const treeGeo = () => {
  const crown = new THREE.IcosahedronGeometry(1, 0);
  crown.scale(1.6, 0.75, 1.6);
  crown.translate(0, 2.6, 0);
  const c2 = new THREE.IcosahedronGeometry(1, 0);
  c2.scale(1.1, 0.6, 1.1);
  c2.translate(0.9, 2.2, 0.4);
  const trunk = new THREE.CylinderGeometry(0.12, 0.18, 2.2, 5);
  trunk.translate(0, 1.1, 0);
  return mergeGeos([crown, c2, trunk]);
};
type Scatter = {x: number; z: number; s: number; r: number; c: number};
/** reparte matas, juncos y árboles en manchones (islas) alrededor de un camino libre (x en [-lane, lane]) */
const scatter = (seed: number, n: number, area: [number, number, number, number], opts: {clump?: number; lane?: number; laneZ?: [number, number]; holes?: [number, number, number][]} = {}) => {
  const out: Scatter[] = [];
  const [x0, x1, z0, z1] = area;
  const centers = Array.from({length: opts.clump ?? 40}, (_, i) => [mix(x0, x1, rnd(seed + i * 2.1)), mix(z0, z1, rnd(seed * 3 + i * 4.3)), 1.5 + rnd(seed + i) * 6]);
  for (let i = 0; out.length < n && i < n * 4; i++) {
    const c = centers[Math.floor(rnd(seed * 7 + i * 1.7) * centers.length)];
    const a = rnd(seed + i * 5.9) * Math.PI * 2, d = Math.sqrt(rnd(seed * 11 + i * 3.1)) * c[2];
    const x = c[0] + Math.cos(a) * d, z = c[1] + Math.sin(a) * d;
    if (opts.lane && Math.abs(x) < opts.lane && (!opts.laneZ || (z > opts.laneZ[0] && z < opts.laneZ[1]))) continue;
    if (opts.holes && opts.holes.some(([hx, hz, hr]) => (x - hx) ** 2 + (z - hz) ** 2 < hr * hr)) continue;
    out.push({x, z, s: 0.6 + rnd(seed * 13 + i) * 0.8, r: rnd(seed * 17 + i) * Math.PI * 2, c: rnd(seed * 19 + i)});
  }
  return out;
};
const Instanced: React.FC<{geo: THREE.BufferGeometry; mat: THREE.Material; items: Scatter[]; sy: [number, number]; sxz?: number; colors?: string[]; y?: number}> = ({geo, mat, items, sy, sxz = 1, colors, y = 0}) => {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, items.length);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(it.x, y, it.z);
      o.rotation.set(0, it.r, 0);
      const h = mix(sy[0], sy[1], it.s - 0.6);
      o.scale.set(sxz * it.s, h, sxz * it.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (colors) m.setColorAt(i, col.set(colors[Math.floor(it.c * colors.length) % colors.length]));
    });
    m.frustumCulled = false;
    return m;
  }, [geo, mat, items]);
  return <primitive object={mesh} />;
};

/** el bañado completo: juncales, matas, islas de monte en el horizonte y una franja libre por donde va el caballo */
export const Marsh: React.FC<{t: number; mood: Mood; seed?: number; lane?: number; laneZ?: [number, number]; dense?: number; far?: boolean; holes?: [number, number, number][]; area?: [number, number, number, number]}> = ({
  t, mood, seed = 1, lane = 3.2, laneZ, dense = 1, far = true, holes, area = [-60, 60, -90, 14],
}) => {
  const u = useMemo(() => ({uT: {value: 0}}), []);
  const dark = mood === 'night' || mood === 'storm';
  const res = useMemo(() => {
    const reedC = dark ? ['#1C2420', '#222A22', '#18201C'] : ['#4E5A31', '#5C6638', '#43502D', '#6A6A3E', '#545C35', '#7A7444'];
    const tuftC = dark ? ['#1E261F', '#262C22'] : ['#7A7748', '#857D4C', '#62683E', '#8E8556', '#6E6C43'];
    return {
      reed: reedGeo(), tuft: tuftGeo(), tree: treeGeo(),
      mReed: swayMat('#FFFFFF', 0.035, 0.8, u), mTuft: swayMat('#FFFFFF', 0.05, 0.9, u),
      mTree: new THREE.MeshStandardMaterial({color: dark ? '#0E1410' : '#2E3A26', roughness: 0.95, flatShading: true}),
      reeds: scatter(seed * 101, Math.round(5200 * dense), area, {clump: 60, lane, laneZ, holes}), reedC,
      tufts: scatter(seed * 37, Math.round(1500 * dense), [area[0] - 10, area[1] + 10, area[2] - 30, area[3] + 2], {clump: 70, lane: lane * 0.8, laneZ, holes}), tuftC,
      trees: far ? scatter(seed * 53, 150, [-260, 260, -330, -150], {clump: 16}) : [],
    };
  }, [seed, lane, dense, dark, JSON.stringify(holes), JSON.stringify(area)]);
  u.uT.value = t;
  return (
    <>
      <Instanced geo={res.reed} mat={res.mReed} items={res.reeds} sy={[1.3, 2.4]} colors={res.reedC} />
      <Instanced geo={res.tuft} mat={res.mTuft} items={res.tufts} sy={[0.5, 1.0]} sxz={1.3} colors={res.tuftC} />
      {far ? <Instanced geo={res.tree} mat={res.mTree} items={res.trees} sy={[1.6, 3.2]} sxz={2.2} /> : null}
    </>
  );
};

/** bruma baja sobre el agua: planos grandes y transparentes */
export const Mist: React.FC<{t: number; color: string; k?: number; z?: number}> = ({t, color, k = 1, z = -60}) => {
  const tex = softTex();
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[(i - 1.5) * 70 + Math.sin(t * 0.05 + i) * 6, 3 + i * 0.6, z - i * 30]} renderOrder={5}>
          <planeGeometry args={[140, 14]} />
          <meshBasicMaterial map={tex} color={color} transparent opacity={0.22 * k} depthWrite={false} fog={false} />
        </mesh>
      ))}
    </>
  );
};

/** garzas blancas cruzando el cielo: cuerpo y dos alas que aletean */
export const Egrets: React.FC<{t: number; n?: number; from?: V3; dir?: V3; k?: number}> = ({t, n = 5, from = [-40, 14, -70], dir = [1, 0.03, 0.15], k = 1}) => {
  const res = useMemo(() => {
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.25, 0, 0, 0.25, 1.1, 0, 0.05], 3));
    wing.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({color: '#F4F1EA', side: THREE.DoubleSide, transparent: true, opacity: 0.95});
    return {wing, mat};
  }, []);
  if (k <= 0.01) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const tt = t + rnd(i * 3.3) * 5;
        const p: V3 = [from[0] + dir[0] * tt * 3.2 + (i % 3) * 2.2, from[1] + dir[1] * tt * 3.2 + Math.sin(tt * 0.7 + i) * 0.4 + (i % 2) * 1.3, from[2] + dir[2] * tt * 3.2 - i * 1.6];
        const flap = Math.sin(tt * 7 + i * 1.7) * 0.75;
        const yaw = Math.atan2(dir[0], dir[2]) - Math.PI / 2;
        return (
          <group key={i} position={p} rotation={[0, yaw, 0]} scale={0.55}>
            <mesh geometry={res.wing} material={res.mat} rotation={[flap, 0, 0]} />
            <mesh geometry={res.wing} material={res.mat} rotation={[-flap, Math.PI, 0]} />
            <mesh position={[0, -0.02, 0]} material={res.mat}>
              <boxGeometry args={[0.18, 0.12, 0.9]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

/** ondas en el agua (anillos que se abren y se apagan) */
export const Ripples: React.FC<{t: number; spots: {x: number; z: number; t0: number; s?: number}[]; color?: string}> = ({t, spots, color = '#FFFFFF'}) => {
  const geo = useMemo(() => new THREE.RingGeometry(0.92, 1, 40), []);
  return (
    <>
      {spots.map((s, i) => {
        const a = t - s.t0;
        if (a < 0 || a > 2.2) return null;
        const r = (0.15 + a * 0.9) * (s.s ?? 1);
        return (
          <mesh key={i} geometry={geo} position={[s.x, 0.02, s.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[r, r, 1]} renderOrder={2}>
            <meshBasicMaterial color={color} transparent opacity={0.35 * (1 - a / 2.2)} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ caballo y jinete */
export type Clip = 'Walk' | 'Gallop' | 'Idle' | 'Idle_Headlow' | 'Eating';
export type RiderKind = 'maestra' | 'baqueana' | 'policia' | 'none';
const RIDER_COLORS: Record<Exclude<RiderKind, 'none'>, {coat: string; legs: string; skin: string; hair: string; hat?: string; cap?: boolean}> = {
  maestra: {coat: '#3A3F46', legs: '#2A2F3A', skin: '#B88A6A', hair: '#1C1612'},
  baqueana: {coat: '#5A3B2A', legs: '#2E2A26', skin: '#A67B5B', hair: '#16110E', hat: '#2A221C'},
  policia: {coat: '#1E2B45', legs: '#18223A', skin: '#A88062', hair: '#14100D', cap: true},
};
/** jinete propio: figura simple de cápsulas unidas punto a punto (metros; origen = asiento sobre el lomo, +z hacia la
    cabeza del caballo), sentada, con las piernas abrazando los flancos y las manos hacia las riendas */
const buildRider = (kind: Exclude<RiderKind, 'none'>) => {
  const c = RIDER_COLORS[kind];
  const g = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const m = (col: string) => (mats[col] ??= new THREE.MeshStandardMaterial({color: col, roughness: 0.85, flatShading: true}));
  const up = new THREE.Vector3(0, 1, 0);
  /** cápsula de radio r entre dos puntos */
  const limb = (a: V3, b: V3, r: number, col: string) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const d = vb.clone().sub(va);
    const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(d.length() - r * 0.5, 0.01), 3, 8), m(col));
    me.position.copy(va.clone().add(vb).multiplyScalar(0.5));
    me.quaternion.setFromUnitVectors(up, d.normalize());
    g.add(me);
  };
  const box = (size: V3, p: V3, col: string, rot: V3 = [0, 0, 0]) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(...size), m(col));
    me.position.set(...p);
    me.rotation.set(...rot);
    g.add(me);
  };
  const ball = (r: number, p: V3, col: string, part?: [number, number]) => {
    const me = new THREE.Mesh(part ? new THREE.SphereGeometry(r, 12, 9, 0, Math.PI * 2, part[0], part[1]) : new THREE.SphereGeometry(r, 12, 9), m(col));
    me.position.set(...p);
    g.add(me);
    return me;
  };
  // apero: pellón y sudadera que caen por los flancos
  box([0.4, 0.06, 0.55], [0, -0.02, 0.02], kind === 'policia' ? '#2B2420' : '#6F5E4A');
  for (const sx of [-1, 1]) box([0.025, 0.26, 0.42], [sx * 0.23, -0.13, 0.02], kind === 'baqueana' ? '#5A2A1E' : kind === 'policia' ? '#151B2C' : '#2A2622', [0, 0, sx * 0.32]);
  // cadera y tronco (apenas inclinado hacia adelante)
  limb([0, 0.1, -0.03], [0, 0.56, 0.05], 0.155, c.coat);
  // cabeza, pelo
  ball(0.102, [0, 0.8, 0.07], c.skin);
  const hair = ball(0.11, [0, 0.815, 0.05], c.hair, [0, Math.PI * 0.6]);
  hair.rotation.set(-0.45, 0, 0);
  if (kind === 'maestra') ball(0.055, [0, 0.79, -0.06], c.hair);
  if (c.hat) {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.014, 18), m(c.hat));
    brim.position.set(0, 0.89, 0.06);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.11, 14), m(c.hat));
    crown.position.set(0, 0.95, 0.06);
    g.add(brim, crown);
  }
  if (c.cap) {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.112, 0.08, 14), m('#16203A'));
    crown.position.set(0, 0.89, 0.07);
    g.add(crown);
    box([0.15, 0.012, 0.09], [0, 0.86, 0.17], '#0E1426');
  }
  for (const sx of [-1, 1]) {
    // brazos: hombro, codo, mano en las riendas
    limb([sx * 0.18, 0.52, 0.03], [sx * 0.2, 0.32, 0.17], 0.045, c.coat);
    limb([sx * 0.2, 0.32, 0.17], [sx * 0.09, 0.27, 0.4], 0.038, c.coat);
    ball(0.035, [sx * 0.08, 0.26, 0.42], c.skin);
    // piernas: el muslo va hacia adelante y afuera, la pierna baja pegada al flanco hasta el estribo
    limb([sx * 0.12, 0.06, 0.0], [sx * 0.33, -0.1, 0.27], 0.066, c.legs);
    limb([sx * 0.33, -0.1, 0.27], [sx * 0.37, -0.52, 0.2], 0.05, c.legs);
    box([0.08, 0.07, 0.2], [sx * 0.37, -0.56, 0.25], '#1A1512');
  }
  return g;
};

const HORSE_TINT: Record<string, Record<string, string>> = {
  bay: {Main: '#4A2A17', Main_Dark: '#2C190E', Main_Light: '#5E3820', Hooves: '#2A2420', Hair: '#100C0A', Muzzle: '#1E140E', Eye_White: '#2C190E', Eye_Black: '#050404'},
  gray: {Main: '#8C8A86', Main_Dark: '#5E5C58', Main_Light: '#A7A49E', Hooves: '#2A2622', Hair: '#3A3836', Muzzle: '#2A2826', Eye_White: '#5E5C58', Eye_Black: '#050404'},
  black: {Main: '#1C1816', Main_Dark: '#110E0D', Main_Light: '#2A2420', Hooves: '#1A1614', Hair: '#0A0808', Muzzle: '#0E0C0B', Eye_White: '#110E0D', Eye_Black: '#050404'},
  chestnut: {Main: '#7A4422', Main_Dark: '#4E2B16', Main_Light: '#93552C', Hooves: '#2E2620', Hair: '#3A1E10', Muzzle: '#2A1A10', Eye_White: '#4E2B16', Eye_Black: '#050404'},
};
type HorseInst = {root: THREE.Group; mixer: THREE.AnimationMixer; actions: Record<string, THREE.AnimationAction>; torso: THREE.Object3D; rider: THREE.Group | null};
const makeHorse = (coat: keyof typeof HORSE_TINT, rider: RiderKind): HorseInst => {
  if (!HORSE) throw new Error('el caballo no terminó de cargar');
  const root = SkeletonUtils.clone(HORSE.scene) as THREE.Group;
  const tint = HORSE_TINT[coat];
  root.traverse((o) => {
    const me = o as THREE.Mesh;
    if (me.isMesh) {
      me.frustumCulled = false;
      const src = me.material as THREE.MeshStandardMaterial;
      const mm = src.clone();
      mm.roughness = 0.78;
      mm.metalness = 0;
      if (tint[src.name]) mm.color.set(tint[src.name]);
      me.material = mm;
    }
  });
  const mixer = new THREE.AnimationMixer(root);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const c of HORSE.clips) {
    const a = mixer.clipAction(c);
    a.play();
    a.enabled = false;
    actions[c.name] = a;
  }
  const torso = root.getObjectByName('Torso')!;
  const r = rider === 'none' ? null : buildRider(rider);
  return {root, mixer, actions, torso, rider: r};
};
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _m = new THREE.Matrix4();
/** dónde se sienta el jinete respecto del hueso "Torso" (unidades del modelo: el caballo mide 4,8 de alto) */
export const RIDER_OFS: V3 = [0, -0.1, 0.75];
/** caballo (paso, galope o quieto) con su jinete; mirror dibuja el reflejo invertido bajo el agua */
export const Horse: React.FC<{
  t: number; pos: V3; yaw: number; clips: {name: Clip; w: number; ts?: number; t0?: number}[]; coat?: keyof typeof HORSE_TINT; rider?: RiderKind; scale?: number; mirror?: boolean; riderLean?: number;
}> = ({t, pos, yaw, clips, coat = 'bay', rider = 'maestra', scale = 0.5, mirror = true, riderLean = 0}) => {
  const a = useMemo(() => makeHorse(coat, rider), [coat, rider]);
  const b = useMemo(() => (mirror ? makeHorse(coat, rider) : null), [coat, rider, mirror]);
  for (const inst of [a, b]) {
    if (!inst) continue;
    for (const name in inst.actions) inst.actions[name].enabled = false;
    for (const c of clips) {
      const act = inst.actions[c.name];
      if (!act || c.w <= 0.001) continue;
      act.enabled = true;
      act.setEffectiveWeight(c.w);
      act.time = ((t - (c.t0 ?? 0)) * (c.ts ?? 1)) % act.getClip().duration;
      if (act.time < 0) act.time += act.getClip().duration;
    }
    inst.mixer.update(0);
    inst.root.position.set(0, 0, 0);
    inst.root.rotation.set(0, 0, 0);
    inst.root.scale.setScalar(1);
    inst.root.updateMatrixWorld(true);
    if (inst.rider) {
      // el jinete sigue al lomo: posición del hueso "Torso" relativa a la raíz del caballo (sin las transformaciones de
      // los grupos de afuera), un poco hacia atrás y arriba; se balancea con el paso
      _m.copy(inst.root.matrixWorld).invert().multiply(inst.torso.matrixWorld);
      _m.decompose(_v, _q, _s);
      const ph = (t / WALK_CYCLE) * Math.PI * 2;
      inst.rider.position.set(_v.x + RIDER_OFS[0], _v.y + RIDER_OFS[1], _v.z + RIDER_OFS[2]);
      inst.rider.rotation.set(riderLean + Math.sin(ph) * 0.035, 0, Math.sin(ph * 0.5) * 0.025);
      inst.rider.scale.setScalar(1 / 0.5);
    }
  }
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <group scale={scale}>
        <primitive object={a.root} />
        {a.rider ? <primitive object={a.rider} /> : null}
      </group>
      {b ? (
        <group scale={[scale, -scale, scale]}>
          <primitive object={b.root} />
          {b.rider ? <primitive object={b.rider} /> : null}
        </group>
      ) : null}
    </group>
  );
};
/** ciclo de paso (s) a escala 1: para sincronizar las ondas con las patas */
export const WALK_CYCLE = 1.1666667;

/* ------------------------------------------------------------------ la escuela */
/** escuela rural: edificio encalado de una planta con galería, techo de chapa a dos aguas, mástil con la bandera,
    tanque de agua y alambrado. night = ventana encendida */
export const School: React.FC<{t: number; pos?: V3; yaw?: number; night?: number; wind?: number; flagUp?: number}> = ({t, pos = [0, 0, 0], yaw = 0, night = 0, wind = 1, flagUp = 1}) => {
  const res = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({map: wallTex('wallOut', '#E4DCCB', '90,80,60'), roughness: 0.92});
    const tin = new THREE.MeshStandardMaterial({map: tinTex(), roughness: 0.55, metalness: 0.45, side: THREE.DoubleSide});
    const wood = new THREE.MeshStandardMaterial({color: '#4A3526', roughness: 0.85});
    const dark = new THREE.MeshStandardMaterial({color: '#1A1C20', roughness: 0.6});
    const metal = new THREE.MeshStandardMaterial({color: '#8C9196', roughness: 0.5, metalness: 0.6});
    const flagGeo = new THREE.PlaneGeometry(1.5, 0.94, 24, 10);
    flagGeo.translate(0.75, 0, 0);
    const flagMat = new THREE.MeshStandardMaterial({map: flagTex(), side: THREE.DoubleSide, roughness: 0.9});
    const winMat = new THREE.MeshStandardMaterial({color: '#1B2230', emissive: new THREE.Color('#FFB866'), emissiveIntensity: 0, roughness: 0.4});
    return {wall, tin, wood, dark, metal, flagGeo, flagMat, winMat, flagBase: (flagGeo.attributes.position.array as Float32Array).slice()};
  }, []);
  // la bandera flamea: ondas que corren desde el mástil
  const fp = res.flagGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < fp.count; i++) {
    const x = res.flagBase[i * 3], y = res.flagBase[i * 3 + 1];
    const k = x / 1.5;
    fp.setZ(i, Math.sin(x * 4.2 - t * 6.5 * wind + y * 0.8) * 0.12 * k * wind + Math.sin(x * 9 - t * 9) * 0.025 * k);
    fp.setY(i, y - k * k * 0.08);
  }
  fp.needsUpdate = true;
  res.flagGeo.computeVertexNormals();
  res.winMat.emissiveIntensity = night * 2.2;
  const W = 8, D = 5.2, H = 3;
  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      {/* plataforma de tierra apenas sobre el agua */}
      <mesh position={[0, 0.06, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 36]} />
        <meshStandardMaterial color="#5E5A3A" roughness={1} />
      </mesh>
      <mesh position={[0, 0.07, 3.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 6]} />
        <meshStandardMaterial color="#6E6248" roughness={1} />
      </mesh>
      <mesh position={[0, H / 2, 0]} material={res.wall}>
        <boxGeometry args={[W, H, D]} />
      </mesh>
      {/* techo a dos aguas */}
      <mesh position={[0, H + 0.55, D / 4 + 0.15]} rotation={[0.4, 0, 0]} material={res.tin}>
        <boxGeometry args={[W + 0.8, 0.05, D / 2 + 0.95]} />
      </mesh>
      <mesh position={[0, H + 0.55, -D / 4 - 0.15]} rotation={[-0.4, 0, 0]} material={res.tin}>
        <boxGeometry args={[W + 0.8, 0.05, D / 2 + 0.95]} />
      </mesh>
      {/* hastiales */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2), H, 0]} rotation={[0, s * Math.PI / 2, 0]} material={res.wall}>
          <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, 1.05)])]} />
        </mesh>
      ))}
      {/* galería: techo de chapa sobre postes de madera */}
      <mesh position={[0, 2.55, D / 2 + 1.1]} rotation={[0.12, 0, 0]} material={res.tin}>
        <boxGeometry args={[W - 0.6, 0.04, 2.3]} />
      </mesh>
      {[-3.4, -1.15, 1.15, 3.4].map((x) => (
        <mesh key={x} position={[x, 1.25, D / 2 + 2.1]} material={res.wood}>
          <boxGeometry args={[0.14, 2.5, 0.14]} />
        </mesh>
      ))}
      {/* puerta y ventanas */}
      <mesh position={[0, 1.05, D / 2 + 0.01]} material={res.wood}>
        <planeGeometry args={[1.1, 2.1]} />
      </mesh>
      {[-2.6, 2.6].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.55, D / 2 + 0.01]} material={res.winMat}>
            <planeGeometry args={[1.3, 1.1]} />
          </mesh>
          <mesh position={[x, 1.55, D / 2 + 0.02]} material={res.wood}>
            <planeGeometry args={[0.07, 1.1]} />
          </mesh>
        </group>
      ))}
      {night > 0.01 ? <pointLight position={[-2.6, 1.6, D / 2 + 1.2]} intensity={night * 6} distance={9} decay={1.4} color="#FFB45C" /> : null}
      {/* zócalo oscuro */}
      <mesh position={[0, 0.25, D / 2 + 0.005]} material={res.dark}>
        <planeGeometry args={[W, 0.5]} />
      </mesh>
      {/* mástil y bandera */}
      <mesh position={[-5.6, 3.5, D / 2 + 3.2]} material={res.metal}>
        <cylinderGeometry args={[0.04, 0.06, 7, 8]} />
      </mesh>
      <mesh geometry={res.flagGeo} material={res.flagMat} position={[-5.58, mix(1.2, 6.45, flagUp), D / 2 + 3.2]} />
      {/* tanque de agua sobre torre */}
      <group position={[5.8, 0, -2.4]}>
        {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, 2.2, z]} material={res.metal}>
            <boxGeometry args={[0.08, 4.4, 0.08]} />
          </mesh>
        ))}
        <mesh position={[0, 5, 0]} material={res.metal}>
          <cylinderGeometry args={[0.95, 0.95, 1.3, 16]} />
        </mesh>
      </group>
      {/* alambrado */}
      {Array.from({length: 13}, (_, i) => (
        <mesh key={i} position={[-9 + i * 1.5, 0.6, D / 2 + 6.4]} material={res.wood}>
          <boxGeometry args={[0.08, 1.2, 0.08]} />
        </mesh>
      ))}
      {[0.45, 0.85].map((y) => (
        <mesh key={y} position={[0, y, D / 2 + 6.4]} material={res.metal}>
          <boxGeometry args={[18, 0.01, 0.01]} />
        </mesh>
      ))}
      {/* paraísos junto a la escuela */}
      {[[-7.5, -2.5, 1.2], [7.8, 1.8, 0.9], [-9, 2.5, 1]].map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 1.4, 0]} material={res.wood}>
            <cylinderGeometry args={[0.15, 0.22, 2.8, 6]} />
          </mesh>
          <mesh position={[0, 3.6, 0]}>
            <icosahedronGeometry args={[2.1, 0]} />
            <meshStandardMaterial color="#34452A" roughness={0.95} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ el aula */
/** aula vacía: paredes descascaradas, pizarrón, ocho bancos, un rayo de luz con polvo. ghost = los bancos se desvanecen */
export const Classroom: React.FC<{t: number; ghost?: number; dust?: number}> = ({t, ghost = 0, dust = 1}) => {
  const res = useMemo(() => {
    const wall = new THREE.MeshStandardMaterial({map: wallTex('wallIn', '#BFB59C', '70,60,45'), roughness: 0.95, side: THREE.BackSide});
    const floor = new THREE.MeshStandardMaterial({color: '#5B5146', roughness: 0.95});
    const desk = new THREE.MeshStandardMaterial({color: '#6E5038', roughness: 0.8, transparent: true});
    const iron = new THREE.MeshStandardMaterial({color: '#2D2F33', roughness: 0.6, metalness: 0.5, transparent: true});
    const board = new THREE.MeshStandardMaterial({map: boardTex(), roughness: 0.9});
    const motes = new THREE.BufferGeometry();
    const n = 260, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(rnd(i * 2.1) - 0.5) * 5, rnd(i * 3.7) * 2.8, (rnd(i * 5.3) - 0.5) * 4], i * 3);
    motes.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return {wall, floor, desk, iron, board, motes, base: p.slice()};
  }, []);
  const k = 1 - ghost * 0.85;
  res.desk.opacity = k;
  res.iron.opacity = k;
  res.desk.emissive = new THREE.Color('#A8C4E0');
  res.desk.emissiveIntensity = ghost * (0.25 + 0.15 * Math.sin(t * 3));
  const mp = res.motes.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < mp.count; i++) {
    mp.setY(i, (res.base[i * 3 + 1] + t * 0.05 + Math.sin(t * 0.7 + i) * 0.05) % 2.8);
    mp.setX(i, res.base[i * 3] + Math.sin(t * 0.3 + i * 1.3) * 0.08);
  }
  mp.needsUpdate = true;
  return (
    <group>
      <mesh position={[0, 1.5, 0]} material={res.wall}>
        <boxGeometry args={[7, 3, 6]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={res.floor}>
        <planeGeometry args={[7, 6]} />
      </mesh>
      <mesh position={[0, 1.6, -2.98]} material={res.board}>
        <planeGeometry args={[3.2, 1.3]} />
      </mesh>
      {/* ocho bancos en dos filas */}
      {Array.from({length: 8}, (_, i) => {
        const x = -2.25 + (i % 4) * 1.5, z = -0.9 + Math.floor(i / 4) * 1.6;
        const tilt = rnd(i * 7.3) * 0.08 - 0.04;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, tilt, 0]}>
            <mesh position={[0, 0.72, 0]} material={res.desk}>
              <boxGeometry args={[0.95, 0.04, 0.5]} />
            </mesh>
            <mesh position={[0, 0.42, 0.42]} material={res.desk}>
              <boxGeometry args={[0.9, 0.04, 0.3]} />
            </mesh>
            {[[-0.42, -0.2], [0.42, -0.2], [-0.42, 0.2], [0.42, 0.2]].map(([dx, dz], j) => (
              <mesh key={j} position={[dx, 0.36, dz]} material={res.iron}>
                <boxGeometry args={[0.03, 0.72, 0.03]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* rayo de luz por la ventana y el polvo flotando */}
      <mesh position={[2.2, 1.5, 0.4]} rotation={[0, -0.5, 0.55]}>
        <planeGeometry args={[1.4, 5]} />
        <meshBasicMaterial map={softTex()} color="#FFE1B0" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <points geometry={res.motes}>
        <pointsMaterial size={0.012} map={softTex()} color="#FFE9C8" transparent opacity={0.6 * dust} depthWrite={false} />
      </points>
      <pointLight position={[2.6, 2.4, 1]} intensity={4} distance={9} color="#FFD9A8" decay={1.5} />
    </group>
  );
};

/* ------------------------------------------------------------------ lluvia y rayos */
/** lluvia: segmentos que caen en un volumen alrededor de la cámara (determinístico) */
export const Rain: React.FC<{t: number; center: V3; k?: number; n?: number}> = ({t, center, k = 1, n = 2400}) => {
  const res = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 6);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return {g, seeds: Array.from({length: n}, (_, i) => [rnd(i * 1.3), rnd(i * 2.9), rnd(i * 4.1), rnd(i * 6.7)])};
  }, [n]);
  const p = res.g.attributes.position as THREE.BufferAttribute;
  const H = 16, sp = 14;
  res.seeds.forEach(([a, b, c, d], i) => {
    const x = center[0] + (a - 0.5) * 30, z = center[2] + (b - 0.5) * 30 - 6;
    const y = ((c * H - t * sp * (0.9 + d * 0.2)) % H + H) % H;
    p.setXYZ(i * 2, x + 0.08, y + 0.6, z);
    p.setXYZ(i * 2 + 1, x, y, z);
  });
  p.needsUpdate = true;
  if (k <= 0.01) return null;
  return (
    <lineSegments geometry={res.g} frustumCulled={false}>
      <lineBasicMaterial color="#C2D3E3" transparent opacity={0.5 * k} depthWrite={false} fog={false} />
    </lineSegments>
  );
};
/** relámpago lejano: un trazo quebrado que se enciende un instante */
export const Bolt: React.FC<{k: number; seed?: number; pos?: V3}> = ({k, seed = 3, pos = [30, 0, -220]}) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    let x = 0, y = 120;
    while (y > 0) {
      const nx = x + (rnd(seed + y) - 0.5) * 14, ny = y - 6 - rnd(seed * 3 + y) * 10;
      pts.push(x, y, 0, nx, Math.max(ny, 0), 0);
      x = nx;
      y = ny;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [seed]);
  if (k <= 0.01) return null;
  return (
    <lineSegments geometry={geo} position={pos} frustumCulled={false}>
      <lineBasicMaterial color="#EAF2FF" transparent opacity={k} fog={false} />
    </lineSegments>
  );
};
/** intensidad del relámpago: destellos dobles en los instantes dados */
export const flashAt = (t: number, hits: number[]) =>
  hits.reduce((m, h) => {
    const a = t - h;
    if (a < 0 || a > 0.6) return m;
    return Math.max(m, Math.exp(-a * 14) + (a > 0.12 ? Math.exp(-(a - 0.12) * 18) * 0.7 : 0));
  }, 0);
export {clamp};
