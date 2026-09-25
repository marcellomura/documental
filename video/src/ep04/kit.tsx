/* Sistema visual del episodio 4 (Súper Niño): fondo oceánico, etiquetas HUD, transiciones de agua. */
import React from 'react';
import {AbsoluteFill, Img, getInputProps, staticFile} from 'remotion';
import {C, F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog} from '../lib/anim';

export const N = {
  bg0: '#040A11',
  bg1: '#081523',
  bg2: '#0E2236',
  line: 'rgba(150,195,230,0.22)',
  text: '#EEF4F8',
  mute: '#8EA4B8',
  yellow: C.yellow,
  amber: '#FFA630',
  hot: '#FF5A36',
  red: '#E23B2E',
  magenta: '#C2185B',
  cold: '#4EA8DE',
  deep: '#1B4F8A',
  teal: '#39D0C8',
  rain: '#6CB8FF',
  dry: '#D08A45',
  land: '#1A2533',
};

/** densidad de píxeles para los canvas (2 en el render 4K) */
export const DPR: number = Number((getInputProps() as {dpr?: number}).dpr ?? 1);

/* ---------- Fondo ---------- */
export const Ocean: React.FC<{children?: React.ReactNode; glow?: string; grid?: number}> = ({children, glow = 'rgba(40,110,170,0.28)', grid = 0}) => (
  <AbsoluteFill style={{background: N.bg0}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 42%, ${glow} 0%, rgba(8,21,35,0.6) 45%, ${N.bg0} 100%)`}} />
    {grid ? (
      <AbsoluteFill
        style={{
          opacity: grid,
          backgroundImage: `linear-gradient(${N.line} 1px, transparent 1px), linear-gradient(90deg, ${N.line} 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: '0 0',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)',
        }}
      />
    ) : null}
    {children}
  </AbsoluteFill>
);

