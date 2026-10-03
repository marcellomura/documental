/* Sistema visual del episodio 12 (ARA San Juan): "abismo".
   Azul abisal casi negro, cian de sonar, verde de pantalla, ámbar de alerta y rojo de colapso.
   Tipografía nueva del canal: Archivo variable (el ancho y el peso se animan), Instrument Serif para lo humano
   y IBM Plex Mono para los datos, las horas y las coordenadas. Todo el archivo se etaloniza en frío. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

export const K = {
  abyss: '#01050A',
  deep: '#030E1A',
  navy: '#06192B',
  ocean: '#0B3654',
  teal: '#11607A',
  cyan: '#56D8FF',
  sonar: '#3DFFB2',
  amber: '#FFB547',
  red: '#FF4B3A',
  bone: '#EAF1F4',
  mute: '#8EA2B2',
  dim: '#4D6273',
  line: 'rgba(234,241,244,0.16)',
  celeste: '#74ACDF',
  paper: '#E6E1D5',
  ink: '#0D1317',
};
export const F12 = {
  sans: 'Archivo, "Archivo Black", Inter, sans-serif',
  serif: '"Instrument Serif", "Playfair Display", Georgia, serif',
  mono: '"IBM Plex Mono", "JetBrains Mono", monospace',
};
/** grotesca variable: ancho 62–125 y peso 100–900 */
export const vf = (wdth: number, wght: number): React.CSSProperties => ({
  fontFamily: F12.sans,
  fontVariationSettings: `"wdth" ${wdth.toFixed(1)}, "wght" ${wght.toFixed(0)}`,
  fontWeight: Math.round(wght),
  fontStretch: `${wdth.toFixed(1)}%`,
});
export const mono = (size: number, color: string = K.bone, w = 500): React.CSSProperties => ({fontFamily: F12.mono, fontSize: size, color, fontWeight: w, letterSpacing: '0.04em'});

export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), b === Infinity ? 1 : 1 - prog(t, b - d, d, easeIn));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ================================================================== FONDOS */
/** agua profunda: degradé con un cono de luz que viene de arriba y "nieve marina" */
export const AbyssBg: React.FC<{t: number; light?: number; x?: number; deep?: number; snow?: number}> = ({t, light = 1, x = 50, deep = 0, snow = 1}) => (
  <AbsoluteFill style={{background: K.abyss}}>
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(17,96,122,${0.55 * light * (1 - deep)}) 0%, rgba(6,25,43,${0.9 - 0.5 * deep}) 45%, ${K.abyss} 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 38% 70% at ${x + Math.sin(t * 0.21) * 3}% -8%, rgba(120,220,255,${0.22 * light * (1 - deep)}) 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
    {snow > 0 ? <MarineSnow t={t} o={snow} /> : null}
  </AbsoluteFill>
);

/** partículas en suspensión (nieve marina): tres capas con parallax */
export const MarineSnow: React.FC<{t: number; n?: number; o?: number; speed?: number; color?: string}> = ({t, n = 90, o = 1, speed = 1, color = '#BFE9FF'}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: n}, (_, i) => {
        const layer = i % 3;
        const sp = (0.012 + layer * 0.016 + rnd(i) * 0.01) * speed;
        const y = ((rnd(i + 3) - t * sp) % 1 + 1) % 1 * 1140 - 30;
        const x = rnd(i + 7) * 1920 + Math.sin(t * (0.3 + rnd(i) * 0.4) + i) * (10 + layer * 8);
        const r = 0.7 + layer * 0.9 + rnd(i + 11) * 1.2;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={(0.08 + 0.1 * layer + rnd(i + 5) * 0.18) * o} />;
      })}
    </svg>
  </AbsoluteFill>
);

/** franjas de cine 2.39:1 (k = 1 cerradas, 0 abiertas) */
export const Letterbox: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 139 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: 139 * k, background: '#000'}} />
    </>
  );

