/* Sistema visual del ep15 (EL HOMBRE DE LAS MIL CARAS): policial documental. Casi negro y hueso, el rojo para lo
   judicial, el ámbar del sol del Chaco y el acero de la noche y la cárcel. Anton para los títulos, Instrument Serif para
   las citas, IBM Plex Mono para los datos y Special Elite para los expedientes. Sirve para el largo (1920×1080, se
   renderiza a 1440p) y para el vertical (1080×1920): los componentes miden el cuadro con useVideoConfig. */
import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {clamp, easeIn, easeInOut, easeOut, prog, rnd} from '../lib/anim';
import CRED from '../data/ep15/creditos.json';

export const K = {
  ink: '#06080A', night: '#0C1217', coal: '#13181C', bone: '#EEE7D9', paper: '#E7DDC8', ash: '#A3A8AA', mute: '#6C7275',
  blood: '#C0352B', ember: '#E39B47', steel: '#8DB0C3', moss: '#6E9B62', gold: '#E9C47E',
};
export const F = {title: 'Anton, Impact, sans-serif', serif: '"Instrument Serif", Georgia, serif', mono: '"IBM Plex Mono", monospace', type: '"Special Elite", "Courier New", monospace', sans: 'Inter, Arial, sans-serif'};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export {clamp, easeIn, easeInOut, easeOut, prog, rnd};

/** ventana [a, b) con fundidos de entrada y salida; fuera de ella no se dibuja (ni se calcula el 3D) */
export const Win: React.FC<{t: number; a: number; b: number; fin?: number; fout?: number; children: React.ReactNode}> = ({t, a, b, fin = 0.35, fout = 0.35, children}) => {
  if (t < a - fin || t >= b + fout) return null;
  const o = Math.min(fin > 0 ? clamp((t - (a - fin)) / fin) : 1, fout > 0 ? clamp((b + fout - t) / fout) : 1);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
/** opacidad de un elemento que entra en a y sale en b */
export const fio = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/* ------------------------------------------------------------------ película */
/** grano de película (8 texturas que rotan a 12 cuadros por segundo), viñeta y, opcional, franjas de 2,39:1 */
export const FilmLook: React.FC<{t: number; grain?: number; vignette?: number; bars?: number}> = ({t, grain = 1, vignette = 1, bars = 0}) => {
  const {width, height} = useVideoConfig();
  const n = Math.floor(t * 12) % 8;
  const bh = bars * Math.max(0, (height - width / 2.39) / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.62 * vignette}) 100%)`}} />
      {grain > 0 ? <Img src={staticFile(`tex/grain${n}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen', opacity: 0.11 * grain}} /> : null}
      {bh > 0.5 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bh, background: '#000'}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bh, background: '#000'}} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
