/* Kit 3D del episodio 10 (El cuadro del nazi): el living con el sillón de terciopelo verde y el retrato
   (que después se cambia por un tapiz de caballos), el chalet de Mar del Plata de noche, la cubierta del barco
   de 1940 con la escotilla, el cuaderno negro, la galería con 1.113 cuadros, el botín y el campo de 600 marcos. */
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, rnd} from '../lib/anim';
import type {V3} from '../ep06/three6';

export {Stage, ShadowFloor, camPath, lerpCam, project, Globe3D, globeRot, globePoint} from '../ep06/three6';
export type {Cam, V3, Route} from '../ep06/three6';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ------------------------------------------------------------------ texturas de imagen */
const IMG_TEX: Record<string, THREE.Texture> = {};
const IMGS = ['ep10/img/cuadro.jpg', 'ep10/img/mignon.png'];
if (typeof document !== 'undefined' && !(window as any).__ep10tex) {
  (window as any).__ep10tex = true;
  const h = delayRender('texturas 3D ep10', {timeoutInMilliseconds: 120000});
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
const R = (seed: number) => {
  let s = seed * 97 + 13;
  return () => rnd(s++);
};

/** empapelado: rayas finas y medallones apagados */
const wallpaperTex = () =>
  canvasTex('wall10', 512, 512, (g) => {
    g.fillStyle = '#6F6A55';
    g.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = 'rgba(40,36,25,0.18)';
      g.fillRect(x, 0, 6, 512);
      g.fillStyle = 'rgba(255,240,200,0.06)';
      g.fillRect(x + 30, 0, 3, 512);
    }
    g.strokeStyle = 'rgba(230,214,170,0.12)';
    g.lineWidth = 3;
    for (let y = 64; y < 512; y += 128)
      for (let x = 32; x < 512; x += 64) {
        g.beginPath();
        g.ellipse(x, y + ((x / 64) % 2) * 64, 14, 22, 0, 0, Math.PI * 2);
        g.stroke();
      }
    const r = R(3);
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = `rgba(0,0,0,${r() * 0.05})`;
      g.fillRect(r() * 512, r() * 512, 2, 2);
    }
  }, [3, 1.2]);

/** parquet en espina de pez */
const parquetTex = () =>
  canvasTex('parquet10', 1024, 1024, (g) => {
    const r = R(7);
    g.fillStyle = '#5A3A22';
    g.fillRect(0, 0, 1024, 1024);
    const L = 128, Wd = 32;
    for (let y = -L; y < 1024 + L; y += Wd * 2)
      for (let x = -L; x < 1024 + L; x += L) {
        for (const dir of [0, 1]) {
          g.save();
          g.translate(x + dir * Wd * 2, y);
          g.rotate(dir ? -Math.PI / 4 : Math.PI / 4);
          const tone = 70 + r() * 40;
          g.fillStyle = `rgb(${tone + 40},${tone},${tone * 0.6})`;
          g.fillRect(0, 0, L, Wd - 2);
          g.fillStyle = 'rgba(0,0,0,0.12)';
          for (let k = 0; k < 6; k++) g.fillRect(0, r() * Wd, L, 1);
          g.restore();
        }
      }
  }, [3, 3]);

/** alfombra persa simplificada */
const rugTex = () =>
  canvasTex('rug10', 1024, 640, (g) => {
    g.fillStyle = '#5E1E1A';
    g.fillRect(0, 0, 1024, 640);
    g.strokeStyle = '#C9A36A';
    g.lineWidth = 14;
    g.strokeRect(30, 30, 964, 580);
    g.strokeStyle = '#1F2B3A';
    g.lineWidth = 26;
    g.strokeRect(64, 64, 896, 512);
    g.fillStyle = '#B98A4E';
    g.beginPath();
    g.ellipse(512, 320, 210, 140, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#5E1E1A';
    g.beginPath();
    g.ellipse(512, 320, 150, 95, 0, 0, Math.PI * 2);
    g.fill();
    const r = R(11);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = ['#C9A36A', '#1F2B3A', '#8C3A2B', '#E2D2A8'][Math.floor(r() * 4)];
      g.globalAlpha = 0.5;
      g.fillRect(100 + r() * 824, 100 + r() * 440, 10, 10);
    }
    g.globalAlpha = 1;
  });

/** tapiz de caballos (silueta de jinetes sobre fondo de verdes y ocres) */
const tapestryTex = () =>
  canvasTex('tapiz10', 1024, 760, (g) => {
    const grd = g.createLinearGradient(0, 0, 0, 760);
    grd.addColorStop(0, '#8E9A6E');
    grd.addColorStop(0.55, '#6E7A4E');
    grd.addColorStop(1, '#4C5232');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 760);
    // árboles
    const rt = R(61);
    g.fillStyle = '#B9B98C';
    g.fillRect(0, 0, 1024, 250);
    for (let i = 0; i < 14; i++) {
      const x = 40 + i * 75 + rt() * 30, y = 230 + rt() * 70;
      g.fillStyle = '#4A3A22';
      g.fillRect(x - 6, y, 12, 120);
      for (let k = 0; k < 5; k++) {
        g.fillStyle = `rgba(${45 + rt() * 30},${70 + rt() * 30},${36 + rt() * 15},0.9)`;
        g.beginPath();
        g.arc(x + (rt() - 0.5) * 60, y - 20 + (rt() - 0.5) * 60, 30 + rt() * 26, 0, Math.PI * 2);
        g.fill();
      }
    }
    // flores del primer plano
    for (let i = 0; i < 70; i++) {
      g.fillStyle = ['#B8452E', '#D9C27A', '#E6DCC0', '#7A3A5A'][Math.floor(rt() * 4)];
      g.beginPath();
      g.arc(50 + rt() * 924, 640 + rt() * 70, 4 + rt() * 5, 0, Math.PI * 2);
      g.fill();
    }
    // caballos: silueta de perfil (mirando a la derecha) en una caja de 200 × 150
    const HP = [[20,50],[60,44],[128,40],[146,22],[160,6],[164,0],[168,6],[176,10],[194,34],[190,43],[172,40],[160,47],[156,70],[154,100],[152,140],[158,146],[144,147],[142,104],[136,84],[100,88],[70,86],[62,98],[64,140],[69,146],[55,147],[50,110],[40,92],[30,76],[22,64],[12,100],[6,112],[14,109],[26,72]];
    const horse = (x: number, y: number, s: number, c: string, dir: 1 | -1, rider = false) => {
      g.save();
      g.translate(x, y);
      g.scale(s * dir, s);
      g.translate(-100, -75);
      g.fillStyle = c;
      g.beginPath();
      HP.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.closePath();
      g.fill();
      // patas del otro lado, un poco más oscuras
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(132, 92, 9, 52);
      g.fillRect(72, 92, 9, 52);
      // crin
      g.strokeStyle = 'rgba(20,12,6,0.8)';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(130, 40);
      g.quadraticCurveTo(150, 18, 162, 4);
      g.stroke();
      if (rider) {
        g.fillStyle = '#5A1E1A';
        g.beginPath();
        g.moveTo(88, 44); g.lineTo(112, 44); g.lineTo(108, 6); g.lineTo(92, 6); g.closePath(); g.fill();
        g.beginPath(); g.arc(100, -6, 11, 0, Math.PI * 2); g.fillStyle = '#C9A27A'; g.fill();
        g.fillStyle = '#2A1A10'; g.fillRect(86, -20, 28, 8);
        g.fillStyle = '#5A1E1A'; g.fillRect(96, 44, 9, 34);
      }
      g.restore();
    };
    horse(280, 520, 1.55, '#3E2A1C', 1, true);
    horse(640, 575, 1.4, '#C9B48A', -1);
    horse(840, 470, 1.05, '#5B3A24', 1, true);
    // borde tejido
    g.strokeStyle = '#7A2E22';
    g.lineWidth = 34;
    g.strokeRect(17, 17, 990, 726);
    g.strokeStyle = '#D2B97E';
    g.lineWidth = 8;
    g.strokeRect(42, 42, 940, 676);
    // trama
    for (let y = 0; y < 760; y += 3) {
      g.fillStyle = 'rgba(0,0,0,0.07)';
      g.fillRect(0, y, 1024, 1);
    }
    for (let x = 0; x < 1024; x += 4) {
      g.fillStyle = 'rgba(255,255,255,0.04)';
      g.fillRect(x, 0, 1, 760);
    }
  });

