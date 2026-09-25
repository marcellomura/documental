import React from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {clamp, easeIn, easeOut, env, fmt, pop, prog} from '../lib/anim';

/* ---------- Fuentes ---------- */
const FONTS: [string, string, FontFaceDescriptors][] = [
  ['Anton', 'Anton-Regular.ttf', {}],
  ['Inter', 'Inter-VF.ttf', {weight: '100 900'}],
  ['Playfair Display', 'PlayfairDisplay-VF.ttf', {weight: '400 900'}],
  ['Playfair Display', 'PlayfairDisplay-Italic-VF.ttf', {weight: '400 900', style: 'italic'}],
  ['Permanent Marker', 'PermanentMarker-Regular.ttf', {}],
  ['JetBrains Mono', 'JetBrainsMono-VF.ttf', {weight: '100 800'}],
  ['Archivo Black', 'ArchivoBlack-Regular.ttf', {}],
  ['Caveat', 'Caveat-VF.ttf', {weight: '400 700'}],
  ['Special Elite', 'SpecialElite-Regular.ttf', {}],
  ['Rock Salt', 'RockSalt-Regular.ttf', {}],
  ['Bungee', 'Bungee-Regular.ttf', {}],
];
if (typeof document !== 'undefined' && !(window as any).__fontsLoading) {
  (window as any).__fontsLoading = true;
  const h = delayRender('fuentes');
  Promise.all(
    FONTS.map(([fam, file, d]) =>
      new FontFace(fam, `url(${staticFile('fonts/' + file)})`, d).load().then((f) => (document.fonts as any).add(f)),
    ),
  ).then(() => continueRender(h));
}

/* ---------- Fondos ---------- */
export const Paper: React.FC<{tint?: string; children?: React.ReactNode}> = ({tint = C.paper, children}) => (
  <AbsoluteFill style={{background: tint}}>
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.55}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,10,0.18) 100%)'}} />
    {children}
  </AbsoluteFill>
);