export const Vignette: React.FC<{k?: number}> = ({k = 0.55}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}) 100%)`}} />
);

/* ---------- Tipografía ---------- */
export const Kicker: React.FC<{t: number; t0: number; t1?: number; text: string; x?: number; y?: number; color?: string; size?: number}> = ({
  t, t0, t1 = Infinity, text, x = 110, y = 96, color = N.yellow, size = 26,
}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.5);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 16, opacity: o}}>
      <div style={{width: 46 * a, height: 6, background: color}} />
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: size, letterSpacing: 6, color: N.text, textTransform: 'uppercase', clipPath: `inset(0 ${100 - a * 100}% 0 0)`}}>{text}</div>
    </div>
  );
};

/** titular que entra palabra por palabra con máscara */
export const Headline: React.FC<{t: number; t0: number; text: string; size?: number; color?: string; stagger?: number; style?: React.CSSProperties; hl?: string[]; hlColor?: string}> = ({
  t, t0, text, size = 110, color = N.text, stagger = 0.07, style, hl = [], hlColor = N.yellow,
}) => (
  <div style={{fontFamily: F.head, fontSize: size, lineHeight: 1.02, color, textTransform: 'uppercase', letterSpacing: 1, ...style}}>
    {text.split(' ').map((w, i) => {
      const p = prog(t, t0 + i * stagger, 0.55);
      return (
        <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', marginRight: size * 0.22, paddingBottom: size * 0.06}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, color: hl.includes(w) ? hlColor : undefined}}>{w}</span>
        </span>
      );
    })}
  </div>
);

export const Num: React.FC<{t: number; t0: number; t1: number; to: number; from?: number; dec?: number; prefix?: string; suffix?: string; style?: React.CSSProperties}> = ({
  t, t0, t1, to, from = 0, dec = 0, prefix = '', suffix = '', style,
}) => {
  const p = clamp((t - t0) / (t1 - t0));
  const e = 1 - Math.pow(1 - p, 3);
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{prefix}{fmt(from + (to - from) * e, dec)}{suffix}</span>;
};

/* ---------- Etiqueta HUD con punto y línea guía ---------- */
export const Tag: React.FC<{
  t: number; t0: number; t1?: number; x: number; y: number; dx?: number; dy?: number; title: string; value?: React.ReactNode;
  color?: string; size?: number; align?: 'left' | 'right'; dot?: boolean; w?: number;
}> = ({t, t0, t1 = Infinity, x, y, dx = 120, dy = -90, title, value, color = N.yellow, size = 64, align, dot = true, w}) => {
  if (t < t0 - 0.02) return null;
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  if (out >= 1) return null;
  const a = prog(t, t0, 0.35);
  const b = prog(t, t0 + 0.15, 0.45);
  const side = align ?? (dx >= 0 ? 'left' : 'right');
  const ex = x + dx, ey = y + dy;
  const len = Math.hypot(dx, dy);
  const pulse = (t - t0) % 1.6;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {dot ? (
          <>
            <circle cx={x} cy={y} r={10 + pulse * 26} fill="none" stroke={color} strokeWidth={2} opacity={Math.max(0, 1 - pulse / 1.2) * a} />
            <circle cx={x} cy={y} r={9 * pop(t, t0)} fill={color} />
          </>
        ) : null}
        <line x1={x} y1={y} x2={x + dx * a} y2={y + dy * a} stroke={color} strokeWidth={2.5} strokeDasharray={len} strokeDashoffset={0} />
        <line x1={ex} y1={ey} x2={ex + (side === 'left' ? 1 : -1) * 40 * b} y2={ey} stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: 'absolute', top: ey - 14, [side === 'left' ? 'left' : 'right']: side === 'left' ? ex + 52 : 1920 - ex + 52, width: w,
          textAlign: side, opacity: b, transform: `translateX(${(1 - b) * (side === 'left' ? -24 : 24)}px)`,
        }}
      >
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: N.mute, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{title}</div>
        {value !== undefined ? <div style={{fontFamily: F.head, fontSize: size, lineHeight: 1.05, color, whiteSpace: 'nowrap', marginTop: 4}}>{value}</div> : null}
      </div>
    </div>
  );
};

/* ---------- Fuente / crédito ---------- */
export const Src: React.FC<{t: number; t0: number; text: string; x?: number; y?: number; align?: 'left' | 'right'}> = ({t, t0, text, x = 110, y = 1022, align = 'left'}) => (
  <div
    style={{
      position: 'absolute', top: y, [align]: align === 'left' ? x : 1920 - x, fontFamily: F.mono, fontSize: 17, letterSpacing: 0.5,
      color: 'rgba(210,225,238,0.62)', opacity: prog(t, t0, 0.5), whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

/* ---------- Marco de foto oscuro ---------- */
export const Frame: React.FC<{
  src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; credit?: string; zoom?: [number, number]; focus?: string;
  rot?: number; enter?: 'rise' | 'fade' | 'left' | 'right' | 'clip'; grade?: string; children?: React.ReactNode; radius?: number;
}> = ({src, t, t0, t1 = Infinity, x, y, w, h, credit, zoom = [1.04, 1.14], focus = '50% 50%', rot = 0, enter = 'rise', grade, children, radius = 6}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = prog(t, t0, 0.7);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.35, 0.35, easeIn);
  const span = (t1 === Infinity ? 8 : t1 - t0) || 8;
  const sc = zoom[0] + (zoom[1] - zoom[0]) * clamp((t - t0) / span);
  let tr = '';
  let clip = 'inset(0 0 0 0)';
  if (enter === 'rise') tr = `translateY(${(1 - a) * 80}px)`;
  if (enter === 'left') tr = `translateX(${(1 - a) * -160}px)`;
  if (enter === 'right') tr = `translateX(${(1 - a) * 160}px)`;
  if (enter === 'clip') clip = `inset(${(1 - a) * 50}% 0 ${(1 - a) * 50}% 0 round ${radius}px)`;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `${tr} rotate(${rot}deg)`, opacity: Math.min(clamp((t - t0) / 0.25), 1 - out), clipPath: clip}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', background: '#000'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus}} />
        {grade ? <div style={{position: 'absolute', inset: 0, background: grade}} /> : null}
        <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 0 90px rgba(0,0,0,0.35)', borderRadius: radius}} />
        {children}
      </div>
      {credit ? (
        <div style={{position: 'absolute', left: 0, top: h + 12, fontFamily: F.mono, fontSize: 16, color: 'rgba(210,225,238,0.6)', whiteSpace: 'nowrap'}}>{credit}</div>
      ) : null}
    </div>
  );
};

/* ---------- Transición de agua: tres olas suben, cubren el corte y siguen de largo ---------- */
const waveEdge = (level: number, t: number, amp: number, freq: number, phase: number, rev = false) => {
  const pts: string[] = [];
  for (let x = -40; x <= 1960; x += 40) {
    const y = level + Math.sin(x * freq + t * 5 + phase) * amp + Math.sin(x * freq * 2.3 - t * 3.1 + phase) * amp * 0.35;
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  if (rev) pts.reverse();
  return pts.join(' L ');
};
export const WaveWipe: React.FC<{t: number; at: number; colors?: [string, string, string]; dur?: number}> = ({t, at, colors = [N.yellow, N.deep, N.bg1], dur = 1.2}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  const bands = [0, 1, 2].map((i) => {
    const top = 1200 - easeInOut(clamp((k - i * 0.05) / 0.4)) * 1400;
    const bot = 1240 - easeInOut(clamp((k - 0.5 - (2 - i) * 0.05) / 0.4)) * 1500;
    const amp = 34 - i * 7, fr = 0.0032 + i * 0.0008, ph = i * 1.9;
    return `M ${waveEdge(top, t, amp, fr, ph)} L ${waveEdge(Math.max(bot, top), t, amp * 0.8, fr * 1.1, ph + 1, true)} Z`;
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {bands.map((d, i) => <path key={i} d={d} fill={colors[i]} />)}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Destello de impacto ---------- */
export const Flash: React.FC<{t: number; at: number; color?: string; dur?: number; max?: number}> = ({t, at, color = '#fff', dur = 0.5, max = 0.85}) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  return <AbsoluteFill style={{background: color, opacity: max * (1 - easeOut(k)), mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

/* ---------- Barras de cine para énfasis ---------- */
export const Bars: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 * k, background: '#000'}} />
    </>
  );

/* ---------- Logo CONTEXTO (variante transparente) ---------- */
export const LogoMark: React.FC<{size: number; t?: number; t0?: number; style?: React.CSSProperties}> = ({size, t = 99, t0 = 0, style}) => {
  // animación de armado: sombra se desliza, cuadrado rebota
  const p = pop(t, t0, 0.8);
  const sh = prog(t, t0 + 0.25, 0.45);
  const off = size * 0.075;
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      <div style={{position: 'absolute', left: off * sh, top: off * sh, width: size, height: size, background: '#0B0B0C', borderRadius: size * 0.02, opacity: clamp((t - t0) / 0.2)}} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${Math.max(0, p)})`, transformOrigin: '50% 50%'}}>
        <Img src={staticFile('brand/logo_c.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
    </div>
  );
};