export const Vignette: React.FC<{k?: number}> = ({k = 0.7}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`}} />
);

/** líneas de barrido de monitor (para pantallas de sonar y cámaras de robot) */
export const Scanlines: React.FC<{o?: number}> = ({o = 0.18}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: o, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)'}} />
);

/* ================================================================== TIPOGRAFÍA CINÉTICA */
type KTProps = {
  t: number; t0: number; t1?: number; text: string; size?: number; x?: number; y?: number; align?: 'left' | 'center' | 'right';
  color?: string; w0?: number; w1?: number; g0?: number; g1?: number; stagger?: number; dur?: number; track0?: number; track1?: number;
  lh?: number; maxW?: number; hl?: Record<string, string>; shadow?: boolean; upper?: boolean; o?: number;
};
/** título por letras: cada letra sube desde una máscara mientras la fuente pasa de ancha y fina a angosta y pesada */
export const KTitle: React.FC<KTProps> = ({
  t, t0, t1 = Infinity, text, size = 140, x = 960, y = 540, align = 'center', color = K.bone, w0 = 125, w1 = 78, g0 = 250, g1 = 860,
  stagger = 0.03, dur = 0.85, track0 = 0.08, track1 = -0.01, lh = 0.95, maxW = 1700, hl = {}, shadow = true, upper = true, o = 1,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.6) return null;
  const lines = (upper ? text.toUpperCase() : text).split('\n');
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.45, easeIn);
  let ci = 0;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, width: maxW, textAlign: align, opacity: o}}>
      {lines.map((ln, li) => (
        <div key={li} style={{overflow: 'hidden', lineHeight: lh, paddingBottom: size * 0.06, marginTop: li ? -size * 0.02 : 0}}>
          {ln.split(' ').map((word, wi) => {
            const key = word.replace(/[^\wÁÉÍÓÚÑÜáéíóúñü%]/g, '');
            const wc = hl[key] ?? color;
            return (
              <span key={wi} style={{display: 'inline-block', whiteSpace: 'nowrap', marginRight: size * 0.22}}>
                {[...word].map((ch, k) => {
                  const i = ci++;
                  const p = prog(t, t0 + i * stagger, dur, easeOut);
                  const yv = (1 - p) * 105 + out * -110;
                  const wd = mix(w0, w1, p), wg = mix(g0, g1, p);
                  return (
                    <span
                      key={k}
                      style={{
                        display: 'inline-block', fontSize: size, color: wc, ...vf(wd, wg),
                        letterSpacing: `${mix(track0, track1, p)}em`, transform: `translateY(${yv}%)`, opacity: Math.min(1, p * 1.6) * (1 - out),
                        textShadow: shadow ? '0 6px 30px rgba(0,0,0,0.55)' : undefined,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export type WordCue = {w: string; t: number; color?: string; serif?: boolean; big?: boolean};
/** frase palabra por palabra sincronizada con la locución (cada palabra entra con desenfoque y sube) */
export const SyncWords: React.FC<{t: number; words: WordCue[]; size?: number; x?: number; y?: number; w?: number; align?: 'left' | 'center'; t1?: number; color?: string; lh?: number}> = ({
  t, words, size = 72, x = 960, y = 540, w = 1500, align = 'center', t1 = Infinity, color = K.bone, lh = 1.12,
}) => {
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.4, easeIn);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align, lineHeight: lh, opacity: 1 - out}}>
      {words.map((c, i) => {
        const p = prog(t, c.t - 0.05, 0.42);
        const base: React.CSSProperties = c.serif ? {fontFamily: F12.serif, fontStyle: 'italic', fontWeight: 400} : vf(c.big ? 92 : 100, c.big ? 820 : 560);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', marginRight: size * 0.26, fontSize: c.big ? size * 1.18 : size, color: c.color ?? color, ...base,
              opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`,
            }}
          >
            {c.w}
          </span>
        );
      })}
    </div>
  );
};

