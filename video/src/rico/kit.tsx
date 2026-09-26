/* Sistema visual de "¿El país más rico del mundo?" (1920x1080, se renderiza x2 para 4K).
   Dos mundos que se cruzan: el ARCHIVO (papel, sepia, fotos de 1900, tipografía de revista ilustrada)
   y el LABORATORIO DE DATOS (noche azul, oro, gráficos vivos). */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import {Grain} from '../components/base';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const R = {
  night: '#0A1120',
  night2: '#121D33',
  night3: '#1B2A47',
  line: 'rgba(170,200,240,0.14)',
  paper: '#F2E8D2',
  paper2: '#E3D3B0',
  sepia: '#6E5230',
  ink: '#17130E',
  ink2: '#3C3428',
  gold: '#E3B34C',
  goldHi: '#FFE09A',
  goldDeep: '#9A6B1C',
  celeste: '#78BDF0',
  celesteDeep: '#2E73B8',
  red: '#E4483B',
  green: '#4CC38A',
  cream: '#FFF7E6',
  mute: '#8C9AB3',
  white: '#FFFFFF',
};
export const FONT = {
  serif: '"Playfair Display", Georgia, serif',
  head: F.head,
  body: F.body,
  mono: F.mono,
  black: F.black,
  type: '"Special Elite", "Courier New", monospace',
  hand: F.script,
};

/* ---------- tiempos a partir de las palabras ---------- */
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

