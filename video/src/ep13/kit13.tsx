/* Sistema visual del episodio 13 (EL LOTE 31.202, edición especial): "clínico / forense".
   Grafito verdoso de quirófano a oscuras, blanco clínico para los documentos, verde quirúrgico para lo que funciona,
   rojo de alarma para la contaminación y ámbar para las advertencias; las fetas del queso suizo en ámbar translúcido.
   Tipografía nueva: Geist (titulares y rótulos, peso animable), Geist Mono (fechas, lotes, horas), Instrument Serif
   (las frases humanas: los chats y las citas) y Tinos/Arimo para recrear documentos oficiales.
   El recurso que atraviesa el episodio: las nueve barreras, con su contador arriba y una fecha en cada agujero. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

export const K = {
  void: '#040A0B',
  deep: '#081315',
  slate: '#0F1F22',
  steel: '#19302F',
  line: 'rgba(214,236,232,0.14)',
  line2: 'rgba(214,236,232,0.28)',
  bone: '#ECF3F1',
  paper: '#F3F4EF',
  paper2: '#E4E7E0',
  ink: '#0B1416',
  inkSoft: '#3C4A4C',
  mute: '#8FA6A6',
  dim: '#4F6769',
  teal: '#22C9B4',
  tealDeep: '#0D7F72',
  mint: '#A6F2E4',
  red: '#FF3B30',
  redDeep: '#B5121B',
  amber: '#FFB020',
  cheese: '#F2C14E',
  cheeseDeep: '#C88A1C',
  blue: '#64B0FF',
  bubbleIn: '#1C2A2C',
  bubbleOut: '#0F5A51',
};
export const F = {
  sans: 'Geist, Inter, sans-serif',
  mono: '"Geist Mono", "IBM Plex Mono", monospace',
  serif: '"Instrument Serif", Georgia, serif',
  doc: 'Tinos, "Times New Roman", serif',
  docSans: 'Arimo, Arial, sans-serif',
  ui: 'Inter, sans-serif',
};
/** Geist con peso y tracking */
export const gs = (size: number, w = 600, color: string = K.bone, track = -0.02): React.CSSProperties => ({
  fontFamily: F.sans, fontSize: size, fontWeight: Math.round(w), color, letterSpacing: `${track}em`,
});
/** Geist Mono */
export const gm = (size: number, color: string = K.bone, w = 500, track = 0.04): React.CSSProperties => ({
  fontFamily: F.mono, fontSize: size, color, fontWeight: w, letterSpacing: `${track}em`,
});
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), b === Infinity ? 1 : 1 - prog(t, b - d, d, easeIn));
/** acercamiento lento y continuo para que ningún plano quede quieto */
export const driftT = (t: number, t0: number, k = 0.012) => `scale(${1 + k * Math.max(0, t - t0)})`;

/* ================================================================== FONDOS */
/** quirófano a oscuras: degradé grafito, retícula de azulejos muy tenue, polvo en suspensión y viñeta */
export const ClinicBg: React.FC<{t: number; grid?: number; light?: number; alarm?: number; dust?: number; x?: number; w?: number; h?: number}> = ({t, grid = 1, light = 1, alarm = 0, dust = 1, x = 50, w = 1920, h = 1080}) => (
  <AbsoluteFill style={{background: K.void}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at ${x}% 30%, rgba(34,90,86,${0.42 * light}) 0%, rgba(10,24,26,${0.6 * light}) 45%, rgba(4,10,11,1) 100%)`}} />
    {grid > 0 ? (
      <AbsoluteFill
        style={{
          opacity: 0.07 * grid,
          backgroundImage: 'linear-gradient(rgba(214,236,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(214,236,232,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: `${(t * 6) % 64}px ${(t * 3) % 64}px`,
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, #000 20%, transparent 85%)',
        }}
      />
    ) : null}
    {alarm > 0 ? (
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,59,48,${0.16 * alarm * (0.75 + 0.25 * Math.sin(t * 3.2))}) 0%, rgba(120,0,8,${0.22 * alarm}) 70%, rgba(0,0,0,0) 100%)`}} />
    ) : null}
    {dust > 0 ? <Dust t={t} o={dust} w={w} h={h} /> : null}
    <Vignette k={0.6} />
  </AbsoluteFill>
);

/** partículas de polvo en suspensión iluminadas (aire de sala) */
export const Dust: React.FC<{t: number; n?: number; o?: number; color?: string; w?: number; h?: number}> = ({t, n = 70, o = 1, color = '#CFF5EE', w = 1920, h = 1080}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => {
      const layer = i % 3;
      const sp = 0.006 + layer * 0.008 + rnd(i) * 0.006;
      const yy = ((rnd(i + 3) - t * sp) % 1 + 1) % 1 * (h + 60) - 30;
      const xx = rnd(i + 7) * w + Math.sin(t * (0.2 + rnd(i) * 0.3) + i) * (14 + layer * 10);
      const r = 0.8 + layer * 0.9 + rnd(i + 11) * 1.1;
      return <circle key={i} cx={xx} cy={yy} r={r} fill={color} opacity={(0.05 + 0.07 * layer + rnd(i + 5) * 0.12) * o} />;
    })}
  </svg>
);

/** papel clínico (para documentos y gráficos claros) */
export const PaperBg: React.FC<{tint?: string; o?: number}> = ({tint = K.paper, o = 1}) => (
  <AbsoluteFill style={{background: tint, opacity: o}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 45%, rgba(255,255,255,0.55) 0%, rgba(0,0,0,0) 60%, rgba(30,40,40,0.18) 100%)'}} />
    <AbsoluteFill style={{filter: 'url(#paper13)', opacity: 0.35}} />
  </AbsoluteFill>
);

