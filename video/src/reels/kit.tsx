/* Kit de los reels verticales v2 (1080x1920): fondos vivos, cámara, transiciones apiladas,
   tarjetas y texto en 3D, prismas, subtítulos karaoke y placa final. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import {Grain} from '../components/base';

export const W = 1080;
export const H = 1920;

/* ---------- tiempos a partir de las palabras ---------- */
export type Word = {w: string; s: number; e: number};
export type TL = {fps: number; segs: Record<string, {at: number; dur: number}>; endCard: number; total: number};
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const makeCue = (tl: TL, WS: Record<string, Word[]>) => {
  const c = (seg: string, phrase: string, n = 0, which: 's' | 'e' = 's') => {
    const list = WS[seg];
    const tg = phrase.split(/\s+/).map(norm);
    let found = -1;
    for (let i = 0; i <= list.length - tg.length; i++) {
      if (tg.every((x, k) => norm(list[i + k].w) === x)) {
        found++;
        if (found === n) return tl.segs[seg].at + (which === 's' ? list[i].s : list[i + tg.length - 1].e);
      }
    }
    throw new Error(`cue no encontrado: ${seg} "${phrase}"`);
  };
  const at = (seg: string) => tl.segs[seg].at;
  const end = (seg: string) => tl.segs[seg].at + tl.segs[seg].dur;
  return {c, at, end};
};

/* ---------- temas de color por escena ---------- */
export type Theme = 'paper' | 'ink' | 'yellow' | 'celeste' | 'navy' | 'red';
export const THEMES: Record<Theme, {bg: string; bg2: string; fg: string; sub: string; blob: string; dots: string}> = {
  paper: {bg: '#EFE8DC', bg2: '#E4DAC8', fg: C.ink, sub: 'rgba(22,21,19,0.55)', blob: 'rgba(255,204,51,0.35)', dots: 'rgba(22,21,19,0.10)'},
  ink: {bg: '#141417', bg2: '#1F1F25', fg: C.white, sub: 'rgba(255,255,255,0.6)', blob: 'rgba(116,172,223,0.22)', dots: 'rgba(255,255,255,0.07)'},
  navy: {bg: '#0B1B33', bg2: '#12294A', fg: C.white, sub: 'rgba(255,255,255,0.62)', blob: 'rgba(116,172,223,0.30)', dots: 'rgba(255,255,255,0.08)'},
  yellow: {bg: '#FFCC33', bg2: '#F4BA1C', fg: C.ink, sub: 'rgba(22,21,19,0.6)', blob: 'rgba(255,255,255,0.35)', dots: 'rgba(22,21,19,0.12)'},
  celeste: {bg: '#8EC0EA', bg2: '#6FA8DA', fg: C.ink, sub: 'rgba(22,21,19,0.6)', blob: 'rgba(255,255,255,0.35)', dots: 'rgba(22,21,19,0.10)'},
  red: {bg: '#E23B2E', bg2: '#C62D22', fg: C.white, sub: 'rgba(255,255,255,0.7)', blob: 'rgba(255,204,51,0.30)', dots: 'rgba(255,255,255,0.10)'},
};

/* fondo vivo: gradiente, manchas que derivan, grilla de puntos con paralaje y viñeta */
export const LiveBG: React.FC<{theme: Theme; t: number}> = ({theme, t}) => {
  const th = THEMES[theme];
  const b1x = 540 + Math.sin(t * 0.23) * 260, b1y = 520 + Math.cos(t * 0.17) * 200;
  const b2x = 480 + Math.cos(t * 0.19 + 2) * 300, b2y = 1450 + Math.sin(t * 0.21 + 1) * 180;
  const off = (t * 14) % 60;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${th.bg} 0%, ${th.bg2} 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: b1x - 520, top: b1y - 520, width: 1040, height: 1040, borderRadius: '50%', background: `radial-gradient(circle, ${th.blob} 0%, rgba(0,0,0,0) 65%)`}} />
      <div style={{position: 'absolute', left: b2x - 600, top: b2y - 600, width: 1200, height: 1200, borderRadius: '50%', background: `radial-gradient(circle, ${th.blob} 0%, rgba(0,0,0,0) 62%)`, opacity: 0.8}} />
      <div
        style={{
          position: 'absolute', left: -60, top: -60 + off, width: W + 120, height: H + 180,
          backgroundImage: `radial-gradient(${th.dots} 2.4px, rgba(0,0,0,0) 2.6px)`, backgroundSize: '60px 60px',
        }}
      />
      {theme === 'paper' || theme === 'yellow' ? (
        <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.45}} />
      ) : null}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.28) 100%)'}} />
    </AbsoluteFill>
  );
};

