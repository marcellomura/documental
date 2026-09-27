/* "¿Por qué ver a Messi cuesta $3 millones?" — sistema visual (1920x1080, se renderiza x2 y se baja a 1080p).
   NOCHE DE ESTADIO: azul profundo, haces de luz, celeste y blanco de la camiseta, dorado para la plata
   y rojo para la reventa. Todo lo que es fondo es vectorial o foto de 3840 px, así queda nítido a cualquier escala. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import '../components/base'; // carga de fuentes

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const M = {
  night: '#050A17',
  night2: '#0B1430',
  night3: '#15224A',
  celeste: '#74B9F0',
  celesteHi: '#B6DCFF',
  celesteDeep: '#2F79C2',
  white: '#FFFFFF',
  cream: '#F4F1EA',
  ink: '#0B0D12',
  ink2: '#3A3F4B',
  gold: '#FFC83D',
  goldHi: '#FFE49A',
  red: '#FF3B4E',
  redDeep: '#B3122A',
  green: '#2BD98A',
  mute: '#8E9BB8',
  line: 'rgba(150,190,255,0.12)',
};
export const FONT = {head: F.head, body: F.body, mono: F.mono, black: F.black, serif: '"Playfair Display", Georgia, serif', hand: F.hand};

export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};
export const useF = () => useCurrentFrame();
export const img = (f: string) => staticFile('msi/' + f);

/* ---------- tiempos ---------- */
export type Word = {w: string; s: number; e: number};
export type TL = {fps: number; segs: Record<string, {at: number; dur: number}>; total: number};
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
    throw new Error(`cue no encontrado: ${seg} "${phrase}" #${n}`);
  };
  const at = (seg: string) => tl.segs[seg].at;
  const end = (seg: string) => tl.segs[seg].at + tl.segs[seg].dur;
  return {c, at, end};
};

/* =====================================================================
   FONDOS
   ===================================================================== */

/** haz de luz de reflector: cono con degradé, entra en pantalla con blend screen */
const Beam: React.FC<{x: number; y: number; ang: number; len?: number; w?: number; o?: number; color?: string}> = ({x, y, ang, len = 1900, w = 420, o = 0.35, color = '200,225,255'}) => (
  <div
    style={{
      position: 'absolute', left: x - w / 2, top: y, width: w, height: len, transformOrigin: '50% 0%', transform: `rotate(${ang}deg)`,
      background: `linear-gradient(180deg, rgba(${color},${o}) 0%, rgba(${color},${o * 0.35}) 45%, rgba(${color},0) 100%)`,
      clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
    }}
  />
);

/** noche de estadio: cielo profundo, reflectores que barren, grilla de puntos y bruma */
export const Night: React.FC<{t: number; hue?: string; beams?: number; dots?: number; glow?: string; children?: React.ReactNode; floor?: boolean}> = ({
  t, hue = M.night, beams = 1, dots = 1, glow = 'rgba(116,185,240,0.22)', children, floor = true,
}) => {
  const gx = 960 + Math.sin(t * 0.21) * 380, gy = 380 + Math.cos(t * 0.17) * 140;
  const sw = Math.sin(t * 0.35);
  return (
    <AbsoluteFill style={{background: hue, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 65% 60% at ${gx}px ${gy}px, ${glow} 0%, rgba(0,0,0,0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 50% 40% at ${1920 - gx * 0.7}px ${820 - gy * 0.3}px, rgba(47,121,194,0.18) 0%, rgba(0,0,0,0) 70%)`}} />
      {beams ? (
        <AbsoluteFill style={{opacity: beams}}>
          <Beam x={-60} y={-120} ang={-38 + sw * 6} o={0.26} />
          <Beam x={1980} y={-120} ang={38 - sw * 6} o={0.26} />
          <Beam x={520} y={-160} ang={-14 + Math.sin(t * 0.5 + 1) * 5} o={0.14} w={300} />
          <Beam x={1400} y={-160} ang={14 + Math.sin(t * 0.43 + 2) * 5} o={0.14} w={300} />
        </AbsoluteFill>
      ) : null}
      {dots ? (
        <AbsoluteFill
          style={{
            opacity: 0.55 * dots, backgroundImage: 'radial-gradient(rgba(170,205,255,0.22) 1.6px, transparent 1.8px)', backgroundSize: '44px 44px',
            backgroundPosition: `${(t * 6) % 44}px ${(t * 3) % 44}px`,
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)',
          }}
        />
      ) : null}
      {floor ? (
        <div
          style={{
            position: 'absolute', left: -400, right: -400, bottom: -140, height: 620, opacity: 0.5,
            backgroundImage: `linear-gradient(${M.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${M.line} 1.5px, transparent 1.5px)`,
            backgroundSize: '110px 110px', backgroundPosition: `0 ${(t * 26) % 110}px`,
            transform: 'perspective(900px) rotateX(66deg)', transformOrigin: '50% 0%',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 50%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 50%)',
          }}
        />
      ) : null}
      <Motes t={t} />
      {children}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/** partículas de luz que flotan (polvo en los reflectores) */
export const Motes: React.FC<{t: number; n?: number; color?: string; o?: number}> = ({t, n = 34, color = M.celesteHi, o = 0.45}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const sp = 10 + rnd(i * 3.1) * 30;
      const x = (rnd(i) * W + Math.sin(t * 0.3 + i) * 40 + 4000) % W;
      const y = (((rnd(i * 7.7) * H - t * sp) % H) + H) % H;
      const s = 2 + rnd(i * 1.7) * 5;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i) * 1.4) + i));
      return <div key={i} style={{position: 'absolute', left: x - s * 2, top: y - s * 2, width: s * 5, height: s * 5, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, ${color} 18%, rgba(255,255,255,0) 60%)`, opacity: o * tw}} />;
    })}
  </AbsoluteFill>
);