export const Vignette: React.FC<{k?: number}> = ({k = 0.7}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`}} />
);
/** franjas de cine (k = 1 cerradas) */
export const Letterbox: React.FC<{k: number}> = ({k}) =>
  k <= 0 ? null : (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 120 * k, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: 120 * k, background: '#000'}} />
    </>
  );

/** filtros SVG del episodio: tinta de sello, papel, desenfoques de barrido */
export const Defs13: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ink13">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={6} result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves={1} seed={3} result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="holes" />
        <feComposite in="d" in2="holes" operator="in" />
      </filter>
      <filter id="paper13" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={11} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.38  0 0 0 0 0.36  0 0 0 0.22 0" />
      </filter>
      <filter id="burn13" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={5} />
        <feDisplacementMap in="SourceGraphic" scale={30} />
      </filter>
      <filter id="glow13" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

/* ================================================================== TIPOGRAFÍA */
/** rótulo chico: punto + línea + texto mono en mayúsculas */
export const Kicker: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; size?: number; align?: 'left' | 'center' | 'right'; shadow?: boolean; plate?: boolean}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.teal, size = 22, align = 'left', shadow = false, plate = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.6);
  const n = Math.floor(clamp((t - t0) * 55, 0, text.length));
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, display: 'flex', alignItems: 'center', gap: 14, opacity: o, whiteSpace: 'nowrap',
        ...(plate ? {background: 'rgba(4,10,11,0.78)', padding: '10px 18px', borderRadius: 4, backdropFilter: 'blur(6px)'} : {}),
      }}
    >
      <span style={{width: 9, height: 9, borderRadius: 5, background: color, boxShadow: `0 0 10px ${color}`}} />
      <span style={{width: 34 * p, height: 2, background: color}} />
      <span style={{...gm(size, color, 600, 0.22), textTransform: 'uppercase', textShadow: shadow ? '0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8)' : undefined}}>{text.slice(0, n)}</span>
    </div>
  );
};

type TitleProps = {
  t: number; t0: number; t1?: number; text: string; size?: number; x?: number; y?: number; align?: 'left' | 'center' | 'right';
  color?: string; g0?: number; g1?: number; stagger?: number; dur?: number; track0?: number; track1?: number; lh?: number; maxW?: number;
  hl?: Record<string, string>; upper?: boolean; o?: number; shadow?: boolean; mono?: boolean;
};
/** título por letras: cada letra sube desde una máscara mientras el peso pasa de fino a pesado y el tracking se cierra */
export const Title13: React.FC<TitleProps> = ({
  t, t0, t1 = Infinity, text, size = 130, x = 960, y = 540, align = 'center', color = K.bone, g0 = 200, g1 = 780, stagger = 0.028, dur = 0.8,
  track0 = 0.1, track1 = -0.03, lh = 0.98, maxW = 1760, hl = {}, upper = true, o = 1, shadow = true, mono = false,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.6) return null;
  const lines = (upper ? text.toUpperCase() : text).split('\n');
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.45, easeIn);
  let ci = 0;
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, -50%)`, width: maxW, textAlign: align, opacity: o}}>
      {lines.map((ln, li) => (
        <div key={li} style={{overflow: 'hidden', lineHeight: lh, paddingBottom: size * 0.08, marginTop: li ? -size * 0.04 : 0}}>
          {ln.split(' ').map((word, wi) => {
            const key = word.replace(/[^\wÁÉÍÓÚÑÜáéíóúñü%.]/g, '');
            const wc = hl[key] ?? color;
            return (
              <span key={wi} style={{display: 'inline-block', whiteSpace: 'nowrap', marginRight: size * 0.24}}>
                {[...word].map((ch, k) => {
                  const i = ci++;
                  const p = prog(t, t0 + i * stagger, dur, easeOut);
                  return (
                    <span
                      key={k}
                      style={{
                        display: 'inline-block', fontFamily: mono ? F.mono : F.sans, fontSize: size, color: wc, fontWeight: Math.round(mix(g0, g1, p)),
                        letterSpacing: `${mix(track0, track1, p)}em`, transform: `translateY(${(1 - p) * 105 - out * 110}%)`, opacity: Math.min(1, p * 1.6) * (1 - out),
                        textShadow: shadow ? '0 6px 30px rgba(0,0,0,0.5)' : undefined,
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

export type WordCue = {w: string; t: number; color?: string; serif?: boolean; big?: boolean; strike?: number};
/** frase palabra por palabra sincronizada con la locución */
export const SyncWords: React.FC<{t: number; words: WordCue[]; size?: number; x?: number; y?: number; w?: number; align?: 'left' | 'center'; t1?: number; color?: string; lh?: number; weight?: number}> = ({
  t, words, size = 72, x = 960, y = 540, w = 1500, align = 'center', t1 = Infinity, color = K.bone, lh = 1.12, weight = 560,
}) => {
  const out = t1 === Infinity ? 0 : prog(t, t1, 0.4, easeIn);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align, lineHeight: lh, opacity: 1 - out}}>
      {words.map((c, i) => {
        const p = prog(t, c.t - 0.05, 0.42);
        const base: React.CSSProperties = c.serif ? {fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: '0'} : {fontFamily: F.sans, fontWeight: c.big ? 800 : weight, letterSpacing: '-0.02em'};
        const sk = c.strike !== undefined ? prog(t, c.strike, 0.4) : 0;
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: size * 0.26, fontSize: c.big ? size * 1.2 : size, color: c.color ?? color, ...base, opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`}}>
            {c.w}
            {sk > 0 ? <span style={{position: 'absolute', left: -4, top: '54%', height: size * 0.09, width: `calc(${sk * 100}% + 8px)`, background: K.red}} /> : null}
          </span>
        );
      })}
    </div>
  );
};

/** cita en serif itálica, con comillas latinas y atribución en mono */
export const Quote13: React.FC<{t: number; t0: number; t1?: number; text: string; by?: string; size?: number; x?: number; y?: number; w?: number; color?: string; align?: 'left' | 'center'; accent?: string}> = ({
  t, t0, t1 = Infinity, text, by, size = 76, x = 960, y = 540, w = 1500, color = K.bone, align = 'center', accent = K.red,
}) => {
  const o = fadeIO(t, t0, t1, 0.45);
  if (o <= 0) return null;
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, textAlign: align, opacity: o}}>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: size, color, lineHeight: 1.12, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
        <span style={{color: accent, opacity: prog(t, t0, 0.4)}}>«</span>
        {words.map((wd, i) => {
          const p = prog(t, t0 + 0.1 + i * 0.07, 0.5);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: i < words.length - 1 ? size * 0.22 : 0, opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 16}px)`}}>
              {wd}
            </span>
          );
        })}
        <span style={{color: accent, opacity: prog(t, t0 + 0.1 + words.length * 0.07, 0.4)}}>»</span>
      </div>
      {by ? <div style={{...gm(22, K.mute, 500, 0.16), textTransform: 'uppercase', marginTop: 22, opacity: prog(t, t0 + 0.5 + words.length * 0.05, 0.5)}}>{by}</div> : null}
    </div>
  );
};

/* ================================================================== DATOS */
/** número que rueda dígito por dígito (odómetro) */
export const Odo13: React.FC<{value: number; size?: number; color?: string; dec?: number; prefix?: string; suffix?: string; weight?: number; mono?: boolean}> = ({
  value, size = 160, color = K.bone, dec = 0, prefix = '', suffix = '', weight = 700, mono = false,
}) => {
  const s = dec === 0 ? fmt(Math.floor(Math.max(0, value) + 1e-6)) : fmt(Math.max(0, value), dec);
  const frac = value - Math.floor(value);
  const digits = [...s];
  const lastDigit = digits.reduce((a, c, i) => (/\d/.test(c) ? i : a), -1);
  return (
    <span style={{display: 'inline-flex', alignItems: 'baseline', fontFamily: mono ? F.mono : F.sans, fontWeight: weight, fontSize: size, color, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
      {prefix ? <span style={{marginRight: size * 0.08}}>{prefix}</span> : null}
      {digits.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const d = Number(c);
        const off = i === lastDigit && dec === 0 ? frac : 0;
        return (
          <span key={i} style={{display: 'inline-block', height: '1em', overflow: 'hidden'}}>
            <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-(d + off)}em)`}}>
              {Array.from({length: 11}, (_, k) => (
                <span key={k} style={{height: '1em', lineHeight: '1em'}}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix ? <span style={{marginLeft: size * 0.06, fontSize: size * 0.45, fontWeight: 500, letterSpacing: 0}}>{suffix}</span> : null}
    </span>
  );
};
export const ramp = (t: number, t0: number, to: number, dur = 1.4, from = 0) => from + (to - from) * easeInOut(clamp((t - t0) / dur));

/** dato grande con rótulo */
export const Stat13: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; value: number; from?: number; dur?: number; dec?: number; prefix?: string; suffix?: string; label: string; sub?: string; color?: string; size?: number; align?: 'left' | 'center'; w?: number; valColor?: string}> = ({
  t, t0, t1 = Infinity, x, y, value, from = 0, dur = 1.3, dec = 0, prefix, suffix, label, sub, color = K.teal, size = 170, align = 'left', w = 760, valColor = K.bone,
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(${align === 'center' ? '-50%' : '0'}, ${(1 - p) * 30}px)`, opacity: o, textAlign: align}}>
      <div style={{...gm(24, color, 600, 0.2), textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, justifyContent: align === 'center' ? 'center' : 'flex-start'}}>
        <span style={{display: 'inline-block', width: 48 * p, height: 3, background: color}} />
        {label}
      </div>
      <Odo13 value={ramp(t, t0, value, dur, from)} size={size} dec={dec} prefix={prefix} suffix={suffix} color={valColor} />
      {sub ? <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: size * 0.24, color: K.mute, marginTop: 10}}>{sub}</div> : null}
    </div>
  );
};

/** fecha con dígitos que ruedan: "27.11.2024" */
export const DateRoll: React.FC<{t: number; t0: number; t1?: number; text: string; label?: string; x?: number; y?: number; size?: number; color?: string; align?: 'left' | 'center'; labelColor?: string; sub?: string}> = ({
  t, t0, t1 = Infinity, text, label, x = 960, y = 540, size = 120, color = K.bone, align = 'center', labelColor = K.teal, sub,
}) => {
  const o = fadeIO(t, t0, t1, 0.3);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${align === 'center' ? '-50%' : '0'}, -50%)`, opacity: o, textAlign: align}}>
      {label ? <div style={{...gm(24, labelColor, 600, 0.26), textTransform: 'uppercase', marginBottom: 14}}>{label}</div> : null}
      <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', fontFamily: F.mono, fontWeight: 500, fontSize: size, color, lineHeight: 1, letterSpacing: '-0.02em'}}>
        {[...text].map((c, i) => {
          if (!/\d/.test(c)) return <span key={i} style={{opacity: 0.45, margin: '0 0.01em'}}>{c}</span>;
          const d = Number(c);
          const spin = 1 - prog(t, t0 + i * 0.05, 0.8 + i * 0.04, easeOut);
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
      {sub ? <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: size * 0.32, color: K.mute, marginTop: 12, opacity: prog(t, t0 + 0.6, 0.5)}}>{sub}</div> : null}
    </div>
  );
};

/** papel que se quema: frente irregular (ruido + gradiente) que sube desde abajo con borde incandescente y brasas; k 0–1 */
export const BurnAway: React.FC<{k: number; t: number; id?: string; w?: number; h?: number}> = ({k, t, id = 'burnaway', w = 1920, h = 1080}) => {
  if (k <= 0) return null;
  const thr = 0.98 - k * 1.08; // umbral: cuanto más bajo, más superficie quemada (sube desde abajo)
  const s = 16;
  const a = (o: number) => `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${s} 0 0 0 ${-s * (thr - o)}`;
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id={id + 'g'} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0042 0.0058" numOctaves={4} seed={11} result="n0" />
          <feColorMatrix in="n0" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="n" />
          <feComposite in="SourceGraphic" in2="n" operator="arithmetic" k1={0} k2={0.74} k3={0.42} k4={-0.1} result="v" />
          <feColorMatrix in="v" type="matrix" values={a(0)} result="burnt" />
          <feColorMatrix in="v" type="matrix" values={a(0.035)} result="char" />
          <feColorMatrix in="v" type="matrix" values={a(0.075)} result="edge" />
          <feFlood floodColor="#FF8A2A" result="orange" />
          <feComposite in="orange" in2="edge" operator="in" result="edgeC" />
          <feGaussianBlur in="edgeC" stdDeviation="6" result="edgeB" />
          <feFlood floodColor="#3A1206" result="brown" />
          <feComposite in="brown" in2="char" operator="in" result="charC" />
          <feFlood floodColor="#030607" result="black" />
          <feComposite in="black" in2="burnt" operator="in" result="blackC" />
          <feMerge>
            <feMergeNode in="edgeB" />
            <feMergeNode in="edgeC" />
            <feMergeNode in="charC" />
            <feMergeNode in="blackC" />
          </feMerge>
        </filter>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}g)`} filter={`url(#${id})`} />
      {/* brasas que suben */}
      {Array.from({length: 26}, (_, i) => {
        const life = 1.6 + rnd(i * 7) * 1.4;
        const ph = ((t + rnd(i * 3) * life) % life) / life;
        const x = rnd(i * 11) * w + Math.sin(t * 2 + i) * 30;
        const y = h - (0.15 + k * 0.85) * h * 0.83 * (0.3 + rnd(i * 5) * 0.7) - ph * 260;
        return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i) * 2.5} fill="#FFB25A" opacity={(1 - ph) * Math.min(1, k * 4) * 0.9} />;
      })}
    </svg>
  );
};