/** línea en serif itálica (lo humano, las citas) */
export const SerifLine: React.FC<{t: number; t0: number; t1?: number; text: string; size?: number; x?: number; y?: number; color?: string; align?: 'left' | 'center' | 'right'; w?: number; italic?: boolean}> = ({
  t, t0, t1 = Infinity, text, size = 64, x = 960, y = 540, color = K.bone, align = 'center', w = 1600, italic = true,
}) => {
  const o = fadeIO(t, t0, t1, 0.5);
  if (o <= 0) return null;
  const p = prog(t, t0, 1.1);
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'}, -50%)`,
        textAlign: align, fontFamily: F12.serif, fontStyle: italic ? 'italic' : 'normal', fontSize: size, color, opacity: o, lineHeight: 1.1,
        filter: `blur(${(1 - p) * 8}px)`, letterSpacing: `${(1 - p) * 0.06}em`, textShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </div>
  );
};

/* ================================================================== DATOS */
/** número tipo odómetro: cada dígito rueda verticalmente hasta su valor */
export const Odo: React.FC<{value: number; size?: number; color?: string; dec?: number; prefix?: string; suffix?: string; font?: 'sans' | 'mono'; wdth?: number; wght?: number}> = ({
  value, size = 160, color = K.bone, dec = 0, prefix = '', suffix = '', font = 'sans', wdth = 82, wght = 820,
}) => {
  const s = dec === 0 ? fmt(Math.floor(Math.max(0, value) + 1e-6)) : fmt(Math.max(0, value), dec);
  const frac = value - Math.floor(value);
  const st: React.CSSProperties = font === 'mono' ? {fontFamily: F12.mono, fontWeight: 600} : vf(wdth, wght);
  const digits = [...s];
  const lastDigit = digits.reduce((a, c, i) => (/\d/.test(c) ? i : a), -1);
  return (
    <span style={{display: 'inline-flex', alignItems: 'baseline', fontSize: size, color, lineHeight: 1, ...st, fontVariantNumeric: 'tabular-nums'}}>
      {prefix ? <span style={{marginRight: size * 0.1}}>{prefix.trim()}</span> : null}
      {digits.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const d = Number(c);
        const off = i === lastDigit && dec === 0 ? frac : 0;
        return (
          <span key={i} style={{display: 'inline-block', height: '1em', overflow: 'hidden', position: 'relative'}}>
            <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-(d + off) * 1}em)`}}>
              {Array.from({length: 11}, (_, k) => (
                <span key={k} style={{height: '1em', lineHeight: '1em'}}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix ? <span style={{marginLeft: suffix.startsWith(' ') ? size * 0.16 : size * 0.04}}>{suffix.trim()}</span> : null}
    </span>
  );
};
/** valor animado (0 → to) para Odo */
export const ramp = (t: number, t0: number, to: number, dur = 1.4, from = 0) => from + (to - from) * easeInOut(clamp((t - t0) / dur));

/** tarjeta de dato: número grande + etiqueta en mono, con línea de acento */
export const DataCard: React.FC<{
  t: number; t0: number; t1?: number; x: number; y: number; value: number; from?: number; dur?: number; dec?: number; prefix?: string; suffix?: string;
  label: string; sub?: string; color?: string; size?: number; align?: 'left' | 'center'; w?: number;
}> = ({t, t0, t1 = Infinity, x, y, value, from = 0, dur = 1.3, dec = 0, prefix, suffix, label, sub, color = K.cyan, size = 170, align = 'left', w = 760}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - p) * 30}px)`, opacity: o, textAlign: align}}>
      <div style={{...mono(26, color, 600), letterSpacing: '0.18em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, justifyContent: align === 'center' ? 'center' : 'flex-start'}}>
        <span style={{display: 'inline-block', width: 48 * p, height: 3, background: color}} />
        {label}
      </div>
      <Odo value={ramp(t, t0, value, dur, from)} size={size} dec={dec} prefix={prefix} suffix={suffix} />
      {sub ? <div style={{fontFamily: F12.serif, fontStyle: 'italic', fontSize: size * 0.24, color: K.mute, marginTop: 8}}>{sub}</div> : null}
    </div>
  );
};