/* escenas: [t0, tema]; devuelve el tema activo en t (el cambio ocurre en el medio de la transición) */
export type SceneDef = {t: number; theme: Theme; wipe?: WipeKind};
export const themeAt = (scenes: SceneDef[], t: number) => {
  let th = scenes[0].theme;
  for (const s of scenes) if (t >= s.t) th = s.theme;
  return th;
};

/* ---------- transiciones ---------- */
export type WipeKind = 'stack' | 'iris' | 'blinds' | 'slab';
const WD = 0.62;
export const Transition: React.FC<{t: number; at: number; kind?: WipeKind; to: Theme; from?: Theme; dir?: 1 | -1; ox?: number; oy?: number}> = ({
  t, at, kind = 'stack', to, from = 'ink', dir = 1, ox = 540, oy = 960,
}) => {
  const k = (t - (at - WD / 2)) / WD;
  if (k <= 0 || k >= 1) return null;
  const colTo = THEMES[to].bg;
  if (kind === 'iris') {
    // círculo del color nuevo que se abre, con un anillo amarillo por delante
    const r = easeInOut(clamp(k * 1.6)) * 2300;
    const r2 = easeInOut(clamp(k * 1.6 - 0.12)) * 2300;
    const fade = 1 - clamp((k - 0.62) / 0.38);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', opacity: fade}}>
        <AbsoluteFill style={{background: C.yellow, clipPath: `circle(${r}px at ${ox}px ${oy}px)`}} />
        <AbsoluteFill style={{background: colTo, clipPath: `circle(${r2}px at ${ox}px ${oy}px)`}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'blinds') {
    const n = 8;
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {Array.from({length: n}).map((_, i) => {
          const kk = clamp(k * 1.5 - (i / n) * 0.5);
          const cover = kk < 0.5 ? easeOut(kk * 2) : 1 - easeIn((kk - 0.5) * 2);
          return (
            <div key={i} style={{position: 'absolute', left: (W / n) * i - 1, width: W / n + 2, top: 0, height: H, background: i % 2 ? C.yellow : colTo, transformOrigin: kk < 0.5 ? 'top' : 'bottom', transform: `scaleY(${cover})`}} />
          );
        })}
      </AbsoluteFill>
    );
  }
  if (kind === 'slab') {
    // placa diagonal gruesa con el título de la escena siguiente por detrás
    const x = k < 0.5 ? -130 + easeOut(k * 2) * 130 : easeIn((k - 0.5) * 2) * 130;
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <AbsoluteFill style={{background: C.ink, transform: `translateY(${(x - 8 * dir) * dir}%) skewY(${-12 * dir}deg) scaleY(1.4)`}} />
        <AbsoluteFill style={{background: colTo, transform: `translateY(${x * dir}%) skewY(${-12 * dir}deg) scaleY(1.4)`}} />
      </AbsoluteFill>
    );
  }
  // stack: tres paneles diagonales escalonados (amarillo, tinta, color nuevo)
  const cols = [C.yellow, from === 'ink' || from === 'navy' ? C.white : C.ink, colTo];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cols.map((col, i) => {
        const kk = clamp((k - i * 0.07) / 0.86);
        const x = kk < 0.5 ? -140 + easeOut(kk * 2) * 140 : easeIn((kk - 0.5) * 2) * 140;
        return <AbsoluteFill key={i} style={{background: col, transform: `translateX(${x * dir}%) skewX(${-14 * dir}deg) scaleX(1.5)`}} />;
      })}
    </AbsoluteFill>
  );
};