/* ================================================================== BARRERAS */
export const BARRERAS = ['LA FÁBRICA', 'EL ENSAYO', 'LA LIBERACIÓN', 'EL HISTORIAL', 'LA CLAUSURA', 'LA INSPECCIÓN', 'LA SANCIÓN', 'LA ALARMA INTERNA', 'LA TRAZABILIDAD'];

/** feta en miniatura (rectángulo redondeado con agujeros; el agujero de la falla en rojo) */
export const SliceGlyph: React.FC<{x: number; y: number; w?: number; h?: number; state: 'idle' | 'now' | 'failed' | 'hospital'; k?: number; light?: number}> = ({x, y, w = 20, h = 30, state, k = 1, light = 0}) => {
  // sobre papel: las fetas inactivas en ocre visible y el borde de la actual en tinta
  const fill = state === 'hospital' ? K.teal : state === 'idle' ? `rgba(${Math.round(242 - 50 * light)},${Math.round(193 - 55 * light)},${Math.round(78 - 40 * light)},${0.22 + 0.2 * light})` : K.cheese;
  const stroke = state === 'now' ? lerpHex('#FFF2C4', K.ink, light) : 'rgba(0,0,0,0)';
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={2} opacity={state === 'idle' ? 0.9 : 1} />
      {state !== 'hospital' ? <circle cx={-w * 0.18} cy={-h * 0.2} r={w * 0.13} fill={K.void} opacity={state === 'idle' ? 0.5 : 0.75} /> : null}
      {state === 'failed' || state === 'now' ? <circle cx={w * 0.05} cy={h * 0.12} r={w * 0.2 * k} fill={state === 'failed' ? K.red : K.void} /> : null}
    </g>
  );
};