/** etiqueta técnica: punto + línea + texto mono que se escribe */
export const MonoTag: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; size?: number; align?: 'left' | 'right'; cps?: number; dot?: boolean}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.cyan, size = 24, align = 'left', cps = 45, dot = true,
}) => {
  const o = fadeIO(t, t0, t1, 0.25);
  if (o <= 0) return null;
  const n = Math.floor(clamp((t - t0 - 0.15) * cps, 0, text.length));
  const lp = prog(t, t0, 0.35);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${align === 'right' ? '-100%' : '0'}, -50%)`, display: 'flex', alignItems: 'center', gap: 12, flexDirection: align === 'right' ? 'row-reverse' : 'row', opacity: o}}>
      {dot ? <span style={{width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 12px ${color}`}} /> : null}
      <span style={{width: 36 * lp, height: 2, background: color, opacity: 0.8}} />
      <span style={{...mono(size, K.bone, 500), letterSpacing: '0.14em', whiteSpace: 'pre', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>
        {text.slice(0, n)}
        {n < text.length ? <span style={{color}}>▍</span> : null}
      </span>
    </div>
  );
};

/** fecha/hora con dígitos que ruedan (odómetro) y etiqueta */
export const Timecode: React.FC<{t: number; t0: number; t1?: number; text: string; label?: string; x?: number; y?: number; size?: number; color?: string; align?: 'left' | 'center'}> = ({
  t, t0, t1 = Infinity, text, label, x = 960, y = 540, size = 120, color = K.bone, align = 'center',
}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, opacity: o, textAlign: align}}>
      {label ? <div style={{...mono(26, K.cyan, 600), letterSpacing: '0.24em', marginBottom: 12}}>{label}</div> : null}
      <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', fontFamily: F12.mono, fontWeight: 500, fontSize: size, color, lineHeight: 1}}>
        {[...text].map((c, i) => {
          if (!/\d/.test(c)) return <span key={i} style={{opacity: 0.55, margin: '0 0.02em'}}>{c}</span>;
          const d = Number(c);
          const spin = 1 - prog(t, t0 + i * 0.06, 0.9 + i * 0.05, easeOut);
          const v = d + spin * (10 + (i % 3) * 10);
          return (
            <span key={i} style={{display: 'inline-block', height: '1em', overflow: 'hidden'}}>
              <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-(v % 10)}em)`}}>
                {Array.from({length: 11}, (_, k) => (
                  <span key={k} style={{height: '1em'}}>{k % 10}</span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** marca de capítulo: abajo a la izquierda, se escribe y se va */
export const Chapter: React.FC<{t: number; t0: number; n: number; title: string; dur?: number}> = ({t, t0, n, title, dur = 3.2}) => {
  const o = fadeIO(t, t0, t0 + dur, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.9);
  return (
    <div style={{position: 'absolute', left: 96, bottom: 92, opacity: o}}>
      <div style={{...mono(24, K.cyan, 600), letterSpacing: '0.32em', display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{width: 60 * p, height: 2, background: K.cyan}} />
        CAPÍTULO {n}
      </div>
      <div style={{overflow: 'hidden', marginTop: 6}}>
        <div style={{fontSize: 74, color: K.bone, ...vf(mix(118, 84, p), mix(300, 760, p)), letterSpacing: `${mix(0.12, 0.01, p)}em`, transform: `translateY(${(1 - p) * 100}%)`}}>{title}</div>
      </div>
    </div>
  );
};

/** nombre de persona en serif + rol en mono */
export const NameCard: React.FC<{t: number; t0: number; t1?: number; name: string; role: string; role2?: string; x?: number; y?: number; color?: string}> = ({
  t, t0, t1 = Infinity, name, role, role2, x = 110, y = 840, color = K.cyan,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <div style={{width: 80 * p, height: 3, background: color, marginBottom: 14}} />
      <div style={{fontFamily: F12.serif, fontSize: 78, color: K.bone, lineHeight: 1, filter: `blur(${(1 - p) * 6}px)`, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>{name}</div>
      <div style={{...mono(24, K.bone, 500), letterSpacing: '0.16em', marginTop: 12, opacity: prog(t, t0 + 0.3, 0.5)}}>{role}</div>
      {role2 ? <div style={{...mono(22, color, 500), letterSpacing: '0.14em', marginTop: 6, opacity: prog(t, t0 + 0.5, 0.5)}}>{role2}</div> : null}
    </div>
  );
};

/** sello de tinta (con borde irregular por filtro SVG #ink12) */
export const Stamp12: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.red, rot = -8, size = 70,
}) => {
  const o = fadeIO(t, t0, t1, 0.15);
  if (o <= 0) return null;
  const s = 1 + (1 - pop(t, t0, 1.4)) * 0.9;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o * 0.92,
        border: `${size * 0.09}px solid ${color}`, padding: `${size * 0.12}px ${size * 0.34}px`, color, fontSize: size, ...vf(80, 850),
        letterSpacing: '0.04em', filter: 'url(#ink12)', mixBlendMode: 'screen', whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};
export const Defs12: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ink12">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
        <feDisplacementMap in="SourceGraphic" scale={5} />
      </filter>
      <filter id="whipx" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="28 0" />
      </filter>
      <filter id="whipy" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0 26" />
      </filter>
    </defs>
  </svg>
);

/* ================================================================== ARCHIVO */
const GRADES: Record<string, string> = {
  cold: 'saturate(0.72) contrast(1.12) brightness(0.92) hue-rotate(-6deg)',
  night: 'saturate(0.55) contrast(1.18) brightness(0.72)',
  bw: 'grayscale(1) contrast(1.18) brightness(0.95)',
  warm: 'saturate(0.9) contrast(1.08)',
  none: '',
};
type Move = {s: number; x: number; y: number};
/** foto de archivo a pantalla completa con movimiento de cámara suave y etalonaje frío */
export const Photo: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: Move; to?: Move; dur?: number; grade?: keyof typeof GRADES; credit?: string; dim?: number; fit?: 'cover' | 'contain'; focus?: string; tint?: number;
}> = ({src, t, t0, t1 = Infinity, from = {s: 1.04, x: 0, y: 0}, to = {s: 1.14, x: 0, y: 0}, dur, grade = 'cold', credit, dim = 0.25, fit = 'cover', focus = '50% 50%', tint = 0.35}) => {
  const o = fadeIO(t, t0, t1, 0.45);
  if (o <= 0) return null;
  const span = dur ?? (t1 === Infinity ? 8 : t1 - t0);
  const k = easeInOut(clamp((t - t0) / span));
  const s = mix(from.s, to.s, k), x = mix(from.x, to.x, k), y = mix(from.y, to.y, k);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden', background: K.abyss}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: focus, transform: `translate(${x}px, ${y}px) scale(${s})`, filter: GRADES[grade]}} />
      {tint ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(6,40,70,${tint}) 0%, rgba(1,8,16,${tint * 0.6}) 100%)`, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.5}) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit12 text={credit} /> : null}
    </AbsoluteFill>
  );
};

