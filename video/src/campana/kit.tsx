import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, pop, rnd} from '../lib/anim';

export const FPS = 30;
export const K = {
  navy: '#060a15',
  navy2: '#0b1430',
  cel: '#0db2fd',
  cel2: '#48C3EB',
  azul: '#004dff',
  pink: '#F794C5',
  yel: '#F6D465',
  white: '#f4f6fa',
  red: '#ff3b30',
};
export const FONT = '"Roboto Condensed", "Archivo Black", sans-serif';

export const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));
/** 0→1→0: entra en [a, a+din], sale en [b-dout, b] */
export const win = (t: number, a: number, b: number, din = 0.3, dout = 0.3) =>
  Math.min(easeOut(clamp((t - a) / din)), 1 - easeIn(clamp((t - (b - dout)) / dout)));

export const useLayout = () => {
  const {width: W, height: H} = useVideoConfig();
  const V = H > W;
  const u = Math.min(W, H) / 1080; // unidad: 1 en 1080p horizontal y vertical
  return {W, H, V, u};
};

/* ---------------- material ---------------- */
const MDF = staticFile('campana/vid/mdf_1080.mp4');

type ClipP = {
  T: number; from: number; to: number; at: number; rate?: number;
  z0?: number; z1?: number; fin?: number; fout?: number; pos?: string; vpos?: string; filter?: string; punch?: number[];
};
/** toma del video oficial del MDF, con zoom lento, fundidos y golpe en los beats */
export const Clip: React.FC<ClipP> = ({T, from, to, at, rate = 1, z0 = 1.04, z1 = 1.12, fin = 0, fout = 0, pos = '50% 50%', vpos, filter, punch}) => {
  const {V} = useLayout();
  if (T < from - 0.05 || T > to + 0.05) return null;
  const k = clamp((T - from) / (to - from));
  let z = z0 + (z1 - z0) * easeInOut(k);
  if (punch) for (const b of punch) if (T >= b && T < b + 0.5) z *= 1 + 0.045 * Math.exp(-(T - b) * 9);
  const o = Math.min(fin > 0 ? easeOut(clamp((T - from) / fin)) : 1, fout > 0 ? 1 - easeIn(clamp((T - (to - fout)) / fout)) : 1);
  return (
    <Sequence from={Math.round(from * FPS)} durationInFrames={Math.max(1, Math.round((to - from) * FPS) + 2)} layout="none">
      <AbsoluteFill style={{opacity: o, transform: `scale(${z})`, filter}}>
        <OffthreadVideo src={MDF} startFrom={Math.round(at * FPS)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: V ? vpos ?? pos : pos}} />
      </AbsoluteFill>
    </Sequence>
  );
};

/** foto con Ken Burns */
export const Photo: React.FC<{T: number; from: number; to: number; src: string; z0?: number; z1?: number; x0?: number; x1?: number; fin?: number; fout?: number; filter?: string; pos?: string; vpos?: string}> = ({
  T, from, to, src, z0 = 1.04, z1 = 1.14, x0 = 0, x1 = 0, fin = 0.8, fout = 0.6, filter, pos = '50% 50%', vpos,
}) => {
  const {V} = useLayout();
  if (T < from - 0.05 || T > to + 0.05) return null;
  const k = easeInOut(clamp((T - from) / (to - from)));
  const o = Math.min(easeOut(clamp((T - from) / fin)), 1 - easeIn(clamp((T - (to - fout)) / fout)));
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: V ? vpos ?? pos : pos, transform: `scale(${z0 + (z1 - z0) * k}) translateX(${x0 + (x1 - x0) * k}%)`, filter}} />
    </AbsoluteFill>
  );
};