/** interpola dos colores #RRGGBB */
export const lerpHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const kk = clamp(k);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * kk)).join(',')})`;
};

/** contador de barreras (arriba a la izquierda): nueve fetas, la actual resaltada y las caídas con su agujero rojo */
export const BarrierHUD: React.FC<{t: number; t0: number; t1?: number; n: number; failedUpTo: number; x?: number; y?: number; hospital?: number; light?: number}> = ({t, t0, t1 = Infinity, n, failedUpTo, x = 72, y = 70, hospital = 0, light = 0}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.7);
  const title = n >= 1 && n <= 9 ? BARRERAS[n - 1] : '';
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `translateX(${(1 - p) * -40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{...gm(20, lerpHex(K.cheese, '#9A6510', light), 600, 0.24)}}>BARRERA</div>
        <div style={{...gm(20, lerpHex(K.bone, K.ink, light), 600, 0.12)}}>
          {String(n).padStart(2, '0')}
          <span style={{color: lerpHex(K.dim, '#7A8A8B', light)}}> / 09</span>
        </div>
      </div>
      <svg width={hospital > 0 ? 300 : 270} height={44} style={{marginTop: 10, overflow: 'visible'}}>
        {Array.from({length: 9}, (_, i) => {
          const idx = i + 1;
          const state = idx === n ? 'now' : idx <= failedUpTo ? 'failed' : 'idle';
          const pp = prog(t, t0 + i * 0.04, 0.4);
          return (
            <g key={i} opacity={pp}>
              <SliceGlyph x={14 + i * 29} y={22} state={state} k={idx <= failedUpTo ? 1 : 0} light={light} />
            </g>
          );
        })}
        {hospital > 0 ? (
          <g opacity={hospital} transform={`translate(${14 + 9 * 29 + 6},22) scale(${0.6 + 0.4 * hospital})`}>
            <SliceGlyph x={0} y={0} state="hospital" />
          </g>
        ) : null}
      </svg>
      {title ? <div style={{...gs(30, 700, lerpHex(K.bone, K.ink, light), 0.01), marginTop: 8}}>{title}</div> : null}
    </div>
  );
};