/* ---------- cámara: zoom lento continuo + golpes de zoom en momentos clave ---------- */
export const Cam: React.FC<{t: number; punches?: number[]; children: React.ReactNode; drift?: number}> = ({t, punches = [], children, drift = 1}) => {
  let s = 1 + 0.018 * Math.sin(t * 0.21) * drift;
  for (const p of punches) {
    const d = t - p;
    if (d > -0.05 && d < 0.9) s += 0.05 * Math.exp(-d * 5.5) * clamp((d + 0.05) / 0.05);
  }
  const rz = Math.sin(t * 0.13) * 0.35 * drift;
  const x = Math.sin(t * 0.11) * 8 * drift, y = Math.cos(t * 0.09) * 10 * drift;
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${rz}deg)`}}>{children}</AbsoluteFill>;
};

/* ---------- bloque que aparece/desaparece con profundidad ---------- */
type BK = 'rise' | 'flip' | 'zoom' | 'left' | 'right' | 'drop' | 'fade' | 'swing';
export const B: React.FC<{t: number; t0: number; t1?: number; kind?: BK; children: React.ReactNode; style?: React.CSSProperties; din?: number}> = ({
  t, t0, t1 = Infinity, kind = 'rise', children, style, din = 0.5,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = easeOut(clamp((t - t0) / din));
  const b = t1 === Infinity ? 1 : 1 - easeIn(clamp((t - (t1 - 0.28)) / 0.28));
  const sp = pop(t, t0, 0.85);
  let tr = '';
  if (kind === 'rise') tr = `translateY(${(1 - a) * 120 - (1 - b) * 60}px) rotateX(${(1 - a) * 35}deg)`;
  if (kind === 'flip') tr = `rotateY(${(1 - sp) * -80}deg) translateZ(${(1 - a) * -300}px)`;
  if (kind === 'swing') tr = `rotateX(${(1 - sp) * 80}deg)`;
  if (kind === 'zoom') tr = `translateZ(${(1 - a) * 500 - (1 - b) * 300}px)`;
  if (kind === 'left') tr = `translateX(${(1 - a) * -700}px) rotateY(${(1 - a) * 40}deg)`;
  if (kind === 'right') tr = `translateX(${(1 - a) * 700}px) rotateY(${(1 - a) * -40}deg)`;
  if (kind === 'drop') tr = `translateY(${(1 - sp) * -900}px) rotateZ(${(1 - sp) * 14}deg)`;
  const o = kind === 'fade' ? Math.min(a, b) : Math.min(clamp((t - t0) / 0.14), b);
  return (
    <AbsoluteFill style={{perspective: 1400, perspectiveOrigin: '50% 45%'}}>
      <AbsoluteFill style={{transform: tr, opacity: o, transformStyle: 'preserve-3d', transformOrigin: kind === 'swing' ? '50% 0%' : '50% 50%', ...style}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* posición absoluta centrada */
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; w?: number}> = ({x, y, children, style, w}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', width: w, ...style}}>{children}</div>
);

/* ---------- texto extruido 3D ---------- */
export const Ext: React.FC<{
  children: React.ReactNode; size?: number; color?: string; side?: string; depth?: number; font?: string; style?: React.CSSProperties; t?: number; tilt?: boolean; ls?: number;
}> = ({children, size = 140, color = C.ink, side = '#00000055', depth = 10, font = F.head, style, t = 0, tilt = true, ls = 1}) => {
  const sh: string[] = [];
  for (let i = 1; i <= depth; i++) sh.push(`${i * 0.9}px ${i * 1.1}px 0 ${side}`);
  sh.push(`${depth + 6}px ${depth + 14}px 26px rgba(0,0,0,0.30)`);
  const ry = tilt ? Math.sin(t * 0.7) * 6 : 0, rx = tilt ? Math.cos(t * 0.6) * 4 : 0;
  return (
    <div style={{perspective: 1200, display: 'inline-block'}}>
      <div
        style={{
          fontFamily: font, fontSize: size, lineHeight: 0.98, color, textTransform: 'uppercase', letterSpacing: ls, textShadow: sh.join(','),
          transform: `rotateY(${ry}deg) rotateX(${rx}deg)`, textAlign: 'center', ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- tarjeta 3D que flota ---------- */
export const Card3D: React.FC<{
  children: React.ReactNode; t: number; w?: number; h?: number; bg?: string; border?: string; style?: React.CSSProperties; seed?: number; sway?: number; r?: number; pad?: number | string;
}> = ({children, t, w, h, bg = C.white, border = C.ink, style, seed = 0, sway = 1, r = 26, pad = 28}) => {
  const ry = Math.sin(t * 0.8 + seed) * 7 * sway, rx = Math.cos(t * 0.65 + seed * 2) * 5 * sway;
  const y = Math.sin(t * 1.1 + seed) * 6 * sway;
  return (
    <div style={{perspective: 1300, display: 'inline-block'}}>
      <div
        style={{
          width: w, height: h, background: bg, border: `6px solid ${border}`, borderRadius: r, padding: pad, boxSizing: 'border-box',
          boxShadow: `${10 - ry}px ${14 + rx}px 0 ${border}, 0 40px 60px rgba(0,0,0,0.28)`, transform: `translateY(${y}px) rotateY(${ry}deg) rotateX(${rx}deg)`,
          position: 'relative', ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- prisma 3D (barra con cara frontal, lateral y superior) ---------- */
export const Prism: React.FC<{w: number; h: number; d?: number; color: string; side?: string; top?: string; label?: React.ReactNode; stroke?: string}> = ({
  w, h, d = 46, color, side, top, label, stroke = C.ink,
}) => {
  const sd = side ?? shade(color, -0.28), tp = top ?? shade(color, 0.22);
  return (
    <div style={{position: 'relative', width: w + d, height: h + d * 0.6}}>
      <svg width={w + d + 8} height={h + d * 0.6 + 8} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polygon points={`${w},${d * 0.6} ${w + d},0 ${w + d},${h} ${w},${h + d * 0.6}`} fill={sd} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={`0,${d * 0.6} ${d},0 ${w + d},0 ${w},${d * 0.6}`} fill={tp} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
        <rect x={0} y={d * 0.6} width={w} height={h} fill={color} stroke={stroke} strokeWidth={5} />
      </svg>
      {label ? <div style={{position: 'absolute', left: 0, top: d * 0.6, width: w, height: h, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 16}}>{label}</div> : null}
    </div>
  );
};

/* aclara (+) u oscurece (−) un color hex */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(clamp(k > 0 ? v + (255 - v) * k : v * (1 + k), 0, 255));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `rgb(${r},${g},${b})`;
};

/* ---------- foto de archivo en tarjeta 3D con Ken Burns ---------- */
export const Photo3D: React.FC<{
  src: string; t: number; t0: number; w: number; h: number; credit?: string; rot?: number; focus?: string; bw?: boolean; zoom?: [number, number]; span?: number; tint?: string; seed?: number;
}> = ({src, t, t0, w, h, credit, rot = 0, focus = '50% 50%', bw, zoom = [1.04, 1.16], span = 6, tint, seed = 1}) => {
  const zk = clamp((t - t0) / span);
  const sc = zoom[0] + (zoom[1] - zoom[0]) * zk;
  return (
    <div style={{transform: `rotate(${rot}deg)`}}>
      <Card3D t={t} w={w} h={h} pad={12} r={12} seed={seed} bg="#FBF8F2" sway={0.8}>
        <div style={{position: 'relative', width: '100%', height: credit ? 'calc(100% - 26px)' : '100%', overflow: 'hidden', borderRadius: 4, background: '#222'}}>
          <Img
            src={staticFile('reels/' + src)}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: bw ? 'grayscale(1) contrast(1.15)' : 'contrast(1.06) saturate(0.95)'}}
          />
          {tint ? <div style={{position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply'}} /> : null}
          <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 50px rgba(0,0,0,0.25)'}} />
        </div>
        {credit ? <div style={{position: 'absolute', right: 14, bottom: 6, fontFamily: F.body, fontSize: 17, color: '#6f6a62', fontWeight: 600}}>{credit}</div> : null}
      </Card3D>
    </div>
  );
};

/* ---------- foto o video a pantalla completa (duotono opcional) ---------- */
export const FullBleed: React.FC<{src: string; t: number; t0: number; span?: number; video?: boolean; startFrom?: number; dim?: number; duo?: string; focus?: string; zoom?: [number, number]; credit?: string}> = ({
  src, t, t0, span = 6, video, startFrom = 0, dim = 0.35, duo, focus = '50% 50%', zoom = [1.05, 1.18], credit,
}) => {
  const zk = clamp((t - t0) / span);
  const sc = zoom[0] + (zoom[1] - zoom[0]) * easeInOut(zk);
  const st: React.CSSProperties = {position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, filter: duo ? 'grayscale(1) contrast(1.2)' : 'contrast(1.05)'};
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      {video ? (
        <Sequence from={Math.round(t0 * 30)} layout="none">
          <OffthreadVideo src={staticFile('reels/' + src)} startFrom={Math.round(startFrom * 30)} muted style={st} />
        </Sequence>
      ) : (
        <Img src={staticFile('reels/' + src)} style={st} />
      )}
      {duo ? <AbsoluteFill style={{background: duo, mixBlendMode: 'multiply'}} /> : null}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim + 0.2}) 0%, rgba(0,0,0,${dim}) 40%, rgba(0,0,0,${dim + 0.25}) 100%)`}} />
      {credit ? <div style={{position: 'absolute', right: 40, top: 300, fontFamily: F.body, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1}}>{credit}</div> : null}
    </AbsoluteFill>
  );
};