export const Dark: React.FC<{tint?: string; glow?: string; children?: React.ReactNode}> = ({tint = C.dark, glow = 'rgba(255,255,255,0.06)', children}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${glow} 0%, rgba(0,0,0,0) 60%)`}} />
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'screen', opacity: 0.05}} />
    {children}
  </AbsoluteFill>
);

/* Grano animado (8 texturas precargadas, se alterna una cada 2 frames) */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
  const f = useCurrentFrame();
  const idx = Math.floor(f / 3) % 8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      {Array.from({length: 8}).map((_, i) => (
        <Img
          key={i}
          src={staticFile(`tex/grain${i}.png`)}
          style={{position: 'absolute', width: 1920, height: 1920, top: -420, objectFit: 'cover', imageRendering: 'pixelated', opacity: i === idx ? 1 : 0}}
        />
      ))}
    </AbsoluteFill>
  );
};

/* Filtros SVG globales (bordes rugosos para sellos) */
export const SvgDefs: React.FC = () => (
  <svg width="0" height="0" style={{position: 'absolute'}}>
    <defs>
      <filter id="rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
      </filter>
      <filter id="ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.35" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
    </defs>
  </svg>
);

/* ---------- Beat: muestra hijos entre t0 y t1 con animación ---------- */
type BeatProps = {
  t: number; t0: number; t1?: number; children: React.ReactNode;
  kind?: 'fade' | 'up' | 'pop' | 'left' | 'right' | 'zoom' | 'down';
  din?: number; dout?: number; style?: React.CSSProperties; dist?: number;
};
export const Beat: React.FC<BeatProps> = ({t, t0, t1 = Infinity, children, kind = 'up', din = 0.45, dout = 0.3, style, dist = 60}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = easeOut(clamp((t - t0) / din));
  const b = t1 === Infinity ? 1 : 1 - easeIn(clamp((t - (t1 - dout)) / dout));
  const o = Math.min(a, b);
  let tr = '';
  if (kind === 'up') tr = `translateY(${(1 - a) * dist + (1 - b) * -dist * 0.5}px)`;
  if (kind === 'down') tr = `translateY(${-(1 - a) * dist}px)`;
  if (kind === 'left') tr = `translateX(${(1 - a) * -dist * 2}px)`;
  if (kind === 'right') tr = `translateX(${(1 - a) * dist * 2}px)`;
  if (kind === 'pop') tr = `scale(${0.6 + 0.4 * pop(t, t0) * (1 - (1 - b) * 0.3)})`;
  if (kind === 'zoom') tr = `scale(${1.25 - 0.25 * a})`;
  return <AbsoluteFill style={{opacity: kind === 'pop' ? Math.min(clamp((t - t0) / 0.12), b) : o, transform: tr, ...style}}>{children}</AbsoluteFill>;
};

/* ---------- Texto con resaltador ---------- */
export const Mark: React.FC<{t: number; t0: number; color?: string; children: React.ReactNode; dur?: number; pad?: number; style?: React.CSSProperties; skew?: number}> = ({
  t, t0, color = C.yellow, children, dur = 0.45, pad = 10, style, skew = -4,
}) => {
  const p = prog(t, t0, dur);
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      <span style={{position: 'absolute', left: -pad, right: -pad, top: '14%', bottom: '6%', background: color, transformOrigin: 'left center', transform: `scaleX(${p}) skewX(${skew}deg)`, zIndex: 0, borderRadius: 4}} />
      <span style={{position: 'relative', zIndex: 1}}>{children}</span>
    </span>
  );
};

/* Tachado animado */
export const Strike: React.FC<{t: number; t0: number; color?: string; width?: number; children: React.ReactNode}> = ({t, t0, color = C.red, width = 10, children}) => {
  const p = prog(t, t0, 0.35);
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {children}
      <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: width, background: color, transformOrigin: 'left', transform: `scaleX(${p}) rotate(-3deg)`, borderRadius: width}} />
    </span>
  );
};

/* ---------- Sello ---------- */
export const Stamp: React.FC<{t: number; t0: number; text: string; color?: string; size?: number; rot?: number; x?: number; y?: number; sub?: string; blend?: boolean}> = ({
  t, t0, text, color = C.red, size = 120, rot = -9, x = 960, y = 540, sub, blend = true,
}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.18);
  const s = 2.3 - 1.3 * easeIn(k) + (k >= 1 ? Math.exp(-(t - t0 - 0.18) * 14) * 0.06 * Math.sin((t - t0) * 60) : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, zIndex: 20, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: clamp(k * 3)}}>
      <div
        style={{
          border: `${size / 12}px solid ${color}`, color, padding: `${size * 0.08}px ${size * 0.3}px`, fontFamily: F.head, fontSize: size,
          lineHeight: 1, letterSpacing: 4, textTransform: 'uppercase', borderRadius: size * 0.08, filter: 'url(#rough)', textAlign: 'center',
          background: 'rgba(255,255,255,0.0)', whiteSpace: 'nowrap', mixBlendMode: blend ? 'multiply' : 'normal',
        }}
      >
        {text}
        {sub ? <div style={{fontFamily: F.body, fontWeight: 800, fontSize: size * 0.22, letterSpacing: 6, marginTop: 6}}>{sub}</div> : null}
      </div>
    </div>
  );
};

/* ---------- Zócalo (lower third) ---------- */
export const LowerThird: React.FC<{t: number; t0: number; t1?: number; name: string; role: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, name, role, x = 110, y = 820}) => {
  const a = prog(t, t0, 0.5);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3, easeIn);
  if (t < t0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <div style={{overflow: 'hidden'}}>
        <div style={{background: C.yellow, color: C.ink, fontFamily: F.head, fontSize: 58, padding: '6px 24px 4px', display: 'inline-block', transform: `translateX(${(1 - a) * -110}%)`, letterSpacing: 1}}>
          {name.toUpperCase()}
        </div>
      </div>
      <div style={{overflow: 'hidden'}}>
        <div style={{background: C.ink, color: C.white, fontFamily: F.body, fontWeight: 600, fontSize: 28, padding: '10px 24px', display: 'inline-block', transform: `translateX(${(1 - prog(t, t0 + 0.12, 0.5)) * -110}%)`}}>
          {role}
        </div>
      </div>
    </div>
  );
};

/* ---------- Etiqueta de fuente ---------- */
export const Source: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; dark?: boolean; align?: 'left' | 'right'}> = ({t, t0, text, x = 1840, y = 1030, dark, align = 'right'}) => (
  <div
    style={{
      position: 'absolute', [align === 'right' ? 'right' : 'left']: align === 'right' ? 1920 - x : x, top: y, fontFamily: F.body, fontWeight: 600,
      fontSize: 19, letterSpacing: 1.5, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(22,21,19,0.55)', opacity: prog(t, t0, 0.6), textTransform: 'uppercase',
    }}
  >
    {text}
  </div>
);

/* ---------- Contador ---------- */
export const Counter: React.FC<{t: number; t0: number; t1: number; from?: number; to: number; dec?: number; prefix?: string; suffix?: string; style?: React.CSSProperties}> = ({
  t, t0, t1, from = 0, to, dec = 0, prefix = '', suffix = '', style,
}) => {
  const p = clamp((t - t0) / (t1 - t0));
  const e = 1 - Math.pow(1 - p, 3);
  const v = from + (to - from) * e;
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{prefix}{fmt(v, dec)}{suffix}</span>;
};

/* ---------- Foto recortada ---------- */
export const Photo: React.FC<{
  src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number;
  credit?: string; bw?: boolean; zoom?: [number, number]; focus?: string; border?: number; enter?: 'pop' | 'up' | 'fade' | 'left' | 'right' | 'drop';
  tape?: boolean; z?: number; dim?: number; duo?: string;
}> = ({src, t, t0, t1 = Infinity, x, y, w, h, rot = 0, credit, bw, zoom = [1.02, 1.1], focus = '50% 50%', border = 14, enter = 'pop', tape, z, dim = 0, duo}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = clamp((t - t0) / 0.5);
  const out = t1 === Infinity ? 0 : clamp((t - (t1 - 0.3)) / 0.3);
  let tr = '';
  let op = Math.min(clamp((t - t0) / 0.15), 1 - out);
  if (enter === 'pop') tr = `scale(${0.7 + 0.3 * pop(t, t0, 0.9)})`;
  if (enter === 'up') tr = `translateY(${(1 - easeOut(a)) * 400}px)`;
  if (enter === 'drop') tr = `translateY(${(1 - easeOut(a)) * -600}px) rotate(${(1 - easeOut(a)) * 12}deg)`;
  if (enter === 'left') tr = `translateX(${(1 - easeOut(a)) * -900}px)`;
  if (enter === 'right') tr = `translateX(${(1 - easeOut(a)) * 900}px)`;
  if (enter === 'fade') op = Math.min(easeOut(a), 1 - out);
  tr += ` translateY(${easeIn(out) * 40}px)`;
  const span = (t1 === Infinity ? 8 : t1 - t0) || 8;
  const zk = clamp((t - t0) / span);
  const sc = zoom[0] + (zoom[1] - zoom[0]) * zk;
  const filter = bw || duo ? 'grayscale(1) contrast(1.18) brightness(1.03)' : 'contrast(1.06) saturate(0.92)';
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `${tr} rotate(${rot}deg)`, opacity: op, zIndex: z}}>
      <div style={{position: 'absolute', inset: 0, background: '#FBF8F2', boxShadow: '0 18px 40px rgba(0,0,0,0.35), 0 3px 8px rgba(0,0,0,0.25)', padding: border, paddingBottom: credit ? border + 26 : border}}>
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#222'}}>
          <Img src={staticFile('img/' + src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter}} />
          {duo ? <div style={{position: 'absolute', inset: 0, background: duo, mixBlendMode: 'multiply'}} /> : null}
          {dim ? <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dim})`}} /> : null}
          <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.25)'}} />
        </div>
        {credit ? (
          <div style={{position: 'absolute', right: border, bottom: 8, fontFamily: F.body, fontSize: 15, color: '#6f6a62', fontWeight: 500, letterSpacing: 0.3}}>{credit}</div>
        ) : null}
      </div>
      {tape ? <Tape x={w / 2} y={-8} rot={-4} /> : null}
    </div>
  );
};

