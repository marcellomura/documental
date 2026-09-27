/* Sistema visual del episodio 6 (La paradoja de la carne): fondo de brasa, archivo real, ticket de carnicería,
   corte de cuchillo como transición y etiquetas de precio. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';

export const K = {
  bg0: '#0B0806',
  bg1: '#150F0B',
  bg2: '#211811',
  cream: '#F4ECDD',
  mute: '#A5988A',
  line: 'rgba(244,236,221,0.16)',
  yellow: '#FFCC33',
  red: '#E23B2E',
  ember: '#FF6A2B',
  cria: '#7DB356',
  inv: '#E3B341',
  frig: '#7FB6E6',
  carn: '#EE82A8',
  imp: '#E23B2E',
  celeste: '#74ACDF',
  pollo: '#F2C77E',
};
export const LINKS = [
  {id: 'cria', name: 'CRIADOR', short: 'CRÍA', share: 35, amount: 6475, color: K.cria},
  {id: 'inv', name: 'INVERNADOR', short: 'ENGORDE', share: 16, amount: 2960, color: K.inv},
  {id: 'frig', name: 'FRIGORÍFICO', short: 'FRIGORÍFICO', share: 1, amount: 185, color: K.frig},
  {id: 'carn', name: 'CARNICERÍA', short: 'CARNICERÍA', share: 20, amount: 3700, color: K.carn},
  {id: 'imp', name: 'IMPUESTOS', short: 'IMPUESTOS', share: 28, amount: 5180, color: K.imp},
];
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

/* ---------- Fondo de brasa ---------- */
export const Ember: React.FC<{glow?: string; children?: React.ReactNode; k?: number; x?: number; y?: number}> = ({glow = 'rgba(200,80,30,0.26)', children, k = 1, x = 50, y = 62}) => (
  <AbsoluteFill style={{background: K.bg0}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 75% at ${x}% ${y}%, ${glow} 0%, rgba(21,15,11,${0.7 * k}) 48%, ${K.bg0} 100%)`}} />
    {children}
  </AbsoluteFill>
);

export const Vig: React.FC<{k?: number}> = ({k = 0.6}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,${k}) 100%)`}} />
);

/** chispas que suben (brasas del asado) */
export const Sparks: React.FC<{t: number; n?: number; o?: number; area?: [number, number, number, number]}> = ({t, n = 46, o = 1, area = [0, 300, 1920, 1080]}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: n}, (_, i) => {
        const life = 2.2 + rnd(i) * 2.6;
        const ph = ((t + rnd(i + 9) * life) % life) / life;
        const x = area[0] + rnd(i + 3) * (area[2] - area[0]) + Math.sin(t * (0.8 + rnd(i)) + i) * 26;
        const y = area[3] - ph * (area[3] - area[1]) * (0.7 + rnd(i + 5) * 0.5);
        const r = (1.2 + rnd(i + 7) * 2.6) * (1 - ph * 0.5);
        const a = Math.sin(ph * Math.PI) * (0.5 + rnd(i + 2) * 0.5) * o;
        return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? '#FFB347' : '#FF6A2B'} opacity={a} />;
      })}
    </svg>
  </AbsoluteFill>
);

/* ---------- Archivo a pantalla completa ---------- */
export const FullPhoto: React.FC<{
  src: string; t: number; t0: number; t1?: number; zoom?: [number, number]; focus?: string; pan?: [number, number]; grade?: string; dim?: number; bw?: boolean; fade?: number; credit?: string; blur?: number;
}> = ({src, t, t0, t1 = Infinity, zoom = [1.04, 1.16], focus = '50% 50%', pan = [0, 0], grade, dim = 0.25, bw, fade = 0.5, credit, blur = 0}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const span = t1 === Infinity ? 8 : t1 - t0;
  const k = clamp((t - t0) / span);
  const o = Math.min(prog(t, t0, fade), t1 === Infinity ? 1 : 1 - prog(t, t1 - fade, fade, easeIn));
  const sc = zoom[0] + (zoom[1] - zoom[0]) * k;
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transformOrigin: focus,
          transform: `scale(${sc}) translate(${pan[0] * k}px, ${pan[1] * k}px)`,
          filter: `${bw ? 'grayscale(1) sepia(0.25) contrast(1.15)' : 'contrast(1.06) saturate(0.95)'} ${blur ? `blur(${blur}px)` : ''}`,
        }}
      />
      {grade ? <AbsoluteFill style={{background: grade, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.6}) 0%, rgba(0,0,0,${dim * 0.2}) 40%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit text={credit} /> : null}
    </AbsoluteFill>
  );
};