/* ---------- rótulos ---------- */
export const Kicker: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties; t?: number; t0?: number}> = ({children, color = C.ink, style, t = 1, t0 = 0}) => {
  const p = prog(t, t0, 0.5);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', fontFamily: F.body, fontWeight: 900, fontSize: 36, letterSpacing: 7, color, textTransform: 'uppercase', opacity: p, ...style}}>
      <span style={{width: 60 * p, height: 6, background: C.yellow, display: 'inline-block', borderRadius: 3}} />
      {children}
    </div>
  );
};

export const Src: React.FC<{text: string; y?: number; color?: string; t: number; t0: number}> = ({text, y = 1215, color = 'rgba(22,21,19,0.55)', t, t0}) => (
  <div style={{position: 'absolute', left: 70, right: 70, top: y, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 22, letterSpacing: 1.5, color, textTransform: 'uppercase', opacity: prog(t, t0, 0.6)}}>
    {text}
  </div>
);

/* etiqueta pastilla */
export const Pill: React.FC<{children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = C.ink, fg = C.white, size = 40, style}) => (
  <span style={{display: 'inline-block', whiteSpace: 'nowrap', background: bg, color: fg, fontFamily: F.head, fontSize: size, padding: `${size * 0.18}px ${size * 0.5}px ${size * 0.12}px`, borderRadius: size, letterSpacing: 1, ...style}}>{children}</span>
);