/** video de archivo con el mismo tratamiento */
export const Clip: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: number; rate?: number; zoom?: [number, number]; focus?: string; grade?: keyof typeof GRADES; credit?: string; dim?: number; tint?: number;
}> = ({src, t, t0, t1 = Infinity, from = 0, rate = 1, zoom = [1.02, 1.1], focus = '50% 50%', grade = 'cold', credit, dim = 0.25, tint = 0.3}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const o = fadeIO(t, t0, t1, 0.35);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = mix(zoom[0], zoom[1], easeInOut(clamp((t - t0) / span)));
  const startFrame = frame - Math.round((t - t0) * fps);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden', background: '#000'}}>
      <Sequence from={startFrame} layout="none">
        <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} trimBefore={Math.round(from * fps)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: GRADES[grade]}} />
      </Sequence>
      {tint ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(6,40,70,${tint}) 0%, rgba(1,8,16,${tint * 0.6}) 100%)`, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.5}) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit12 text={credit} /> : null}
    </AbsoluteFill>
  );
};

export const Credit12: React.FC<{text: string; x?: number; y?: number; align?: 'left' | 'right'; o?: number}> = ({text, x = 64, y = 1036, align = 'right', o = 1}) => (
  <div style={{position: 'absolute', [align]: x, top: y, transform: 'translateY(-50%)', ...mono(17, 'rgba(234,241,244,0.72)', 500), letterSpacing: '0.12em', textTransform: 'uppercase', opacity: o, textShadow: '0 1px 6px rgba(0,0,0,0.9)'} as React.CSSProperties}>
    {text}
  </div>
);

/** foto enmarcada (tarjeta con sombra, epígrafe mono) que entra con un leve giro */
export const PhotoCard12: React.FC<{
  src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number; caption?: string; credit?: string; grade?: keyof typeof GRADES; focus?: string; zoom?: [number, number]; video?: boolean; from?: number;
}> = ({src, t, t0, t1 = Infinity, x, y, w, h, rot = 0, caption, credit, grade = 'cold', focus = '50% 50%', zoom = [1.0, 1.08], video, from = 0}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = mix(zoom[0], zoom[1], clamp((t - t0) / span));
  const startFrame = frame - Math.round((t - t0) * fps);
  const st: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, filter: GRADES[grade]};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot * p}deg) translateY(${(1 - p) * 60}px)`, opacity: o}}>
      <div style={{width: w, height: h, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.65)', outline: `1px solid ${K.line}`, background: '#000'}}>
        {video ? (
          <Sequence from={startFrame} layout="none">
            <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.round(from * fps)} style={st} />
          </Sequence>
        ) : (
          <Img src={staticFile(src)} style={st} />
        )}
      </div>
      {caption ? <div style={{...mono(20, K.bone, 500), letterSpacing: '0.12em', marginTop: 14, textTransform: 'uppercase'}}>{caption}</div> : null}
      {credit ? <div style={{...mono(15, K.mute, 500), letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase'}}>{credit}</div> : null}
    </div>
  );
};

/* ================================================================== SONAR */
/** anillos de sonar que se expanden desde un punto */
export const Rings: React.FC<{t: number; t0: number; x: number; y: number; n?: number; every?: number; maxR?: number; color?: string; o?: number; width?: number; life?: number}> = ({
  t, t0, x, y, n = 3, every = 0.9, maxR = 700, color = K.cyan, o = 1, width = 2.5, life = 2.4,
}) => {
  if (t < t0) return null;
  const items: React.ReactNode[] = [];
  const first = Math.max(0, Math.floor((t - t0 - life) / every));
  for (let i = first; i < first + n + 3; i++) {
    const a = t - (t0 + i * every);
    if (a < 0 || a > life) continue;
    const k = a / life;
    items.push(<circle key={i} cx={x} cy={y} r={easeOut(k) * maxR} fill="none" stroke={color} strokeWidth={width * (1 - k * 0.6)} opacity={(1 - k) * 0.85 * o} />);
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      {items}
    </svg>
  );
};

/** retícula de objetivo (esquinas que se cierran sobre un punto) */
export const Reticle: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; label?: string; sub?: string; color?: string}> = ({
  t, t0, t1 = Infinity, x, y, w, h, label, sub, color = K.amber,
}) => {
  const o = fadeIO(t, t0, t1, 0.25);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.6);
  const ww = w * mix(2.2, 1, p), hh = h * mix(2.2, 1, p);
  const c = 34;
  const blink = 0.6 + 0.4 * Math.abs(Math.sin(t * 6));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
        const cx = x + (sx * ww) / 2, cy = y + (sy * hh) / 2;
        return <path key={i} d={`M${cx - sx * c} ${cy} L${cx} ${cy} L${cx} ${cy - sy * c}`} fill="none" stroke={color} strokeWidth={4} />;
      })}
      <circle cx={x} cy={y} r={5} fill={color} opacity={blink} />
      {label ? (
        <text x={x + ww / 2 + 22} y={y - hh / 2 + 18} fontFamily={F12.mono} fontWeight={600} fontSize={26} fill={color} letterSpacing="0.12em">{label}</text>
      ) : null}
      {sub ? (
        <text x={x + ww / 2 + 22} y={y - hh / 2 + 52} fontFamily={F12.mono} fontWeight={500} fontSize={22} fill={K.bone} letterSpacing="0.1em">{sub}</text>
      ) : null}
    </svg>
  );
};

