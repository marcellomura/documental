/* Sistema visual del reel 01 (LA MAESTRA QUE IBA A CABALLO): "agua, tiza y expediente".
   El azul pizarra del bañado antes del amanecer, el ámbar del sol bajo, el verde oliva de los juncos, la tiza del
   pizarrón para los rótulos, el papel del expediente y la tinta azul de la carta. El rojo queda para lo judicial.
   Tipografía: Archivo condensada (titulares y subtítulos), Instrument Serif (nombres y citas), IBM Plex Mono (datos) y
   Caveat (la letra de la carta, recreada con las frases que citó la prensa). Formato vertical 1080×1920: los rótulos
   viven entre y = 230 y y = 1250 (arriba está la barra de TikTok y abajo el texto del posteo y los botones). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {clamp, easeIn, easeInOut, easeOut, pop, prog, rnd} from '../lib/anim';
import {W, TL, type Word} from './lib';
import prov from '../data/ep04/arg_provincias.json';
import sat from '../../public/reel01/sat/sat.json';
export {clamp, easeIn, easeInOut, easeOut, pop, prog, rnd};

export const VW = 1080, VH = 1920;
export const K = {
  void: '#05080B',
  deep: '#0B1419',
  slate: '#15232A',
  slate2: '#22343D',
  line: 'rgba(236,232,222,0.16)',
  chalk: '#F3EFE4',
  mute: '#AFA99B',
  dim: '#6C7478',
  dawn: '#F0A85A',
  amber: '#FFC27A',
  ember: '#E8743A',
  reed: '#7C8450',
  water: '#9FB4B9',
  paper: '#EFE7D4',
  paper2: '#DCCFB2',
  ink: '#22305A',
  red: '#E0473B',
  redDeep: '#9E2A22',
  celeste: '#74ACDF',
  gold: '#F6B40E',
};
export const F = {
  sans: 'Archivo, Inter, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  mono: '"IBM Plex Mono", "JetBrains Mono", monospace',
  hand: 'Caveat, cursive',
};
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** entra en a, sale en b (con fundidos de d segundos) */
export const fio = (t: number, a: number, b: number, d = 0.3) => Math.min(prog(t, a, d), b === Infinity ? 1 : 1 - prog(t, b - d, d, easeIn));
/** Archivo condensada, en mayúsculas */
export const hd = (size: number, w = 800, color: string = K.chalk, stretch = 72, track = 0.01): React.CSSProperties => ({
  fontFamily: F.sans, fontSize: size, fontWeight: w, fontStretch: `${stretch}%`, color, letterSpacing: `${track}em`, textTransform: 'uppercase', lineHeight: 0.95,
});
export const sr = (size: number, color: string = K.chalk, italic = false): React.CSSProperties => ({fontFamily: F.serif, fontSize: size, color, fontStyle: italic ? 'italic' : 'normal', lineHeight: 1.02, letterSpacing: '-0.01em'});
export const mn = (size: number, color: string = K.chalk, w = 500, track = 0.08): React.CSSProperties => ({fontFamily: F.mono, fontSize: size, fontWeight: w, color, letterSpacing: `${track}em`, textTransform: 'uppercase'});
export const hw = (size: number, color: string = K.ink, w = 600): React.CSSProperties => ({fontFamily: F.hand, fontSize: size, fontWeight: w, color, lineHeight: 1.1});
const SH = '0 3px 18px rgba(0,0,0,0.55)';