/* número que cuenta */
export const Num: React.FC<{t: number; t0: number; dur?: number; from?: number; to: number; dec?: number; pre?: string; suf?: string}> = ({t, t0, dur = 0.9, from = 0, to, dec = 0, pre = '', suf = ''}) => {
  const p = clamp((t - t0) / dur);
  const v = from + (to - from) * (1 - Math.pow(1 - p, 3));
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{pre}{fmt(v, dec)}{suf}</span>;
};

/* sello que cae con golpe */
export const Slam: React.FC<{t: number; t0: number; children: React.ReactNode; rot?: number; color?: string; size?: number; bg?: string}> = ({t, t0, children, rot = -8, color = C.red, size = 110, bg = 'transparent'}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.18);
  const s = 2.4 - 1.4 * easeIn(k) + (k >= 1 ? Math.exp(-(t - t0 - 0.18) * 12) * 0.07 * Math.sin((t - t0) * 55) : 0);
  return (
    <div style={{display: 'inline-block', transform: `rotate(${rot}deg) scale(${s})`, opacity: clamp(k * 3)}}>
      <div style={{border: `${size / 11}px solid ${color}`, color, background: bg, padding: `${size * 0.06}px ${size * 0.28}px`, fontFamily: F.head, fontSize: size, lineHeight: 1.05, borderRadius: size * 0.1, filter: 'url(#rough)', whiteSpace: 'nowrap', textTransform: 'uppercase'}}>
        {children}
      </div>
    </div>
  );
};

