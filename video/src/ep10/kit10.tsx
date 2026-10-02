/* Sistema visual del episodio 10 (El cuadro del nazi): expediente noir. Negro cálido, papel de archivo,
   tinta roja de sello, dorado de marco y un celeste frío para el presente (2025-2026).
   Fotos de archivo como copias en papel, máquina de escribir, sellos con borde gastado y un diafragma
   de cámara como transición. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import countries from '../data/ep04/countries50.json';
export {Big, Chip, Count, Credit, FullPhoto, FullVideo, SrcLine, Vig} from '../ep06/kit6';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

export const K = {
  bg0: '#0B0907',
  bg1: '#15110D',
  bg2: '#211A14',
  cream: '#F1E7D3',
  paper: '#E9DDC3',
  paper2: '#D8C7A2',
  ink: '#1C1611',
  mute: '#A59882',
  line: 'rgba(241,231,211,0.16)',
  red: '#C8312C', // sello, robado
  gold: '#D6AF5C', // marcos, arte
  blue: '#7DBBE6', // el presente: la investigación, la Justicia
  velvet: '#2F6B4F',
  amber: '#F0A848',
};
const TYPE = '"Special Elite", "Courier New", monospace';
export const FT = {type: TYPE};

export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/* ---------- Fondo: negro cálido con un haz de luz de lámpara y polvo ---------- */
export const NoirBg: React.FC<{t: number; glow?: string; x?: number; y?: number; k?: number}> = ({t, glow = 'rgba(240,168,72,0.16)', x = 50, y = 42, k = 1}) => (
  <AbsoluteFill style={{background: K.bg0}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 75% at ${x + Math.sin(t * 0.13) * 3}% ${y}%, ${glow} 0%, rgba(21,17,13,${0.8 * k}) 52%, ${K.bg0} 100%)`}} />
    <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'screen'}}>
      <Img src={staticFile('tex/paper.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/** polvo en el haz de luz */
export const Motes: React.FC<{t: number; n?: number; o?: number; color?: string}> = ({t, n = 46, o = 1, color = '#FFE2B0'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: n}, (_, i) => {
        const sp = 0.012 + rnd(i) * 0.03;
        const x = ((rnd(i + 3) + t * sp) % 1) * 1920;
        const y = ((rnd(i + 7) + t * sp * 0.4) % 1) * 1080 + Math.sin(t * 0.6 + i) * 16;
        const r = 0.8 + rnd(i + 11) * 2.2;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={(0.12 + rnd(i + 5) * 0.35) * o} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** filtro SVG compartido: borde de tinta gastado para los sellos */
export const InkDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ink10" x="-10%" y="-20%" width="120%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={9} result="n2" />
        <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.6" result="holes" />
        <feComposite in="d" in2="holes" operator="in" />
      </filter>
    </defs>
  </svg>
);

/* ---------- Sello de goma ---------- */
export const Stamp: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number; sub?: string; bg?: string}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.red, rot = -8, size = 72, sub, bg = 'rgba(0,0,0,0)',
}) => {
  if (t < t0 || t > t1) return null;
  const s = Math.min(1, pop(t, t0, 1.5));
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.25, 0.25, easeIn);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1.9 - 0.9 * s})`, opacity: prog(t, t0, 0.08) * (1 - out)}}>
      <div style={{filter: 'url(#ink10)', border: `${Math.round(size / 10)}px solid ${color}`, color, padding: `${size * 0.12}px ${size * 0.38}px ${size * 0.02}px`, borderRadius: size * 0.12, background: bg, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: F.head, fontSize: size, letterSpacing: size * 0.06, lineHeight: 1.08}}>{text}</div>
        {sub ? <div style={{fontFamily: TYPE, fontSize: size * 0.3, letterSpacing: 3, marginTop: -size * 0.04, paddingBottom: size * 0.1}}>{sub}</div> : null}
      </div>
    </div>
  );
};