/** indicador de profundidad (regla vertical que corre, metros y atmósferas) */
export const DepthGauge: React.FC<{depth: number; x?: number; y?: number; h?: number; o?: number; design?: number; collapse?: number; atm?: boolean}> = ({
  depth, x = 1540, y = 170, h = 740, o = 1, design, collapse, atm = true,
}) => {
  if (o <= 0) return null;
  const pxPerM = h / 400; // ventana de 400 m
  const top = depth - 200;
  const ticks: React.ReactNode[] = [];
  for (let m = Math.ceil(top / 10) * 10; m <= top + 400; m += 10) {
    if (m < 0) continue;
    const yy = (m - top) * pxPerM;
    const major = m % 50 === 0;
    ticks.push(<line key={m} x1={major ? 0 : 18} y1={yy} x2={40} y2={yy} stroke={K.bone} strokeWidth={major ? 2 : 1} opacity={major ? 0.7 : 0.35} />);
    if (major) ticks.push(<text key={'l' + m} x={-12} y={yy + 7} textAnchor="end" fontFamily={F12.mono} fontSize={19} fill={K.mute}>{m}</text>);
  }
  const mark = (m: number | undefined, color: string, label: string) => {
    if (m === undefined || m < top || m > top + 400) return null;
    const yy = (m - top) * pxPerM;
    return (
      <g key={label}>
        <line x1={-150} y1={yy} x2={60} y2={yy} stroke={color} strokeWidth={3} strokeDasharray="10 6" />
        <text x={-150} y={yy - 10} fontFamily={F12.mono} fontWeight={600} fontSize={20} fill={color} letterSpacing="0.1em">{label}</text>
      </g>
    );
  };
  const col = collapse !== undefined && depth >= collapse ? K.red : design !== undefined && depth >= design ? K.amber : K.cyan;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <svg width={260} height={h} style={{position: 'absolute', left: -200, top: 0, overflow: 'visible'}}>
        <g transform="translate(200,0)">
          {ticks}
          {mark(design, K.amber, 'DISEÑO')}
          {mark(collapse, K.red, 'COLAPSO')}
          <line x1={-40} y1={h / 2} x2={56} y2={h / 2} stroke={col} strokeWidth={4} />
          <path d={`M56 ${h / 2} l18 -12 v24 Z`} fill={col} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 90, top: h / 2, transform: 'translateY(-50%)'}}>
        <div style={{...mono(22, col, 600), letterSpacing: '0.2em'}}>PROFUNDIDAD</div>
        <div style={{fontFamily: F12.mono, fontWeight: 600, fontSize: 64, color: K.bone, lineHeight: 1.05}}>{fmt(Math.round(depth))}<span style={{fontSize: 30, color: K.mute}}> m</span></div>
        {atm ? <div style={{...mono(24, K.mute, 500), marginTop: 6}}>{fmt(1 + depth / 10, 1)} atm</div> : null}
      </div>
    </div>
  );
};