/* ---------- fondos ---------- */
/** Noche con polvo dorado flotando, luz que respira y grilla técnica con fuga */
export const Night: React.FC<{t: number; glow?: string; grid?: number; dust?: number; children?: React.ReactNode; hue?: string}> = ({
  t, glow = 'rgba(120,189,240,0.20)', grid = 0.55, dust = 1, children, hue = R.night,
}) => {
  const gx = 960 + Math.sin(t * 0.13) * 260, gy = 420 + Math.cos(t * 0.11) * 120;
  return (
    <AbsoluteFill style={{background: hue, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at ${gx}px ${gy}px, ${glow} 0%, rgba(0,0,0,0) 70%)`}} />
      {grid ? (
        <div
          style={{
            position: 'absolute', left: -400, right: -400, bottom: -120, height: 760, opacity: grid,
            backgroundImage: `linear-gradient(${R.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${R.line} 1.5px, transparent 1.5px)`,
            backgroundSize: '96px 96px', backgroundPosition: `0 ${(t * 22) % 96}px`,
            transform: 'perspective(900px) rotateX(64deg)', transformOrigin: '50% 0%',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 45%, black 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 45%, black 100%)',
          }}
        />
      ) : null}
      {dust ? <Dust t={t} n={46} color={R.goldHi} o={0.55 * dust} /> : null}
      {children}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const Dust: React.FC<{t: number; n?: number; color?: string; o?: number}> = ({t, n = 40, color = R.goldHi, o = 0.5}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const sp = 8 + rnd(i * 3.1) * 26;
      const x = (rnd(i) * W + Math.sin(t * 0.3 + i) * 30 + 2000) % W;
      const y = (((rnd(i * 7.7) * H - t * sp) % H) + H) % H;
      const s = 2 + rnd(i * 1.7) * 5;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rnd(i) * 1.4) + i));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: color, opacity: o * tw, boxShadow: `0 0 ${s * 3}px ${color}`}} />;
    })}
  </AbsoluteFill>
);

/** Papel viejo de revista: textura, manchas, viñeta sepia y trama de puntos */
export const Paper: React.FC<{children?: React.ReactNode; tint?: string; dots?: number}> = ({children, tint = R.paper, dots = 0.5}) => (
  <AbsoluteFill style={{background: tint, overflow: 'hidden'}}>
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.7}} />
    {dots ? <AbsoluteFill style={{opacity: dots * 0.35, backgroundImage: 'radial-gradient(rgba(110,82,48,0.35) 1.4px, transparent 1.6px)', backgroundSize: '14px 14px'}} /> : null}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 50%, rgba(90,60,20,0.35) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/** Rayas y polvo de película vieja (para material de archivo) */
export const FilmDamage: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
  const f = Math.floor(t * 12);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
      {Array.from({length: 3}).map((_, i) => {
        const r = rnd(f * 3 + i);
        if (r < 0.45) return null;
        return <div key={i} style={{position: 'absolute', left: rnd(f + i * 9) * W, top: 0, width: 1.5 + r * 1.5, height: H, background: 'rgba(255,245,220,0.22)'}} />;
      })}
      {Array.from({length: 5}).map((_, i) => {
        const r = rnd(f * 5 + i + 100);
        if (r < 0.6) return null;
        const s = 3 + r * 8;
        return <div key={'d' + i} style={{position: 'absolute', left: rnd(f * 2 + i) * W, top: rnd(f * 4 + i) * H, width: s, height: s * 0.7, borderRadius: '50%', background: 'rgba(20,15,10,0.5)'}} />;
      })}
      <AbsoluteFill style={{background: `rgba(255,236,190,${0.03 + 0.03 * Math.sin(t * 23)})`, mixBlendMode: 'overlay'}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{k?: number}> = ({k = 0.55}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,${k}) 100%)`}} />
);

export const LightLeak: React.FC<{t: number; o?: number; color?: string}> = ({t, o = 0.35, color = '255,170,80'}) => {
  const x = 200 + Math.sin(t * 0.35) * 500;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: o}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 90% at ${x}px 20%, rgba(${color},0.55) 0%, rgba(${color},0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 30% 60% at ${W - x * 0.6}px 90%, rgba(${color},0.35) 0%, rgba(${color},0) 70%)`}} />
    </AbsoluteFill>
  );
};

/* ---------- cámara ---------- */
export const Cam: React.FC<{t: number; punches?: number[]; children: React.ReactNode; drift?: number; ox?: number; oy?: number}> = ({t, punches = [], children, drift = 1, ox = 50, oy = 50}) => {
  let s = 1 + 0.02 * Math.sin(t * 0.19) * drift;
  let sx = 0, sy = 0;
  for (const p of punches) {
    const d = t - p;
    if (d > 0 && d < 1.2) {
      s += 0.05 * Math.exp(-d * 4) * Math.sin(Math.min(d * 9, Math.PI / 2));
      const a = 7 * (1 - d / 1.2) ** 2;
      if (d < 0.35) { sx += Math.sin(t * 95) * a; sy += Math.cos(t * 83) * a; }
    }
  }
  const x = Math.sin(t * 0.13) * 10 * drift + sx, y = Math.cos(t * 0.11) * 6 * drift + sy;
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: `${ox}% ${oy}%`}}>{children}</AbsoluteFill>;
};

/* ---------- aparición de bloques ---------- */
type BK = 'up' | 'pop' | 'left' | 'right' | 'fade' | 'blur' | 'drop' | 'flip';
export const B: React.FC<{t: number; t0: number; t1?: number; kind?: BK; children: React.ReactNode; style?: React.CSSProperties; din?: number}> = ({
  t, t0, t1 = Infinity, kind = 'up', children, style, din = 0.55,
}) => {
  if (t < t0 - 0.01) return null;
  if (t > t1 + 0.4) return null;
  const a = prog(t, t0, din);
  const out = t1 === Infinity ? 0 : easeIn(clamp((t - t1) / 0.35));
  const o = Math.min(1, a * 1.6) * (1 - out);
  let tr = '';
  let filter: string | undefined;
  if (kind === 'up') tr = `translateY(${(1 - a) * 60 - out * 30}px)`;
  if (kind === 'drop') tr = `translateY(${(1 - a) * -80}px)`;
  if (kind === 'left') tr = `translateX(${(1 - a) * -120}px)`;
  if (kind === 'right') tr = `translateX(${(1 - a) * 120}px)`;
  if (kind === 'pop') tr = `scale(${0.5 + 0.5 * pop(t, t0) - out * 0.2})`;
  if (kind === 'flip') tr = `perspective(1200px) rotateX(${(1 - a) * -80}deg)`;
  if (kind === 'blur') { tr = `scale(${1.15 - 0.15 * a})`; filter = `blur(${(1 - a) * 14}px)`; }
  return <div style={{opacity: o, transform: tr, filter, ...style}}>{children}</div>;
};

export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; w?: number; center?: boolean}> = ({x, y, children, style, w, center}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: center ? 'translate(-50%, -50%)' : undefined, ...style}}>{children}</div>
);

/* ---------- tipografía ---------- */
export const Kicker: React.FC<{t: number; t0: number; children: React.ReactNode; color?: string; line?: string; size?: number; style?: React.CSSProperties}> = ({
  t, t0, children, color = R.goldHi, line = R.gold, size = 26, style,
}) => {
  const p = prog(t, t0, 0.6);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 18, whiteSpace: 'nowrap', fontFamily: FONT.body, fontWeight: 800, fontSize: size, letterSpacing: size * 0.28, color, textTransform: 'uppercase', opacity: p, ...style}}>
      <span style={{width: 70 * p, height: 4, background: line, display: 'inline-block', borderRadius: 2}} />
      {children}
    </div>
  );
};

/** texto que entra palabra por palabra (estilo tipografía cinética) */
export const Words: React.FC<{t: number; t0: number; text: string; step?: number; style?: React.CSSProperties; hi?: string[]; hiColor?: string; kind?: 'up' | 'blur' | 'slam'}> = ({
  t, t0, text, step = 0.07, style, hi = [], hiColor = R.gold, kind = 'up',
}) => {
  const ws = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', ...style}}>
      {ws.map((w, i) => {
        const k = prog(t, t0 + i * step, kind === 'slam' ? 0.3 : 0.5);
        const isHi = hi.some((h) => norm(h) === norm(w));
        const tr = kind === 'slam' ? `scale(${1.6 - 0.6 * k})` : kind === 'blur' ? `translateY(${(1 - k) * 20}px)` : `translateY(${(1 - k) * 0.5}em)`;
        return (
          <span key={i} style={{display: 'inline-block', opacity: clamp(k * 1.8), transform: tr, filter: kind === 'blur' ? `blur(${(1 - k) * 10}px)` : undefined, color: isHi ? hiColor : undefined}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** número dorado con brillo que corre */
export const GoldText: React.FC<{children: React.ReactNode; size: number; t: number; font?: string; style?: React.CSSProperties; flat?: boolean}> = ({children, size, t, font = FONT.head, style, flat}) => {
  const sh = ((t * 40) % 300) - 100;
  return (
    <div
      style={{
        fontFamily: font, fontSize: size, lineHeight: 0.95, whiteSpace: 'nowrap',
        backgroundImage: flat ? `linear-gradient(180deg, ${R.goldHi}, ${R.gold})` : `linear-gradient(100deg, ${R.goldDeep} ${sh - 40}%, ${R.goldHi} ${sh}%, ${R.gold} ${sh + 20}%, ${R.goldDeep} ${sh + 80}%), linear-gradient(180deg, ${R.goldHi}, ${R.gold} 60%, ${R.goldDeep})`,
        backgroundSize: '100% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        filter: 'drop-shadow(0 6px 22px rgba(227,179,76,0.35))', ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Num: React.FC<{t: number; t0: number; dur?: number; from?: number; to: number; dec?: number; pre?: string; suf?: string}> = ({t, t0, dur = 1.1, from = 0, to, dec = 0, pre = '', suf = ''}) => {
  const k = easeOut(clamp((t - t0) / dur));
  return <>{pre}{fmt(from + (to - from) * k, dec)}{suf}</>;
};

/** golpe tipográfico: palabra enorme que entra, rebota y tiembla */
export const Slam: React.FC<{t: number; t0: number; children: React.ReactNode; size?: number; color?: string; rot?: number; stroke?: string; font?: string}> = ({
  t, t0, children, size = 160, color = R.white, rot = 0, stroke, font = FONT.head,
}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.3);
  const s = 2.2 - 1.2 * clamp(k);
  return (
    <div style={{fontFamily: font, fontSize: size, color, transform: `rotate(${rot}deg) scale(${s})`, opacity: clamp((t - t0) * 8), lineHeight: 0.92, whiteSpace: 'nowrap', WebkitTextStroke: stroke, textShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
      {children}
    </div>
  );
};

/** fuente del dato (siempre visible cuando hay un número) */
export const Src: React.FC<{t: number; t0: number; t1?: number; text: string; dark?: boolean; x?: number; y?: number}> = ({t, t0, t1 = Infinity, text, dark = true, x = 64, y = 1018}) => {
  const o = prog(t, t0 + 0.3, 0.5) * (t1 === Infinity ? 1 : 1 - clamp((t - t1) / 0.3));
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: FONT.body, fontWeight: 600, fontSize: 19, letterSpacing: 1.2, color: dark ? 'rgba(235,242,255,0.62)' : 'rgba(40,30,15,0.62)', display: 'flex', gap: 10, alignItems: 'center'}}>
      <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 15, padding: '3px 8px', borderRadius: 4, border: `1.5px solid ${dark ? 'rgba(235,242,255,0.4)' : 'rgba(40,30,15,0.4)'}`}}>FUENTE</span>
      {text}
    </div>
  );
};

export const Pill: React.FC<{children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = R.gold, fg = R.ink, size = 30, style}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, fontFamily: FONT.body, fontWeight: 900, fontSize: size, padding: `${size * 0.22}px ${size * 0.6}px`, borderRadius: size, letterSpacing: 1, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

/* ---------- fotos y videos de archivo ---------- */
export const img = (f: string) => staticFile('rico/' + f);

/** foto a pantalla completa con Ken Burns, virado sepia opcional, grano de película */
export const Archive: React.FC<{
  src: string; t: number; t0?: number; span?: number; zoom?: [number, number]; pan?: [number, number, number, number]; focus?: string; sepia?: number; dim?: number; video?: boolean; startFrom?: number; credit?: string; damage?: boolean; bw?: boolean;
}> = ({src, t, t0 = 0, span = 8, zoom = [1.06, 1.2], pan = [0, 0, 0, 0], focus = '50% 50%', sepia = 0.55, dim = 0.25, video, startFrom = 0, credit, damage = true, bw}) => {
  const k = easeInOut(clamp((t - t0) / span));
  const sc = zoom[0] + (zoom[1] - zoom[0]) * k;
  const x = pan[0] + (pan[2] - pan[0]) * k, y = pan[1] + (pan[3] - pan[1]) * k;
  const filter = bw ? 'grayscale(1) contrast(1.15) brightness(1.02)' : `sepia(${sepia}) contrast(1.08) saturate(${1 - sepia * 0.5})`;
  const st: React.CSSProperties = {position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `translate(${x}px, ${y}px) scale(${sc})`, transformOrigin: focus, filter};
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#0b0906'}}>
      {video ? (
        <Sequence from={Math.round(t0 * FPS)} layout="none">
          <OffthreadVideo src={img(src)} startFrom={Math.round(startFrom * FPS)} muted style={st} />
        </Sequence>
      ) : (
        <Img src={img(src)} style={st} />
      )}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,8,5,${dim + 0.1}) 0%, rgba(10,8,5,${dim}) 45%, rgba(10,8,5,${dim + 0.35}) 100%)`}} />
      {damage ? <FilmDamage t={t} o={0.8} /> : null}
      <Vignette k={0.6} />
      {credit ? <div style={{position: 'absolute', right: 48, bottom: 30, fontFamily: FONT.body, fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8}}>{credit}</div> : null}
    </AbsoluteFill>
  );
};