/** foto con movimiento por claves: [t, zoom, foco x %, foco y %] */
export const PhotoKeys: React.FC<{T: number; from: number; to: number; src: string; keys: [number, number, number, number][]; fin?: number; fout?: number; filter?: string}> = ({T, from, to, src, keys, fin = 0.8, fout = 0.6, filter}) => {
  if (T < from - 0.05 || T > to + 0.05) return null;
  let i = 0;
  while (i < keys.length - 2 && T > keys[i + 1][0]) i++;
  const [ta, za, xa, ya] = keys[i];
  const [tb, zb, xb, yb] = keys[Math.min(i + 1, keys.length - 1)];
  const k = tb > ta ? easeInOut(clamp((T - ta) / (tb - ta))) : 1;
  const z = za + (zb - za) * k, x = xa + (xb - xa) * k, y = ya + (yb - ya) * k;
  const o = Math.min(easeOut(clamp((T - from) / fin)), 1 - easeIn(clamp((T - (to - fout)) / fout)));
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%`, transform: `scale(${z})`, filter}} />
    </AbsoluteFill>
  );
};

/* ---------------- marca ---------------- */
/** isotipo del MDF (dos bandas celestes y el cuadrado azul) que se arma */
export const Isotipo: React.FC<{size: number; p?: number; mono?: string}> = ({size, p = 1, mono}) => {
  const b1 = easeOut(clamp(p / 0.55));
  const b2 = easeOut(clamp((p - 0.2) / 0.55));
  const sq = pop(p * 1.2, 0.55, 1.2);
  const c1 = mono ?? K.cel;
  const c2 = mono ?? K.azul;
  return (
    <svg viewBox="0 0 66 93" width={size * (66 / 93)} height={size} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="isoc1"><rect x={0} y={0} width={66 * b1} height={34} /></clipPath>
        <clipPath id="isoc2"><rect x={0} y={34} width={66 * b2} height={34} /></clipPath>
      </defs>
      <g clipPath="url(#isoc1)">
        <path fill={c1} d="M2.2,32.36a12.78,12.78,0,0,1,11.3-6.65l37.76.15a13.3,13.3,0,0,0,13.3-13.31V0h-2A12.85,12.85,0,0,1,51.3,6.73L13.5,6.5A13.3,13.3,0,0,0,.19,19.8V32.36h2Z" />
      </g>
      <g clipPath="url(#isoc2)">
        <path fill={c1} d="M2.2,67.14a12.78,12.78,0,0,1,11.3-6.65l28,.15c7.35,0,17.74-6,17.74-13.31V34.78H57.28c-2.18,4-10.86,6.73-15.74,6.73l-28-.24A13.31,13.31,0,0,0,.19,54.58V67.14h2Z" />
      </g>
      <rect fill={c2} x={0} y={75.96} width={17.03} height={17.03} style={{transformOrigin: '8.5px 84.5px', transform: `scale(${sq})`}} />
    </svg>
  );
};

/** logotipo "MDF": MD en Roboto Condensed Black + el isotipo como F */
export const Wordmark: React.FC<{h: number; p?: number; color?: string}> = ({h, p = 1, color = K.white}) => {
  const o = easeOut(clamp(p / 0.4));
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: h * 0.06, height: h}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: h * 1.28, lineHeight: 0.78, color, letterSpacing: -h * 0.02, opacity: o, transform: `translateY(${(1 - o) * h * 0.3}px)`}}>MD</div>
      <Isotipo size={h} p={clamp((p - 0.15) / 0.85)} />
    </div>
  );
};

/** líneas del sistema gráfico del MDF (trazos redondeados celeste, rosa y amarillo) */
const LINES: [string, string][] = [
  ['M 0,302 C 40,302 65,322 65,362 L 65,442 C 65,487 85,507 130,507 L 540,507', K.yel],
  ['M 782,0 L 782,60 C 782,85 802,100 827,100 L 1000,100', K.cel2],
  ['M 844,0 L 844,320 C 844,375 825,410 770,410 L 660,410 C 590,410 543,440 543,530', K.cel2],
  ['M 613,530 C 625,490 660,442 710,442 L 815,442 C 880,442 890,410 890,350 L 890,280 C 890,255 910,240 935,240 L 1000,240', K.pink],
];
const LINES2: [string, string][] = [
  ['M 573,130 L 755,130 C 768,130 780,118 780,105 L 780,60 C 780,47 791,35 805,35 L 1000,35', K.pink],
  ['M 575,530 L 575,425 C 575,411 586,400 600,400 L 845,400 C 859,400 870,389 870,375 L 870,160 C 870,146 881,135 895,135 L 1000,135', K.cel2],
  ['M 380,480 L 713,480 C 727,480 738,469 738,455 L 738,355 C 738,341 749,330 763,330 L 1000,330', K.yel],
];
export const BrandLines: React.FC<{T: number; t0: number; dur?: number; t1?: number; set?: 1 | 2; o?: number; width?: number; flip?: boolean}> = ({T, t0, dur = 1.6, t1 = Infinity, set = 1, o = 0.95, width = 5, flip}) => {
  if (T < t0) return null;
  const L = set === 1 ? LINES : LINES2;
  const out = t1 === Infinity ? 0 : ramp(T, t1 - 0.6, t1, easeIn);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: flip ? 'scale(-1,-1)' : undefined}}>
      <svg viewBox="0 0 1000 530" preserveAspectRatio="none" width="100%" height="100%">
        {L.map(([d, c], i) => {
          const p = easeInOut(clamp((T - t0 - i * 0.12) / dur));
          return <path key={i} d={d} fill="none" stroke={c} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p + out} opacity={o} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- tipografía ---------------- */
/** golpe tipográfico: entra grande y desenfocado, se asienta con rebote */
export const Slam: React.FC<{T: number; t0: number; t1: number; text: string; size: number; color?: string; italic?: boolean; y?: number; stroke?: boolean; weight?: number; ls?: number}> = ({
  T, t0, t1, text, size, color = K.white, italic = true, y = 0, stroke, weight = 900, ls = 0,
}) => {
  if (T < t0 - 0.02 || T > t1 + 0.02) return null;
  const k = clamp((T - t0) / 0.22);
  const s = 1.45 - 0.45 * easeOut(k) + 0.02 * Math.sin(clamp((T - t0) / 0.5) * Math.PI) * (1 - k);
  const o = Math.min(easeOut(k * 1.6), 1 - easeIn(clamp((T - (t1 - 0.18)) / 0.18)));
  const blur = (1 - k) * 18;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(calc(-50% + ${y}px)) scale(${s})`, textAlign: 'center', opacity: o, filter: `blur(${blur}px)`}}>
      <span style={{fontFamily: FONT, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 0.92, color, letterSpacing: ls, textTransform: 'uppercase', textShadow: '0 10px 40px rgba(0,0,0,0.55)', WebkitTextStroke: stroke ? `${size * 0.012}px rgba(255,255,255,0.9)` : undefined, whiteSpace: 'pre-line'}}>
        {text}
      </span>
    </div>
  );
};