/** encuesta para comentarios */
export const Poll12: React.FC<{t: number; t0: number; t1?: number; q: string; a: string; b: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, q, a, b, x = 960, y = 540}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const opt = (txt: string, i: number) => {
    const pp = prog(t, t0 + 0.35 + i * 0.18, 0.5);
    return (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 30px', border: `2px solid ${i ? K.line : K.cyan}`, borderRadius: 14, marginTop: 18, opacity: pp, transform: `translateX(${(1 - pp) * 40}px)`, background: 'rgba(3,14,26,0.6)'}}>
        <span style={{width: 34, height: 34, borderRadius: 17, border: `3px solid ${i ? K.mute : K.cyan}`}} />
        <span style={{fontSize: 44, color: K.bone, ...vf(90, 560)}}>{txt}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1180, transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * p})`, opacity: o, padding: 46, background: 'rgba(1,6,12,0.82)', border: `1px solid ${K.line}`, borderRadius: 22, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
      <div style={{...mono(22, K.cyan, 600), letterSpacing: '0.3em'}}>ENCUESTA · RESPONDÉ EN LOS COMENTARIOS</div>
      <div style={{fontSize: 64, color: K.bone, marginTop: 14, lineHeight: 1.05, ...vf(84, 800)}}>{q}</div>
      {opt(a, 0)}
      {opt(b, 1)}
    </div>
  );
};