/** sello chico del canal en la esquina */
export const Bug: React.FC<{o: number}> = ({o}) =>
  o <= 0 ? null : (
    <div style={{position: 'absolute', right: 56, top: 50, display: 'flex', alignItems: 'center', gap: 12, opacity: o * 0.9}}>
      <Img src={staticFile('brand/logo_transparente.png')} style={{width: 58, height: 58, objectFit: 'contain'}} />
    </div>
  );

/* ---------- Iconos vectoriales simples ---------- */
export const Fish: React.FC<{x: number; y: number; s?: number; color?: string; o?: number; flip?: boolean}> = ({x, y, s = 1, color = N.teal, o = 1, flip}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={o}>
    <path d="M-22 0 C-12 -12 10 -12 20 0 C10 12 -12 12 -22 0 Z" fill={color} />
    <path d="M18 0 L32 -10 L30 0 L32 10 Z" fill={color} />
    <circle cx={-12} cy={-2} r={2.2} fill={N.bg0} />
  </g>
);

export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string; o?: number}> = ({x, y, s = 1, color = '#DCE8F2', o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-60 20 C-80 20 -84 -6 -62 -12 C-60 -38 -26 -44 -14 -26 C-6 -48 30 -48 36 -20 C60 -24 70 4 54 20 Z" fill={color} />
  </g>
);

/** gotas de lluvia deterministas dentro de un rectángulo */
export const Rain: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number; color?: string; o?: number; speed?: number; len?: number}> = ({
  t, x, y, w, h, n = 40, color = N.rain, o = 1, speed = 700, len = 26,
}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const rx = ((i * 97.13) % 1) * 0 + ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const ph = ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1;
      const yy = ((t * speed / h + ph) % 1) * (h + len) - len;
      return <line key={i} x1={x + rx * w} y1={y + yy} x2={x + rx * w - 6} y2={y + yy + len} stroke={color} strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />;
    })}
  </g>
);