/* ---------- Máquina de escribir ---------- */
export const Typed: React.FC<{t: number; t0: number; text: string; cps?: number; size?: number; color?: string; style?: React.CSSProperties; cursor?: boolean}> = ({
  t, t0, text, cps = 26, size = 34, color = K.cream, style, cursor = true,
}) => {
  if (t < t0) return null;
  const n = Math.floor((t - t0) * cps);
  const shown = text.slice(0, n);
  const done = n >= text.length;
  return (
    <div style={{fontFamily: TYPE, fontSize: size, color, whiteSpace: 'pre-wrap', lineHeight: 1.25, ...style}}>
      {shown}
      {cursor && (!done || Math.floor(t * 2) % 2 === 0) ? <span style={{opacity: 0.85}}>▌</span> : null}
    </div>
  );
};
export const typedEnd = (t0: number, text: string, cps = 26) => t0 + text.length / cps;

/* ---------- Copia fotográfica de archivo (papel con borde blanco, cinta y epígrafe) ---------- */
export const PhotoCard: React.FC<{
  t: number; t0: number; t1?: number; src: string; x: number; y: number; w: number; h: number; rot?: number; caption?: string; credit?: string; focus?: string; bw?: boolean;
  zoom?: [number, number]; tape?: boolean; from?: 'up' | 'down' | 'left' | 'right'; children?: React.ReactNode; dim?: number; capSize?: number;
}> = ({t, t0, t1 = Infinity, src, x, y, w, h, rot = -2, caption, credit, focus = '50% 30%', bw = true, zoom = [1.0, 1.06], tape = true, from = 'down', children, dim = 0, capSize = 26}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = prog(t, t0, 0.7);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.35, 0.35, easeIn);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = zoom[0] + (zoom[1] - zoom[0]) * clamp((t - t0) / span);
  const off = (1 - a) * 160;
  const dx = from === 'left' ? -off : from === 'right' ? off : 0, dy = from === 'up' ? -off : from === 'down' ? off : 0;
  const pad = Math.round(w * 0.035);
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2 - pad, top: y - h / 2 - pad, width: w + pad * 2, padding: pad, paddingBottom: caption ? pad + capSize * 1.9 : pad, background: '#F3ECDD',
        transform: `translate(${dx}px, ${dy}px) rotate(${rot + (1 - a) * 6}deg)`, opacity: a * (1 - out), boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#222'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: bw ? 'grayscale(1) sepia(0.3) contrast(1.12) brightness(0.98)' : 'sepia(0.15) contrast(1.05)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,25,10,0.35) 100%)'}} />
        {dim ? <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} /> : null}
        {children}
      </div>
      {caption ? (
        <div style={{position: 'absolute', left: pad, right: pad, bottom: pad * 0.7, fontFamily: TYPE, fontSize: capSize, color: K.ink, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden'}}>{caption}</div>
      ) : null}
      {tape ? <div style={{position: 'absolute', left: '50%', top: -18, width: 150, height: 40, marginLeft: -75, background: 'rgba(230,216,170,0.72)', transform: `rotate(${-rot * 1.5 + 3}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}} /> : null}
      {credit ? <div style={{position: 'absolute', right: 4, bottom: -26, fontFamily: F.mono, fontSize: 14, color: 'rgba(241,231,211,0.6)', whiteSpace: 'nowrap', textShadow: '0 1px 3px #000'}}>{credit}</div> : null}
    </div>
  );
};

/* ---------- Ficha de expediente (carpeta manila) ---------- */
export type DossierRow = {k: string; v: string; t0: number; color?: string};
export const Dossier: React.FC<{t: number; t0: number; x: number; y: number; w?: number; title: string; rows: DossierRow[]; photo?: string; photoCredit?: string; o?: number; rot?: number; noPhoto?: boolean}> = ({
  t, t0, x, y, w = 1060, title, rows, photo, photoCredit, o = 1, rot = -1.5, noPhoto,
}) => {
  if (t < t0 - 0.02) return null;
  const a = prog(t, t0, 0.8);
  const h = 640;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: a * o, transform: `translateY(${(1 - a) * 80}px) rotate(${rot + 0.6 * Math.sin((t - t0) * 0.35)}deg) scale(${1 + 0.035 * clamp((t - t0) / 10)})`}}>
      {/* pestaña */}
      <div style={{position: 'absolute', left: 40, top: -46, width: 300, height: 60, background: '#C9A86A', borderRadius: '12px 12px 0 0', boxShadow: '0 -2px 8px rgba(0,0,0,0.3)'}}>
        <div style={{fontFamily: TYPE, fontSize: 24, color: K.ink, padding: '12px 20px', letterSpacing: 2}}>EXPEDIENTE</div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #D7B97E 0%, #C9A86A 100%)', borderRadius: 6, boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: 30, top: 26, right: 30, bottom: 26, background: K.paper, boxShadow: '0 6px 18px rgba(0,0,0,0.25)'}}>
        <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.5}} />
        <div style={{position: 'absolute', left: 40, top: 30, fontFamily: F.head, fontSize: 64, color: K.ink, letterSpacing: 2}}>{title}</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 112, height: 3, background: K.ink, opacity: 0.7}} />
        {/* foto o silueta */}
        <div style={{position: 'absolute', right: 44, top: 140, width: 300, height: 380, background: '#2A241D', boxShadow: '0 6px 14px rgba(0,0,0,0.35)', overflow: 'hidden'}}>
          {photo ? (
            <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', filter: 'grayscale(1) contrast(1.15)'}} />
          ) : (
            <svg width={300} height={380} viewBox="0 0 300 380">
              <rect width={300} height={380} fill="#3A3229" />
              <circle cx={150} cy={140} r={68} fill="#1E1913" />
              <path d="M30 380 C40 260 100 230 150 230 C200 230 260 260 270 380 Z" fill="#1E1913" />
              <text x={150} y={168} textAnchor="middle" fontFamily={F.head} fontSize={110} fill="#5C5145">?</text>
            </svg>
          )}
          {noPhoto ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: TYPE, fontSize: 20, color: '#BFB29C', letterSpacing: 2}}>SIN FOTO PÚBLICA</div> : null}
        </div>
        {photoCredit ? <div style={{position: 'absolute', right: 44, top: 528, width: 300, fontFamily: F.mono, fontSize: 13, color: '#6E6352', textAlign: 'right'}}>{photoCredit}</div> : null}
        <div style={{position: 'absolute', left: 40, top: 140, width: w - 480}}>
          {rows.map((r, i) =>
            t >= r.t0 ? (
              <div key={i} style={{display: 'flex', gap: 16, marginBottom: 14, alignItems: 'baseline'}}>
                <div style={{fontFamily: TYPE, fontSize: 22, color: '#6E6352', width: 150, flexShrink: 0, letterSpacing: 1}}>{r.k}</div>
                <Typed t={t} t0={r.t0} text={r.v} cps={30} size={30} color={r.color ?? K.ink} cursor={false} />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Hoja de calendario ---------- */
const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
export const DateCard: React.FC<{t: number; t0: number; t1?: number; d: number; m: number; y: number; x: number; yPos: number; label?: string; color?: string; size?: number}> = ({
  t, t0, t1 = Infinity, d, m, y, x, yPos, label, color = K.red, size = 1,
}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = prog(t, t0, 0.5);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  const flip = (1 - a) * 90;
  return (
    <div style={{position: 'absolute', left: x, top: yPos, transform: `translate(-50%,-50%) scale(${size}) perspective(800px) rotateX(${flip}deg)`, transformOrigin: '50% 0%', opacity: (1 - out) * Math.min(1, a * 3)}}>
      <div style={{width: 300, background: K.paper, borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.55)', textAlign: 'center'}}>
        <div style={{background: color, color: '#fff', fontFamily: F.head, fontSize: 44, letterSpacing: 6, padding: '8px 0 2px'}}>{MES[m - 1]}</div>
        <div style={{fontFamily: F.head, fontSize: 170, lineHeight: 1.05, color: K.ink}}>{String(d).padStart(2, '0')}</div>
        <div style={{fontFamily: TYPE, fontSize: 34, color: '#5D5244', paddingBottom: 14, marginTop: -8}}>{y}</div>
      </div>
      {label ? <div style={{marginTop: 18, width: 420, marginLeft: -60, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: K.cream, textShadow: '0 2px 10px #000', opacity: prog(t, t0 + 0.3, 0.4)}}>{label}</div> : null}
    </div>
  );
};

/* ---------- Transición: diafragma de cámara que se cierra y se abre, con flash ---------- */
export const ShutterWipe: React.FC<{t: number; at: number; dur?: number}> = ({t, at, dur = 0.7}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  const close = k < 0.5 ? easeIn(k / 0.5) : 1 - easeOut((k - 0.5) / 0.5);
  const R = 1250 * (1 - close); // radio de la abertura
  const flash = k > 0.48 && k < 0.62 ? 1 - Math.abs(k - 0.55) / 0.07 : 0;
  const blades = 7;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} viewBox="-960 -540 1920 1080">
        <defs>
          <radialGradient id="shg" cx="0" cy="0" r="1300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2A2520" />
            <stop offset="1" stopColor="#0A0806" />
          </radialGradient>
        </defs>
        {Array.from({length: blades}, (_, i) => {
          const a0 = (i / blades) * Math.PI * 2 + close * 1.1;
          // cada hoja: un trapecio que gira y cubre desde el radio R hacia afuera
          const p = (ang: number, r: number) => `${Math.cos(ang) * r},${Math.sin(ang) * r}`;
          const w = (Math.PI * 2) / blades;
          return (
            <polygon
              key={i}
              points={[p(a0 - w * 0.62, R), p(a0 + w * 0.75, R * 0.92 + 40), p(a0 + w * 0.9, 1500), p(a0 - w * 0.62, 1500)].join(' ')}
              fill="url(#shg)" stroke="#000" strokeWidth={3}
            />
          );
        })}
      </svg>
      {flash > 0 ? <AbsoluteFill style={{background: '#FFF8EA', opacity: flash * 0.9}} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- Año que corre (1940 → 2025) ---------- */
export const YearRoll: React.FC<{t: number; t0: number; from: number; to: number; dur?: number; x?: number; y?: number; size?: number; color?: string; o?: number; label?: string}> = ({
  t, t0, from, to, dur = 2.0, x = 960, y = 540, size = 260, color = K.cream, o = 1, label,
}) => {
  if (t < t0 - 0.02) return null;
  const k = easeInOut(clamp((t - t0) / dur));
  const v = Math.round(from + (to - from) * k);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: o * prog(t, t0 - 0.2, 0.3)}}>
      <div style={{fontFamily: F.head, fontSize: size, lineHeight: 1, color, letterSpacing: 6, textShadow: '0 16px 50px rgba(0,0,0,0.7)'}}>{v}</div>
      {label ? <div style={{fontFamily: TYPE, fontSize: size * 0.17, color: K.mute, letterSpacing: 4, marginTop: 8}}>{label}</div> : null}
    </div>
  );
};

/* ---------- Etiqueta de museo ---------- */
export const MuseumLabel: React.FC<{t: number; t0: number; x: number; y: number; lines: {text: string; t0: number; style?: React.CSSProperties}[]; w?: number}> = ({t, t0, x, y, lines, w = 560}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.5);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: '26px 32px', background: '#F5F0E6', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: a, transform: `translateX(${(1 - a) * 60}px)`}}>
      {lines.map((l, i) => (
        <div key={i} style={{opacity: prog(t, l.t0, 0.35), transform: `translateY(${(1 - prog(t, l.t0, 0.35)) * 12}px)`, fontFamily: F.quote, fontSize: 30, color: K.ink, lineHeight: 1.3, ...l.style}}>{l.text}</div>
      ))}
    </div>
  );
};

/* ---------- Rótulo de lugar / fecha (esquina superior izquierda) ---------- */
export const Place: React.FC<{t: number; t0: number; t1?: number; a: string; b?: string; color?: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, a, b, color = K.gold, x = 96, y = 84}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const p = prog(t, t0, 0.5);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: 1 - out}}>
      <div style={{position: 'absolute', left: -60, top: -50, width: 760, height: 200, background: 'radial-gradient(ellipse at 30% 50%, rgba(8,6,5,0.6) 0%, rgba(8,6,5,0) 70%)'}} />
      <div style={{position: 'relative', width: 70 * p, height: 5, background: color, marginBottom: 14}} />
      <div style={{position: 'relative', fontFamily: TYPE, fontSize: 34, color: K.cream, letterSpacing: 3, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{a}</div>
      {b ? <div style={{position: 'relative', fontFamily: F.body, fontWeight: 700, fontSize: 24, color: K.mute, letterSpacing: 3, marginTop: 6, opacity: prog(t, t0 + 0.25, 0.4)}}>{b}</div> : null}
    </div>
  );
};

/* ---------- Iconos de personas ---------- */
export const PersonGlyph: React.FC<{size: number; color: string; o?: number}> = ({size, color, o = 1}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50" style={{opacity: o}}>
    <circle cx={20} cy={12} r={9} fill={color} />
    <path d="M4 50 C4 32 12 25 20 25 C28 25 36 32 36 50 Z" fill={color} />
  </svg>
);

/* ---------- Marco dorado con un cuadro (2D) ---------- */
export const GiltFrame: React.FC<{src?: string; w: number; h: number; children?: React.ReactNode; dark?: boolean; bw?: boolean}> = ({src, w, h, children, dark, bw}) => {
  const b = Math.round(w * 0.075);
  return (
    <div style={{position: 'relative', width: w + b * 2, height: h + b * 2, padding: b, boxSizing: 'border-box', background: 'linear-gradient(135deg, #8A6A2A 0%, #E8C877 22%, #9C7A33 45%, #F2D98F 62%, #7A5A22 100%)', boxShadow: '0 30px 70px rgba(0,0,0,0.7), inset 0 0 0 3px rgba(60,40,10,0.6)'}}>
      <div style={{position: 'absolute', inset: b * 0.45, border: '3px solid rgba(70,48,12,0.55)'}} />
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: dark ? '#14100C' : '#2a2018', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'}}>
        {src ? <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: bw ? 'grayscale(1) contrast(1.1)' : undefined}} /> : null}
        {children}
      </div>
    </div>
  );
};

/* ---------- Mapa plano (equirectangular con corrección de latitud) ---------- */
export type MapView = {lon: number; lat: number; scale: number}; // scale: píxeles por grado de longitud
export const mapXY = (v: MapView, lon: number, lat: number): [number, number] => {
  const k = Math.cos((v.lat * Math.PI) / 180);
  return [960 + (lon - v.lon) * v.scale * k, 540 - (lat - v.lat) * v.scale];
};
const FEATS = (countries as any).features as any[];
export const FlatMap: React.FC<{v: MapView; hl?: Record<string, string>; land?: string; sea?: string; stroke?: string; children?: React.ReactNode; o?: number}> = ({
  v, hl = {}, land = '#2B241C', sea = '#0D1114', stroke = 'rgba(241,231,211,0.25)', children, o = 1,
}) => {
  const k = Math.cos((v.lat * Math.PI) / 180);
  const lonMin = v.lon - 1100 / (v.scale * k), lonMax = v.lon + 1100 / (v.scale * k);
  const latMin = v.lat - 620 / v.scale, latMax = v.lat + 620 / v.scale;
  const paths: React.ReactNode[] = [];
  for (const f of FEATS) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    let d = '';
    for (const poly of polys) {
      const ring = poly[0] as number[][];
      // descartar polígonos fuera de la vista
      let inView = false;
      for (const c of ring) if (c[0] > lonMin && c[0] < lonMax && c[1] > latMin && c[1] < latMax) { inView = true; break; }
      if (!inView) continue;
      for (const r of poly as number[][][]) {
        r.forEach((c, i) => {
          const [x, y] = mapXY(v, c[0], c[1]);
          d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        });
        d += 'Z';
      }
    }
    if (d) {
      const a3 = f.properties.a3;
      paths.push(<path key={a3 + paths.length} d={d} fill={hl[a3] ?? land} stroke={stroke} strokeWidth={1.4} fillRule="evenodd" />);
    }
  }
  return (
    <AbsoluteFill style={{background: sea, opacity: o}}>
      <svg width={1920} height={1080}>{paths}{children}</svg>
    </AbsoluteFill>
  );
};

/** ruta animada sobre el mapa plano (línea punteada que avanza y una punta) */
export const MapRoute: React.FC<{v: MapView; pts: [number, number][]; p: number; color?: string; dash?: boolean; width?: number; curve?: number}> = ({v, pts, p, color = K.red, dash = true, width = 5, curve = 0.18}) => {
  if (p <= 0) return null;
  // curva cuadrática por tramo
  const xy = pts.map((q) => mapXY(v, q[0], q[1]));
  const samples: [number, number][] = [];
  for (let s = 0; s < xy.length - 1; s++) {
    const [x0, y0] = xy[s], [x1, y1] = xy[s + 1];
    const mx = (x0 + x1) / 2 - (y1 - y0) * curve, my = (y0 + y1) / 2 + (x1 - x0) * curve;
    for (let i = 0; i < 40; i++) {
      const k = i / 40;
      samples.push([(1 - k) * (1 - k) * x0 + 2 * (1 - k) * k * mx + k * k * x1, (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * my + k * k * y1]);
    }
  }
  samples.push(xy[xy.length - 1]);
  const n = Math.max(2, Math.round(samples.length * clamp(p)));
  const sub = samples.slice(0, n);
  const d = sub.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const head = sub[sub.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash ? `${width * 3} ${width * 2}` : undefined} strokeLinecap="round" />
      <circle cx={head[0]} cy={head[1]} r={width * 2.2} fill="#fff" />
      <circle cx={head[0]} cy={head[1]} r={width * 4} fill="none" stroke={color} strokeWidth={2} opacity={0.6} />
    </g>
  );
};
export const MapPin: React.FC<{v: MapView; lon: number; lat: number; label: string; o?: number; color?: string; side?: 'l' | 'r'; sub?: string; size?: number}> = ({v, lon, lat, label, o = 1, color = K.gold, side = 'r', sub, size = 30}) => {
  if (o <= 0) return null;
  const [x, y] = mapXY(v, lon, lat);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={11} fill={color} stroke="#000" strokeWidth={2} />
      <circle cx={x} cy={y} r={22} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      <text x={side === 'r' ? x + 30 : x - 30} y={y + 10} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={TYPE} fontSize={size} fill={K.cream} stroke="#000" strokeWidth={5} paintOrder="stroke">{label}</text>
      {sub ? <text x={side === 'r' ? x + 30 : x - 30} y={y + 10 + size} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={F.body} fontWeight={700} fontSize={size * 0.68} fill={K.mute} stroke="#000" strokeWidth={4} paintOrder="stroke">{sub}</text> : null}
    </g>
  );
};