/** piedra "Mar del Plata": lajas irregulares beige y marrón */
const stoneTex = () =>
  canvasTex('stone10', 1024, 512, (g) => {
    const r = R(21);
    g.fillStyle = '#4A4036';
    g.fillRect(0, 0, 1024, 512);
    let y = 0;
    while (y < 512) {
      const h = 34 + r() * 30;
      let x = -r() * 60;
      while (x < 1024) {
        const w = 50 + r() * 90;
        const tone = 150 + r() * 60;
        g.fillStyle = `rgb(${tone},${tone * 0.86},${tone * 0.68})`;
        g.beginPath();
        g.moveTo(x + 4 + r() * 6, y + 4);
        g.lineTo(x + w - 4, y + 3 + r() * 6);
        g.lineTo(x + w - 3 - r() * 6, y + h - 4);
        g.lineTo(x + 3, y + h - 3 - r() * 5);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(0,0,0,0.1)';
        g.fillRect(x + 6, y + h - 12, w - 12, 6);
        x += w;
      }
      y += h;
    }
  }, [2, 1]);

/** tejas francesas rojas */
const tileTex = () =>
  canvasTex('tile10', 512, 512, (g) => {
    const r = R(31);
    g.fillStyle = '#6E2E1E';
    g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 32)
      for (let x = 0; x < 512; x += 48) {
        const tone = 120 + r() * 50;
        g.fillStyle = `rgb(${tone + 40},${tone * 0.45},${tone * 0.3})`;
        g.fillRect(x + ((y / 32) % 2) * 24, y, 44, 28);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.fillRect(x + ((y / 32) % 2) * 24, y + 24, 44, 4);
      }
  }, [3, 2]);

const signTex = () =>
  canvasTex('sevende10', 512, 300, (g) => {
    g.fillStyle = '#F4F0E6';
    g.fillRect(0, 0, 512, 300);
    g.fillStyle = '#C8312C';
    g.fillRect(0, 0, 512, 70);
    g.fillRect(0, 250, 512, 50);
    g.fillStyle = '#1C1611';
    g.font = 'bold 118px Anton, Impact, sans-serif';
    g.textAlign = 'center';
    g.fillText('SE VENDE', 256, 205);
  });

/** tablones de la cubierta */
const deckTex = () =>
  canvasTex('deck10', 512, 1024, (g) => {
    const r = R(41);
    g.fillStyle = '#3B2E22';
    g.fillRect(0, 0, 512, 1024);
    for (let x = 0; x < 512; x += 42) {
      const tone = 60 + r() * 25;
      g.fillStyle = `rgb(${tone + 20},${tone + 6},${tone - 10})`;
      g.fillRect(x, 0, 38, 1024);
      g.fillStyle = 'rgba(0,0,0,0.6)';
      g.fillRect(x + 38, 0, 4, 1024);
      for (let y = r() * 300; y < 1024; y += 300 + r() * 200) g.fillRect(x, y, 38, 3);
    }
  }, [2, 8]);