export const FullVideo: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: number; rate?: number; zoom?: [number, number]; grade?: string; dim?: number; bw?: boolean; fade?: number; credit?: string; focus?: string;
}> = ({src, t, t0, t1 = Infinity, from = 0, rate = 1, zoom = [1.02, 1.1], grade, dim = 0.25, bw, fade = 0.45, credit, focus = '50% 50%'}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const span = t1 === Infinity ? 8 : t1 - t0;
  const k = clamp((t - t0) / span);
  const o = Math.min(prog(t, t0, fade), t1 === Infinity ? 1 : 1 - prog(t, t1 - fade, fade, easeIn));
  const sc = zoom[0] + (zoom[1] - zoom[0]) * k;
  // la secuencia arranca (en cuadros absolutos) cuando t = t0; el video se reproduce desde "from"
  const startFrame = frame - Math.round((t - t0) * fps);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Sequence from={startFrame} layout="none">
        <OffthreadVideo
          src={staticFile(src)}
          muted
          playbackRate={rate}
          trimBefore={Math.round(from * fps)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: bw ? 'grayscale(1) contrast(1.1)' : 'contrast(1.05) saturate(0.95)'}}
        />
      </Sequence>
      {grade ? <AbsoluteFill style={{background: grade, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.6}) 0%, rgba(0,0,0,${dim * 0.2}) 40%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit text={credit} /> : null}
    </AbsoluteFill>
  );
};

export const Credit: React.FC<{text: string; x?: number; y?: number; align?: 'left' | 'right'; o?: number}> = ({text, x = 60, y = 1034, align = 'right', o = 1}) => (
  <div
    style={{
      position: 'absolute', top: y, [align]: x, fontFamily: F.mono, fontSize: 16, letterSpacing: 0.4, color: 'rgba(244,236,221,0.66)', whiteSpace: 'nowrap', opacity: o,
      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    }}
  >
    {text}
  </div>
);

/* ---------- Tipografía ---------- */
export const Big: React.FC<{t: number; t0: number; t1?: number; text: string; size?: number; color?: string; hl?: Record<string, string>; x?: number; y?: number; align?: 'left' | 'center' | 'right'; stagger?: number; w?: number; shadow?: boolean; lh?: number}> = ({
  t, t0, t1 = Infinity, text, size = 120, color = K.cream, hl = {}, x = 960, y = 540, align = 'center', stagger = 0.06, w = 1700, shadow = true, lh = 1.0,
}) => {
  if (t < t0 - 0.02) return null;
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  if (out >= 1) return null;
  const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
  return (
    <div
      style={{
        position: 'absolute', left, top: y, width: w, transform: 'translateY(-50%)', textAlign: align, fontFamily: F.head, fontSize: size, lineHeight: lh, color,
        textTransform: 'uppercase', letterSpacing: 1, opacity: 1 - out, textShadow: shadow ? '0 6px 30px rgba(0,0,0,0.65)' : undefined,
      }}
    >
      {text.split(' ').map((wd, i) => {
        if (wd === '|') return <br key={i} />;
        const p = prog(t, t0 + i * stagger, 0.5);
        const clean = wd.replace(/[.,:;¿?¡!]/g, '');
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', margin: `0 ${size * 0.11}px`, paddingTop: size * 0.18, marginTop: -size * 0.18, paddingBottom: size * 0.04}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 120}%)`, color: hl[clean] ?? undefined}}>{wd}</span>
          </span>
        );
      })}
    </div>
  );
};