/** placa de barrera a pantalla completa: número enorme en mono hueco, título que se arma y una feta que entra y se agujerea */
export const BarrierCard: React.FC<{t: number; t0: number; dur: number; n: number; sub?: string}> = ({t, t0, dur, n, sub}) => {
  const a = t - t0;
  if (a < -0.05 || a > dur + 0.05) return null;
  const inP = prog(t, t0, 0.25);
  const outP = prog(t, t0 + dur - 0.35, 0.35, easeIn);
  const slideP = prog(t, t0 + 0.05, 0.75);
  const hole = prog(t, t0 + 0.55, 0.45, easeOut);
  const title = BARRERAS[n - 1];
  // «LA TRAZABILIDAD» no tiene dónde cortar en dos líneas y a 104 px la última letra pisa la feta
  const tSize = n === 9 ? 90 : 104;
  return (
    <AbsoluteFill style={{opacity: 1 - outP}}>
      <AbsoluteFill style={{background: `rgba(4,10,11,${0.92 * inP})`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 50% 60% at 70% 50%, rgba(242,193,78,${0.12 * inP}) 0%, rgba(0,0,0,0) 70%)`}} />
      {/* feta en perspectiva */}
      <div style={{position: 'absolute', left: 1180 + (1 - slideP) * 700, top: 540, transform: `translate(-50%,-50%) perspective(1400px) rotateY(${-38 + (1 - slideP) * -30}deg) rotateZ(-4deg)`, opacity: slideP}}>
        <svg width={520} height={640} style={{overflow: 'visible', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))'}}>
          <defs>
            <linearGradient id={`fc${n}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F7D27A" />
              <stop offset="1" stopColor="#C88A1C" />
            </linearGradient>
            <mask id={`fm${n}`}>
              <rect x={0} y={0} width={520} height={640} rx={36} fill="#fff" />
              <circle cx={150} cy={170} r={44} fill="#000" />
              <circle cx={380} cy={120} r={26} fill="#000" />
              <circle cx={400} cy={470} r={38} fill="#000" />
              <circle cx={120} cy={520} r={22} fill="#000" />
              <circle cx={260} cy={330} r={110 * hole} fill="#000" />
            </mask>
          </defs>
          <rect x={0} y={0} width={520} height={640} rx={36} fill={`url(#fc${n})`} mask={`url(#fm${n})`} />
          <circle cx={260} cy={330} r={110 * hole + 6} fill="none" stroke={K.red} strokeWidth={8} opacity={hole} />
        </svg>
      </div>
      {/* número y título */}
      <div style={{position: 'absolute', left: 150, top: 300}}>
        <div style={{...gm(28, K.cheese, 600, 0.3), opacity: prog(t, t0 + 0.1, 0.4)}}>BARRERA</div>
        <div
          style={{
            fontFamily: F.sans, fontWeight: 200, fontSize: 320, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `3px ${K.cheese}`,
            letterSpacing: '-0.05em', transform: `translateY(${(1 - prog(t, t0 + 0.05, 0.6)) * 60}px)`, opacity: prog(t, t0 + 0.05, 0.5),
          }}
        >
          {String(n).padStart(2, '0')}
        </div>
      </div>
      <Title13 t={t} t0={t0 + 0.2} text={title} size={tSize} x={150} y={720} align="left" g0={250} g1={800} stagger={0.022} maxW={1100} />
      {sub ? (
        <div style={{position: 'absolute', left: 154, top: 800, fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: K.mute, opacity: prog(t, t0 + 0.6, 0.5)}}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ================================================================== DOCUMENTOS */
/** sello de tinta */
export const Stamp13: React.FC<{t: number; t0: number; t1?: number; text: string; x: number; y: number; color?: string; rot?: number; size?: number; sub?: string; dark?: boolean}> = ({
  t, t0, t1 = Infinity, text, x, y, color = K.red, rot = -8, size = 64, sub, dark = false,
}) => {
  const o = fadeIO(t, t0, t1, 0.12);
  if (o <= 0) return null;
  const s = 1 + (1 - pop(t, t0, 1.5)) * 0.85;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o * 0.94,
        border: `${size * 0.09}px solid ${color}`, borderRadius: size * 0.12, padding: `${size * 0.14}px ${size * 0.36}px`, color, textAlign: 'center',
        filter: 'url(#ink13)', mixBlendMode: dark ? 'screen' : 'multiply', whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontFamily: F.docSans, fontWeight: 700, fontSize: size, letterSpacing: '0.04em', lineHeight: 1}}>{text}</div>
      {sub ? <div style={{fontFamily: F.docSans, fontWeight: 700, fontSize: size * 0.34, letterSpacing: '0.12em', marginTop: size * 0.12}}>{sub}</div> : null}
    </div>
  );
};

/** rótulo "RECREACIÓN" para documentos y chats reconstruidos a partir de la causa */
export const Recreation: React.FC<{x?: number; y?: number; dark?: boolean; text?: string; o?: number}> = ({x = 1848, y = 994, dark = true, text = 'RECREACIÓN', o = 1}) => (
  <div style={{position: 'absolute', right: 1920 - x, top: y, ...gm(17, dark ? 'rgba(236,243,241,0.75)' : 'rgba(11,20,22,0.7)', 600, 0.24), border: `1px solid ${dark ? 'rgba(236,243,241,0.4)' : 'rgba(11,20,22,0.35)'}`, padding: '6px 12px', borderRadius: 4, opacity: o}}>
    {text}
  </div>
);

/** firma manuscrita que se dibuja (trazo continuo generado) */
export const Signature: React.FC<{p: number; w?: number; h?: number; seed?: number; color?: string}> = ({p, w = 300, h = 90, seed = 3, color = '#1B2A6B'}) => {
  const pts: string[] = [];
  const N = 46;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const xx = u * w;
    const yy = h * 0.55 + Math.sin(u * 19 + seed) * h * 0.28 * (1 - u * 0.4) + Math.sin(u * 47 + seed * 2) * h * 0.1 - (u < 0.15 ? (0.15 - u) * h * 1.6 : 0);
    pts.push(`${i ? 'L' : 'M'}${xx.toFixed(1)} ${yy.toFixed(1)}`);
  }
  const len = w * 3.2;
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp(p))} />
      <path d={`M${w * 0.62} ${h * 0.9} L${w * 1.02} ${h * 0.82}`} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeDasharray={w} strokeDashoffset={w * (1 - clamp((p - 0.8) / 0.2))} />
    </svg>
  );
};