/** destello de corte (ámbar o blanco) centrado en tc */
export const Flash: React.FC<{t: number; tc: number; color?: string; k?: number; d?: number}> = ({t, tc, color = 'rgba(255,236,205,1)', k = 0.7, d = 0.22}) => {
  const x = (t - tc) / d;
  if (x < -1 || x > 2.5) return null;
  const o = x < 0 ? 1 + x : Math.exp(-x * 1.6);
  return <AbsoluteFill style={{background: color, opacity: o * k, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};
/** fundido a negro alrededor de tc (sube en d/2, baja en d/2) */
export const Dip: React.FC<{t: number; tc: number; d?: number}> = ({t, tc, d = 0.8}) => {
  const o = 1 - Math.min(1, Math.abs(t - tc) / (d / 2));
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: '#000', opacity: easeInOut(o)}} />;
};
/** fuga de luz ámbar que cruza el cuadro en un corte */
export const Leak: React.FC<{t: number; tc: number; d?: number; color?: string}> = ({t, tc, d = 1.1, color = '227,140,60'}) => {
  const k = (t - tc + d / 2) / d;
  if (k < 0 || k > 1) return null;
  const o = Math.sin(k * Math.PI);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 90% at ${mix(-10, 110, k)}% 40%, rgba(${color},${0.55 * o}) 0%, rgba(${color},0) 70%)`, mixBlendMode: 'screen'}} />;
};
/** barras de glitch: cambio de identidad */
export const Glitch: React.FC<{t: number; t0: number; d?: number; seed?: number}> = ({t, t0, d = 0.5, seed = 1}) => {
  const {width, height} = useVideoConfig();
  const k = (t - t0) / d;
  if (k < 0 || k > 1) return null;
  const f = Math.floor(t * 30);
  const amp = Math.sin(k * Math.PI);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 9}, (_, i) => {
        const r = rnd(seed * 31 + i * 7.3 + f * 1.7);
        if (r > 0.55 * amp + 0.2) return null;
        const y = rnd(i * 13.1 + f * 0.37 + seed) * height, h = 4 + rnd(i * 3.3 + f) * 60 * amp;
        return <div key={i} style={{position: 'absolute', left: 0, width, top: y, height: h, background: i % 3 === 0 ? 'rgba(192,53,43,0.55)' : i % 3 === 1 ? 'rgba(141,176,195,0.4)' : 'rgba(238,231,217,0.35)', transform: `translateX(${(rnd(i + f) - 0.5) * 120 * amp}px)`, mixBlendMode: 'screen'}} />;
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ fotos reales */
type Grade = 'noir' | 'warm' | 'cold' | 'night' | 'none';
const GRADE: Record<Grade, string> = {
  noir: 'grayscale(0.8) contrast(1.18) brightness(0.82)',
  warm: 'sepia(0.22) saturate(0.85) contrast(1.08) brightness(0.9)',
  cold: 'saturate(0.55) hue-rotate(-10deg) contrast(1.12) brightness(0.8)',
  night: 'saturate(0.75) contrast(1.15) brightness(0.78)',
  none: 'none',
};
export const credito = (file: string) => {
  const c = (CRED as Record<string, {autor: string; licencia: string}>)[file];
  return c ? `Foto: ${c.autor} · ${c.licencia} · Wikimedia Commons` : '';
};
/** foto real con movimiento lento de cámara (Ken Burns), corrección de color y crédito. from/to: foco (0-100 %) y zoom */
export const Photo: React.FC<{file: string; t: number; t0: number; dur: number; from?: [number, number, number]; to?: [number, number, number]; grade?: Grade; credit?: boolean; shade?: number; children?: React.ReactNode}> = ({
  file, t, t0, dur, from = [50, 50, 1.04], to = [50, 50, 1.14], grade = 'warm', credit = true, shade = 0.35, children,
}) => {
  const {width} = useVideoConfig();
  const k = clamp((t - t0) / dur);
  const e = k * k * (3 - 2 * k) * 0.6 + k * 0.4;   // casi lineal, con un respiro en las puntas
  const x = mix(from[0], to[0], e), y = mix(from[1], to[1], e), s = mix(from[2], to[2], e);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`ep15/img/${file}`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${x}% ${y}%`, transform: `scale(${s})`, transformOrigin: `${x}% ${y}%`, filter: GRADE[grade]}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${shade * 0.6}) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,${shade + 0.2}) 100%)`}} />
      {children}
      {credit ? <Credit text={credito(file)} /> : null}
    </AbsoluteFill>
  );
};
export const Credit: React.FC<{text: string; side?: 'left' | 'right'}> = ({text, side = 'right'}) => {
  const {width, height} = useVideoConfig();
  const v = height > width;
  return text ? (
    <div style={{position: 'absolute', [side]: v ? 40 : 34, bottom: v ? 360 : 22, fontFamily: F.mono, fontSize: v ? 19 : 15, letterSpacing: 0.4, color: 'rgba(238,231,217,0.62)', textShadow: '0 1px 3px rgba(0,0,0,0.9)', maxWidth: v ? 1000 : 900, textAlign: side}}>{text}</div>
  ) : null;
};

/* ------------------------------------------------------------------ textos */
/** rótulo de lugar y hora que se escribe como en una máquina (con cursor) */
export const Slate: React.FC<{t: number; t0: number; lines: string[]; x?: number; y?: number; size?: number; color?: string; out?: number; align?: 'left' | 'right'}> = ({t, t0, lines, x = 90, y = 90, size = 26, color = K.bone, out = 999, align = 'left'}) => {
  if (t < t0) return null;
  const cps = 28;
  let rem = (t - t0) * cps;
  const o = 1 - prog(t, out, 0.4);
  return (
    <div style={{position: 'absolute', [align]: x, top: y, fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: size * 0.16, color, opacity: o, textShadow: '0 2px 8px rgba(0,0,0,0.8)', textAlign: align}}>
      {lines.map((ln, i) => {
        const n = Math.max(0, Math.min(ln.length, Math.floor(rem)));
        rem -= ln.length + 4;
        const cur = n < ln.length || i === lines.length - 1;
        const blink = Math.floor(t * 2.2) % 2 === 0;
        return (
          <div key={i} style={{opacity: i === 0 ? 1 : 0.78, fontSize: i === 0 ? size : size * 0.82, marginTop: i ? size * 0.35 : 0, whiteSpace: 'pre'}}>
            {ln.slice(0, n)}
            {cur && n > 0 && n <= ln.length && (n < ln.length || blink) ? <span style={{display: 'inline-block', width: size * 0.55, height: size * 0.95, background: K.blood, marginLeft: 4, verticalAlign: 'text-bottom'}} /> : null}
          </div>
        );
      })}
    </div>
  );
};
/** placa de capítulo: número romano chico y título grande */
export const Chapter: React.FC<{t: number; t0: number; n: string; title: string; sub?: string; dur?: number}> = ({t, t0, n, title, sub, dur = 2.6}) => {
  const {width, height} = useVideoConfig();
  const v = height > width;
  if (t < t0 - 0.05 || t > t0 + dur + 0.4) return null;
  const a = prog(t, t0, 0.5), z = 1 - prog(t, t0 + dur - 0.3, 0.6, easeIn);
  const sp = mix(0.5, 0.08, easeOut(clamp((t - t0) / 1.6)));
  return (
    <AbsoluteFill style={{background: '#000', opacity: Math.min(1, z * 1.2), alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: F.mono, fontSize: v ? 30 : 24, letterSpacing: v ? 12 : 10, color: K.blood, opacity: a}}>{n}</div>
      <div style={{fontFamily: F.title, fontSize: v ? 150 : 150, color: K.bone, letterSpacing: `${sp}em`, marginTop: 18, opacity: a, textAlign: 'center', lineHeight: 1, padding: '0 40px', transform: `scale(${mix(1.06, 1, easeOut(clamp((t - t0) / 2.4)))})`}}>{title}</div>
      <div style={{width: 120 * prog(t, t0 + 0.35, 0.6), height: 3, background: K.blood, marginTop: 30}} />
      {sub ? <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: v ? 46 : 40, color: K.ash, marginTop: 24, opacity: prog(t, t0 + 0.5, 0.5)}}>{sub}</div> : null}
    </AbsoluteFill>
  );
};
/** zócalo con nombre y rol */
export const NameCard: React.FC<{t: number; t0: number; name: string; role: string; x?: number; y?: number; out?: number; color?: string}> = ({t, t0, name, role, x, y, out = 999, color = K.blood}) => {
  const {width, height} = useVideoConfig();
  const v = height > width;
  if (t < t0) return null;
  const a = prog(t, t0, 0.5), o = 1 - prog(t, out, 0.35);
  return (
    <div style={{position: 'absolute', left: x ?? (v ? 70 : 110), top: y ?? (v ? 1180 : 780), opacity: o}}>
      <div style={{width: 70 * a, height: 4, background: color, marginBottom: 16}} />
      <div style={{fontFamily: F.title, fontSize: v ? 84 : 76, color: K.bone, lineHeight: 1, letterSpacing: 1, textTransform: 'uppercase', clipPath: `inset(0 ${100 - a * 100}% 0 0)`, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>{name}</div>
      <div style={{fontFamily: F.mono, fontSize: v ? 26 : 23, letterSpacing: 3, color: K.ash, marginTop: 14, opacity: prog(t, t0 + 0.25, 0.4), textTransform: 'uppercase'}}>{role}</div>
    </div>
  );
};
/** cita textual: comillas, serif, atribución en mono */
export const Quote: React.FC<{t: number; t0: number; text: string; who: string; x?: number; y?: number; w?: number; size?: number; out?: number; align?: 'left' | 'center'}> = ({t, t0, text, who, x, y, w, size, out = 999, align = 'left'}) => {
  const {width, height} = useVideoConfig();
  const v = height > width;
  if (t < t0) return null;
  const words = text.split(' ');
  const per = 0.06;
  const o = 1 - prog(t, out, 0.4);
  const fs = size ?? (v ? 76 : 68);
  return (
    <div style={{position: 'absolute', left: x ?? (v ? 80 : 180), top: y ?? (v ? 600 : 330), width: w ?? (v ? 920 : 1560), opacity: o, textAlign: align}}>
      <div style={{fontFamily: F.serif, fontSize: fs * 2.2, lineHeight: 0.6, color: K.blood, opacity: prog(t, t0, 0.4), height: fs * 0.9}}>“</div>
      <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: fs, lineHeight: 1.12, color: K.bone, textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>
        {words.map((wd, i) => <span key={i} style={{opacity: prog(t, t0 + i * per, 0.35)}}>{wd} </span>)}
      </div>
      <div style={{fontFamily: F.mono, fontSize: v ? 26 : 22, letterSpacing: 3, color: K.ash, marginTop: 26, opacity: prog(t, t0 + words.length * per + 0.2, 0.4), textTransform: 'uppercase'}}>— {who}</div>
    </div>
  );
};
/** sello de goma (filtro de bordes gastados) */
export const Stamp: React.FC<{t: number; t0: number; text: string; sub?: string; x: number; y: number; rot?: number; size?: number; color?: string; out?: number}> = ({t, t0, text, sub, x, y, rot = -7, size = 64, color = K.blood, out = 999}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.18);
  const s = mix(1.8, 1, easeIn(k));
  const o = Math.min(k * 1.5, 1) * (1 - prog(t, out, 0.3));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, opacity: o * 0.92, border: `${size / 11}px solid ${color}`, color, padding: `${size * 0.12}px ${size * 0.34}px`, fontFamily: F.title, fontSize: size, letterSpacing: size * 0.06, lineHeight: 1, textTransform: 'uppercase', filter: 'url(#rough15)', textAlign: 'center', whiteSpace: 'nowrap', mixBlendMode: 'normal'}}>
      {text}
      {sub ? <div style={{fontFamily: F.mono, fontSize: size * 0.26, letterSpacing: size * 0.05, marginTop: size * 0.12}}>{sub}</div> : null}
    </div>
  );
};
/** filtro SVG de bordes gastados para los sellos: se monta una vez por composición */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="rough15">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves={1} seed={9} result="m" />
      <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.7" result="mm" />
      <feComposite in="d" in2="mm" operator="in" />
    </filter>
  </svg>
);
/** hoja de expediente con textura de papel y renglones a máquina que se escriben solos */
export const Paper: React.FC<{t: number; t0: number; lines: {text: string; at?: number; big?: boolean; red?: boolean}[]; x: number; y: number; w: number; h: number; rot?: number; head?: string; o?: number; out?: number}> = ({t, t0, lines, x, y, w, h, rot = -1.5, head, o = 1, out = 9999}) => {
  if (t < t0 - 0.4 || t > out + 0.5) return null;
  const a = prog(t, t0 - 0.4, 0.6) * (1 - prog(t, out, 0.45));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) translateY(${(1 - a) * 40}px)`, opacity: a * o, background: K.paper, boxShadow: '0 30px 80px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.55}} />
      <div style={{position: 'absolute', left: w * 0.08, right: w * 0.08, top: h * 0.07}}>
        {head ? <div style={{fontFamily: F.type, fontSize: w * 0.034, color: '#3B2F22', letterSpacing: 2, borderBottom: '2px solid rgba(59,47,34,0.5)', paddingBottom: 10, marginBottom: 22}}>{head}</div> : null}
        {lines.map((ln, i) => {
          const ta = ln.at ?? t0 + 0.4 + i * 0.5;
          const n = Math.floor(clamp((t - ta) * 34, 0, ln.text.length));
          return <div key={i} style={{fontFamily: F.type, fontSize: ln.big ? w * 0.062 : w * 0.038, lineHeight: 1.35, color: ln.red ? K.blood : '#2A2119', marginTop: ln.big ? 14 : 4, whiteSpace: 'pre-wrap'}}>{ln.text.slice(0, n)}</div>;
        })}
      </div>
    </div>
  );
};
/** cifra grande que cuenta hasta su valor, con unidad y bajada */
export const BigNumber: React.FC<{t: number; t0: number; to: number; unit?: string; pre?: string; label?: string; x?: number; y?: number; size?: number; color?: string; dur?: number; out?: number; align?: 'left' | 'center'}> = ({t, t0, to, unit = '', pre, label, x, y, size, color = K.bone, dur = 1.4, out = 999, align = 'center'}) => {
  const {width, height} = useVideoConfig();
  const v = height > width;
  if (t < t0) return null;
  const k = easeOut(clamp((t - t0) / dur));
  const val = Math.round(to * k).toLocaleString('es-AR');
  const fs = size ?? (v ? 230 : 210);
  return (
    <div style={{position: 'absolute', left: x ?? 0, right: x === undefined ? 0 : undefined, top: y ?? (v ? 640 : 330), textAlign: align, opacity: prog(t, t0, 0.3) * (1 - prog(t, out, 0.35))}}>
      <div style={{fontFamily: F.title, fontSize: fs, lineHeight: 0.95, color, letterSpacing: 2, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>{pre ? <span style={{fontSize: fs * 0.45, marginRight: fs * 0.08, color: K.ash}}>{pre}</span> : null}{val}<span style={{fontSize: fs * 0.36, marginLeft: fs * 0.08, color: K.ash}}>{unit}</span></div>
      {label ? <div style={{fontFamily: F.mono, fontSize: v ? 30 : 26, letterSpacing: 5, color: K.ash, marginTop: 18, textTransform: 'uppercase', opacity: prog(t, t0 + 0.4, 0.4)}}>{label}</div> : null}
    </div>
  );
};
/** subtítulos palabra por palabra (vertical): bloques de hasta 3 palabras, la activa en ámbar */
export const Captions: React.FC<{t: number; words: {w: string; s: number; e: number}[]; y?: number; hide?: (t: number) => boolean}> = ({t, words, y = 1310, hide}) => {
  if (hide && hide(t)) return null;
  // bloques: cortan en puntuación fuerte o cada 3 palabras
  const chunks: {w: string; s: number; e: number}[][] = [];
  let cur: {w: string; s: number; e: number}[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const gap = next ? next.s - w.e : 9;
    if (cur.length >= 3 || /[.,:;?!…»]$/.test(w.w) || gap > 0.35) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  const ch = chunks.find((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1] ? Math.min(chunks[i + 1][0].s - 0.05, c[c.length - 1].e + 0.6) : c[c.length - 1].e + 0.6));
  if (!ch) return null;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', fontFamily: F.title, fontSize: 78, lineHeight: 1.08, letterSpacing: 1, textTransform: 'uppercase'}}>
      {ch.map((w, i) => {
        const on = t >= w.s - 0.03;
        return <span key={i} style={{color: on ? (t < w.e + 0.05 ? K.ember : K.bone) : 'rgba(238,231,217,0.35)', textShadow: '0 4px 0 #000, 0 0 30px rgba(0,0,0,0.9)', marginRight: 18}}>{w.w.replace(/[«»"]/g, '')}</span>;
      })}
    </div>
  );
};
/** marca del canal (logo) */
export const Logo: React.FC<{t: number; t0: number; size?: number}> = ({t, t0, size = 92}) => (
  <Img src={staticFile('brand/logo_transparente.png')} style={{width: size, height: size, opacity: prog(t, t0, 0.5), transform: `scale(${mix(0.8, 1, easeOut(clamp((t - t0) / 0.6)))})`}} />
);