/** rótulo de capítulo: "ESLABÓN 1 · EL CRIADOR" */
export const LinkTag: React.FC<{t: number; t0: number; t1?: number; n: string; name: string; color: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, n, name, color, x = 96, y = 92}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.55);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, display: 'flex', alignItems: 'stretch', gap: 0, transform: `translateX(${(1 - a) * -40}px)`}}>
      <div style={{background: color, color: K.bg0, fontFamily: F.head, fontSize: 40, padding: '6px 18px 2px', lineHeight: 1.05, clipPath: `inset(0 ${100 - a * 100}% 0 0)`}}>{n}</div>
      <div style={{background: 'rgba(11,8,6,0.72)', border: `2px solid ${color}`, borderLeft: 'none', color: K.cream, fontFamily: F.head, fontSize: 40, padding: '6px 20px 2px', lineHeight: 1.05, letterSpacing: 1, clipPath: `inset(0 ${100 - prog(t, t0 + 0.12, 0.5) * 100}% 0 0)`}}>
        {name}
      </div>
    </div>
  );
};

/** chip con texto chico (costos, ingredientes, etc.) */
export const Chip: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; size?: number; icon?: React.ReactNode; bg?: string; fg?: string}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.yellow, size = 34, icon, bg = 'rgba(11,8,6,0.78)', fg = K.cream,
}) => {
  if (t < t0) return null;
  const s = pop(t, t0, 1.1);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.25, 0.25);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${Math.max(0, s)})`, opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: bg, border: `3px solid ${color}`, borderRadius: 999, padding: `${size * 0.22}px ${size * 0.62}px ${size * 0.16}px`, whiteSpace: 'nowrap', boxShadow: '0 12px 30px rgba(0,0,0,0.45)'}}>
        {icon}
        <span style={{fontFamily: F.head, fontSize: size, color: fg, letterSpacing: 1, lineHeight: 1.05}}>{text}</span>
      </div>
    </div>
  );
};

/** etiqueta de precio flotante (se usa sobre el 3D) */
export const PriceLabel: React.FC<{x: number; y: number; value: number; color: string; o?: number; title?: string; size?: number; prefix?: string}> = ({x, y, value, color, o = 1, title, size = 44, prefix = '$'}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${0.85 + 0.15 * o})`, opacity: o, textAlign: 'center'}}>
      {title ? <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 17, letterSpacing: 3, color: K.cream, opacity: 0.8, marginBottom: 4, whiteSpace: 'nowrap', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{title}</div> : null}
      <div style={{background: color, color: K.bg0, fontFamily: F.head, fontSize: size, lineHeight: 1, padding: `${size * 0.14}px ${size * 0.3}px ${size * 0.08}px`, borderRadius: 8, boxShadow: '0 10px 26px rgba(0,0,0,0.55)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
        {prefix}{fmt(value)}
      </div>
      <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `12px solid ${color}`}} />
    </div>
  );

/** número grande que cuenta */
export const Count: React.FC<{t: number; t0: number; dur?: number; to: number; from?: number; prefix?: string; suffix?: string; dec?: number}> = ({t, t0, dur = 1, to, from = 0, prefix = '', suffix = '', dec = 0}) => {
  const k = easeOut(clamp((t - t0) / dur));
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{prefix}{fmt(from + (to - from) * k, dec)}{suffix}</span>;
};

export const SrcLine: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; align?: 'left' | 'right'}> = ({t, t0, text, x = 96, y = 1022, align = 'left'}) => (
  <div style={{position: 'absolute', top: y, [align]: x, fontFamily: F.mono, fontSize: 17, color: 'rgba(244,236,221,0.6)', opacity: prog(t, t0, 0.5), whiteSpace: 'nowrap'}}>{text}</div>
);

/* ---------- Corte de cuchilla: transición diagonal con filo brillante ---------- */
export const SlashWipe: React.FC<{t: number; at: number; color?: string; dur?: number; dir?: 1 | -1}> = ({t, at, color = K.bg0, dur = 0.8, dir = 1}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  // una hoja oscura cruza en diagonal: tapa (0→0.5), destapa (0.5→1)
  const e = easeInOut(k);
  const x = -700 + e * 3320; // borde delantero
  const tail = 1500;
  const s = dir;
  const poly = (x0: number, x1: number) => `${x0 + 420},0 ${x1 + 420},0 ${x1 - 420},1080 ${x0 - 420},1080`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: s < 0 ? 'scaleX(-1)' : undefined}}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="slashG" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FFF4E0" stopOpacity="0" />
            <stop offset="0.8" stopColor="#FFE2B0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>
        <polygon points={poly(x - tail, x)} fill={color} />
        <polygon points={poly(x - 60, x + 6)} fill="url(#slashG)" />
        <polygon points={poly(x - tail - 8, x - tail + 4)} fill={K.red} opacity={0.9} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Pictogramas ---------- */