/** letra del jingle palabra por palabra (karaoke sobrio) */
type Line = {t0: number; t1: number; w: [number, string][]};
export const Caption: React.FC<{T: number; line: Line; next?: number}> = ({T, line, next}) => {
  const {V, u, W} = useLayout();
  const a = line.w[0][0] - 0.35;
  const b = Math.min(line.t1 + 1.1, next !== undefined ? next - 0.15 : Infinity);
  if (T < a || T > b) return null;
  const o = Math.min(easeOut(clamp((T - a) / 0.3)), 1 - easeIn(clamp((T - (b - 0.3)) / 0.3)));
  return (
    <div style={{position: 'absolute', left: V ? 70 * u : 0, right: V ? 70 * u : 0, bottom: V ? 360 * u : 72 * u, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 14}px)`}}>
      <span style={{fontFamily: FONT, fontWeight: 600, fontSize: (V ? 60 : 50) * u, lineHeight: 1.18, letterSpacing: 0.5 * u, textShadow: '0 2px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', maxWidth: W}}>
        {line.w.map(([tw, word], i) => {
          const on = clamp((T - tw + 0.06) / 0.16);
          const cur = T >= tw - 0.06 && (i === line.w.length - 1 ? T < tw + 0.6 : T < line.w[i + 1][0] - 0.06);
          return (
            <span key={i} style={{color: cur ? K.yel : `rgba(244,246,250,${0.42 + 0.58 * on})`, transition: 'none'}}>
              {word}
              {i < line.w.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </span>
    </div>
  );
};

/** placa con dato verificable */
export const FactCard: React.FC<{T: number; t0: number; t1: number; date: string; text: string; src?: string}> = ({T, t0, t1, date, text, src}) => {
  const {V, u} = useLayout();
  if (T < t0 || T > t1) return null;
  const o = win(T, t0, t1, 0.45, 0.35);
  const x = (1 - easeOut(clamp((T - t0) / 0.55))) * -60;
  const bar = easeOut(clamp((T - t0 - 0.1) / 0.5));
  return (
    <div style={{position: 'absolute', left: V ? 60 * u : 110 * u, right: V ? 60 * u : undefined, top: V ? 1080 * u : undefined, bottom: V ? undefined : 200 * u, maxWidth: V ? undefined : 820 * u, opacity: o, transform: `translateX(${x}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 8 * u, background: K.cel, transformOrigin: 'top', transform: `scaleY(${bar})`}} />
      <div style={{paddingLeft: 34 * u}}>
        <div style={{display: 'inline-block', background: K.cel, color: K.navy, fontFamily: FONT, fontWeight: 800, fontSize: 30 * u, letterSpacing: 3 * u, padding: `${4 * u}px ${14 * u}px`, marginBottom: 14 * u}}>{date}</div>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: (V ? 58 : 52) * u, lineHeight: 1.08, color: K.white, textShadow: '0 4px 24px rgba(0,0,0,0.7)'}}>{text}</div>
        {src ? <div style={{marginTop: 12 * u, fontFamily: FONT, fontWeight: 400, fontSize: 24 * u, color: 'rgba(244,246,250,0.6)', letterSpacing: 1 * u}}>{src}</div> : null}
      </div>
    </div>
  );
};