/** líneas de texto simulado (cuerpo de un documento) */
export const DocLines: React.FC<{n: number; w: number; seed?: number; color?: string; gap?: number; h?: number; reveal?: number}> = ({n, w, seed = 1, color = 'rgba(11,20,22,0.55)', gap = 22, h = 7, reveal = 1}) => (
  <div>
    {Array.from({length: n}, (_, i) => {
      const last = i === n - 1;
      const ww = (last ? 0.45 + rnd(seed + i) * 0.2 : 0.86 + rnd(seed + i) * 0.14) * w;
      const pr = clamp(reveal * n - i);
      return <div key={i} style={{width: ww * pr, height: h, borderRadius: 2, background: color, marginBottom: gap - h}} />;
    })}
  </div>
);

/** hoja oficial recreada (membrete, título, destinatario, cuerpo, firma) */
export const DocSheet: React.FC<{
  t: number; t0: number; t1?: number; x: number; y: number; w?: number; rot?: number; head?: string; title: string; to?: string; date?: string; body?: React.ReactNode;
  sign?: 'none' | 'empty' | number; signLabel?: string; scale?: number; o?: number; children?: React.ReactNode; lines?: number; seed?: number;
}> = ({t, t0, t1 = Infinity, x, y, w = 620, rot = 0, head = 'MINISTERIO DE SALUD · ANMAT · INAME', title, to, date, body, sign = 'none', signLabel = 'Firma y sello', scale = 1, o = 1, children, lines = 9, seed = 1}) => {
  const oo = fadeIO(t, t0, t1, 0.35) * o;
  if (oo <= 0) return null;
  const p = pop(t, t0, 1.0);
  const h = w * 1.36;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale * (0.94 + 0.06 * p)}) translateY(${(1 - p) * 40}px)`, opacity: oo}}>
      <div style={{position: 'absolute', inset: 0, background: K.paper, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', overflow: 'hidden'}}>
        <AbsoluteFill style={{filter: 'url(#paper13)', opacity: 0.5}} />
        <div style={{position: 'absolute', left: w * 0.09, right: w * 0.09, top: w * 0.08}}>
          <div style={{fontFamily: F.docSans, fontWeight: 700, fontSize: w * 0.024, color: K.inkSoft, letterSpacing: '0.12em', borderBottom: '2px solid rgba(11,20,22,0.25)', paddingBottom: w * 0.015}}>{head}</div>
          {date ? <div style={{fontFamily: F.doc, fontSize: w * 0.026, color: K.inkSoft, textAlign: 'right', marginTop: w * 0.03}}>{date}</div> : null}
          <div style={{fontFamily: F.doc, fontWeight: 700, fontSize: w * 0.052, color: K.ink, marginTop: w * 0.05, letterSpacing: '0.02em'}}>{title}</div>
          {to ? <div style={{fontFamily: F.doc, fontSize: w * 0.03, color: K.ink, marginTop: w * 0.025}}>{to}</div> : null}
          <div style={{marginTop: w * 0.05}}>{body ?? <DocLines n={lines} w={w * 0.82} seed={seed} gap={w * 0.038} h={w * 0.011} />}</div>
        </div>
        {sign !== 'none' ? (
          <div style={{position: 'absolute', left: w * 0.52, bottom: w * 0.12, width: w * 0.38}}>
            <div style={{height: w * 0.15, display: 'flex', alignItems: 'flex-end'}}>{typeof sign === 'number' ? <Signature p={sign} w={w * 0.36} h={w * 0.13} /> : null}</div>
            <div style={{borderTop: '2px solid rgba(11,20,22,0.6)', paddingTop: 6, fontFamily: F.docSans, fontSize: w * 0.022, color: K.inkSoft, textAlign: 'center'}}>{signLabel}</div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

/* ================================================================== CHAT */
export type Msg = {side: 'in' | 'out'; text: string; at: number; time?: string; author?: string; quote?: boolean};
/** conversación de mensajería (modo oscuro, genérica): mensajes que entran sincronizados con la locución, con "escribiendo…" antes */
export const ChatPanel: React.FC<{
  t: number; t0: number; t1?: number; x?: number; y?: number; w?: number; h?: number; title: string; sub?: string; date?: string; msgs: Msg[]; scale?: number; avatar?: string; group?: boolean; o?: number; focus?: number;
}> = ({t, t0, t1 = Infinity, x = 960, y = 540, w = 760, h = 820, title, sub, date, msgs, scale = 1, avatar, group = false, o = 1, focus = -1}) => {
  const oo = fadeIO(t, t0, t1, 0.4) * o;
  if (oo <= 0) return null;
  const p = pop(t, t0, 0.9);
  const fs = 30;
  // altura acumulada para desplazar hacia arriba cuando no entra
  const shown = msgs.filter((m) => t >= m.at - 0.7);
  const estH = (m: Msg) => 64 + Math.ceil((m.text.length * fs * 0.52) / (w * 0.68)) * fs * 1.28 + (m.author ? 30 : 0);
  const total = shown.reduce((a, m) => a + estH(m) + 16, 0) + 90;
  const avail = h - 120;
  const scroll = Math.max(0, total - avail);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) scale(${scale * (0.92 + 0.08 * p)}) translateY(${(1 - p) * 50}px)`, opacity: oo}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 34, background: '#0B1213', border: '1px solid rgba(236,243,241,0.12)', boxShadow: '0 40px 100px rgba(0,0,0,0.65)', overflow: 'hidden'}}>
        {/* cabecera */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 104, background: '#121C1D', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 20, borderBottom: '1px solid rgba(236,243,241,0.08)', zIndex: 2}}>
          <div style={{width: 60, height: 60, borderRadius: 30, background: group ? '#2B4A47' : '#33403F', display: 'flex', alignItems: 'center', justifyContent: 'center', ...gs(24, 700, K.bone, 0)}}>{avatar ?? title.slice(0, 1)}</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 30, color: K.bone}}>{title}</div>
            {sub ? <div style={{fontFamily: F.ui, fontSize: 21, color: K.mute, marginTop: 2}}>{sub}</div> : null}
          </div>
        </div>
        {/* mensajes */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 104, bottom: 0, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 0%, #0F1A1B 0%, #0A1011 70%)'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, padding: '22px 26px', transform: `translateY(${-scroll}px)`}}>
            {date ? (
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}>
                <div style={{fontFamily: F.ui, fontSize: 20, color: K.mute, background: '#1A2526', padding: '6px 16px', borderRadius: 10}}>{date}</div>
              </div>
            ) : null}
            {msgs.map((m, i) => {
              const typing = t >= m.at - 0.7 && t < m.at;
              if (t < m.at - 0.7) return null;
              const pp = prog(t, m.at, 0.35);
              const isOut = m.side === 'out';
              const dimmed = focus >= 0 && focus !== i;
              return (
                <div key={i} style={{display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', marginBottom: 16, opacity: dimmed ? 0.35 : 1}}>
                  {typing ? (
                    <div style={{background: isOut ? K.bubbleOut : K.bubbleIn, borderRadius: 22, padding: '18px 22px', display: 'flex', gap: 8}}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{width: 11, height: 11, borderRadius: 6, background: K.mute, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - d * 0.9))}} />
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        maxWidth: w * 0.74, background: isOut ? K.bubbleOut : K.bubbleIn, borderRadius: 22, borderTopLeftRadius: isOut ? 22 : 6, borderTopRightRadius: isOut ? 6 : 22,
                        padding: '14px 20px 12px', transform: `translateY(${(1 - pp) * 18}px) scale(${0.96 + 0.04 * pp})`, opacity: pp, transformOrigin: isOut ? '100% 0%' : '0% 0%',
                        boxShadow: focus === i ? `0 0 0 3px ${K.red}` : undefined,
                      }}
                    >
                      {m.author ? <div style={{fontFamily: F.ui, fontWeight: 600, fontSize: 21, color: isOut ? K.mint : K.amber, marginBottom: 4}}>{m.author}</div> : null}
                      <div style={{fontFamily: F.ui, fontSize: fs, color: K.bone, lineHeight: 1.28}}>{m.text}</div>
                      <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 4}}>
                        {m.time ? <span style={{fontFamily: F.ui, fontSize: 18, color: 'rgba(236,243,241,0.55)'}}>{m.time}</span> : null}
                        {isOut ? <span style={{fontFamily: F.ui, fontSize: 18, color: K.mint}}>✓✓</span> : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== PERSONAS */
/** nombre + rol + situación procesal */
export const NameCard13: React.FC<{t: number; t0: number; t1?: number; name: string; role: string; status?: string; statusColor?: string; x?: number; y?: number; size?: number; align?: 'left' | 'center'}> = ({
  t, t0, t1 = Infinity, name, role, status, statusColor = K.amber, x = 110, y = 860, size = 70, align = 'left',
}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  const p = prog(t, t0, 0.8);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: align === 'center' ? 'translateX(-50%)' : undefined, textAlign: align}}>
      <div style={{width: 80 * p, height: 3, background: statusColor, marginBottom: 14, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0}} />
      <div style={{fontFamily: F.serif, fontSize: size, color: K.bone, lineHeight: 1, whiteSpace: 'nowrap', filter: `blur(${(1 - p) * 6}px)`, textShadow: '0 4px 20px rgba(0,0,0,0.7)'}}>{name}</div>
      <div style={{...gm(22, K.bone, 500, 0.14), textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 12, opacity: prog(t, t0 + 0.3, 0.5)}}>{role}</div>
      {status ? (
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '6px 14px', border: `1.5px solid ${statusColor}`, borderRadius: 6, opacity: prog(t, t0 + 0.55, 0.5)}}>
          <span style={{width: 9, height: 9, borderRadius: 5, background: statusColor}} />
          <span style={{...gm(19, statusColor, 600, 0.16), textTransform: 'uppercase'}}>{status}</span>
        </div>
      ) : null}
    </div>
  );
};