export const CowIcon: React.FC<{size?: number; color?: string}> = ({size = 60, color = K.cream}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62">
    <path
      fill={color}
      d="M14 22 C14 15 20 12 28 12 L64 12 C70 12 74 10 78 8 L80 3 L83 8 L88 7 L90 3 L92 9 C96 11 98 15 98 20 C98 25 95 27 91 27 L88 27 C86 30 84 31 82 32 L81 44 L81 58 L76 58 L75 45 C72 45 68 46 64 46 L62 58 L57 58 L56 46 C48 46 40 46 34 45 L33 58 L28 58 L27 44 C24 43 22 42 21 40 L20 58 L15 58 L14 40 C12 36 12 31 12 28 C8 30 6 36 5 42 L3 42 C3 34 6 26 14 22 Z"
    />
  </svg>
);
export const PersonIcon: React.FC<{size?: number; color?: string}> = ({size = 60, color = K.celeste}) => (
  <svg width={size * 0.5} height={size} viewBox="0 0 30 60">
    <circle cx={15} cy={9} r={7} fill={color} />
    <path fill={color} d="M6 20 Q15 16 24 20 L26 38 L22 38 L21 58 L16 58 L15 42 L14 58 L9 58 L8 38 L4 38 Z" />
  </svg>
);
export const ChickenIcon: React.FC<{size?: number; color?: string}> = ({size = 60, color = K.pollo}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 80">
    <path fill={color} d="M30 20 C30 10 38 4 46 6 C52 8 54 14 52 20 C62 22 78 22 88 14 C92 30 86 50 70 58 L66 72 L62 72 L60 60 L50 60 L48 72 L44 72 L42 58 C30 54 24 44 26 34 L16 32 L26 26 C27 23 28 21 30 20 Z" />
    <path fill={K.red} d="M38 4 C40 0 44 0 44 4 C47 1 50 3 48 7 Z" />
  </svg>
);