/** página del cuaderno: renglones, números y escritura ilegible a mano */
const pageTex = (side: number, red: boolean) =>
  canvasTex(`page10-${side}-${red}`, 700, 1000, (g) => {
    const r = R(51 + side);
    g.fillStyle = '#E9DFC7';
    g.fillRect(0, 0, 700, 1000);
    const grd = g.createLinearGradient(side ? 0 : 700, 0, side ? 120 : 580, 0);
    grd.addColorStop(0, 'rgba(90,70,40,0.35)');
    grd.addColorStop(1, 'rgba(90,70,40,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 700, 1000);
    g.strokeStyle = 'rgba(110,130,160,0.4)';
    g.lineWidth = 2;
    for (let y = 90; y < 980; y += 44) {
      g.beginPath();
      g.moveTo(40, y);
      g.lineTo(660, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(190,60,50,0.45)';
    g.beginPath();
    g.moveTo(130, 30);
    g.lineTo(130, 990);
    g.stroke();
    let n = 1 + side * 21 + 900;
    for (let y = 84; y < 980; y += 44) {
      g.fillStyle = '#1F2A44';
      g.font = '30px Caveat, cursive';
      g.fillText(String(n++), 60, y - 6);
      // escritura: trazos ondulados con lazos
      g.strokeStyle = 'rgba(25,35,60,0.9)';
      g.lineWidth = 2.4;
      g.beginPath();
      let x = 150;
      const end = 330 + r() * 300;
      g.moveTo(x, y - 12);
      while (x < end) {
        const w = 6 + r() * 7;
        g.quadraticCurveTo(x + w / 2, y - 12 - 10 - r() * 10, x + w, y - 12);
        g.quadraticCurveTo(x + w * 1.4, y - 4, x + w * 1.8, y - 12);
        x += w * 1.8;
        if (r() < 0.12) {
          x += 12;
          g.moveTo(x, y - 12);
        }
      }
      g.stroke();
      if (red && r() < 0.7) {
        g.strokeStyle = 'rgba(200,40,35,0.9)';
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(140, y - 14);
        g.lineTo(end + 10, y - 10);
        g.stroke();
      }
    }
  });

/** pinturas procedurales para la galería: paisajes, retratos, marinas y naturalezas muertas */
const artTex = (i: number) =>
  canvasTex('art10-' + i, 256, 256, (g) => {
    const r = R(100 + i);
    const kind = i % 4;
    const dark = `rgb(${20 + r() * 25},${16 + r() * 20},${10 + r() * 12})`;
    g.fillStyle = dark;
    g.fillRect(0, 0, 256, 256);
    if (kind === 0) {
      const sky = g.createLinearGradient(0, 0, 0, 170);
      sky.addColorStop(0, `rgb(${120 + r() * 60},${130 + r() * 50},${140 + r() * 50})`);
      sky.addColorStop(1, `rgb(${200 + r() * 40},${180 + r() * 40},${130 + r() * 40})`);
      g.fillStyle = sky;
      g.fillRect(0, 0, 256, 170);
      g.fillStyle = `rgb(${50 + r() * 30},${55 + r() * 30},${25 + r() * 20})`;
      g.fillRect(0, 160, 256, 96);
      for (let k = 0; k < 5; k++) {
        g.fillStyle = `rgba(${30 + r() * 30},${40 + r() * 30},${20},0.9)`;
        g.beginPath();
        g.ellipse(r() * 256, 150 + r() * 20, 20 + r() * 30, 30 + r() * 30, 0, 0, Math.PI * 2);
        g.fill();
      }
    } else if (kind === 1) {
      g.fillStyle = `rgb(${200 + r() * 40},${160 + r() * 40},${120 + r() * 30})`;
      g.beginPath();
      g.ellipse(128, 100, 38, 50, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgb(${30 + r() * 90},${20 + r() * 40},${20 + r() * 40})`;
      g.beginPath();
      g.ellipse(128, 250, 100, 100, 0, Math.PI, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(240,230,210,0.8)';
      g.fillRect(108, 148, 40, 12);
    } else if (kind === 2) {
      const sky = g.createLinearGradient(0, 0, 0, 150);
      sky.addColorStop(0, '#6F7D86');
      sky.addColorStop(1, '#C9BDA0');
      g.fillStyle = sky;
      g.fillRect(0, 0, 256, 150);
      g.fillStyle = '#3B4A4E';
      g.fillRect(0, 150, 256, 106);
      g.fillStyle = '#2A2118';
      g.beginPath();
      g.moveTo(80, 160);
      g.lineTo(180, 160);
      g.lineTo(165, 180);
      g.lineTo(95, 180);
      g.fill();
      g.fillRect(125, 70, 4, 92);
      g.fillStyle = '#E6DCC0';
      g.beginPath();
      g.moveTo(130, 75);
      g.lineTo(170, 140);
      g.lineTo(130, 140);
      g.fill();
    } else {
      for (let k = 0; k < 9; k++) {
        g.fillStyle = `rgb(${120 + r() * 130},${40 + r() * 120},${30 + r() * 60})`;
        g.beginPath();
        g.arc(60 + r() * 140, 90 + r() * 110, 10 + r() * 20, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#5B4A33';
      g.fillRect(30, 200, 196, 20);
    }
    // barniz envejecido
    const v = g.createRadialGradient(128, 128, 60, 128, 128, 190);
    v.addColorStop(0, 'rgba(120,90,30,0.0)');
    v.addColorStop(1, 'rgba(40,25,5,0.55)');
    g.fillStyle = v;
    g.fillRect(0, 0, 256, 256);
  });

/** tela negra con un signo de pregunta (el cuadro que falta) */
const unknownTex = () =>
  canvasTex('unknown10', 512, 660, (g) => {
    g.fillStyle = '#100D0A';
    g.fillRect(0, 0, 512, 660);
    g.fillStyle = '#6E5C44';
    g.font = '400px Anton, Impact, sans-serif';
    g.textAlign = 'center';
    g.fillText('?', 256, 470);
  });

/** billete genérico (no es una moneda real) */
const noteTex = () =>
  canvasTex('note10', 512, 256, (g) => {
    g.fillStyle = '#AFC0A4';
    g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#4D6650';
    g.lineWidth = 10;
    g.strokeRect(12, 12, 488, 232);
    g.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
      g.beginPath();
      g.ellipse(256, 128, 40 + i * 6, 20 + i * 3, 0, 0, Math.PI * 2);
      g.globalAlpha = 0.15;
      g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = '#2F4634';
    g.font = 'bold 64px Anton, Impact, sans-serif';
    g.fillText('1000', 30, 90);
    g.fillText('1000', 360, 230);
  });

/* ------------------------------------------------------------------ helpers */
export const M: React.FC<{c: string; r?: number; m?: number; e?: string; ei?: number; o?: number; map?: THREE.Texture | null; side?: THREE.Side; dw?: boolean; tm?: boolean; flat?: boolean}> = ({
  c, r = 0.75, m = 0, e, ei = 0, o, map, side, dw, tm, flat,
}) => (
  <meshStandardMaterial
    color={c} roughness={r} metalness={m} emissive={e ?? '#000'} emissiveIntensity={ei} transparent={o !== undefined} opacity={o ?? 1} map={map ?? null} side={side}
    depthWrite={dw ?? (o === undefined || o > 0.99)} toneMapped={tm ?? true} flatShading={flat}
  />
);
export const Box: React.FC<{p: V3; s: V3; c: string; r?: number; m?: number; rot?: V3; e?: string; ei?: number; o?: number; shadow?: boolean; map?: THREE.Texture | null}> = ({p, s, c, r, m, rot, e, ei, o, shadow = true, map}) => (
  <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <M c={c} r={r} m={m} e={e} ei={ei} o={o} map={map} />
  </mesh>
);
const RBOX: Record<string, THREE.BufferGeometry> = {};
const rbox = (w: number, h: number, d: number, rad: number) => {
  const k = [w, h, d, rad].join('_');
  if (!RBOX[k]) RBOX[k] = new RoundedBoxGeometry(w, h, d, 4, rad);
  return RBOX[k];
};
const Velvet: React.FC<{c?: string}> = ({c = '#2F6B4F'}) => (
  <meshPhysicalMaterial color={c} roughness={0.85} metalness={0} sheen={1} sheenColor="#7FC79E" sheenRoughness={0.45} />
);
const RB: React.FC<{p: V3; s: V3; rad?: number; rot?: V3; children: React.ReactNode}> = ({p, s, rad = 0.06, rot, children}) => (
  <mesh position={p} rotation={rot} geometry={rbox(s[0], s[1], s[2], rad)} castShadow receiveShadow>
    {children}
  </mesh>
);

/** marco dorado (4 listones) con una tela adentro */
export const Frame3D: React.FC<{p: V3; w: number; h: number; map?: THREE.Texture | null; o?: number; b?: number; color?: string; canvasColor?: string; rot?: V3; e?: number}> = ({
  p, w, h, map, o = 1, b = 0.08, color = '#B8913F', canvasColor = '#ffffff', rot, e = 0,
}) => {
  if (o <= 0.005) return null;
  const d = 0.06;
  const mat = <M c={color} r={0.38} m={0.55} e="#6B4A14" ei={0.18} o={o < 1 ? o : undefined} />;
  return (
    <group position={p} rotation={rot}>
      <mesh position={[0, h / 2 + b / 2, d / 2]} castShadow>
        <boxGeometry args={[w + b * 2, b, d]} />
        {mat}
      </mesh>
      <mesh position={[0, -h / 2 - b / 2, d / 2]} castShadow>
        <boxGeometry args={[w + b * 2, b, d]} />
        {mat}
      </mesh>
      <mesh position={[-w / 2 - b / 2, 0, d / 2]} castShadow>
        <boxGeometry args={[b, h, d]} />
        {mat}
      </mesh>
      <mesh position={[w / 2 + b / 2, 0, d / 2]} castShadow>
        <boxGeometry args={[b, h, d]} />
        {mat}
      </mesh>
      <mesh position={[0, 0, 0.012]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={canvasColor} map={map ?? null} roughness={0.85} transparent={o < 1} opacity={o} emissive={map ? '#ffffff' : '#000000'} emissiveMap={map ?? null} emissiveIntensity={map ? e : 0} />
      </mesh>
    </group>
  );
};

/* =====================================================================================
   EL LIVING: pared del fondo en z = 0, piso en y = 0. El retrato cuelga sobre el sillón.
   ===================================================================================== */
export const PAINT_POS: V3 = [0, 1.92, 0.02];
export const PAINT_W = 0.64, PAINT_H = 0.86;
export const SECOND_POS: V3 = [2.55, 1.75, 0.02];
export type RoomState = {
  t: number;
  painting: number; // 1 = el retrato colgado
  tapestry: number; // 1 = el tapiz de caballos
  ghost?: number; // marca más clara en la pared donde estaba el cuadro
  second?: number; // segundo marco (la naturaleza muerta) en la pared derecha
  secondReveal?: number; // 0 = marco negro con "?", 1 = la foto de archivo
  police?: number; // luces azules y rojas que entran por la ventana
  lamp?: number;
  scan?: number; // aro de luz fría sobre el retrato (la pareja que lo reconoce)
};
export const Room3D: React.FC<{s: RoomState}> = ({s}) => {
  const paint = IMG_TEX['ep10/img/cuadro.jpg'];
  const mignon = IMG_TEX['ep10/img/mignon.png'];
  const pol = s.police ?? 0;
  const blink = Math.sin(s.t * 9) > 0 ? 1 : 0;
  const lamp = s.lamp ?? 1;
  return (
    <group>
      {/* piso, paredes, zócalo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <M c="#8C6A4C" r={0.6} map={parquetTex()} />
      </mesh>
      <mesh position={[0, 1.6, 0]} receiveShadow>
        <planeGeometry args={[10, 3.2]} />
        <M c="#B8B49A" r={0.95} map={wallpaperTex()} />
      </mesh>
      <mesh position={[-4.2, 1.6, 3]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <M c="#A9A58C" r={0.95} map={wallpaperTex()} />
      </mesh>
      <mesh position={[4.2, 1.6, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <M c="#A9A58C" r={0.95} map={wallpaperTex()} />
      </mesh>
      <Box p={[0, 0.07, 0.02]} s={[8.4, 0.14, 0.04]} c="#E6DDC8" r={0.6} />
      <Box p={[0, 3.12, 0.04]} s={[8.4, 0.12, 0.08]} c="#E6DDC8" r={0.6} />
      {/* ventana en la pared izquierda: noche azul (o patrulleros) */}
      <group position={[-4.17, 1.6, 2.4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 1.7]} />
          <meshBasicMaterial color={pol > 0 ? (blink ? '#3B5BFF' : '#FF2B2B') : '#1B2B44'} toneMapped={false} />
        </mesh>
        <Box p={[0, 0, 0.03]} s={[0.06, 1.7, 0.05]} c="#E8E1D0" />
        <Box p={[0, 0, 0.03]} s={[1.5, 0.06, 0.05]} c="#E8E1D0" />
        <Box p={[0, 0.88, 0.03]} s={[1.62, 0.08, 0.06]} c="#E8E1D0" />
        <Box p={[0, -0.88, 0.05]} s={[1.7, 0.08, 0.12]} c="#E8E1D0" />
        {/* cortinas */}
        <Box p={[-1.0, 0, 0.08]} s={[0.45, 2.1, 0.06]} c="#5C2A22" r={0.9} />
        <Box p={[1.0, 0, 0.08]} s={[0.45, 2.1, 0.06]} c="#5C2A22" r={0.9} />
      </group>
      {pol > 0 ? (
        <>
          <pointLight position={[-3.4, 1.8, 2.4]} intensity={9 * pol * blink} distance={9} color="#3B5BFF" />
          <pointLight position={[-3.4, 1.6, 2.0]} intensity={9 * pol * (1 - blink)} distance={9} color="#FF3030" />
        </>
      ) : null}
      {/* alfombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 1.7]} receiveShadow>
        <planeGeometry args={[3.6, 2.3]} />
        <M c="#ffffff" r={0.95} map={rugTex()} />
      </mesh>
      {/* el sillón de terciopelo verde */}
      <group position={[0, 0, 0.62]}>
        <RB p={[0, 0.3, 0]} s={[2.5, 0.34, 0.92]} rad={0.08}>
          <Velvet />
        </RB>
        {[-0.8, 0, 0.8].map((x) => (
          <RB key={'c' + x} p={[x, 0.53, 0.06]} s={[0.78, 0.16, 0.78]} rad={0.07}>
            <Velvet />
          </RB>
        ))}
        {[-0.8, 0, 0.8].map((x) => (
          <RB key={'b' + x} p={[x, 0.86, -0.32]} s={[0.78, 0.6, 0.2]} rad={0.09} rot={[-0.14, 0, 0]}>
            <Velvet />
          </RB>
        ))}
        <RB p={[-1.32, 0.55, 0]} s={[0.22, 0.56, 0.95]} rad={0.1}>
          <Velvet />
        </RB>
        <RB p={[1.32, 0.55, 0]} s={[0.22, 0.56, 0.95]} rad={0.1}>
          <Velvet />
        </RB>
        {[-1.2, 1.2].map((x) =>
          [-0.36, 0.36].map((z) => <Box key={x + '_' + z} p={[x, 0.065, z]} s={[0.07, 0.13, 0.07]} c="#3A2614" r={0.5} />),
        )}
      </group>
      {/* mesa baja */}
      <group position={[0, 0, 2.0]}>
        <Box p={[0, 0.42, 0]} s={[1.3, 0.05, 0.62]} c="#4A2E1A" r={0.35} />
        {[-0.58, 0.58].map((x) => [-0.25, 0.25].map((z) => <Box key={x + '_' + z} p={[x, 0.2, z]} s={[0.05, 0.4, 0.05]} c="#3A2414" />))}
        <Box p={[0.25, 0.47, 0.05]} s={[0.3, 0.05, 0.22]} c="#8C2E25" r={0.8} />
      </group>
      {/* mesa lateral y lámpara */}
      <group position={[1.85, 0, 0.55]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.6, 28]} />
          <M c="#4A2E1A" r={0.4} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.09, 0.36, 16]} />
          <M c="#B08A40" r={0.35} m={0.5} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.15, 0.27, 0.3, 28, 1, true]} />
          <meshStandardMaterial color="#F2DDB0" emissive="#FFC874" emissiveIntensity={0.9 * lamp} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
        <pointLight position={[0, 1.0, 0.1]} intensity={3.2 * lamp} distance={6} decay={1.6} color="#FFC27A" castShadow={false} />
      </group>
      {/* planta en el rincón */}
      <group position={[-2.4, 0, 0.5]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.44, 20]} />
          <M c="#7A3E22" r={0.8} />
        </mesh>
        {Array.from({length: 9}, (_, i) => (
          <mesh key={i} position={[Math.cos(i * 2.4) * 0.12, 0.75 + (i % 3) * 0.15, Math.sin(i * 2.4) * 0.12]} rotation={[Math.cos(i) * 0.5, i, Math.sin(i * 1.7) * 0.5]} castShadow>
            <coneGeometry args={[0.1, 0.62, 5]} />
            <M c="#2E4A2A" r={0.8} />
          </mesh>
        ))}
      </group>
      {/* el retrato, la marca en la pared y el tapiz */}
      {(s.ghost ?? 0) > 0 ? (
        <mesh position={[PAINT_POS[0], PAINT_POS[1], 0.004]}>
          <planeGeometry args={[PAINT_W + 0.2, PAINT_H + 0.2]} />
          <meshBasicMaterial color="#CFC7A8" transparent opacity={0.12 * (s.ghost ?? 0)} />
        </mesh>
      ) : null}
      <group position={[0, (1 - s.painting) * -0.08, 0]}>
        <Frame3D p={PAINT_POS} w={PAINT_W} h={PAINT_H} map={paint} o={s.painting} e={0.12} />
      </group>
      {s.tapestry > 0.005 ? (
        <group position={[0, 1.88 + (1 - s.tapestry) * 0.25, 0.03]}>
          <mesh position={[0, 0.54, 0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 1.62, 12]} />
            <M c="#8C6A2C" m={0.5} r={0.4} o={s.tapestry} />
          </mesh>
          <mesh position={[0, 0, 0.02]} receiveShadow>
            <planeGeometry args={[1.42, 1.05]} />
            <meshStandardMaterial map={tapestryTex()} roughness={1} transparent opacity={s.tapestry} />
          </mesh>
        </group>
      ) : null}
      {/* aplique de luz sobre el cuadro */}
      <Box p={[0, PAINT_POS[1] + PAINT_H / 2 + 0.2, 0.12]} s={[0.42, 0.04, 0.05]} c="#B08A40" m={0.6} r={0.35} e="#FFD27A" ei={0.4} />
      <spotLight position={[0, PAINT_POS[1] + 0.75, 0.9]} target-position={[0, PAINT_POS[1], 0]} angle={0.55} penumbra={0.6} intensity={7 * lamp} distance={4} color="#FFDDA0" />
      {/* segundo marco: la naturaleza muerta */}
      {(s.second ?? 0) > 0.005 ? (
        <group>
          <Frame3D p={SECOND_POS} w={0.62} h={0.8} map={(s.secondReveal ?? 0) > 0.5 ? mignon : unknownTex()} o={s.second ?? 0} e={0.1} />
          <spotLight position={[SECOND_POS[0], SECOND_POS[1] + 0.8, 0.9]} target-position={[SECOND_POS[0], SECOND_POS[1], 0]} angle={0.5} penumbra={0.7} intensity={5 * (s.second ?? 0)} distance={4} color="#FFDDA0" />
        </group>
      ) : null}
      {(s.scan ?? 0) > 0 ? (
        <mesh position={[PAINT_POS[0], PAINT_POS[1], 0.1]}>
          <ringGeometry args={[0.62, 0.66, 64]} />
          <meshBasicMaterial color="#7DBBE6" transparent opacity={s.scan} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/* =====================================================================================
   EL CHALET DE MAR DEL PLATA, DE NOCHE. Frente hacia +z, vereda en z ≈ 6.
   ===================================================================================== */
export type ChaletState = {t: number; sign?: number; mover?: number; police?: number; lights?: number; porch?: number};
export const Chalet3D: React.FC<{s: ChaletState}> = ({s}) => {
  const lights = s.lights ?? 1;
  const pol = s.police ?? 0;
  const blink = Math.sin(s.t * 9) > 0 ? 1 : 0;
  const gableGeo = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-3.1, 0);
    sh.lineTo(0, 2.0);
    sh.lineTo(3.1, 0);
    sh.lineTo(-3.1, 0);
    return new THREE.ShapeGeometry(sh);
  }, []);
  const win = (x: number, y: number, w = 1.0, h = 1.2, on = 1) => (
    <group position={[x, y, 3.03]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#2A1A0C" emissive="#FFB65C" emissiveIntensity={1.3 * on * lights} toneMapped={false} />
      </mesh>
      <Box p={[0, 0, 0.03]} s={[0.05, h, 0.04]} c="#EDE6D6" shadow={false} />
      <Box p={[0, 0, 0.03]} s={[w, 0.05, 0.04]} c="#EDE6D6" shadow={false} />
      <Box p={[0, -h / 2 - 0.05, 0.06]} s={[w + 0.2, 0.09, 0.14]} c="#EDE6D6" />
      {/* postigos */}
      <Box p={[-w / 2 - 0.2, 0, 0.04]} s={[0.36, h + 0.1, 0.05]} c="#2D4A3A" />
      <Box p={[w / 2 + 0.2, 0, 0.04]} s={[0.36, h + 0.1, 0.05]} c="#2D4A3A" />
    </group>
  );
  const mover = s.mover ?? 0;
  return (
    <group>
      {/* terreno */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <M c="#1E2A1A" r={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 7.4]} receiveShadow>
        <planeGeometry args={[60, 1.8]} />
        <M c="#5B5650" r={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 11]} receiveShadow>
        <planeGeometry args={[60, 5.4]} />
        <M c="#22252A" r={0.9} />
      </mesh>
      {/* camino de lajas a la puerta */}
      {Array.from({length: 6}, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0.2 * Math.sin(i)]} position={[0.9 + Math.sin(i) * 0.15, 0.02, 3.5 + i * 0.6]} receiveShadow>
          <circleGeometry args={[0.26, 7]} />
          <M c="#8A8073" r={0.9} />
        </mesh>
      ))}
      {/* casa: planta baja de piedra */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 2.7, 6]} />
        <M c="#ffffff" r={0.95} map={stoneTex()} />
      </mesh>
      {/* hastial blanco del frente con vigas */}
      <mesh position={[0, 2.7, 3.005]}>
        <primitive object={gableGeo} attach="geometry" />
        <M c="#EDE6D6" r={0.9} />
      </mesh>
      <Box p={[0, 3.25, 3.03]} s={[0.12, 1.1, 0.06]} c="#3A2A1C" />
      <Box p={[0, 2.78, 3.03]} s={[6.2, 0.12, 0.06]} c="#3A2A1C" />
      {/* techo de tejas */}
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 1.78, 2.7 + 1.15, 0]} rotation={[0, 0, -sd * 0.568]} castShadow receiveShadow>
          <boxGeometry args={[4.45, 0.16, 6.9]} />
          <M c="#ffffff" r={0.85} map={tileTex()} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, -3.005]} rotation={[0, Math.PI, 0]}>
        <primitive object={gableGeo} attach="geometry" />
        <M c="#EDE6D6" r={0.9} />
      </mesh>
      {/* chimenea */}
      <mesh position={[-1.9, 4.2, -1.2]} castShadow>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <M c="#ffffff" r={0.95} map={stoneTex()} />
      </mesh>
      {/* ventanas y puerta */}
      {win(-1.6, 1.45, 1.1, 1.25, 1)}
      {win(1.75, 1.45, 0.9, 1.25, 0.25)}
      {win(0, 3.45, 0.55, 0.55, 0.6)}
      {/* alguien que se mueve detrás de la ventana iluminada */}
      {mover > 0 ? (
        <group position={[-1.6 + mix(-0.45, 0.45, clamp(mover)), 1.3, 3.036]}>
          <mesh position={[0, -0.12, 0]}>
            <planeGeometry args={[0.36, 0.75]} />
            <meshBasicMaterial color="#2A1606" transparent opacity={0.75 * Math.sin(Math.PI * clamp(mover))} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <circleGeometry args={[0.13, 20]} />
            <meshBasicMaterial color="#2A1606" transparent opacity={0.75 * Math.sin(Math.PI * clamp(mover))} />
          </mesh>
        </group>
      ) : null}
      <group position={[0.9, 1.05, 3.02]}>
        <mesh>
          <planeGeometry args={[0.95, 2.1]} />
          <M c="#3E2616" r={0.6} />
        </mesh>
        <Box p={[0, 0, 0.02]} s={[1.1, 0.06, 0.05]} c="#2A1A0E" shadow={false} />
        <mesh position={[0.32, 0, 0.05]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <M c="#C9A24A" m={0.7} r={0.3} />
        </mesh>
      </group>
      {/* farol de la entrada y timbre */}
      <mesh position={[1.62, 2.05, 3.12]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#FFE2A8" emissive="#FFC46A" emissiveIntensity={2.2 * (s.porch ?? 1)} toneMapped={false} />
      </mesh>
      <pointLight position={[1.62, 2.0, 3.6]} intensity={4 * (s.porch ?? 1)} distance={6} decay={1.5} color="#FFC07A" />
      <pointLight position={[-1.6, 1.4, 3.8]} intensity={2.2 * lights} distance={5} decay={1.6} color="#FFB65C" />
      {/* muro bajo de piedra con portón */}
      <mesh position={[-2.2, 0.35, 5.8]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.7, 0.3]} />
        <M c="#ffffff" r={0.95} map={stoneTex()} />
      </mesh>
      <mesh position={[3.6, 0.35, 5.8]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.7, 0.3]} />
        <M c="#ffffff" r={0.95} map={stoneTex()} />
      </mesh>
      {/* arbustos y árbol */}
      {[[-2.6, 4.6], [-3.3, 3.5], [2.9, 4.4], [3.4, 3.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]} castShadow>
          <icosahedronGeometry args={[0.6 + (i % 2) * 0.15, 1]} />
          <M c="#1F3A22" r={0.9} flat />
        </mesh>
      ))}
      <mesh position={[-5.2, 1.6, 3.2]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 3.2, 10]} />
        <M c="#3A2A1C" r={0.9} />
      </mesh>
      <mesh position={[-5.2, 4.0, 3.2]} castShadow>
        <icosahedronGeometry args={[1.7, 1]} />
        <M c="#1A3020" r={0.9} flat />
      </mesh>
      {/* cartel SE VENDE */}
      {(s.sign ?? 1) > 0 ? (
        <group position={[-3.15, 0, 5.15]} rotation={[0, 0.3, 0]}>
          <Box p={[0, 0.7, 0]} s={[0.07, 1.4, 0.07]} c="#3A2A1C" />
          <mesh position={[0, 1.35, 0.05]} castShadow>
            <boxGeometry args={[1.1, 0.64, 0.03]} />
            <meshStandardMaterial attach="material-4" map={signTex()} roughness={0.7} emissive="#ffffff" emissiveMap={signTex()} emissiveIntensity={0.18} />
            <meshStandardMaterial attach="material-0" color="#ddd" />
            <meshStandardMaterial attach="material-1" color="#ddd" />
            <meshStandardMaterial attach="material-2" color="#ddd" />
            <meshStandardMaterial attach="material-3" color="#ddd" />
            <meshStandardMaterial attach="material-5" color="#ddd" />
          </mesh>
        </group>
      ) : null}
      {/* farola de la calle */}
      <Box p={[6.6, 1.8, 8.3]} s={[0.1, 3.6, 0.1]} c="#22262A" m={0.4} />
      <Box p={[6.3, 3.55, 8.3]} s={[0.7, 0.06, 0.06]} c="#22262A" m={0.4} />
      <mesh position={[6.0, 3.45, 8.3]}>
        <coneGeometry args={[0.22, 0.2, 16, 1, true]} />
        <meshStandardMaterial color="#22262A" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6.0, 3.36, 8.3]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 16]} />
        <meshStandardMaterial color="#FFE9C0" emissive="#FFD48A" emissiveIntensity={2.2} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[6.0, 3.2, 8.3]} intensity={6} distance={14} decay={1.4} color="#FFD08A" />
      {/* patrulleros: luces que barren la fachada */}
      {pol > 0 ? (
        <>
          <pointLight position={[-2, 1.4, 10]} intensity={30 * pol * blink} distance={18} decay={1.3} color="#3050FF" />
          <pointLight position={[2.5, 1.4, 10.5]} intensity={30 * pol * (1 - blink)} distance={18} decay={1.3} color="#FF2A2A" />
          <pointLight position={[0, 3.5, 15]} intensity={4 * pol} distance={14} decay={1.2} color="#AFC4FF" />
          {[-5.2, 4.9].map((x, i) => (
            <group key={i} position={[x, 0, 9.6]} rotation={[0, i ? -0.35 : 0.35, 0]}>
              <Box p={[0, 0.55, 0]} s={[3.6, 0.7, 1.7]} c="#E8E8EA" r={0.4} m={0.3} />
              <Box p={[0.2, 1.1, 0]} s={[1.9, 0.55, 1.5]} c="#1A2230" r={0.2} m={0.3} />
              <Box p={[0.2, 1.42, 0]} s={[0.9, 0.12, 0.3]} c={i ? '#FF3030' : '#3050FF'} e={i ? '#FF3030' : '#3050FF'} ei={2.5 * pol * (i ? 1 - blink : blink)} />
            </group>
          ))}
        </>
      ) : null}
    </group>
  );
};

/* =====================================================================================
   LA CUBIERTA DEL BARCO (noche de mayo de 1940). La proa hacia −z. La escotilla en z = −9.
   ===================================================================================== */
export const HATCH_Z = -9;
export const ShipDeck3D: React.FC<{t: number; lantern?: number; fall?: number}> = ({t, lantern = 1, fall = 0}) => {
  const sea = useMemo(() => new THREE.PlaneGeometry(140, 140, 70, 70), []);
  const pos = sea.attributes.position as THREE.BufferAttribute;
  const base = useMemo(() => Float32Array.from(pos.array as Float32Array), [sea]);
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3], y = base[i * 3 + 1];
    pos.setZ(i, Math.sin(x * 0.35 + t * 1.1) * 0.25 + Math.sin(y * 0.5 - t * 0.8) * 0.18 + Math.sin((x + y) * 0.9 + t * 1.7) * 0.06);
  }
  pos.needsUpdate = true;
  sea.computeVertexNormals();
  const roll = Math.sin(t * 0.7) * 0.025;
  const swing = Math.sin(t * 1.3) * 0.22;
  const posts = [];
  for (let z = 4; z > -26; z -= 1.4) posts.push(z);
  return (
    <group>
      <fog attach="fog" args={['#070B12', 6, 34]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -10]}>
        <primitive object={sea} attach="geometry" />
        <meshStandardMaterial color="#08101C" roughness={0.62} metalness={0.05} />
      </mesh>
      <directionalLight position={[-12, 18, -30]} intensity={0.32} color="#9FB8E8" />
      <group rotation={[0, 0, roll]}>
        {/* casco y cubierta */}
        <mesh position={[0, -1.3, -11]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 2.6, 34]} />
          <M c="#14171C" r={0.7} m={0.2} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -11]} receiveShadow>
          <planeGeometry args={[6.2, 34]} />
          <M c="#ffffff" r={0.85} map={deckTex()} />
        </mesh>
        {/* barandas */}
        {[-3.05, 3.05].map((x) => (
          <group key={x}>
            {posts.map((z) => (
              <Box key={z} p={[x, 0.55, z]} s={[0.07, 1.1, 0.07]} c="#C9C3B5" m={0.4} r={0.5} />
            ))}
            <mesh position={[x, 1.1, -11]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 30, 8]} />
              <M c="#C9C3B5" m={0.5} r={0.4} />
            </mesh>
            <mesh position={[x, 0.6, -11]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 30, 8]} />
              <M c="#C9C3B5" m={0.5} r={0.4} />
            </mesh>
          </group>
        ))}
        {/* superestructura con ojos de buey y chimenea */}
        <mesh position={[0, 1.4, 2.5]} castShadow receiveShadow>
          <boxGeometry args={[5, 2.8, 4]} />
          <M c="#D8D2C2" r={0.8} />
        </mesh>
        {[-1.6, -0.5, 0.6, 1.7].map((x) => (
          <mesh key={x} position={[x, 1.6, 0.49]}>
            <circleGeometry args={[0.2, 20]} />
            <meshStandardMaterial color="#20160C" emissive="#FFB050" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 4.4, 3.4]} castShadow>
          <cylinderGeometry args={[0.8, 0.9, 3.4, 24]} />
          <M c="#1A1A1A" r={0.6} />
        </mesh>
        <mesh position={[0, 5.4, 3.4]}>
          <cylinderGeometry args={[0.82, 0.82, 0.5, 24]} />
          <M c="#7A2A22" r={0.6} />
        </mesh>
        {/* la escotilla abierta */}
        <group position={[0, 0, HATCH_Z]}>
          <Box p={[0, 0.16, -0.75]} s={[1.9, 0.32, 0.14]} c="#2A2018" />
          <Box p={[0, 0.16, 0.75]} s={[1.9, 0.32, 0.14]} c="#2A2018" />
          <Box p={[-0.9, 0.16, 0]} s={[0.14, 0.32, 1.6]} c="#2A2018" />
          <Box p={[0.9, 0.16, 0]} s={[0.14, 0.32, 1.6]} c="#2A2018" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[1.66, 1.36]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* la tapa, abierta y apoyada */}
          <Box p={[0, 0.62, -1.18]} s={[1.7, 1.0, 0.07]} c="#5A4430" rot={[-0.55, 0, 0]} />
          {/* pozo hacia la bodega */}
          <mesh position={[0, -1.4, 0]}>
            <boxGeometry args={[1.66, 2.8, 1.36]} />
            <meshStandardMaterial color="#120D08" side={THREE.BackSide} roughness={1} />
          </mesh>
        </group>
        {/* farol que se balancea */}
        <group position={[-1.5, 1.9, HATCH_Z + 2.2]}>
          <Box p={[0, 0.6, 0]} s={[0.08, 1.2, 0.08]} c="#2A2A2A" />
          <group position={[0.35, 1.1, 0]} rotation={[swing * 0.3, 0, swing]}>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
              <M c="#222" />
            </mesh>
            <mesh position={[0, -0.7, 0]}>
              <sphereGeometry args={[0.12, 14, 10]} />
              <meshStandardMaterial color="#FFE0A0" emissive="#FFB24C" emissiveIntensity={2.4 * lantern} toneMapped={false} />
            </mesh>
            <pointLight position={[0, -0.7, 0]} intensity={5 * lantern} distance={7} decay={1.5} color="#FFB060" />
          </group>
        </group>
      </group>
      {fall > 0 ? <pointLight position={[0, -2, HATCH_Z]} intensity={0} /> : null}
    </group>
  );
};

/* =====================================================================================
   EL CUADERNO NEGRO. Apoyado sobre una mesa; el lomo sobre el eje z (x = 0).
   open: 0 cerrado → 1 abierto. flip: hoja que pasa (0..n). red: marcas rojas de "falta".
   ===================================================================================== */
export const Notebook3D: React.FC<{open: number; flip?: number; red?: boolean; lamp?: number; table?: boolean}> = ({open, flip = 0, red = false, lamp = 1, table = true}) => {
  const W = 1.05, Hh = 1.5, T = 0.05;
  const cover = <M c="#262019" r={0.32} m={0.15} />;
  const a = open * Math.PI * 0.98;
  const fl = flip % 1;
  const flips = Math.floor(flip);
  return (
    <group>
      {table ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <planeGeometry args={[9, 6]} />
          <M c="#4A3222" r={0.55} map={parquetTex()} />
        </mesh>
      ) : null}
      <spotLight position={[0.6, 3.4, 1.2]} target-position={[0, 0, 0]} angle={0.6} penumbra={0.7} intensity={22 * lamp} distance={8} color="#FFE2B0" castShadow />
      <pointLight position={[-1.6, 1.2, -1.8]} intensity={2.5 * lamp} distance={6} color="#FFB870" />
      {/* tapa trasera + bloque de hojas derecho */}
      <mesh position={[W / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, T * 0.6, Hh]} />
        {cover}
      </mesh>
      <mesh position={[W / 2 - 0.01, T * 0.55, 0]} receiveShadow>
        <boxGeometry args={[W - 0.04, T * 0.5, Hh - 0.04]} />
        <M c="#E3D8BE" r={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 - 0.01, T * 0.81, 0]}>
        <planeGeometry args={[W - 0.06, Hh - 0.06]} />
        <M c="#ffffff" r={0.95} map={pageTex(1, red)} />
      </mesh>
      {/* tapa delantera + página izquierda: giran sobre el lomo */}
      <group rotation={[0, 0, a]}>
        <mesh position={[W / 2, T * 1.35, 0]} castShadow>
          <boxGeometry args={[W, T * 0.6, Hh]} />
          {cover}
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[W / 2 - 0.01, T * 1.04, 0]}>
          <planeGeometry args={[W - 0.06, Hh - 0.06]} />
          <M c="#ffffff" r={0.95} map={pageTex(0, red)} />
        </mesh>
        {/* elástico */}
        <mesh position={[W - 0.12, T * 1.7, 0]}>
          <boxGeometry args={[0.03, 0.012, Hh + 0.01]} />
          <M c="#1A1A1A" r={0.6} />
        </mesh>
      </group>
      {/* hojas que pasan */}
      {open > 0.95 && flip > 0 && fl > 0.01
        ? [0].map((i) => (
            <group key={flips + '_' + i} rotation={[0, 0, Math.PI * easeInOut(fl) * 0.98]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 - 0.01, T * 0.86, 0]}>
                <planeGeometry args={[W - 0.06, Hh - 0.06]} />
                <meshStandardMaterial map={pageTex(2 + (flips % 3), red)} side={THREE.DoubleSide} roughness={0.95} />
              </mesh>
            </group>
          ))
        : null}
    </group>
  );
};

/* =====================================================================================
   LA GALERÍA: un pasillo con cientos de cuadros en las dos paredes. taken: fracción que se llevan.
   ===================================================================================== */
const N_ART = 12;
type GalleryItem = {p: V3; w: number; h: number; side: 1 | -1; tex: number; order: number};
const GALLERY: GalleryItem[] = (() => {
  const out: GalleryItem[] = [];
  let k = 0;
  for (const side of [-1, 1] as const)
    for (let col = 0; col < 34; col++)
      for (let row = 0; row < 3; row++) {
        const w = 0.7 + rnd(k * 3 + 1) * 0.6, h = 0.6 + rnd(k * 3 + 2) * 0.55;
        out.push({p: [side * 2.95, 1.0 + row * 1.15 + (rnd(k) - 0.5) * 0.1, 1 - col * 1.55 - (row % 2) * 0.35], w, h, side, tex: k % N_ART, order: rnd(k * 7 + 5)});
        k++;
      }
  return out;
})();
export const GALLERY_N = GALLERY.length;
export const Gallery3D: React.FC<{t: number; taken?: number; reveal?: number; dim?: number}> = ({t, taken = 0, reveal = 1, dim = 1}) => {
  const frameGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 0.06), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#B8913F', roughness: 0.38, metalness: 0.55, emissive: '#5A3C0E', emissiveIntensity: 0.25}), []);
  const artMats = useMemo(() => Array.from({length: N_ART}, (_, i) => new THREE.MeshStandardMaterial({map: artTex(i), roughness: 0.85})), []);
  const planeGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const frames = useMemo(() => {
    const im = new THREE.InstancedMesh(frameGeo, frameMat, GALLERY.length);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    im.castShadow = true;
    return im;
  }, [frameGeo, frameMat]);
  const arts = useMemo(
    () =>
      artMats.map((m) => {
        const im = new THREE.InstancedMesh(planeGeo, m, GALLERY.length);
        im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        im.frustumCulled = false;
        return im;
      }),
    [artMats, planeGeo],
  );
  const dummy = new THREE.Object3D();
  const counts = new Array(N_ART).fill(0);
  let fi = 0;
  GALLERY.forEach((g, i) => {
    // aparición en ola desde la cámara hacia el fondo
    const ap = easeOut(clamp(reveal * 1.6 - (-g.p[2] / 52) * 0.6));
    if (ap <= 0.01) return;
    // se lo llevan: sale de la pared, sube y se aleja
    const k = clamp((taken - g.order * 0.85) / 0.15);
    if (k >= 0.999) return;
    const e = easeIn(k);
    const x = g.p[0] - g.side * (0.15 + e * 1.6), y = g.p[1] + e * 2.4, z = g.p[2] - e * 6;
    const s = ap * (1 - e * 0.6);
    const ry = -g.side * Math.PI / 2 + e * g.side * 0.8;
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, ry, e * 0.4);
    dummy.scale.set((g.w + 0.14) * s, (g.h + 0.14) * s, 1);
    dummy.updateMatrix();
    frames.setMatrixAt(fi++, dummy.matrix);
    dummy.position.set(x - g.side * 0.035, y, z);
    dummy.scale.set(g.w * s, g.h * s, 1);
    dummy.updateMatrix();
    arts[g.tex].setMatrixAt(counts[g.tex]++, dummy.matrix);
  });
  frames.count = fi;
  frames.instanceMatrix.needsUpdate = true;
  arts.forEach((im, j) => {
    im.count = counts[j];
    im.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -24]} receiveShadow>
        <planeGeometry args={[6, 60]} />
        <M c="#6B4A30" r={0.5} map={parquetTex()} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 3, 2.4, -24]} rotation={[0, -sd * Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[60, 4.8]} />
          <M c="#4B1F1C" r={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 4.8, -24]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 60]} />
        <M c="#1A1410" r={1} />
      </mesh>
      <primitive object={frames} />
      {arts.map((im, j) => (
        <primitive key={j} object={im} />
      ))}
      {[0, -10, -20, -32].map((z, i) => (
        <pointLight key={i} position={[0, 4.2, z]} intensity={6 * dim} distance={14} decay={1.4} color="#FFD49A" />
      ))}
    </group>
  );
};

/* =====================================================================================
   EL BOTÍN: lingotes de oro, diamantes y fajos de billetes sobre terciopelo
   ===================================================================================== */
const diamondGeo = (() => {
  const pts = [new THREE.Vector2(0, -0.32), new THREE.Vector2(0.36, 0.0), new THREE.Vector2(0.3, 0.08), new THREE.Vector2(0.17, 0.13), new THREE.Vector2(0, 0.13)];
  return new THREE.LatheGeometry(pts, 8);
})();
export const diamondPos = (i: number): V3 => [0.3 + (rnd(i) - 0.5) * 1.8, 0.4, 0.6 + (rnd(i + 9) - 0.5) * 1.4];
export const Loot3D: React.FC<{t: number; gold: number; diamonds: number; notes: number}> = ({t, gold, diamonds, notes}) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 9]} />
      <M c="#3B0F14" r={0.95} />
    </mesh>
    {/* lingotes */}
    {Array.from({length: 9}, (_, i) => {
      const row = i < 5 ? 0 : 1;
      const col = row === 0 ? i : i - 5;
      const k = easeOut(clamp(gold * 2.2 - i * 0.12));
      if (k <= 0) return null;
      return (
        <mesh key={i} position={[-2.4 + (col - (row ? 1.5 : 2)) * 0.62, 0.11 + row * 0.22 + (1 - k) * 1.6, -0.2 + row * 0.0]} rotation={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.2, 1.1]} />
          <meshStandardMaterial color="#E2B64A" roughness={0.28} metalness={0.75} emissive="#7A5410" emissiveIntensity={0.55} />
        </mesh>
      );
    })}
    {/* diamantes */}
    {Array.from({length: 11}, (_, i) => {
      const k = easeOut(clamp(diamonds * 2 - i * 0.08));
      if (k <= 0) return null;
      const [x, , z] = diamondPos(i);
      return (
        <mesh key={i} geometry={diamondGeo} position={[x, 0.33 + (1 - k) * 1.2, z]} rotation={[rnd(i + 3) * 0.3, t * 0.6 + i, rnd(i + 5) * 0.25]} scale={0.34 + rnd(i + 2) * 0.1} castShadow>
          <meshStandardMaterial color="#EEF6FF" roughness={0.08} metalness={0.35} emissive="#C9E0FF" emissiveIntensity={0.12} flatShading />
        </mesh>
      );
    })}
    {/* fajos de billetes */}
    {Array.from({length: 6}, (_, i) => {
      const k = easeOut(clamp(notes * 2 - i * 0.12));
      if (k <= 0) return null;
      return (
        <group key={i} position={[2.4 + (i % 3) * 0.95 - 0.95, 0.07 + Math.floor(i / 3) * 0.14 + (1 - k) * 1.5, -0.3 + Math.floor(i / 3) * 0.1]} rotation={[0, 0.15 * (i - 2), 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.92, 0.13, 0.46]} />
            <meshStandardMaterial attach="material-2" map={noteTex()} roughness={0.8} />
            <meshStandardMaterial attach="material-0" color="#C9D3BE" />
            <meshStandardMaterial attach="material-1" color="#C9D3BE" />
            <meshStandardMaterial attach="material-3" color="#C9D3BE" />
            <meshStandardMaterial attach="material-4" color="#C9D3BE" />
            <meshStandardMaterial attach="material-5" color="#C9D3BE" />
          </mesh>
          <mesh position={[0, 0.0, 0]}>
            <boxGeometry args={[0.14, 0.135, 0.47]} />
            <M c="#B33A2A" r={0.7} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/* =====================================================================================
   CAMPO DE MARCOS: 600 marcos (cada uno = 1.000 obras). missing: los 100 que todavía faltan.
   ===================================================================================== */
export const FIELD_COLS = 30, FIELD_ROWS = 20;
/** exactamente 100 de los 600 marcos: los que faltan */
const MISSING = (() => {
  const idx = Array.from({length: 600}, (_, i) => i).sort((a, b) => rnd(a * 13 + 1) - rnd(b * 13 + 1));
  return new Set(idx.slice(0, 100));
})();
export const FrameField: React.FC<{t: number; build: number; missing: number; lift?: number}> = ({t, build, missing, lift = 0}) => {
  const geo = useMemo(() => new THREE.BoxGeometry(0.42, 0.34, 0.05), []);
  const matG = useMemo(() => new THREE.MeshStandardMaterial({color: '#C9A24A', roughness: 0.4, metalness: 0.45, emissive: '#4A320C', emissiveIntensity: 0.4}), []);
  const matR = useMemo(() => new THREE.MeshStandardMaterial({color: '#D0362F', roughness: 0.5, metalness: 0.1, emissive: '#7A1410', emissiveIntensity: 0.7}), []);
  const gold = useMemo(() => {
    const im = new THREE.InstancedMesh(geo, matG, 600);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    im.castShadow = true;
    return im;
  }, [geo, matG]);
  const red = useMemo(() => {
    const im = new THREE.InstancedMesh(geo, matR, 100);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    return im;
  }, [geo, matR]);
  const dummy = new THREE.Object3D();
  let ng = 0, nr = 0;
  for (let i = 0; i < 600; i++) {
    const col = i % FIELD_COLS, row = Math.floor(i / FIELD_COLS);
    const x = (col - (FIELD_COLS - 1) / 2) * 0.5, z = (row - (FIELD_ROWS - 1) / 2) * 0.42;
    const ap = easeOut(clamp(build * 2.2 - (col + row) / (FIELD_COLS + FIELD_ROWS) * 1.2));
    if (ap <= 0.01) continue;
    const isMissing = MISSING.has(i);
    const m = isMissing ? clamp(missing * 1.4 - rnd(i * 3) * 0.4) : 0;
    const up = isMissing ? lift * (1 + rnd(i) * 1.5) : 0;
    dummy.position.set(x, 0.17 * ap + up, z);
    dummy.rotation.set(-0.15 + (isMissing ? up * 0.3 : 0), isMissing ? up * 0.6 : 0, 0);
    dummy.scale.setScalar(ap);
    dummy.updateMatrix();
    if (isMissing && m > 0.5) red.setMatrixAt(nr++, dummy.matrix);
    else gold.setMatrixAt(ng++, dummy.matrix);
  }
  gold.count = ng;
  red.count = nr;
  gold.instanceMatrix.needsUpdate = true;
  red.instanceMatrix.needsUpdate = true;
  return (
    <group>
      <primitive object={gold} />
      <primitive object={red} />
    </group>
  );
};