export const Tape: React.FC<{x: number; y: number; rot?: number; w?: number}> = ({x, y, rot = 0, w = 170}) => (
  <div
    style={{
      position: 'absolute', left: x - w / 2, top: y - 22, width: w, height: 44, transform: `rotate(${rot}deg)`,
      background: 'linear-gradient(180deg, rgba(255,246,214,0.82), rgba(236,224,190,0.78))', boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
      clipPath: 'polygon(2% 0, 98% 4%, 100% 50%, 97% 100%, 3% 96%, 0 50%)',
    }}
  />
);

/* ---------- Tarjeta de capítulo ---------- */
export const ChapterCard: React.FC<{t: number; t0: number; t1: number; year: string; title: string; num?: string; color?: string; bg?: string}> = ({
  t, t0, t1, year, title, num, color = C.yellow, bg = C.ink,
}) => {
  if (t < t0 || t > t1) return null;
  const a = prog(t, t0, 0.45);
  const out = prog(t, t1 - 0.35, 0.35, easeIn);
  const barW = prog(t, t0 + 0.15, 0.7);
  const lt = t - t0;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 ${out * 100}% 0 0)`}}>
      <AbsoluteFill style={{background: bg, transform: `translateX(${(1 - a) * -100}%)`}}>
        <Grain opacity={0.14} />
        <div style={{position: 'absolute', left: 150, top: 250, color: 'rgba(255,255,255,0.6)', fontFamily: F.body, fontWeight: 700, fontSize: 34, letterSpacing: 10, opacity: prog(t, t0 + 0.25, 0.4)}}>
          {num}
        </div>
        <div style={{position: 'absolute', left: 140, top: 300, fontFamily: F.head, fontSize: 330, lineHeight: 1, color, letterSpacing: 4, transform: `translateY(${(1 - prog(t, t0 + 0.1, 0.6)) * 60}px) scale(${1 + lt * 0.015})`, transformOrigin: 'left', opacity: prog(t, t0 + 0.1, 0.3)}}>
          {year}
        </div>
        <div style={{position: 'absolute', left: 150, top: 690, width: 1100 * barW, height: 8, background: color}} />
        <div style={{position: 'absolute', left: 150, top: 730, color: C.white, fontFamily: F.body, fontWeight: 800, fontSize: 64, letterSpacing: 3, textTransform: 'uppercase', opacity: prog(t, t0 + 0.35, 0.4), transform: `translateX(${(1 - prog(t, t0 + 0.35, 0.5)) * 40}px)`}}>
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Etiqueta superior de capítulo (persistente) ---------- */
export const ChapterTag: React.FC<{t: number; t0: number; label: string; dark?: boolean}> = ({t, t0, label, dark}) => (
  <div
    style={{
      position: 'absolute', left: 60, top: 48, display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, t0, 0.5),
      fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: dark ? C.white : C.ink, textTransform: 'uppercase',
    }}
  >
    <div style={{width: 14, height: 14, background: C.yellow, borderRadius: 3}} />
    {label}
  </div>
);

/* ---------- Transición tipo barrido ---------- */
export const Wipe: React.FC<{t: number; at: number; color?: string; dir?: 1 | -1}> = ({t, at, color = C.yellow, dir = 1}) => {
  const d = 0.55;
  const k = (t - (at - d / 2)) / d;
  if (k <= 0 || k >= 1) return null;
  // entra cubriendo, sale descubriendo
  const x = k < 0.5 ? -100 + easeOut(k * 2) * 100 : easeIn((k - 0.5) * 2) * 100;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: color, transform: `translateX(${x * dir}%) skewX(${-8 * dir}deg) scaleX(1.2)`}} />
      <AbsoluteFill style={{background: C.ink, transform: `translateX(${(x + (k < 0.5 ? -12 : 12)) * dir}%) skewX(${-8 * dir}deg) scaleX(1.2)`, opacity: 0.0}} />
    </AbsoluteFill>
  );
};

/* ---------- Texto de titular ---------- */
export const H: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; font?: string}> = ({size = 120, color = C.ink, children, style, font = F.head}) => (
  <div style={{fontFamily: font, fontSize: size, lineHeight: 1.02, color, textTransform: 'uppercase', letterSpacing: 1, ...style}}>{children}</div>
);

export const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', ...style}}>{children}</AbsoluteFill>
);