/* ================================================================== ARCHIVO */
const GRADES: Record<string, string> = {
  clinic: 'saturate(0.62) contrast(1.1) brightness(0.9) hue-rotate(8deg)',
  cold: 'saturate(0.7) contrast(1.12) brightness(0.9) hue-rotate(-4deg)',
  night: 'saturate(0.5) contrast(1.16) brightness(0.72)',
  bw: 'grayscale(1) contrast(1.15) brightness(0.95)',
  lab: 'saturate(0.85) contrast(1.06)',
  none: '',
};
type Move = {s: number; x: number; y: number};
/** foto de archivo a pantalla completa con movimiento de cámara y etalonaje clínico */
export const Photo13: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: Move; to?: Move; dur?: number; grade?: keyof typeof GRADES; credit?: string; dim?: number; fit?: 'cover' | 'contain'; focus?: string; tint?: number;
}> = ({src, t, t0, t1 = Infinity, from = {s: 1.04, x: 0, y: 0}, to = {s: 1.14, x: 0, y: 0}, dur, grade = 'clinic', credit, dim = 0.3, fit = 'cover', focus = '50% 50%', tint = 0.3}) => {
  const o = fadeIO(t, t0, t1, 0.45);
  if (o <= 0) return null;
  const span = dur ?? (t1 === Infinity ? 8 : t1 - t0);
  const k = easeInOut(clamp((t - t0) / span));
  const s = mix(from.s, to.s, k), xx = mix(from.x, to.x, k), yy = mix(from.y, to.y, k);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden', background: K.void}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: focus, transform: `translate(${xx}px, ${yy}px) scale(${s})`, filter: GRADES[grade]}} />
      {tint ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,60,56,${tint}) 0%, rgba(2,10,10,${tint * 0.7}) 100%)`, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${Math.min(0.85, dim * 1.5)}) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 55%, rgba(0,0,0,${dim * 1.6}) 100%)`}} /> : null}
      {credit ? <Credit13 text={credit} /> : null}
    </AbsoluteFill>
  );
};
export const Credit13: React.FC<{text: string; x?: number; y?: number; align?: 'left' | 'right'; o?: number; dark?: boolean}> = ({text, x = 60, y = 1040, align = 'right', o = 1, dark = true}) => (
  <div style={{position: 'absolute', [align]: x, top: y, transform: 'translateY(-50%)', ...gm(16, dark ? 'rgba(236,243,241,0.7)' : 'rgba(11,20,22,0.6)', 500, 0.12), textTransform: 'uppercase', opacity: o, textShadow: dark ? '0 1px 6px rgba(0,0,0,0.9)' : undefined} as React.CSSProperties}>
    {text}
  </div>
);
/** foto enmarcada con epígrafe */
export const PhotoCard13: React.FC<{
  src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number; caption?: string; credit?: string; grade?: keyof typeof GRADES; focus?: string; zoom?: [number, number]; dark?: boolean;
}> = ({src, t, t0, t1 = Infinity, x, y, w, h, rot = 0, caption, credit, grade = 'clinic', focus = '50% 50%', zoom = [1.0, 1.08], dark = true}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = mix(zoom[0], zoom[1], clamp((t - t0) / span));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot * p}deg) translateY(${(1 - p) * 60}px)`, opacity: o}}>
      <div style={{width: w, height: h, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', outline: `1px solid ${K.line}`, background: '#000'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, filter: GRADES[grade]}} />
      </div>
      {caption ? <div style={{...gm(19, dark ? K.bone : K.ink, 500, 0.12), marginTop: 14, textTransform: 'uppercase'}}>{caption}</div> : null}
      {credit ? <div style={{...gm(14, dark ? K.mute : K.inkSoft, 500, 0.1), marginTop: 4, textTransform: 'uppercase'}}>{credit}</div> : null}
    </div>
  );
};

/** fuente en pantalla (abajo a la izquierda) */
export const Source13: React.FC<{t: number; t0: number; t1?: number; text: string; dark?: boolean; x?: number; y?: number}> = ({t, t0, t1 = Infinity, text, dark = true, x = 72, y = 1028}) => {
  const o = fadeIO(t, t0, t1, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translateY(-50%)', ...gm(17, dark ? 'rgba(236,243,241,0.62)' : 'rgba(11,20,22,0.62)', 500, 0.1), opacity: o, whiteSpace: 'nowrap'}}>
      <span style={{color: dark ? K.teal : K.tealDeep}}>FUENTE · </span>
      {text}
    </div>
  );
};

/** encuesta para comentarios */
export const Poll13: React.FC<{t: number; t0: number; t1?: number; q: string; a: string; b: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, q, a, b, x = 960, y = 540}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const p = pop(t, t0, 0.9);
  const opt = (txt: string, i: number, letter: string) => {
    const pp = prog(t, t0 + 0.35 + i * 0.18, 0.5);
    const c = i ? K.blue : K.red;
    return (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 28px', border: `2px solid ${c}`, borderRadius: 14, marginTop: 18, opacity: pp, transform: `translateX(${(1 - pp) * 40}px)`, background: 'rgba(4,10,11,0.65)'}}>
        <span style={{width: 46, height: 46, borderRadius: 23, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', ...gs(26, 800, K.void, 0)}}>{letter}</span>
        <span style={{...gs(42, 560, K.bone, -0.01)}}>{txt}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1240, transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * p})`, opacity: o, padding: 46, background: 'rgba(4,10,11,0.86)', border: `1px solid ${K.line}`, borderRadius: 22, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
      <div style={{...gm(21, K.teal, 600, 0.28)}}>RESPONDÉ EN LOS COMENTARIOS</div>
      <div style={{...gs(62, 760, K.bone, -0.02), marginTop: 14, lineHeight: 1.05}}>{q}</div>
      {opt(a, 0, 'A')}
      {opt(b, 1, 'B')}
    </div>
  );
};