/** hoja clara con grilla fina (para las explicaciones "de pizarrón") */
export const Sheet: React.FC<{t: number; children?: React.ReactNode; tint?: string}> = ({t, children, tint = M.cream}) => (
  <AbsoluteFill style={{background: tint, overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'linear-gradient(rgba(20,40,80,0.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(20,40,80,0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '60px 60px', backgroundPosition: `${(t * 4) % 60}px 0`,
      }}
    />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 55% at ${900 + Math.sin(t * 0.3) * 200}px 400px, rgba(116,185,240,0.16) 0%, rgba(0,0,0,0) 70%)`}} />
    {children}
    <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 60%, rgba(40,50,70,0.22) 100%)'}} />
  </AbsoluteFill>
);

type Grade = 'none' | 'cold' | 'warm' | 'duo' | 'red' | 'mono';
const gradeFilter = (g: Grade): string | undefined =>
  g === 'duo' ? 'grayscale(1) contrast(1.2) brightness(0.95)' : g === 'mono' ? 'grayscale(1) contrast(1.15)' : g === 'cold' ? 'saturate(0.85) contrast(1.08)' : g === 'warm' ? 'saturate(1.08) contrast(1.06)' : g === 'red' ? 'grayscale(0.7) contrast(1.15)' : undefined;
const gradeOverlay = (g: Grade) =>
  g === 'duo' ? 'rgba(47,121,194,0.55)' : g === 'cold' ? 'rgba(20,60,140,0.22)' : g === 'warm' ? 'rgba(255,170,60,0.10)' : g === 'red' ? 'rgba(200,20,40,0.35)' : null;

/** foto o video de archivo a pantalla completa, con Ken Burns, grade y viñeta */
export const Photo: React.FC<{
  src: string; t: number; t0?: number; span?: number; zoom?: [number, number]; pan?: [number, number, number, number]; focus?: string; dim?: number; grade?: Grade;
  video?: boolean; startFrom?: number; credit?: string; rate?: number;
}> = ({src, t, t0 = 0, span = 6, zoom = [1.04, 1.16], pan = [0, 0, 0, 0], focus = '50% 50%', dim = 0.2, grade = 'none', video, startFrom = 0, credit, rate = 1}) => {
  const k = easeInOut(clamp((t - t0) / span));
  const sc = zoom[0] + (zoom[1] - zoom[0]) * k;
  const x = pan[0] + (pan[2] - pan[0]) * k, y = pan[1] + (pan[3] - pan[1]) * k;
  const st: React.CSSProperties = {position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `translate(${x}px, ${y}px) scale(${sc})`, transformOrigin: focus, filter: gradeFilter(grade as Grade)};
  const ov = gradeOverlay(grade as Grade);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: M.night}}>
      {video ? (
        <Sequence from={Math.round(t0 * FPS)} layout="none">
          <OffthreadVideo src={img(src)} startFrom={Math.round(startFrom * FPS)} playbackRate={rate} muted style={st} />
        </Sequence>
      ) : (
        <Img src={img(src)} style={st} />
      )}
      {ov ? <AbsoluteFill style={{background: ov, mixBlendMode: grade === 'duo' || grade === 'red' ? 'multiply' : 'soft-light'}} /> : null}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(5,10,23,${dim + 0.15}) 0%, rgba(5,10,23,${dim}) 40%, rgba(5,10,23,${dim + 0.4}) 100%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      {credit ? <Credit text={credit} /> : null}
    </AbsoluteFill>
  );
};

export const Credit: React.FC<{text: string; dark?: boolean}> = ({text, dark = true}) => (
  <div style={{position: 'absolute', right: 40, bottom: 26, fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,30,0.5)', letterSpacing: 0.6}}>{text}</div>
);

/** grano de película a resolución nativa (6 cuadros que se alternan) */
export const GrainHD: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const f = useCurrentFrame();
  const idx = Math.floor(f / 2) % 6;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <Img src={staticFile(`tex/grainhd${idx}.jpg`)} style={{position: 'absolute', width: W, height: H}} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   CÁMARA Y APARICIONES
   ===================================================================== */
export const Cam: React.FC<{t: number; punches?: number[]; children: React.ReactNode; drift?: number; ox?: number; oy?: number; push?: [number, number, number, number]}> = ({t, punches = [], children, drift = 1, ox = 50, oy = 50, push}) => {
  let s = 1 + 0.018 * Math.sin(t * 0.23) * drift;
  if (push) s *= push[2] + (push[3] - push[2]) * easeInOut(clamp((t - push[0]) / (push[1] - push[0])));
  let sx = 0, sy = 0;
  for (const p of punches) {
    const d = t - p;
    if (d > 0 && d < 1.2) {
      s += 0.06 * Math.exp(-d * 4) * Math.sin(Math.min(d * 9, Math.PI / 2));
      const a = 8 * (1 - d / 1.2) ** 2;
      if (d < 0.3) { sx += Math.sin(t * 95) * a; sy += Math.cos(t * 83) * a; }
    }
  }
  const x = Math.sin(t * 0.13) * 10 * drift + sx, y = Math.cos(t * 0.11) * 6 * drift + sy;
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: `${ox}% ${oy}%`}}>{children}</AbsoluteFill>;
};

type BK = 'up' | 'pop' | 'left' | 'right' | 'fade' | 'blur' | 'drop' | 'flip' | 'zoom';
export const B: React.FC<{t: number; t0: number; t1?: number; kind?: BK; children: React.ReactNode; style?: React.CSSProperties; din?: number}> = ({t, t0, t1 = Infinity, kind = 'up', children, style, din = 0.5}) => {
  if (t < t0 - 0.01) return null;
  if (t > t1 + 0.4) return null;
  const a = prog(t, t0, din);
  const out = t1 === Infinity ? 0 : easeIn(clamp((t - t1) / 0.3));
  const o = Math.min(1, a * 1.6) * (1 - out);
  let tr = '';
  let filter: string | undefined;
  if (kind === 'up') tr = `translateY(${(1 - a) * 60 - out * 30}px)`;
  if (kind === 'drop') tr = `translateY(${(1 - a) * -80}px)`;
  if (kind === 'left') tr = `translateX(${(1 - a) * -140}px)`;
  if (kind === 'right') tr = `translateX(${(1 - a) * 140}px)`;
  if (kind === 'pop') tr = `scale(${0.4 + 0.6 * pop(t, t0) - out * 0.2})`;
  if (kind === 'zoom') tr = `scale(${1.5 - 0.5 * a + out * 0.3})`;
  if (kind === 'flip') tr = `perspective(1200px) rotateX(${(1 - a) * -80}deg)`;
  if (kind === 'blur') { tr = `scale(${1.12 - 0.12 * a})`; filter = a < 0.99 ? `blur(${(1 - a) * 12}px)` : undefined; }
  return <div style={{opacity: o, transform: tr, filter, ...style}}>{children}</div>;
};

export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; w?: number; center?: boolean}> = ({x, y, children, style, w, center}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w ?? (center ? 'max-content' : undefined), transform: center ? 'translate(-50%, -50%)' : undefined, ...style}}>{children}</div>
);

/* =====================================================================
   TIPOGRAFÍA
   ===================================================================== */
export const Words: React.FC<{t: number; t0: number; text: string; step?: number; style?: React.CSSProperties; hi?: string[]; hiColor?: string; kind?: 'up' | 'blur' | 'slam'; center?: boolean}> = ({
  t, t0, text, step = 0.07, style, hi = [], hiColor = M.celeste, kind = 'up', center,
}) => {
  const ws = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.24em', justifyContent: center ? 'center' : undefined, ...style}}>
      {ws.map((w, i) => {
        const k = prog(t, t0 + i * step, kind === 'slam' ? 0.3 : 0.5);
        const isHi = hi.some((h) => norm(h) === norm(w));
        const tr = kind === 'slam' ? `scale(${1.6 - 0.6 * k})` : kind === 'blur' ? `translateY(${(1 - k) * 20}px)` : `translateY(${(1 - k) * 0.5}em)`;
        return (
          <span key={i} style={{display: 'inline-block', opacity: clamp(k * 1.8), transform: tr, filter: kind === 'blur' && k < 0.99 ? `blur(${(1 - k) * 10}px)` : undefined, color: isHi ? hiColor : undefined}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{t: number; t0: number; children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({t, t0, children, color = M.celeste, size = 24, style}) => {
  const p = prog(t, t0, 0.6);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', fontFamily: FONT.body, fontWeight: 800, fontSize: size, letterSpacing: size * 0.3, color, textTransform: 'uppercase', opacity: p, ...style}}>
      <span style={{width: 64 * p, height: 4, background: color, display: 'inline-block', borderRadius: 2}} />
      {children}
    </div>
  );
};

/** golpe tipográfico */
export const Slam: React.FC<{t: number; t0: number; children: React.ReactNode; size?: number; color?: string; rot?: number; stroke?: string; font?: string; style?: React.CSSProperties}> = ({
  t, t0, children, size = 160, color = M.white, rot = 0, stroke, font = FONT.head, style,
}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.3);
  const s = 2.1 - 1.1 * clamp(k);
  return (
    <div style={{fontFamily: font, fontSize: size, color, transform: `rotate(${rot}deg) scale(${s})`, opacity: clamp((t - t0) * 8), lineHeight: 0.92, whiteSpace: 'nowrap', WebkitTextStroke: stroke, textShadow: '0 10px 40px rgba(0,0,0,0.35)', ...style}}>
      {children}
    </div>
  );
};

/** número que corre (formato argentino) */
export const Num: React.FC<{t: number; t0: number; dur?: number; from?: number; to: number; dec?: number; pre?: string; suf?: string}> = ({t, t0, dur = 1.1, from = 0, to, dec = 0, pre = '', suf = ''}) => {
  const k = easeOut(clamp((t - t0) / dur));
  return <>{pre}{fmt(from + (to - from) * k, dec)}{suf}</>;
};

/** texto metálico dorado (plata) */
export const Gold: React.FC<{children: React.ReactNode; size: number; t: number; font?: string; style?: React.CSSProperties; red?: boolean}> = ({children, size, t, font = FONT.head, style, red}) => {
  const sh = ((t * 45) % 300) - 100;
  const [a, b, c] = red ? ['#B3122A', '#FF9AA4', M.red] : ['#D08A12', M.goldHi, M.gold];
  const edge = red ? '#4A0510' : '#5E3D06';
  const base: React.CSSProperties = {fontFamily: font, fontSize: size, lineHeight: 0.95, whiteSpace: 'nowrap'};
  return (
    <div style={{position: 'relative', ...style}}>
      <div aria-hidden style={{...base, position: 'absolute', left: 0, top: Math.max(2, size * 0.025), color: edge, textShadow: `0 10px 28px rgba(0,0,0,0.55), 0 0 30px ${red ? 'rgba(255,59,78,0.35)' : 'rgba(255,200,61,0.3)'}`}}>{children}</div>
      <div
        style={{
          ...base, position: 'relative',
          backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sh - 22}%, rgba(255,255,255,0.8) ${sh}%, rgba(255,255,255,0) ${sh + 22}%), linear-gradient(180deg, ${b} 0%, ${c} 52%, ${a} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Pill: React.FC<{children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = M.celeste, fg = M.ink, size = 28, style}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, fontFamily: FONT.body, fontWeight: 900, fontSize: size, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size, letterSpacing: 1, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/** fuente del dato, abajo a la izquierda */
export const Src: React.FC<{t: number; t0: number; t1?: number; text: string; dark?: boolean}> = ({t, t0, t1 = Infinity, text, dark = true}) => {
  const o = prog(t, t0 + 0.3, 0.5) * (t1 === Infinity ? 1 : 1 - clamp((t - t1) / 0.3));
  return (
    <div style={{position: 'absolute', left: 64, top: 1016, opacity: o, fontFamily: FONT.body, fontWeight: 600, fontSize: 18, letterSpacing: 1, color: dark ? 'rgba(235,242,255,0.62)' : 'rgba(20,25,40,0.6)', display: 'flex', gap: 10, alignItems: 'center'}}>
      <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 14, padding: '3px 8px', borderRadius: 4, border: `1.5px solid ${dark ? 'rgba(235,242,255,0.4)' : 'rgba(20,25,40,0.35)'}`}}>FUENTE</span>
      {text}
    </div>
  );
};

/** sello que cae y rebota */
export const Stamp: React.FC<{t: number; t0: number; text: string; color?: string; size?: number; rot?: number; sub?: string; bg?: string}> = ({t, t0, text, color = M.red, size = 110, rot = -8, sub, bg}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.2);
  const s = 2.4 - 1.4 * easeOut(k);
  return (
    <div style={{transform: `rotate(${rot}deg) scale(${s})`, opacity: k, border: `${size * 0.075}px solid ${color}`, borderRadius: size * 0.14, padding: `${size * 0.06}px ${size * 0.26}px`, color, fontFamily: FONT.head, fontSize: size, lineHeight: 1.02, letterSpacing: 4, textAlign: 'center', background: bg, whiteSpace: 'nowrap'}}>
      {text}
      {sub ? <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: size * 0.22, letterSpacing: 5, marginTop: 4}}>{sub}</div> : null}
    </div>
  );
};

/* =====================================================================
   OBJETOS
   ===================================================================== */

/** franjas de la camiseta */
export const Stripes: React.FC<{w: number; h: number; n?: number; style?: React.CSSProperties}> = ({w, h, n = 5, style}) => (
  <div style={{width: w, height: h, display: 'flex', ...style}}>
    {Array.from({length: n}).map((_, i) => <div key={i} style={{flex: 1, background: i % 2 ? M.white : M.celeste}} />)}
  </div>
);

const barcode = (n: number, seed: number) => Array.from({length: n}).map((_, i) => 1 + Math.floor(rnd(seed + i * 1.37) * 4));

/** la entrada: talón con perforado, código de barras y brillo que corre */
export const Ticket: React.FC<{
  t: number; t0: number; w?: number; sector?: string; price?: string; strikeAt?: number; resale?: string; resaleAt?: number; seed?: number; rot?: number; sway?: number; tone?: 'light' | 'dark';
}> = ({t, t0, w = 900, sector = 'POPULAR', price = '$90.000', strikeAt, resale, resaleAt, seed = 1, rot = -4, sway = 1, tone = 'light'}) => {
  const h = w * 0.37;
  const sc = w / 900;
  const a = pop(t, t0, 1.05);
  const shine = ((t - t0) * 0.55) % 2.4;
  const ry = Math.sin(t * 0.8 + seed) * 7 * sway, rx = Math.cos(t * 0.6 + seed) * 4 * sway;
  const bg = tone === 'light' ? '#FBFAF6' : '#101A36';
  const fg = tone === 'light' ? M.ink : M.white;
  const sub = tone === 'light' ? '#4B5263' : '#A9B6D6';
  const strike = strikeAt !== undefined ? easeOut(clamp((t - strikeAt) / 0.35)) : 0;
  const stub = w * 0.3;
  return (
    <div style={{perspective: 1800, opacity: clamp((t - t0) * 6)}}>
      <div
        style={{
          width: w, height: h, position: 'relative', transformStyle: 'preserve-3d',
          transform: `translateY(${(1 - clamp(a)) * 140}px) rotate(${rot}deg) rotateY(${ry}deg) rotateX(${rx}deg) scale(${0.8 + 0.2 * clamp(a)})`,
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: 22 * sc, boxShadow: '0 40px 60px rgba(0,0,0,0.5), 0 10px 18px rgba(0,0,0,0.3)'}} />
        {/* cuerpo con muescas en el perforado */}
        <div
          style={{
            position: 'absolute', inset: 0, background: bg, borderRadius: 22 * sc, overflow: 'hidden',
            WebkitMaskImage: `radial-gradient(circle ${22 * sc}px at ${w - stub}px 0, transparent 98%, black 100%), radial-gradient(circle ${22 * sc}px at ${w - stub}px ${h}px, transparent 98%, black 100%)`,
            WebkitMaskComposite: 'source-in', maskComposite: 'intersect',
          }}
        >
          <Stripes w={34 * sc} h={h} n={5} style={{position: 'absolute', left: 0, top: 0}} />
          <div style={{position: 'absolute', left: 70 * sc, top: 38 * sc, fontFamily: FONT.body, fontWeight: 800, fontSize: 19 * sc, letterSpacing: 5 * sc, color: M.celesteDeep}}>SELECCIÓN ARGENTINA · AMISTOSO</div>
          <div style={{position: 'absolute', left: 68 * sc, top: 72 * sc, fontFamily: FONT.head, fontSize: 70 * sc, whiteSpace: 'nowrap', color: fg, lineHeight: 1, letterSpacing: 1}}>ARGENTINA <span style={{color: M.celeste}}>vs</span> BENÍN</div>
          <div style={{position: 'absolute', left: 70 * sc, top: 166 * sc, fontFamily: FONT.mono, fontWeight: 700, fontSize: 19.5 * sc, whiteSpace: 'nowrap', color: sub, letterSpacing: 1}}>MAR 06.10.2026 · 20:00 · ESTADIO MONUMENTAL</div>
          <div style={{position: 'absolute', left: 70 * sc, bottom: 30 * sc, display: 'flex', gap: 3 * sc, alignItems: 'flex-end'}}>
            {barcode(40, seed).map((b, i) => <div key={i} style={{width: b * 2.2 * sc, height: (i % 9 === 0 ? 62 : 54) * sc, background: fg, opacity: 0.85}} />)}
          </div>
          <div style={{position: 'absolute', left: 480 * sc, bottom: 34 * sc, fontFamily: FONT.mono, fontSize: 17 * sc, color: sub}}>N.º {String(100000 + Math.floor(rnd(seed) * 899999))}</div>
          {/* talón */}
          <div style={{position: 'absolute', left: w - stub, top: 0, width: stub, height: h, background: tone === 'light' ? '#EEF4FB' : '#0B1330'}} />
          <div style={{position: 'absolute', left: w - stub - 1.5, top: 26 * sc, height: h - 52 * sc, borderLeft: `${3 * sc}px dashed ${tone === 'light' ? 'rgba(20,30,50,0.25)' : 'rgba(255,255,255,0.25)'}`}} />
          <div style={{position: 'absolute', left: w - stub + 28 * sc, top: 42 * sc, fontFamily: FONT.body, fontWeight: 800, fontSize: 18 * sc, letterSpacing: 4 * sc, color: sub}}>SECTOR</div>
          <div style={{position: 'absolute', left: w - stub + 26 * sc, top: 66 * sc, fontFamily: FONT.head, fontSize: 40 * sc, color: fg, width: stub - 40 * sc, lineHeight: 1}}>{sector}</div>
          <div style={{position: 'absolute', left: w - stub + 28 * sc, top: 150 * sc, fontFamily: FONT.body, fontWeight: 800, fontSize: 18 * sc, letterSpacing: 4 * sc, color: sub}}>PRECIO</div>
          <div style={{position: 'absolute', left: w - stub + 26 * sc, top: 176 * sc, fontFamily: FONT.head, fontSize: 64 * sc, color: M.celesteDeep, lineHeight: 1, whiteSpace: 'nowrap'}}>
            {price}
            {strike > 0 ? <div style={{position: 'absolute', left: -6 * sc, top: 30 * sc, height: 7 * sc, width: `${strike * 104}%`, background: M.red, transform: 'rotate(-8deg)', borderRadius: 4}} /> : null}
          </div>
          {/* brillo */}
          <div style={{position: 'absolute', top: -h, left: (shine - 0.6) * w * 1.2, width: 140 * sc, height: h * 3, transform: 'rotate(24deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)'}} />
        </div>
        {resale && resaleAt !== undefined && t >= resaleAt ? (
          <div style={{position: 'absolute', right: -60 * sc, top: -90 * sc, transform: `rotate(10deg) scale(${0.3 + 0.7 * clamp(pop(t, resaleAt, 1.4))})`, transformOrigin: 'center'}}>
            <div style={{background: M.red, color: M.white, padding: `${14 * sc}px ${30 * sc}px`, borderRadius: 14 * sc, boxShadow: '0 20px 50px rgba(255,59,78,0.45)', textAlign: 'center'}}>
              <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: 20 * sc, letterSpacing: 6 * sc}}>REVENTA</div>
              <div style={{fontFamily: FONT.head, fontSize: 76 * sc, lineHeight: 1}}>{resale}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** ventana de navegador */
export const Browser: React.FC<{url: string; w: number; h: number; children?: React.ReactNode; urlColor?: string; lock?: boolean; hiFrom?: number; hiLen?: number; hiColor?: string; hiK?: number}> = ({
  url, w, h, children, lock = true, hiFrom, hiLen = 0, hiColor = M.red, hiK = 0,
}) => (
  <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 50px 100px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(255,255,255,0.15)'}}>
    <div style={{height: 70, background: '#E9EDF3', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
      <div style={{marginLeft: 20, flex: 1, height: 44, borderRadius: 22, background: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, fontFamily: FONT.body, fontSize: 24, color: '#1B1F29', fontWeight: 500}}>
        <svg width="18" height="22" viewBox="0 0 18 22"><rect x="1" y="9" width="16" height="12" rx="3" fill={lock ? '#4B5263' : M.red} /><path d="M4.5 9 V6 a4.5 4.5 0 0 1 9 0 V9" stroke={lock ? '#4B5263' : M.red} strokeWidth="2.4" fill="none" /></svg>
        <span style={{position: 'relative', whiteSpace: 'nowrap'}}>
          {hiFrom !== undefined ? (
            <>
              {url.slice(0, hiFrom)}
              <span style={{position: 'relative', color: hiK > 0.5 ? hiColor : undefined, fontWeight: hiK > 0.5 ? 800 : 500}}>
                <span style={{position: 'absolute', left: -4, right: -4, top: -4, bottom: -4, borderRadius: 6, background: hiColor, opacity: 0.18 * hiK}} />
                {url.slice(hiFrom, hiFrom + hiLen)}
              </span>
              {url.slice(hiFrom + hiLen)}
            </>
          ) : url}
        </span>
      </div>
    </div>
    <div style={{position: 'relative', width: w, height: h - 70, overflow: 'hidden'}}>{children}</div>
  </div>
);

/** celular */
export const Phone: React.FC<{w?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({w = 420, children, style}) => (
  <div style={{width: w, height: w * 2.05, borderRadius: w * 0.14, background: '#0E1016', padding: w * 0.035, boxShadow: '0 50px 100px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.12)', ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', background: '#F5F7FB', position: 'relative'}}>
      <div style={{position: 'absolute', left: '50%', top: w * 0.03, width: w * 0.3, height: w * 0.075, borderRadius: w * 0.04, background: '#0E1016', transform: 'translateX(-50%)', zIndex: 5}} />
      {children}
    </div>
  </div>
);

/** ícono de estadio (óvalo con campo) */
export const StadiumIcon: React.FC<{w: number; hot?: boolean; o?: number}> = ({w, hot, o = 1}) => (
  <svg width={w} height={w * 0.66} viewBox="0 0 60 40" style={{opacity: o, overflow: 'visible'}}>
    <ellipse cx="30" cy="20" rx="28" ry="18" fill={hot ? M.celeste : 'rgba(182,220,255,0.18)'} stroke={hot ? M.white : 'rgba(182,220,255,0.55)'} strokeWidth="2" />
    <rect x="16" y="12" width="28" height="16" rx="2" fill={hot ? M.green : 'rgba(43,217,138,0.35)'} />
    <line x1="30" y1="12" x2="30" y2="28" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
  </svg>
);

/** persona (pictograma) */
export const Person: React.FC<{w: number; color?: string}> = ({w, color = M.white}) => (
  <svg width={w} height={w * 1.9} viewBox="0 0 40 76"><circle cx="20" cy="11" r="10" fill={color} /><path d="M4 76 V36 a16 16 0 0 1 32 0 V76 Z" fill={color} /></svg>
);

/** bot (pictograma) */
export const Bot: React.FC<{w: number; color?: string; eye?: string}> = ({w, color = M.red, eye = M.night}) => (
  <svg width={w} height={w * 1.9} viewBox="0 0 40 76">
    <line x1="20" y1="0" x2="20" y2="7" stroke={color} strokeWidth="3" /><circle cx="20" cy="3" r="3" fill={color} />
    <rect x="6" y="7" width="28" height="22" rx="5" fill={color} /><rect x="11" y="14" width="6" height="6" rx="1" fill={eye} /><rect x="23" y="14" width="6" height="6" rx="1" fill={eye} />
    <rect x="4" y="34" width="32" height="42" rx="6" fill={color} /><rect x="12" y="44" width="16" height="4" rx="2" fill={eye} opacity="0.6" />
  </svg>
);

/** tarjeta de vidrio oscuro */
export const Glass: React.FC<{children: React.ReactNode; w?: number; style?: React.CSSProperties; light?: boolean}> = ({children, w, style, light}) => (
  <div style={{width: w, padding: 40, borderRadius: 26, background: light ? 'rgba(255,255,255,0.92)' : 'rgba(10,18,42,0.78)', border: light ? '1.5px solid rgba(20,40,80,0.12)' : '1.5px solid rgba(182,220,255,0.18)', boxShadow: '0 40px 90px rgba(0,0,0,0.45)', ...style}}>{children}</div>
);

/* =====================================================================
   TRANSICIONES
   ===================================================================== */
export type TrKind = 'flash' | 'whip' | 'glitch' | 'stripes' | 'tear' | 'iris' | 'shutter';
export const TR_DUR: Record<TrKind, number> = {flash: 0.34, whip: 0.42, glitch: 0.38, stripes: 0.7, tear: 0.62, iris: 0.66, shutter: 0.56};
export const Transition: React.FC<{t: number; at: number; kind: TrKind; color?: string}> = ({t, at, kind, color = M.night}) => {
  const D = TR_DUR[kind];
  const k = (t - (at - D / 2)) / D;
  if (k <= 0 || k >= 1) return null;
  const tri = k < 0.5 ? easeOut(k * 2) : 1 - easeIn((k - 0.5) * 2);
  if (kind === 'flash') return <AbsoluteFill style={{background: '#F4FAFF', opacity: tri * 0.95, pointerEvents: 'none'}} />;
  if (kind === 'glitch') {
    const f = Math.floor(t * 30);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {Array.from({length: 10}).map((_, i) => {
          const r = rnd(f * 13 + i);
          const y = rnd(f * 7 + i * 3) * H;
          return <div key={i} style={{position: 'absolute', left: (r - 0.5) * 240, top: y, width: W, height: 8 + r * 70, background: i % 3 === 0 ? M.celeste : i % 3 === 1 ? M.red : 'rgba(255,255,255,0.85)', opacity: 0.6, mixBlendMode: 'screen'}} />;
        })}
        <AbsoluteFill style={{background: 'rgba(255,255,255,0.08)'}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'whip') {
    const x = (k * 2 - 1) * W * 1.3;
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
        {Array.from({length: 16}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: x - 900 + rnd(i) * 500, top: (H / 16) * i, width: 1500 + rnd(i * 3) * 900, height: H / 16 + 1, background: `linear-gradient(90deg, rgba(0,0,0,0), ${i % 5 === 0 ? M.celeste : color} 30%, ${color} 70%, rgba(0,0,0,0))`}} />
        ))}
      </AbsoluteFill>
    );
  }
  if (kind === 'stripes') {
    // la camiseta: franjas celestes y blancas que barren la pantalla
    const n = 9;
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
        {Array.from({length: n}).map((_, i) => {
          const kk = clamp(k * 1.45 - (i / n) * 0.45);
          const y = kk < 0.5 ? (1 - easeOut(kk * 2)) * 110 : -easeIn((kk - 0.5) * 2) * 110;
          return <div key={i} style={{position: 'absolute', left: (W / n) * i - 1, width: W / n + 2, top: 0, height: H, background: i % 2 ? M.white : M.celeste, transform: `translateY(${y}%)`}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (kind === 'tear') {
    // talón de entrada que cruza: panel con borde perforado
    const x = -W * 1.15 + easeInOut(k) * W * 2.3;
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: x, top: -20, width: W * 1.1, height: H + 40, background: M.cream, WebkitMaskImage: 'radial-gradient(circle 18px at 100% 22px, transparent 98%, black 100%)', WebkitMaskSize: '100% 56px', boxShadow: '0 0 80px rgba(0,0,0,0.4)'}}>
          <div style={{position: 'absolute', right: 60, top: 0, bottom: 0, borderLeft: '6px dashed rgba(20,30,60,0.25)'}} />
          <Stripes w={60} h={H + 40} n={5} style={{position: 'absolute', left: 0, top: 0}} />
        </div>
      </AbsoluteFill>
    );
  }
  if (kind === 'iris') {
    const r = easeInOut(clamp(k * 1.7)) * 2300;
    const r2 = easeInOut(clamp(k * 1.7 - 0.14)) * 2300;
    const fade = 1 - clamp((k - 0.6) / 0.4);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', opacity: fade}}>
        <AbsoluteFill style={{background: M.celeste, clipPath: `circle(${r}px at 960px 540px)`}} />
        <AbsoluteFill style={{background: color, clipPath: `circle(${r2}px at 960px 540px)`}} />
      </AbsoluteFill>
    );
  }
  // shutter
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 540 * tri + 2, background: color, borderBottom: `6px solid ${M.celeste}`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 540 * tri + 2, background: color, borderTop: `6px solid ${M.celeste}`}} />
    </AbsoluteFill>
  );
};

/* =====================================================================
   RETENCIÓN: barra de capítulos y logo
   ===================================================================== */
export const ChapterBar: React.FC<{t: number; total: number; marks: {t: number; label: string}[]; o: number}> = ({t, total, marks, o}) => {
  if (o <= 0) return null;
  let cur = 0;
  marks.forEach((m, i) => { if (t >= m.t) cur = i; });
  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 36, height: 5, opacity: o * 0.92}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.16)', borderRadius: 3}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(t / total) * 100}%`, background: `linear-gradient(90deg, ${M.celeste}, ${M.white})`, borderRadius: 3, boxShadow: `0 0 14px ${M.celeste}`}} />
      {marks.map((m, i) => (
        <div key={i} style={{position: 'absolute', left: `${(m.t / total) * 100}%`, top: -5, width: 3, height: 15, background: i <= cur ? M.white : 'rgba(255,255,255,0.4)'}} />
      ))}
      <div style={{position: 'absolute', left: `${(marks[cur].t / total) * 100}%`, top: 17, fontFamily: FONT.body, fontWeight: 800, fontSize: 16, letterSpacing: 3, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>{marks[cur].label}</div>
    </div>
  );
};

export const Bug: React.FC<{o: number}> = ({o}) =>
  o > 0 ? <Img src={staticFile('brand/logo_transparente.png')} style={{position: 'absolute', right: 44, bottom: 34, height: 42, opacity: o * 0.75}} /> : null;