/** foto impresa (borde blanco) flotando en 3D, con sombra y cinta */
export const Print: React.FC<{src: string; t: number; t0: number; w: number; h: number; rot?: number; ry?: number; caption?: string; focus?: string; sepia?: number; seed?: number; zoom?: [number, number]; tape?: boolean}> = ({
  src, t, t0, w, h, rot = 0, ry = 0, caption, focus = '50% 50%', sepia = 0.45, seed = 1, zoom = [1.02, 1.14], tape = true,
}) => {
  const a = pop(t, t0, 1.1);
  const k = clamp((t - t0) / 7);
  const sway = Math.sin(t * 0.7 + seed) * 2.5;
  return (
    <div style={{perspective: 1600, opacity: clamp((t - t0) * 5)}}>
      <div
        style={{
          width: w, padding: 14, paddingBottom: caption ? 58 : 14, background: '#FBF6EA', borderRadius: 3,
          boxShadow: '0 30px 70px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.25)',
          transform: `translateY(${(1 - clamp(a)) * 120}px) rotate(${rot * clamp(a) + (1 - clamp(a)) * rot * 2}deg) rotateY(${ry + sway}deg) rotateX(${sway * 0.6}deg) scale(${0.85 + 0.15 * clamp(a)})`,
          position: 'relative',
        }}
      >
        <div style={{width: w - 28, height: h, overflow: 'hidden', background: '#222'}}>
          <Img src={img(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${zoom[0] + (zoom[1] - zoom[0]) * k})`, filter: `sepia(${sepia}) contrast(1.08)`}} />
        </div>
        {caption ? <div style={{position: 'absolute', left: 20, right: 20, bottom: 12, fontFamily: FONT.hand, fontSize: 34, color: '#3a3024', whiteSpace: 'nowrap', overflow: 'hidden'}}>{caption}</div> : null}
        {tape ? <div style={{position: 'absolute', left: w / 2 - 70, top: -18, width: 140, height: 36, background: 'rgba(240,225,180,0.75)', transform: `rotate(${-3 + seed * 2}deg)`, boxShadow: '0 2px 5px rgba(0,0,0,0.15)'}} /> : null}
      </div>
    </div>
  );
};

/* ---------- tarjeta de cita ---------- */
export const Quote: React.FC<{t: number; t0: number; text: string; who: string; when: string; hi?: string[]; step?: number; size?: number; w?: number}> = ({t, t0, text, who, when, hi = [], step = 0.11, size = 76, w = 1400}) => (
  <div style={{width: w, position: 'relative'}}>
    <div style={{position: 'absolute', left: -90, top: -90, fontFamily: FONT.serif, fontSize: 300, color: R.gold, opacity: prog(t, t0, 0.5) * 0.9, lineHeight: 1}}>“</div>
    <Words t={t} t0={t0 + 0.1} text={text} step={step} hi={hi} hiColor={R.goldHi} style={{fontFamily: FONT.serif, fontStyle: 'italic', fontWeight: 600, fontSize: size, color: R.cream, lineHeight: 1.12}} />
    <B t={t} t0={t0 + 0.4} kind="left">
      <div style={{marginTop: 34, display: 'flex', gap: 18, alignItems: 'center', fontFamily: FONT.body, fontSize: 28, color: R.mute, fontWeight: 600}}>
        <span style={{width: 48, height: 3, background: R.gold}} />
        <span style={{color: R.cream, fontWeight: 800}}>{who}</span> · {when}
      </div>
    </B>
  </div>
);

/* ---------- detector de mitos: medidor de aguja ---------- */
export const Meter: React.FC<{t: number; value: number; label?: string; size?: number; o?: number}> = ({t, value, label, size = 560, o = 1}) => {
  // value: -1 = MITO, +1 = VERDAD
  const ang = value * 80 + Math.sin(t * 9) * 1.2;
  const r = size / 2;
  const arc = (a0: number, a1: number, col: string) => {
    const p = (a: number) => [r + Math.cos(((a - 90) * Math.PI) / 180) * (r - 30), r + Math.sin(((a - 90) * Math.PI) / 180) * (r - 30)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return <path d={`M ${x0} ${y0} A ${r - 30} ${r - 30} 0 0 1 ${x1} ${y1}`} stroke={col} strokeWidth={34} fill="none" />;
  };
  return (
    <div style={{width: size, height: r + 120, position: 'relative', opacity: o}}>
      <svg width={size} height={r + 20} style={{overflow: 'visible'}}>
        {arc(-86, -30, R.red)}
        {arc(-28, 28, R.gold)}
        {arc(30, 86, R.green)}
        {Array.from({length: 17}).map((_, i) => {
          const a = ((-80 + i * 10 - 90) * Math.PI) / 180;
          return <line key={i} x1={r + Math.cos(a) * (r - 64)} y1={r + Math.sin(a) * (r - 64)} x2={r + Math.cos(a) * (r - 80)} y2={r + Math.sin(a) * (r - 80)} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />;
        })}
        <g transform={`rotate(${ang} ${r} ${r})`}>
          <path d={`M ${r - 12} ${r} L ${r} ${40} L ${r + 12} ${r} Z`} fill={R.cream} />
        </g>
        <circle cx={r} cy={r} r={26} fill={R.cream} />
        <circle cx={r} cy={r} r={11} fill={R.night} />
      </svg>
      <div style={{position: 'absolute', left: 0, top: r + 30, width: '100%', display: 'flex', justifyContent: 'space-between', fontFamily: FONT.head, fontSize: 44, letterSpacing: 2}}>
        <span style={{color: R.red}}>MITO</span>
        <span style={{color: R.green}}>VERDAD</span>
      </div>
      {label ? <div style={{position: 'absolute', left: 0, top: r + 90, width: '100%', textAlign: 'center', fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: R.cream, letterSpacing: 3}}>{label}</div> : null}
    </div>
  );
};

/* ---------- sello ---------- */
export const Stamp: React.FC<{t: number; t0: number; text: string; color?: string; size?: number; rot?: number; sub?: string}> = ({t, t0, text, color = R.red, size = 120, rot = -9, sub}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.22);
  const s = 2.4 - 1.4 * easeOut(k);
  return (
    <div style={{transform: `rotate(${rot}deg) scale(${s})`, opacity: k, border: `${size * 0.07}px solid ${color}`, borderRadius: size * 0.12, padding: `${size * 0.08}px ${size * 0.28}px`, color, fontFamily: FONT.head, fontSize: size, lineHeight: 1, letterSpacing: 4, textAlign: 'center', mixBlendMode: 'normal', boxShadow: `inset 0 0 0 ${size * 0.03}px ${color}`}}>
      {text}
      {sub ? <div style={{fontFamily: FONT.body, fontWeight: 900, fontSize: size * 0.24, letterSpacing: 6, marginTop: 6}}>{sub}</div> : null}
    </div>
  );
};

/* ---------- títulos de capítulo ---------- */
export const Chapter: React.FC<{t: number; t0: number; num: string; title: string; sub?: string; bg?: string; t1: number}> = ({t, t0, num, title, sub, bg, t1}) => {
  if (t < t0 || t > t1 + 0.1) return null;
  const k = prog(t, t0, 0.8);
  const out = clamp((t - (t1 - 0.4)) / 0.4);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      {bg ? <Archive src={bg} t={t} t0={t0} span={t1 - t0 + 1} zoom={[1.15, 1.03]} dim={0.55} sepia={0.8} /> : <Night t={t} />}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: FONT.body, fontWeight: 800, fontSize: 30, letterSpacing: 18, color: R.goldHi, opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>CAPÍTULO {num}</div>
        <div style={{width: 700 * easeInOut(clamp((t - t0 - 0.15) / 0.7)), height: 3, background: R.gold, margin: '28px 0 34px'}} />
        <div style={{fontFamily: FONT.serif, fontWeight: 800, fontSize: 132, color: R.cream, lineHeight: 1, letterSpacing: -2, textAlign: 'center', filter: `blur(${(1 - prog(t, t0 + 0.2, 0.7)) * 16}px)`, opacity: prog(t, t0 + 0.2, 0.6), transform: `scale(${1.08 - 0.08 * prog(t, t0 + 0.2, 1.2)})`, textShadow: '0 10px 50px rgba(0,0,0,0.6)'}}>
          {title}
        </div>
        {sub ? <div style={{marginTop: 26, fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 42, color: 'rgba(255,247,230,0.8)', opacity: prog(t, t0 + 0.6, 0.6)}}>{sub}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- transiciones (se dibujan encima del corte) ---------- */
export type TrKind = 'gold' | 'flash' | 'burn' | 'shutter' | 'iris' | 'glitch' | 'bars' | 'whip';
export const TR_DUR: Record<TrKind, number> = {gold: 0.7, flash: 0.35, burn: 0.8, shutter: 0.6, iris: 0.7, glitch: 0.4, bars: 0.7, whip: 0.45};
export const Transition: React.FC<{t: number; at: number; kind: TrKind; color?: string; ox?: number; oy?: number}> = ({t, at, kind, color = R.night, ox = 960, oy = 540}) => {
  const D = TR_DUR[kind];
  const k = (t - (at - D / 2)) / D;
  if (k <= 0 || k >= 1) return null;
  if (kind === 'flash') {
    const o = k < 0.5 ? easeOut(k * 2) : 1 - easeIn((k - 0.5) * 2);
    return <AbsoluteFill style={{background: '#FFF8E8', opacity: o * 0.95, pointerEvents: 'none'}} />;
  }
  if (kind === 'burn') {
    // quemado de película: mancha naranja que explota desde un borde
    const o = k < 0.5 ? easeOut(k * 2) : 1 - easeIn((k - 0.5) * 2);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: o}}>
        <AbsoluteFill style={{background: `radial-gradient(ellipse ${60 + k * 90}% ${80 + k * 60}% at 85% 30%, rgba(255,240,200,1) 0%, rgba(255,150,40,0.95) 35%, rgba(200,40,10,0.7) 60%, rgba(0,0,0,0) 80%)`}} />
        <AbsoluteFill style={{background: `radial-gradient(ellipse ${40 + k * 80}% ${50 + k * 60}% at 10% 90%, rgba(255,200,120,0.9) 0%, rgba(255,90,20,0.6) 45%, rgba(0,0,0,0) 75%)`}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'iris') {
    const r = easeInOut(clamp(k * 1.7)) * 2300;
    const r2 = easeInOut(clamp(k * 1.7 - 0.14)) * 2300;
    const fade = 1 - clamp((k - 0.6) / 0.4);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', opacity: fade}}>
        <AbsoluteFill style={{background: R.gold, clipPath: `circle(${r}px at ${ox}px ${oy}px)`}} />
        <AbsoluteFill style={{background: color, clipPath: `circle(${r2}px at ${ox}px ${oy}px)`}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'shutter') {
    // persiana de dos hojas que cierra y abre (como el obturador de una cámara vieja)
    const c = k < 0.5 ? easeInOut(k * 2) : 1 - easeInOut((k - 0.5) * 2);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 540 * c + 2, background: color, borderBottom: `6px solid ${R.gold}`}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 540 * c + 2, background: color, borderTop: `6px solid ${R.gold}`}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'bars') {
    const n = 7;
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {Array.from({length: n}).map((_, i) => {
          const kk = clamp(k * 1.5 - (i / n) * 0.5);
          const cover = kk < 0.5 ? easeOut(kk * 2) : 1 - easeIn((kk - 0.5) * 2);
          return <div key={i} style={{position: 'absolute', top: (H / n) * i - 1, height: H / n + 2, left: 0, width: W, background: i % 2 ? R.gold : color, transformOrigin: kk < 0.5 ? 'left' : 'right', transform: `scaleX(${cover})`}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (kind === 'glitch') {
    const f = Math.floor(t * 30);
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {Array.from({length: 9}).map((_, i) => {
          const r = rnd(f * 13 + i);
          const y = rnd(f * 7 + i * 3) * H;
          return <div key={i} style={{position: 'absolute', left: (r - 0.5) * 200, top: y, width: W, height: 10 + r * 70, background: i % 3 === 0 ? R.celeste : i % 3 === 1 ? R.red : 'rgba(255,255,255,0.8)', opacity: 0.55, mixBlendMode: 'screen'}} />;
        })}
        <AbsoluteFill style={{background: 'rgba(255,255,255,0.08)'}} />
      </AbsoluteFill>
    );
  }
  if (kind === 'whip') {
    // barrido con desenfoque direccional simulado: franjas horizontales que cruzan
    const x = (k * 2 - 1) * W * 1.3;
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
        {Array.from({length: 14}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: x - 900 + rnd(i) * 500, top: (H / 14) * i, width: 1400 + rnd(i * 3) * 900, height: H / 14 + 1, background: `linear-gradient(90deg, rgba(0,0,0,0), ${i % 4 === 0 ? R.gold : color} 30%, ${color} 70%, rgba(0,0,0,0))`}} />
        ))}
      </AbsoluteFill>
    );
  }
  // gold: tres láminas diagonales (oro, crema, color nuevo)
  const cols = [R.gold, R.cream, color];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {cols.map((col, i) => {
        const kk = clamp((k - i * 0.07) / 0.86);
        const x = kk < 0.5 ? -140 + easeOut(kk * 2) * 140 : easeIn((kk - 0.5) * 2) * 140;
        return <AbsoluteFill key={i} style={{background: col, transform: `translateX(${x}%) skewX(-16deg) scaleX(1.5)`}} />;
      })}
    </AbsoluteFill>
  );
};

/* ---------- barra de progreso por capítulos (retención) ---------- */
export const ChapterBar: React.FC<{t: number; total: number; marks: {t: number; label: string}[]; o: number}> = ({t, total, marks, o}) => {
  if (o <= 0) return null;
  let cur = 0;
  marks.forEach((m, i) => { if (t >= m.t) cur = i; });
  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 38, height: 4, opacity: o * 0.9}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.16)', borderRadius: 2}} />
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(t / total) * 100}%`, background: R.gold, borderRadius: 2, boxShadow: `0 0 12px ${R.gold}`}} />
      {marks.map((m, i) => (
        <div key={i} style={{position: 'absolute', left: `${(m.t / total) * 100}%`, top: -5, width: 3, height: 14, background: i <= cur ? R.goldHi : 'rgba(255,255,255,0.4)'}} />
      ))}
      <div style={{position: 'absolute', left: `${(marks[cur].t / total) * 100}%`, top: 16, fontFamily: FONT.body, fontWeight: 800, fontSize: 16, letterSpacing: 3, color: 'rgba(255,247,230,0.8)', whiteSpace: 'nowrap', textTransform: 'uppercase'}}>{marks[cur].label}</div>
    </div>
  );
};

/** logo de la marca en la esquina */
export const Bug: React.FC<{o: number}> = ({o}) =>
  o > 0 ? <Img src={staticFile('brand/logo_transparente.png')} style={{position: 'absolute', right: 48, bottom: 36, height: 44, opacity: o * 0.75}} /> : null;

export {Grain, clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};
export const useF = () => useCurrentFrame();