/* partículas (confeti de papel) que explotan desde un punto */
export const Burst: React.FC<{t: number; t0: number; x: number; y: number; n?: number; colors?: string[]; spread?: number}> = ({t, t0, x, y, n = 22, colors = [C.yellow, C.ink, C.red, C.celeste], spread = 520}) => {
  const d = t - t0;
  if (d < 0 || d > 1.6) return null;
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const a = rnd(i + 3) * Math.PI * 2, v = (0.4 + rnd(i + 9) * 0.6) * spread;
        const px = x + Math.cos(a) * v * easeOut(clamp(d / 0.9)), py = y + Math.sin(a) * v * easeOut(clamp(d / 0.9)) + d * d * 380;
        return (
          <div key={i} style={{position: 'absolute', left: px, top: py, width: 18, height: 30, background: colors[i % colors.length], transform: `rotate(${d * 600 * (rnd(i) - 0.5)}deg) rotateX(${d * 700}deg)`, opacity: 1 - clamp((d - 1.1) / 0.5), borderRadius: 3}} />
        );
      })}
    </>
  );
};

/* ---------- barra de progreso + etiqueta superior ---------- */
export const TopBar: React.FC<{t: number; total: number; label: string; theme: Theme; marks?: number[]}> = ({t, total, label, theme, marks = []}) => {
  const dark = THEMES[theme].fg === C.white;
  const col = dark ? C.white : C.ink;
  return (
    <>
      <div style={{position: 'absolute', left: 70, right: 70, top: 150, height: 8, borderRadius: 4, background: dark ? 'rgba(255,255,255,0.18)' : 'rgba(22,21,19,0.14)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${clamp(t / total) * 100}%`, background: C.yellow, borderRadius: 4, boxShadow: `0 0 0 2px ${dark ? 'rgba(0,0,0,0)' : C.ink}`}} />
        {marks.map((m, i) => (
          <div key={i} style={{position: 'absolute', left: `${(m / total) * 100}%`, top: -5, width: 6, height: 18, borderRadius: 3, background: col, opacity: 0.5}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 186, textAlign: 'center'}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 900, fontSize: 28, letterSpacing: 6, color: col}}>
          <span style={{width: 18, height: 18, background: C.yellow, borderRadius: 4, display: 'inline-block', border: dark ? 'none' : `3px solid ${C.ink}`}} />
          {label}
        </span>
      </div>
    </>
  );
};

/* ---------- subtítulos karaoke ---------- */
/* une números deletreados en una sola palabra con cifras (conserva tiempos y puntuación final) */
export const mergeNums = (ws: Word[], nums: [string, string][]) => {
  const key = (w: string) => norm(w);
  const out: Word[] = [];
  let i = 0;
  while (i < ws.length) {
    let hit = false;
    for (const [a, b] of nums) {
      const toks = a.split(/\s+/).map(key), n = toks.length;
      if (i + n <= ws.length && toks.every((x, k) => key(ws[i + k].w) === x)) {
        const trail = (ws[i + n - 1].w.match(/[.,:;!?…»]*$/) || [''])[0];
        out.push({w: b + trail, s: ws[i].s, e: ws[i + n - 1].e});
        i += n; hit = true; break;
      }
    }
    if (!hit) out.push(ws[i++]);
  }
  return out;
};

export const buildChunks = (tl: TL, WS: Record<string, Word[]>, nums: [string, string][] = []) => {
  const list: Word[] = [];
  for (const k of Object.keys(tl.segs).sort()) for (const w of mergeNums(WS[k], nums)) list.push({w: w.w, s: tl.segs[k].at + w.s, e: tl.segs[k].at + w.e});
  const out: {words: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    const punct = /[.,:?!…]$/.test(w.w);
    if (cur.length >= 3 || punct || txt.length > 14 || i === list.length - 1) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((x, i) => (x.e = i < out.length - 1 ? Math.min(out[i + 1].s, x.e + 0.35) : x.e + 0.3));
  return out;
};

const OUTLINE = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `${Math.cos((a * Math.PI) / 180) * 6}px ${Math.sin((a * Math.PI) / 180) * 6}px 0 #161513`).join(',') + ', 0 16px 26px rgba(0,0,0,0.45)';

/* reemplazos para mostrar cifras en vez de números deletreados */
export const Captions: React.FC<{t: number; chunks: ReturnType<typeof buildChunks>; hide?: [number, number][]; y?: number; fix?: (w: string) => string}> = ({t, chunks, hide = [], y = 1330, fix = (w) => w}) => {
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const ch = chunks.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!ch) return null;
  const k = pop(t, ch.s - 0.05, 1.5);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', perspective: 900}}>
      <div style={{transform: `rotateX(${(1 - k) * 60}deg) scale(${0.86 + 0.14 * k})`, transformOrigin: '50% 100%'}}>
        {ch.words.map((w, i) => {
          const cur = ch.words.reduce((a, x, j) => (t >= x.s - 0.03 ? j : a), -1);
          const on = i === cur && t < w.e + 0.35;
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', margin: '0 10px'}}>
              {on ? <span style={{position: 'absolute', left: -12, right: -12, top: 6, bottom: 0, background: C.yellow, border: `5px solid ${C.ink}`, borderRadius: 14, transform: `rotate(-2deg) scale(${0.9 + 0.1 * pop(t, w.s - 0.03, 2)})`, boxShadow: `6px 6px 0 ${C.ink}`}} /> : null}
              <span style={{position: 'relative', fontFamily: F.head, fontSize: 96, lineHeight: 1.18, textTransform: 'uppercase', color: on ? C.ink : C.white, textShadow: on ? 'none' : OUTLINE}}>
                {fix(w.w.replace(/[«»]/g, ''))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- placa final ---------- */
export const EndCard: React.FC<{t: number; E: number; title: React.ReactNode; sub: string}> = ({t, E, title, sub}) => {
  if (t < E - 0.05) return null;
  const d = t - E;
  return (
    <AbsoluteFill style={{clipPath: `circle(${easeInOut(clamp(d / 0.55)) * 150}% at 50% 45%)`}}>
      <LiveBG theme="ink" t={t} />
      <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 220}}>
        <div style={{transform: `scale(${pop(t, E + 0.15)}) rotateY(${Math.sin(d * 1.4) * 10}deg)`, perspective: 1000}}>
          <Img src={staticFile('brand/logo_transparente.png')} style={{width: 380, height: 380, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'}} />
        </div>
        <div style={{fontFamily: F.head, fontSize: 150, color: C.white, letterSpacing: 6, marginTop: 10, opacity: prog(t, E + 0.35, 0.4), transform: `translateY(${(1 - prog(t, E + 0.35, 0.5)) * 40}px)`}}>CONTEXTO</div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 38, color: 'rgba(255,255,255,0.75)', letterSpacing: 3, marginTop: 6, opacity: prog(t, E + 0.6, 0.4), textAlign: 'center', padding: '0 80px'}}>{sub}</div>
        <div style={{marginTop: 60, transform: `scale(${pop(t, E + 1.0) * (1 + Math.sin(d * 6) * 0.03)})`}}>
          <span style={{display: 'inline-block', background: C.yellow, color: C.ink, border: `6px solid ${C.white}`, fontFamily: F.head, fontSize: 64, padding: '16px 44px', borderRadius: 18}}>SEGUINOS ▸</span>
        </div>
        <div style={{marginTop: 50, fontFamily: F.hand, fontSize: 52, color: C.yellow, opacity: prog(t, E + 1.5, 0.4), transform: 'rotate(-3deg)'}}>{title}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- íconos simples (trazo grueso) ---------- */
type IP = {size?: number; color?: string; stroke?: string};
export const Ico = {
  person: ({size = 60, color = C.ink}: IP) => (
    <svg width={size} height={size * 1.6} viewBox="0 0 60 96">
      <circle cx="30" cy="18" r="15" fill={color} />
      <path d="M6 96 V58 Q6 38 30 38 Q54 38 54 58 V96 Z" fill={color} />
    </svg>
  ),
  bread: ({size = 140, color = '#E0A35A', stroke = C.ink}: IP) => (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <path d="M20 70 Q20 36 70 36 Q120 36 120 70 L112 70 L112 112 L28 112 L28 70 Z" fill={color} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
      <path d="M50 58 l10 12 M70 54 l10 12 M90 58 l10 12" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  shirt: ({size = 140, color = C.celeste, stroke = C.ink}: IP) => (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <path d="M48 24 L20 42 L32 66 L44 60 L44 118 L96 118 L96 60 L108 66 L120 42 L92 24 Q70 42 48 24 Z" fill={color} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
    </svg>
  ),
  bus: ({size = 140, color = C.yellow, stroke = C.ink}: IP) => (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <rect x="22" y="24" width="96" height="86" rx="16" fill={color} stroke={stroke} strokeWidth="7" />
      <rect x="34" y="38" width="72" height="30" rx="6" fill="#fff" stroke={stroke} strokeWidth="6" />
      <circle cx="44" cy="116" r="10" fill={stroke} />
      <circle cx="96" cy="116" r="10" fill={stroke} />
      <circle cx="40" cy="88" r="6" fill={stroke} />
      <circle cx="100" cy="88" r="6" fill={stroke} />
    </svg>
  ),
  health: ({size = 140, color = C.red, stroke = C.ink}: IP) => (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <path d="M52 20 H88 V52 H120 V88 H88 V120 H52 V88 H20 V52 H52 Z" fill={color} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
    </svg>
  ),
  house: ({size = 140, color = '#fff', stroke = C.ink}: IP) => (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <path d="M18 66 L70 22 L122 66 L110 66 L110 120 L30 120 L30 66 Z" fill={color} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
      <rect x="58" y="84" width="24" height="36" fill={C.yellow} stroke={stroke} strokeWidth="6" />
    </svg>
  ),
  check: ({size = 80, color = C.green}: IP) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="36" fill={color} stroke={C.ink} strokeWidth="5" />
      <path d="M22 41 L35 54 L59 28" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cross: ({size = 80, color = C.red}: IP) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="36" fill={color} stroke={C.ink} strokeWidth="5" />
      <path d="M26 26 L54 54 M54 26 L26 54" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
    </svg>
  ),
  eye: ({size = 200, t = 0}: IP & {t?: number}) => {
    const blink = Math.abs(Math.sin(t * 1.3)) > 0.97 ? 0.1 : 1;
    return (
      <svg width={size} height={size * 0.6} viewBox="0 0 200 120">
        <path d="M10 60 Q100 -10 190 60 Q100 130 10 60 Z" fill="#fff" stroke={C.ink} strokeWidth="9" transform={`translate(0 ${60 * (1 - blink)}) scale(1 ${blink})`} />
        <circle cx={100 + Math.sin(t * 2) * 14} cy="60" r={30 * blink} fill={C.ink} />
        <circle cx={108 + Math.sin(t * 2) * 14} cy="50" r={9 * blink} fill="#fff" />
      </svg>
    );
  },
  hourglass: ({size = 200, t = 0}: IP & {t?: number}) => {
    const k = (t * 0.25) % 1;
    return (
      <svg width={size * 0.7} height={size} viewBox="0 0 140 200">
        <rect x="14" y="6" width="112" height="16" rx="6" fill={C.ink} />
        <rect x="14" y="178" width="112" height="16" rx="6" fill={C.ink} />
        <path d="M26 22 H114 Q114 70 72 100 Q114 130 114 178 H26 Q26 130 68 100 Q26 70 26 22 Z" fill="#fff" stroke={C.ink} strokeWidth="7" />
        <path d={`M${40 + 26 * k} ${40 + 50 * k} H${100 - 26 * k} Q${96 - 20 * k} ${72} 72 98 Q${44 + 20 * k} 72 ${40 + 26 * k} ${40 + 50 * k} Z`} fill={C.yellow} />
        <path d={`M34 174 Q72 ${174 - 50 * k} 106 174 Z`} fill={C.yellow} />
        <rect x="70" y="98" width="4" height={70} fill={C.yellow} opacity={0.9} />
      </svg>
    );
  },
};

/* flecha 3D gruesa (arriba o abajo) */
export const Arrow3D: React.FC<{up?: boolean; color: string; size?: number}> = ({up = true, color, size = 260}) => {
  const d = 22;
  const pts = up ? '60,0 120,70 84,70 84,170 36,170 36,70 0,70' : '36,0 84,0 84,100 120,100 60,170 0,100 36,100';
  return (
    <svg width={size} height={size * 1.5} viewBox={`-10 -10 ${150 + d} ${200 + d}`}>
      <polygon points={pts} fill={shade(color, -0.4)} transform={`translate(${d * 0.6} ${d * 0.7})`} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <polygon points={pts} fill={color} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
};