export const Flame: React.FC<{x: number; y: number; s?: number; t: number; o?: number}> = ({x, y, s = 1, t, o = 1}) => {
  const f = 1 + Math.sin(t * 17 + x) * 0.08;
  return (
    <g transform={`translate(${x},${y}) scale(${s}, ${s * f})`} opacity={o}>
      <path d="M0 -40 C18 -18 22 -4 14 10 C8 20 -8 20 -14 10 C-20 -2 -12 -14 -6 -22 C-4 -12 2 -10 4 -16 C6 -24 2 -32 0 -40 Z" fill={N.hot} />
      <path d="M0 -14 C8 -4 8 6 4 10 C0 14 -6 12 -7 6 C-8 0 -4 -6 0 -14 Z" fill={N.yellow} />
    </g>
  );
};

/** ventilador (alisios) con aspas que giran a velocidad `spin` (vueltas/s acumuladas) */
export const Fan: React.FC<{x: number; y: number; s?: number; angle: number; color?: string; off?: number}> = ({x, y, s = 1, angle, color = N.text, off = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={78} fill="none" stroke={color} strokeWidth={5} opacity={0.9} />
    <g transform={`rotate(${angle})`} opacity={1 - off * 0.35}>
      {[0, 120, 240].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 -8 C18 -30 18 -64 0 -70 C-14 -60 -14 -30 0 -8 Z" fill={color} />
      ))}
    </g>
    <circle r={9} fill={color} />
    <line x1={0} y1={78} x2={0} y2={150} stroke={color} strokeWidth={6} />
    <line x1={-40} y1={150} x2={40} y2={150} stroke={color} strokeWidth={6} strokeLinecap="round" />
  </g>
);

export {easeIn, easeInOut, easeOut, prog, pop, clamp};

/** texto relleno con el mapa real de anomalía (lengua caliente del Pacífico), con deriva lenta */
export const HeatText: React.FC<{text: string; size: number; t: number; style?: React.CSSProperties; drift?: number}> = ({text, size, t, style, drift = 14}) => {
  const src = staticFile('ep04/maps/sst_2026.png');
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <Img src={src} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
      <div
        style={{
          fontFamily: F.head, fontSize: size, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 2, whiteSpace: 'nowrap',
          backgroundImage: `url(${src}), linear-gradient(90deg, ${N.amber}, ${N.hot} 55%, ${N.magenta})`,
          backgroundSize: `${size * 16}px ${size * 5.36}px, 100% 100%`,
          backgroundPosition: `${-size * 8.2 - t * drift}px ${-size * 2.35}px, 0 0`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          filter: 'saturate(1.25) contrast(1.1)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** transición iris: círculo que se abre desde un punto con borde amarillo */
export const Iris: React.FC<{t: number; at: number; x?: number; y?: number; dur?: number; color?: string}> = ({t, at, x = 960, y = 540, dur = 0.9, color = N.bg0}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  // cierra (0→0.5) y abre (0.5→1)
  const R = 2300;
  const r = k < 0.5 ? R * (1 - easeIn(k * 2)) : R * easeOut((k - 0.5) * 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        <defs>
          <mask id="iris-m">
            <rect width={1920} height={1080} fill="white" />
            <circle cx={x} cy={y} r={Math.max(0, r)} fill="black" />
          </mask>
        </defs>
        <rect width={1920} height={1080} fill={color} mask="url(#iris-m)" />
        <circle cx={x} cy={y} r={Math.max(0, r)} fill="none" stroke={N.yellow} strokeWidth={10} />
      </svg>
    </AbsoluteFill>
  );
};