/* ---------- Balanza de aguja (hacienda / carnicería) ---------- */
export const Dial: React.FC<{kg: number; max?: number; size?: number; label?: string; color?: string}> = ({kg, max = 500, size = 420, label = 'KG', color = K.red}) => {
  const a0 = -130, a1 = 130;
  const ang = a0 + (a1 - a0) * clamp(kg / max);
  const R = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`}>
      <circle r={R - 4} fill="#EFE7D6" stroke="#2C2520" strokeWidth={10} />
      <circle r={R - 18} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={2} />
      {Array.from({length: 51}, (_, i) => {
        const a = ((a0 + ((a1 - a0) * i) / 50) * Math.PI) / 180;
        const long = i % 5 === 0;
        const r1 = R - 26, r2 = r1 - (long ? 26 : 12);
        return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke="#2C2520" strokeWidth={long ? 4 : 2} />;
      })}
      {Array.from({length: 11}, (_, i) => {
        const a = ((a0 + ((a1 - a0) * i) / 10) * Math.PI) / 180;
        const r = R - 76;
        return (
          <text key={i} x={Math.sin(a) * r} y={-Math.cos(a) * r + 9} textAnchor="middle" fontFamily="Anton" fontSize={size * 0.062} fill="#2C2520">
            {Math.round((max * i) / 10)}
          </text>
        );
      })}
      <text y={R * 0.42} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={size * 0.05} letterSpacing={4} fill="#6B5E52">{label}</text>
      <g transform={`rotate(${ang})`}>
        <path d={`M -7 18 L 0 ${-(R - 34)} L 7 18 Z`} fill={color} />
      </g>
      <circle r={16} fill="#2C2520" />
      <circle r={6} fill={color} />
    </svg>
  );
};

/* ---------- Ticket de carnicería (papel térmico que se imprime línea por línea) ---------- */
export type TicketLine = {label: string; value: number; t0: number; color?: string; strong?: boolean};
export const Ticket: React.FC<{t: number; t0: number; lines: TicketLine[]; total?: {t0: number; value: number}; x?: number; y?: number; w?: number; circle?: {t0: number; line: number}; title?: string}> = ({
  t, t0, lines, total, x = 560, y = 110, w = 600, circle, title = 'TU KILO DE CARNE',
}) => {
  if (t < t0) return null;
  const rowH = 74;
  const shown = lines.filter((l) => t >= l.t0).length;
  const headH = 210;
  const h = headH + shown * rowH + (total && t >= total.t0 ? 150 : 40);
  const printed = h * easeOut(clamp((t - t0) / 0.6));
  const edge = (n: number) =>
    Array.from({length: n + 1}, (_, i) => `${100 - (i / n) * 100}% ${i % 2 ? 100 : 97}%`).join(',');
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: printed + 20, overflow: 'hidden', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))'}}>
      <div
        style={{
          position: 'absolute', left: 0, top: printed - h, width: w, height: h + 20,
          background: 'linear-gradient(90deg, #EDEAE2 0%, #FAF8F3 12%, #FFFFFF 50%, #F7F4EE 88%, #E8E4DA 100%)',
          clipPath: `polygon(0 0, 100% 0, ${edge(40)}, 0 97%)`,
          fontFamily: F.mono, color: '#26221E', padding: '34px 44px',
        }}
      >
        <div style={{textAlign: 'center', fontFamily: F.head, fontSize: 44, letterSpacing: 2}}>{title}</div>
        <div style={{textAlign: 'center', fontSize: 20, marginTop: 6, color: '#6A625A'}}>DEL CAMPO A TU MESA · 1 KG</div>
        <div style={{borderTop: '3px dashed #9C948A', margin: '22px 0 10px'}} />
        {lines.map((l, i) => {
          if (t < l.t0) return null;
          const a = prog(t, l.t0, 0.3);
          return (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: rowH, fontSize: 36, fontWeight: l.strong ? 800 : 600, color: l.color ?? '#26221E', opacity: a, position: 'relative'}}>
              <span style={{whiteSpace: 'nowrap'}}>{l.label}</span>
              <span style={{flex: 1, borderBottom: '3px dotted #B8B0A5', margin: '0 14px', transform: 'translateY(-8px)'}} />
              <span style={{fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>${fmt(l.value)}</span>
              {circle && circle.line === i && t > circle.t0 ? (
                <svg width={w - 40} height={rowH + 20} style={{position: 'absolute', left: -24, top: -18, overflow: 'visible'}}>
                  <ellipse
                    cx={(w - 40) / 2} cy={(rowH + 20) / 2 - 4} rx={(w - 70) / 2} ry={rowH / 2 + 2} fill="none" stroke={K.red} strokeWidth={6}
                    strokeDasharray={1800} strokeDashoffset={1800 * (1 - easeOut(clamp((t - circle.t0) / 0.6)))} transform={`rotate(-2 ${(w - 40) / 2} ${(rowH + 20) / 2})`}
                  />
                </svg>
              ) : null}
            </div>
          );
        })}
        {total && t >= total.t0 ? (
          <div style={{opacity: prog(t, total.t0, 0.3)}}>
            <div style={{borderTop: '3px solid #26221E', margin: '16px 0 10px'}} />
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.head, fontSize: 64}}>
              <span>TOTAL</span>
              <span style={{fontVariantNumeric: 'tabular-nums'}}>${fmt(total.value)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- Barra de tiempo (meses / semanas) ---------- */
export const TimeBar: React.FC<{x: number; y: number; w: number; p: number; color: string; label: string; value: string; h?: number; vo?: number}> = ({x, y, w, p, color, label, value, h = 46, vo}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: K.mute, marginBottom: 10}}>{label}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{width: Math.max(4, w * p), height: h, background: color, borderRadius: 6, boxShadow: `0 0 30px ${color}55`}} />
      <div style={{fontFamily: F.head, fontSize: h * 1.1, color: K.cream, opacity: vo ?? clamp(p * 4), whiteSpace: 'nowrap'}}>{value}</div>
    </div>
  </div>
);

export const Panel: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; o?: number; style?: React.CSSProperties}> = ({x, y, w, h, children, o = 1, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, background: 'rgba(14,10,8,0.8)', border: `1px solid ${K.line}`, borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', ...style}}>{children}</div>
);