/* ================================================================== subtítulos palabra por palabra */
const CHUNKS = (() => {
  const list: Word[] = [];
  for (const seg of Object.keys(W).sort()) for (const w of W[seg]) list.push({w: w.w, s: TL.starts[seg] + w.s, e: TL.starts[seg] + w.e});
  const out: {words: Word[]; s: number; e: number}[] = [];
  let cur: Word[] = [];
  list.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    const next = list[i + 1];
    if (cur.length >= 3 || /[.,:;?!»]$/.test(w.w) || txt.length > 16 || !next || next.s - w.e > 0.6 || w.w.length > 14) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.4) : c.e + 0.4));
  return out;
})();
/** subtítulos: bloques de hasta tres palabras; la palabra que se dice se pinta en ámbar */
export const Captions: React.FC<{t: number; y?: number; hide?: boolean}> = ({t, y = 1330, hide}) => {
  if (hide) return null;
  const c = CHUNKS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const k = pop(t, c.s - 0.05, 1.5);
  const s = '#05080B';
  const long = c.words.map((w) => w.w).join(' ').length > 22;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', transform: `scale(${0.9 + 0.1 * k})`}}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.03 && t < w.e + 0.12;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 10px', ...hd(long ? 64 : 80, 800, on ? K.amber : K.chalk, 74, 0.005),
              textShadow: `4px 4px 0 ${s}, -4px -4px 0 ${s}, 4px -4px 0 ${s}, -4px 4px 0 ${s}, 0 4px 0 ${s}, 4px 0 0 ${s}, -4px 0 0 ${s}, 0 -4px 0 ${s}, 0 14px 28px rgba(0,0,0,0.55)`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ================================================================== piezas */
export const Vignette: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.55 * k}) 100%)`, pointerEvents: 'none'}} />
);
/** degradé oscuro arriba y abajo para que se lean los rótulos y los subtítulos sobre el 3D */
export const Scrims: React.FC<{top?: number; bottom?: number}> = ({top = 0.55, bottom = 0.65}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 620, background: `linear-gradient(180deg, rgba(5,8,11,${top}) 0%, rgba(5,8,11,0) 100%)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, background: `linear-gradient(0deg, rgba(5,8,11,${bottom}) 0%, rgba(5,8,11,${bottom * 0.6}) 45%, rgba(5,8,11,0) 100%)`}} />
  </>
);
/** rótulo chico en mono con una barra de color */
export const Kicker: React.FC<{t: number; t0: number; text: string; color?: string; x?: number; y?: number; size?: number; o?: number; align?: 'left' | 'center'}> = ({t, t0, text, color = K.dawn, x = 80, y = 260, size = 30, o = 1, align = 'left'}) => {
  const k = prog(t, t0, 0.5);
  if (k <= 0 || o <= 0) return null;
  const n = Math.round(text.length * clamp((t - t0) / 0.6));
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', alignItems: 'center', gap: 16, opacity: o}}>
      <div style={{width: 46 * k, height: 6, background: color}} />
      <div style={{...mn(size, K.chalk, 600, 0.14), textShadow: SH}}>{text.slice(0, n)}</div>
    </div>
  );
};
/** titular grande que entra palabra por palabra (cada palabra con su tiempo) */
export const Headline: React.FC<{t: number; words: [string, number, string?][]; y: number; size?: number; o?: number; align?: 'center' | 'left'; x?: number; lh?: number; maxW?: number}> = ({
  t, words, y, size = 150, o = 1, align = 'center', x = 70, lh = 0.95, maxW = 940,
}) => (
  <div style={{position: 'absolute', left: align === 'center' ? (VW - maxW) / 2 : x, width: maxW, top: y, textAlign: align, opacity: o, lineHeight: lh}}>
    {words.map(([w, t0, col], i) => {
      const k = prog(t, t0, 0.45);
      const p = pop(t, t0, 1.3);
      return (
        <span key={i} style={{display: 'inline-block', margin: `0 ${size * 0.11}px`, ...hd(size, 900, col ?? K.chalk, 70, 0), opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * clamp(p, 0, 1.2)})`, textShadow: '0 8px 40px rgba(0,0,0,0.5)'}}>
          {w}
        </span>
      );
    })}
  </div>
);
/** chip redondeado con un ícono a la izquierda */
export const Chip: React.FC<{t: number; t0: number; x: number; y: number; icon?: React.ReactNode; text: string; color?: string; bg?: string; size?: number; o?: number}> = ({t, t0, x, y, icon, text, color = K.chalk, bg = 'rgba(11,20,25,0.82)', size = 34, o = 1}) => {
  const k = pop(t, t0, 1.2);
  if (t < t0 || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, padding: `${size * 0.42}px ${size * 0.7}px`, borderRadius: 999, background: bg, border: `2px solid ${K.line}`, transform: `scale(${clamp(k, 0, 1.15)})`, transformOrigin: 'left center', opacity: o, boxShadow: '0 12px 40px rgba(0,0,0,0.35)'}}>
      {icon}
      <span style={{...mn(size, color, 600, 0.08)}}>{text}</span>
    </div>
  );
};
/** contador que sube hasta n */
export const Counter: React.FC<{t: number; t0: number; n: number; dur?: number; style: React.CSSProperties; suffix?: string}> = ({t, t0, n, dur = 1.2, style, suffix = ''}) => (
  <span style={style}>
    {Math.round(n * easeOut(clamp((t - t0) / dur)))}
    {suffix}
  </span>
);

/* ------------------------------------------------------------------ íconos (SVG) */
export const IconMic: React.FC<{s?: number; c?: string}> = ({s = 34, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={c} />
    <path d="M6 11 a6 6 0 0 0 12 0 M12 17 v4 M9 21 h6" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
export const IconHorse: React.FC<{s?: number; c?: string}> = ({s = 40, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 64 64">
    <path d="M14 50 L18 34 C14 30 14 24 20 22 L36 20 L44 10 L48 12 L46 18 L54 24 L52 28 L46 26 L44 32 L46 50 L42 50 L40 36 L26 38 L22 50 Z" fill={c} />
  </svg>
);
export const IconDoc: React.FC<{s?: number; c?: string}> = ({s = 40, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M6 2 h9 l5 5 v15 H6 Z" fill="none" stroke={c} strokeWidth="1.8" />
    <path d="M9 11 h8 M9 15 h8 M9 19 h5" stroke={c} strokeWidth="1.6" />
  </svg>
);
export const IconClock: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" />
    <path d="M12 7 v5 l3 3" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
export const IconBadge: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12 2 L20 5 V11 C20 16 16.5 20 12 22 C7.5 20 4 16 4 11 V5 Z" fill="none" stroke={c} strokeWidth="2" />
    <path d="M12 7 L13.4 10 L16.6 10.3 L14.2 12.4 L14.9 15.6 L12 14 L9.1 15.6 L9.8 12.4 L7.4 10.3 L10.6 10 Z" fill={c} />
  </svg>
);
export const IconPaw: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <ellipse cx="12" cy="16" rx="5" ry="4.2" fill={c} />
    <circle cx="6" cy="10" r="2.2" fill={c} />
    <circle cx="9.6" cy="6.4" r="2.2" fill={c} />
    <circle cx="14.4" cy="6.4" r="2.2" fill={c} />
    <circle cx="18" cy="10" r="2.2" fill={c} />
  </svg>
);
export const IconDrone: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <rect x="9" y="10" width="6" height="4" rx="1" fill={c} />
    <path d="M9 11 L5 7 M15 11 L19 7 M9 13 L5 17 M15 13 L19 17" stroke={c} strokeWidth="1.8" />
    {[[5, 7], [19, 7], [5, 17], [19, 17]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3.4" ry="1.1" fill={c} />)}
  </svg>
);
export const IconHeli: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.chalk}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M3 5 H21 M12 5 V8" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    <ellipse cx="10" cy="12" rx="6" ry="4" fill={c} />
    <path d="M15 12 H22 M22 10 V14 M7 17 V19 M13 17 V19 M5 19 H15" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
export const IconBolt: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.amber}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z" fill={c} />
  </svg>
);
export const IconWaves: React.FC<{s?: number; c?: string}> = ({s = 36, c = K.water}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    {[8, 13, 18].map((y) => <path key={y} d={`M2 ${y} q2.5 -3 5 0 t5 0 t5 0 t5 0`} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />)}
  </svg>
);
export const IconChat: React.FC<{s?: number; c?: string}> = ({s = 52, c = K.deep}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M4 4 H20 A2 2 0 0 1 22 6 V15 A2 2 0 0 1 20 17 H10 L5 21 V17 H4 A2 2 0 0 1 2 15 V6 A2 2 0 0 1 4 4 Z" fill={c} />
    <path d="M7 9 H17 M7 12.5 H14" stroke="#F3EFE4" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
/** barras de señal que se apagan (k = 1 llenas, 0 sin señal) y una cruz roja */
export const Signal: React.FC<{k: number; s?: number; x?: boolean}> = ({k, s = 64, x = true}) => (
  <svg width={s} height={s} viewBox="0 0 40 40">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={4 + i * 8} y={30 - (i + 1) * 6} width={6} height={(i + 1) * 6 + 2} rx={1} fill={k * 4 > i + 0.5 ? K.chalk : 'rgba(243,239,228,0.18)'} />
    ))}
    {x && k < 0.15 ? <path d="M26 4 L38 16 M38 4 L26 16" stroke={K.red} strokeWidth="3.4" strokeLinecap="round" /> : null}
  </svg>
);

/* ------------------------------------------------------------------ el audio de WhatsApp (genérico, sin marcas) */
export const AudioBubble: React.FC<{t: number; t0: number; x: number; y: number; label: string; time: string; w?: number; play?: number; o?: number}> = ({t, t0, x, y, label, time, w = 640, play, o = 1}) => {
  const k = pop(t, t0, 1.1);
  if (t < t0 || o <= 0) return null;
  const bars = 38;
  const pp = play === undefined ? clamp((t - t0) / 3) : play;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${clamp(k, 0, 1.1)})`, transformOrigin: '0% 100%', opacity: o}}>
      <div style={{background: '#E9F3E2', borderRadius: '30px 30px 30px 8px', padding: '24px 28px 18px', boxShadow: '0 20px 60px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 76, height: 76, borderRadius: 999, background: '#2E5C46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <IconMic s={40} c="#F3EFE4" />
        </div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 4, height: 64}}>
            {Array.from({length: bars}, (_, i) => {
              const h = 10 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 46 + rnd(i * 3) * 8;
              const on = i / bars < pp;
              return <div key={i} style={{width: 7, height: h, borderRadius: 4, background: on ? '#2E5C46' : 'rgba(46,92,70,0.3)'}} />;
            })}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6}}>
            <span style={{...mn(24, '#3C5A4A', 500, 0.04)}}>{label}</span>
            <span style={{...mn(24, '#3C5A4A', 500, 0.04)}}>{time} ✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ calendario de octubre */
export type DayMark = {d: number; t0: number; label: string; color: string; circle?: boolean; cross?: number};
export const Calendar: React.FC<{t: number; t0: number; days: number[]; marks: DayMark[]; y?: number; bracket?: {from: number; to: number; t0: number; label: string}; o?: number}> = ({t, t0, days, marks, y = 420, bracket, o = 1}) => {
  const cw = 90, gap = 8, total = days.length * cw + (days.length - 1) * gap, x0 = (VW - total) / 2;
  const xOf = (d: number) => x0 + days.indexOf(d) * (cw + gap) + cw / 2;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: VW, height: 520, opacity: o}}>
      <div style={{position: 'absolute', left: x0, top: -64, ...mn(30, K.mute, 600, 0.2), opacity: prog(t, t0, 0.4)}}>OCTUBRE 2026</div>
      {days.map((d, i) => {
        const k = prog(t, t0 + i * 0.04, 0.4);
        const m = marks.filter((mk) => mk.d === d && t >= mk.t0);
        const hot = m.length > 0;
        return (
          <div key={d} style={{position: 'absolute', left: x0 + i * (cw + gap), top: (1 - k) * 30, width: cw, height: 132, borderRadius: 16, background: hot ? 'rgba(243,239,228,0.96)' : 'rgba(21,35,42,0.88)', border: `2px solid ${K.line}`, opacity: k, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{...hd(62, 800, hot ? K.deep : K.chalk, 78, 0)}}>{d}</span>
          </div>
        );
      })}
      {marks.map((mk, i) => {
        if (t < mk.t0) return null;
        const k = prog(t, mk.t0, 0.5);
        const cx = xOf(mk.d);
        return (
          <React.Fragment key={i}>
            {mk.circle ? (
              <svg style={{position: 'absolute', left: cx - 80, top: -14, overflow: 'visible'}} width={160} height={160}>
                <ellipse cx={80} cy={80} rx={54} ry={80} fill="none" stroke={mk.color} strokeWidth={7} strokeDasharray={560} strokeDashoffset={560 * (1 - k)} strokeLinecap="round" transform="rotate(-80 80 80)" />
              </svg>
            ) : null}
            {mk.cross !== undefined && t >= mk.cross ? (
              <svg style={{position: 'absolute', left: cx - 60, top: 6, overflow: 'visible'}} width={120} height={120}>
                <path d="M22 14 L98 106 M98 14 L22 106" stroke={K.red} strokeWidth={10} strokeLinecap="round" strokeDasharray={140} strokeDashoffset={140 * (1 - prog(t, mk.cross, 0.35))} />
              </svg>
            ) : null}
            <div style={{position: 'absolute', left: cx - 160, width: 320, top: 160 + (i % 2) * 70, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 14}px)`}}>
              <div style={{width: 3, height: 26 + (i % 2) * 70, background: mk.color, margin: '0 auto', marginTop: -((i % 2) * 70) - 24}} />
              <div style={{...mn(30, mk.color, 600, 0.06), textShadow: SH}}>{mk.label}</div>
            </div>
          </React.Fragment>
        );
      })}
      {bracket && t >= bracket.t0 ? (
        <div style={{position: 'absolute', left: xOf(bracket.from) - cw / 2, top: 330, width: (xOf(bracket.to) - xOf(bracket.from) + cw) * prog(t, bracket.t0, 0.8), height: 70, borderLeft: `4px solid ${K.red}`, borderRight: `4px solid ${K.red}`, borderBottom: `4px solid ${K.red}`, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center'}} />
        </div>
      ) : null}
      {bracket && t >= bracket.t0 + 0.4 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', ...hd(64, 900, K.red, 74), opacity: prog(t, bracket.t0 + 0.4, 0.4)}}>{bracket.label}</div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ sello de tinta */
export const Stamp: React.FC<{t: number; t0: number; text: string; x: number; y: number; color?: string; size?: number; rot?: number; sub?: string}> = ({t, t0, text, x, y, color = K.red, size = 56, rot = -8, sub}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / 0.18);
  const s = mix(1.8, 1, easeIn(k));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: k, border: `${size * 0.09}px solid ${color}`, borderRadius: 12, padding: `${size * 0.22}px ${size * 0.4}px`, textAlign: 'center', mixBlendMode: 'normal'}}>
      <div style={{...hd(size, 900, color, 78, 0.04), whiteSpace: 'nowrap'}}>{text}</div>
      {sub ? <div style={{...mn(size * 0.36, color, 600, 0.1), marginTop: 6}}>{sub}</div> : null}
    </div>
  );
};

/* ------------------------------------------------------------------ figuras (los detenidos, sin rostro) */
export const Figure: React.FC<{w?: number; c?: string; hat?: boolean; braid?: boolean}> = ({w = 150, c = '#2A3940', hat, braid}) => (
  <svg width={w} height={w * 1.9} viewBox="0 0 100 190">
    <circle cx="50" cy="34" r="20" fill={c} />
    {hat ? <path d="M18 26 h64 v6 h-64 Z M34 10 h32 v18 h-32 Z" fill={c} /> : null}
    {braid ? <path d="M64 36 C76 48 74 66 66 74" stroke={c} strokeWidth="9" fill="none" strokeLinecap="round" /> : null}
    <path d="M14 190 L18 96 C20 70 34 60 50 60 C66 60 80 70 82 96 L86 190 Z" fill={c} />
  </svg>
);

/* ------------------------------------------------------------------ cita grande */
export const Quote: React.FC<{t: number; t0: number; text: string; who: string; y?: number; size?: number; color?: string; o?: number; mark?: string}> = ({t, t0, text, who, y = 520, size = 96, color = K.chalk, o = 1, mark = K.dawn}) => {
  const k = prog(t, t0, 0.6);
  if (k <= 0 || o <= 0) return null;
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', left: 80, right: 80, top: y, opacity: o}}>
      <div style={{...sr(260, mark), height: 140, opacity: k, marginBottom: 10}}>“</div>
      <div style={{...sr(size, color), textShadow: SH}}>
        {words.map((w, i) => {
          const kk = prog(t, t0 + 0.1 + i * 0.07, 0.4);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: size * 0.24, opacity: kk, transform: `translateY(${(1 - kk) * 18}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, opacity: prog(t, t0 + 0.5, 0.5)}}>
        <div style={{width: 60, height: 4, background: mark}} />
        <div style={{...mn(30, K.mute, 600, 0.1)}}>{who}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ la carta (recreación) */
export const Letter: React.FC<{t: number; t0: number; lines: {text: string; t0: number; hl?: boolean}[]; date: string; o?: number; rot?: number; y?: number}> = ({t, t0, lines, date, o = 1, rot = -2, y = 300}) => {
  const k = prog(t, t0, 0.7);
  if (k <= 0 || o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 90, top: y + (1 - k) * 80, width: 900, height: 1000, transform: `rotate(${rot + (1 - k) * 4}deg)`, opacity: o * k}}>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${K.paper} 0%, ${K.paper2} 100%)`, borderRadius: 6, boxShadow: '0 40px 80px rgba(0,0,0,0.55)'}}>
        {/* renglones */}
        {Array.from({length: 16}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: 50, right: 50, top: 170 + i * 52, height: 2, background: 'rgba(80,110,160,0.22)'}} />
        ))}
        <div style={{position: 'absolute', left: 110, top: 0, bottom: 0, width: 2, background: 'rgba(200,70,70,0.25)'}} />
        <div style={{position: 'absolute', right: 60, top: 70, ...hw(52)}}>{date}</div>
        {lines.map((l, i) => {
          if (t < l.t0) return null;
          const n = Math.round(l.text.length * clamp((t - l.t0) / Math.max(0.5, l.text.length * 0.035)));
          return (
            <div key={i} style={{position: 'absolute', left: 130, right: 60, top: 128 + i * 104, ...hw(64), whiteSpace: 'nowrap'}}>
              {l.hl ? <span style={{position: 'absolute', left: -8, top: 18, height: 52, width: `${clamp((t - l.t0 - 0.4) / 0.6) * 100}%`, background: 'rgba(240,168,90,0.45)'}} /> : null}
              <span style={{position: 'relative'}}>{l.text.slice(0, n)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ satélite (Sentinel-2, 19/10/2026) */
type SatName = 'region' | 'zona';
const SAT = sat as unknown as {crops: Record<SatName, {w: number; h: number; m_per_px: number; points: Record<string, [number, number]>}>; credit: string};
/** imagen satelital con paneo/zoom: cx, cy = punto de la imagen (px) que va al centro del cuadro; z = píxeles de pantalla
    por píxel de imagen. children recibe la función que lleva un punto de la imagen a la pantalla */
export const SatView: React.FC<{name: SatName; cx: number; cy: number; z: number; o?: number; dark?: number; children?: (P: (x: number, y: number) => [number, number], z: number) => React.ReactNode; cy0?: number}> = ({
  name, cx, cy, z, o = 1, dark = 0.25, children, cy0 = 820,
}) => {
  const c = SAT.crops[name];
  z = Math.max(z, 1920 / c.h, VW / c.w);
  const left = VW / 2 - cx * z, top = cy0 - cy * z;
  const P = (x: number, y: number): [number, number] => [left + x * z, top + y * z];
  return (
    <AbsoluteFill style={{background: K.deep, opacity: o, overflow: 'hidden'}}>
      <Img src={staticFile(`reel01/sat/${name}.jpg`)} style={{position: 'absolute', left, top, width: c.w * z, height: c.h * z, filter: `saturate(0.62) contrast(1.1) brightness(${0.92 - dark})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,11,0.55) 0%, rgba(5,8,11,0) 22%, rgba(5,8,11,0) 60%, rgba(5,8,11,0.7) 100%)'}} />
      {children ? children(P, z) : null}
    </AbsoluteFill>
  );
};
export const satPoint = (name: SatName, k: string) => SAT.crops[name].points[k];
export const satMpp = (name: SatName) => SAT.crops[name].m_per_px;
export const SAT_CREDIT = 'Imagen: Copernicus Sentinel-2, 19/10/2026';
/** rótulo con punto sobre un mapa */
export const Pin: React.FC<{x: number; y: number; t: number; t0: number; label: string; sub?: string; color?: string; side?: 'left' | 'right'; ring?: boolean}> = ({x, y, t, t0, label, sub, color = K.dawn, side = 'right', ring = true}) => {
  if (t < t0) return null;
  const k = pop(t, t0, 1.2);
  const pulse = ((t - t0) % 1.6) / 1.6;
  return (
    <>
      {ring ? <div style={{position: 'absolute', left: x - 60 * pulse, top: y - 60 * pulse, width: 120 * pulse, height: 120 * pulse, borderRadius: 999, border: `3px solid ${color}`, opacity: 1 - pulse}} /> : null}
      <div style={{position: 'absolute', left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 999, background: color, border: '4px solid #05080B', transform: `scale(${clamp(k, 0, 1.2)})`}} />
      <div style={{position: 'absolute', top: y - 34, left: side === 'right' ? x + 30 : undefined, right: side === 'left' ? VW - x + 30 : undefined, opacity: prog(t, t0 + 0.1, 0.4), textAlign: side === 'left' ? 'right' : 'left'}}>
        <div style={{...hd(46, 800, K.chalk, 76), textShadow: '0 3px 0 #05080B, 0 0 20px rgba(0,0,0,0.8)', whiteSpace: 'nowrap'}}>{label}</div>
        {sub ? <div style={{...mn(24, color, 600, 0.08), marginTop: 6, textShadow: '0 2px 0 #05080B', whiteSpace: 'nowrap'}}>{sub}</div> : null}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ mapa de la Argentina (provincias) */
type Feat = {type: 'Feature'; properties: {n: string}; geometry: object};
const PROV = prov as unknown as {type: 'FeatureCollection'; features: Feat[]};
const mainland = {...PROV, features: PROV.features.filter((f) => f.properties.n !== 'Tierra del Fuego')};
/** provincias con proyección mercator ajustada a un rectángulo; hl = provincia resaltada; fill por provincia opcional */
export const ArgMap: React.FC<{x: number; y: number; w: number; h: number; hl?: string; hlK?: number; fill?: (n: string) => string; stroke?: string; o?: number; dots?: {lon: number; lat: number; k: number; color?: string; r?: number}[]; scale?: number; focus?: [number, number]}> = ({
  x, y, w, h, hl, hlK = 1, fill, stroke = 'rgba(243,239,228,0.45)', o = 1, dots = [], scale = 1, focus,
}) => {
  const proj = geoMercator().fitExtent([[0, 0], [w, h]], mainland as never);
  const path = geoPath(proj);
  const f = focus ? proj(focus) : null;
  const tr = f ? `translate(${w / 2 - f[0] * scale}px, ${h / 2 - f[1] * scale}px) scale(${scale})` : `scale(${scale})`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, overflow: 'visible'}}>
      <svg width={w} height={h} style={{overflow: 'visible'}}>
        <g style={{transform: tr, transformOrigin: f ? '0 0' : '50% 50%'}}>
          {PROV.features.map((ft, i) => {
            const on = ft.properties.n === hl;
            return (
              <path key={i} d={path(ft as never) ?? ''} fill={fill ? fill(ft.properties.n) : on ? `rgba(240,168,90,${0.25 + 0.6 * hlK})` : 'rgba(34,52,61,0.85)'} stroke={on ? K.dawn : stroke} strokeWidth={(on ? 2.5 : 1.2) / scale} />
            );
          })}
          {dots.map((d, i) => {
            const p = proj([d.lon, d.lat]);
            if (!p || d.k <= 0) return null;
            return (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={((d.r ?? 9) * clamp(d.k, 0, 1.3)) / scale} fill={d.color ?? K.dawn} />
                <circle cx={p[0]} cy={p[1]} r={((d.r ?? 9) * 2.6 * clamp(d.k, 0, 1)) / scale} fill="none" stroke={d.color ?? K.dawn} strokeWidth={2 / scale} opacity={0.5} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ el logo del canal */
export const Logo: React.FC<{size: number; t: number; t0: number}> = ({size, t, t0}) => {
  const p = pop(t, t0, 0.9);
  const sh = prog(t, t0 + 0.2, 0.4);
  if (t < t0) return null;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <div style={{position: 'absolute', left: size * 0.075 * sh, top: size * 0.075 * sh, width: size, height: size, background: '#0B0B0C', borderRadius: size * 0.02}} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${Math.max(0, p)})`}}>
        <Img src={staticFile('brand/logo_c.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
    </div>
  );
};