/** sello "VETO" */
export const Stamp: React.FC<{T: number; t0: number; t1: number; x?: number; y?: number; size?: number; rot?: number; text?: string}> = ({T, t0, t1, x = 0, y = 0, size = 150, rot = -9, text = 'VETO'}) => {
  if (T < t0 || T > t1) return null;
  const k = clamp((T - t0) / 0.16);
  const s = 2.3 - 1.3 * easeIn(k);
  const o = Math.min(k * 2, 1 - easeIn(clamp((T - (t1 - 0.25)) / 0.25)));
  return (
    <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg) scale(${s})`, opacity: o}}>
      <div style={{filter: 'url(#rough)', border: `${size * 0.07}px solid ${K.red}`, outline: `${size * 0.025}px solid ${K.red}`, outlineOffset: size * 0.06, padding: `${size * 0.02}px ${size * 0.2}px`, color: K.red, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: size * 0.06, mixBlendMode: 'screen'}}>
        {text}
      </div>
    </div>
  );
};

/* ---------------- dibujos de línea ---------------- */
const Draw: React.FC<{d: string; p: number; w?: number; c?: string}> = ({d, p, w = 7, c = K.white}) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
);
export const Wheelchair: React.FC<{T: number; t0: number; size: number; c?: string}> = ({T, t0, size, c = K.white}) => {
  const p = (i: number, d = 0.9) => easeInOut(clamp((T - t0 - i * 0.15) / d));
  return (
    <svg viewBox="-150 -230 380 420" width={size * (380 / 420)} height={size} style={{overflow: 'visible'}}>
      <Draw c={c} p={p(0, 1.2)} d="M 0,60 m -115,0 a 115,115 0 1,0 230,0 a 115,115 0 1,0 -230,0" />
      <Draw c={c} p={p(1)} d="M 0,60 m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0" />
      <Draw c={c} p={p(2)} d="M -95,-175 L -62,-175 L -40,20 L 130,20 L 170,140" />
      <Draw c={c} p={p(3)} d="M 170,140 m -24,0 a 24,24 0 1,0 48,0 a 24,24 0 1,0 -48,0" />
      <Draw c={c} p={p(4)} d="M 110,20 L 150,80 L 205,80" />
      <Draw c={c} p={p(5)} d="M -46,-60 L 90,-60" />
    </svg>
  );
};
export const Aula: React.FC<{T: number; t0: number; size: number}> = ({T, t0, size}) => {
  const p = (i: number, d = 0.8) => easeInOut(clamp((T - t0 - i * 0.14) / d));
  const txt = easeOut(clamp((T - t0 - 0.7) / 0.6));
  return (
    <svg viewBox="-330 -210 660 470" width={size * (660 / 470)} height={size} style={{overflow: 'visible'}}>
      <Draw p={p(0, 1.1)} d="M -300,-180 L 300,-180 L 300,140 L -300,140 Z" />
      <Draw p={p(1)} d="M -320,140 L 320,140" w={10} />
      <Draw p={p(2)} d="M -60,140 L -120,240 M 60,140 L 120,240" />
      <text x={0} y={-60} textAnchor="middle" fill={K.white} opacity={txt} fontFamily='"Permanent Marker", cursive' fontSize={58}>UNIVERSIDAD</text>
      <text x={0} y={20} textAnchor="middle" fill={K.white} opacity={txt} fontFamily='"Permanent Marker", cursive' fontSize={58}>PÚBLICA</text>
      <Draw p={p(4)} c={K.cel2} d="M -170,70 Q 0,95 170,62" w={6} />
    </svg>
  );
};

/* ---------------- transiciones ---------------- */
/** barrido de bandas diagonales con los colores de la marca; cubre el corte en `at` */
export const BandWipe: React.FC<{T: number; at: number; dur?: number; colors?: string[]}> = ({T, at, dur = 0.5, colors = [K.cel, K.azul, K.white]}) => {
  const a = at - dur / 2;
  if (T < a || T > a + dur) return null;
  const k = (T - a) / dur;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {colors.map((c, i) => {
        const kk = clamp(k * 1.25 - i * 0.12);
        const x = -160 + 320 * easeInOut(kk);
        return <div key={i} style={{position: 'absolute', left: `${x - 40}%`, top: '-30%', width: '90%', height: '160%', background: c, transform: 'skewX(-18deg)', borderRadius: 60}} />;
      })}
    </AbsoluteFill>
  );
};
/** destello de luz (fuga de lente) */
export const Leak: React.FC<{T: number; at: number; dur?: number; color?: string; x?: string; y?: string; peak?: number}> = ({T, at, dur = 0.9, color = '255,244,214', x = '50%', y = '60%', peak = 0.9}) => {
  if (T < at - 0.1 || T > at + dur) return null;
  const o = peak * Math.min(clamp((T - at + 0.1) / 0.18), 1 - easeIn(clamp((T - at) / dur)));
  return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: o, background: `radial-gradient(ellipse at ${x} ${y}, rgba(${color},1) 0%, rgba(${color},0.55) 25%, rgba(${color},0) 65%)`}} />;
};
export const Flash: React.FC<{T: number; at: number; dur?: number; c?: string; peak?: number}> = ({T, at, dur = 0.22, c = '#ffffff', peak = 0.85}) => {
  if (T < at || T > at + dur) return null;
  return <AbsoluteFill style={{background: c, opacity: peak * (1 - (T - at) / dur), pointerEvents: 'none'}} />;
};
export const Vignette: React.FC<{o?: number}> = ({o = 0.7}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${o}) 100%)`}} />
);
/** papel picado de colores de la marca */
export const Confetti: React.FC<{T: number; t0: number; t1: number; n?: number}> = ({T, t0, t1, n = 90}) => {
  const {W, H} = useLayout();
  if (T < t0 || T > t1) return null;
  const cols = [K.cel, K.white, K.yel, K.pink, K.azul];
  const o = 1 - easeIn(clamp((T - (t1 - 0.5)) / 0.5));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
      {Array.from({length: n}).map((_, i) => {
        const dt = T - t0 - rnd(i) * 0.5;
        if (dt < 0) return null;
        const x = rnd(i + 11) * W + Math.sin(dt * (1 + rnd(i + 3) * 2) + i) * 40;
        const y = -60 + dt * (260 + rnd(i + 7) * 420);
        const r = dt * (200 + rnd(i + 5) * 500) + i * 37;
        return <div key={i} style={{position: 'absolute', left: x, top: y % (H + 120), width: 14 + rnd(i + 9) * 16, height: 7 + rnd(i + 2) * 7, background: cols[i % cols.length], transform: `rotate(${r}deg) rotateX(${r * 1.3}deg)`, opacity: 0.95}} />;
      })}
    </AbsoluteFill>
  );
};
