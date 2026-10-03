/* Sistema visual del episodio 11 (El Sol de Perón): la era atómica.
   Negro espacial con un resplandor solar, naranja de plasma, cian de laboratorio y el celeste argentino.
   El archivo se muestra como película de noticiero (parpadeo, rayas, polvo), los diarios son recreaciones
   tipográficas y la transición es un destello solar. */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
export {Big, Chip, Count, Credit, FullPhoto, SrcLine, Vig} from '../ep06/kit6';
export {InkDefs, Stamp, Typed, typedEnd, PhotoCard, DateCard, Place, YearRoll, between, fadeIO} from '../ep10/kit10';
export {MarkerCircle} from '../ep10/shots10';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

export const K = {
  bg0: '#05060B',
  bg1: '#0C0E17',
  bg2: '#161A26',
  cream: '#F3EBDD',
  paper: '#ECE3D0',
  ink: '#16130F',
  mute: '#9C9AA6',
  line: 'rgba(243,235,221,0.16)',
  sun: '#FFB23E', // fuego solar, la promesa
  sun2: '#FF7A1A',
  plasma: '#5CD6FF', // ciencia de verdad
  red: '#E8423A', // mentira, fraude
  celeste: '#74ACDF',
  gold: '#E8C36A',
  green: '#59D18A',
};
export const TYPE = '"Special Elite", "Courier New", monospace';

/* ---------- Fondo: espacio oscuro con un resplandor de sol y estrellas tenues ---------- */
export const SpaceBg: React.FC<{t: number; glow?: string; x?: number; y?: number; stars?: number; k?: number}> = ({t, glow = 'rgba(255,140,40,0.20)', x = 50, y = 50, stars = 1, k = 1}) => (
  <AbsoluteFill style={{background: K.bg0}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 80% at ${x + Math.sin(t * 0.11) * 2}% ${y}%, ${glow} 0%, rgba(12,14,23,${0.85 * k}) 55%, ${K.bg0} 100%)`}} />
    {stars > 0 ? (
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: stars}}>
        {Array.from({length: 120}, (_, i) => {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.4 + rnd(i + 40)) + i));
          return <circle key={i} cx={rnd(i) * 1920} cy={rnd(i + 200) * 1080} r={0.6 + rnd(i + 400) * 1.6} fill="#DDE6FF" opacity={0.08 + 0.32 * tw * rnd(i + 600)} />;
        })}
      </svg>
    ) : null}
  </AbsoluteFill>
);

/** chispas de plasma que suben */
export const Embers: React.FC<{t: number; n?: number; o?: number; color?: string}> = ({t, n = 50, o = 1, color = '#FFC27A'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: n}, (_, i) => {
        const sp = 0.02 + rnd(i) * 0.05;
        const y = 1080 - ((rnd(i + 3) + t * sp) % 1) * 1180;
        const x = rnd(i + 7) * 1920 + Math.sin(t * 0.7 + i) * 24;
        return <circle key={i} cx={x} cy={y} r={0.8 + rnd(i + 11) * 2.4} fill={color} opacity={(0.15 + rnd(i + 5) * 0.45) * o} />;
      })}
    </svg>
  </AbsoluteFill>
);

/* ---------- Efecto de película de noticiero: parpadeo, rayas, polvo y viñeta ---------- */
export const FilmFX: React.FC<{t: number; k?: number}> = ({t, k = 1}) => {
  const f = Math.floor(t * 24);
  const flick = 0.05 + 0.06 * rnd(f * 3.1);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(255,248,230,${flick * k * 0.5})`, mixBlendMode: 'overlay'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
        {Array.from({length: 3}, (_, i) => {
          const on = rnd(f * 7 + i * 13) > 0.45;
          const x = rnd(Math.floor(t * 2) * 5 + i * 31) * 1920 + Math.sin(t * 3 + i) * 6;
          return on ? <line key={i} x1={x} y1={0} x2={x + 4} y2={1080} stroke="#F6EEDC" strokeWidth={1 + rnd(i + f) * 1.4} opacity={0.18} /> : null;
        })}
        {Array.from({length: 7}, (_, i) => {
          const s = f * 11 + i * 17;
          return rnd(s) > 0.55 ? <circle key={'d' + i} cx={rnd(s + 1) * 1920} cy={rnd(s + 2) * 1080} r={1 + rnd(s + 3) * 3.5} fill={rnd(s + 4) > 0.5 ? '#000' : '#F6EEDC'} opacity={0.4} /> : null;
        })}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.62) 100%)', opacity: k}} />
    </AbsoluteFill>
  );
};

/** video de archivo a pantalla completa (cuadros absolutos), en blanco y negro o color, con efecto de película */
export const ArchiveVideo: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: number; rate?: number; zoom?: [number, number]; focus?: string; bw?: boolean; film?: number; fade?: number; credit?: string; dim?: number; grade?: string; sepia?: boolean;
}> = ({src, t, t0, t1 = Infinity, from = 0, rate = 1, zoom = [1.04, 1.12], focus = '50% 50%', bw = false, film = 1, fade = 0.35, credit, dim = 0.2, grade, sepia}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const span = t1 === Infinity ? 8 : t1 - t0;
  const k = clamp((t - t0) / span);
  const o = Math.min(prog(t, t0, fade), t1 === Infinity ? 1 : 1 - prog(t, t1 - fade, fade, easeIn));
  const sc = zoom[0] + (zoom[1] - zoom[0]) * k;
  const weave = film ? Math.sin(t * 9.3) * 1.2 : 0;
  const startFrame = frame - Math.round((t - t0) * fps);
  const filter = bw ? `grayscale(1) ${sepia ? 'sepia(0.35)' : ''} contrast(1.12) brightness(1.02)` : 'contrast(1.05) saturate(0.92)';
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden', background: '#000'}}>
      <Sequence from={startFrame} layout="none">
        <OffthreadVideo
          src={staticFile(src)}
          muted
          playbackRate={rate}
          trimBefore={Math.round(from * fps)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `translateY(${weave}px) scale(${sc})`, transformOrigin: focus, filter}}
        />
      </Sequence>
      {grade ? <AbsoluteFill style={{background: grade, mixBlendMode: 'multiply'}} /> : null}
      {dim ? <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${dim * 0.6}) 0%, rgba(0,0,0,${dim * 0.15}) 40%, rgba(0,0,0,${dim * 1.5}) 100%)`}} /> : null}
      {film ? <FilmFX t={t} k={film} /> : null}
      {credit ? <ArchCredit text={credit} /> : null}
    </AbsoluteFill>
  );
};

/** video de archivo enmarcado como copia de película (con perforaciones) */
export const FilmFrame: React.FC<{
  src: string; t: number; t0: number; t1?: number; from?: number; rate?: number; x: number; y: number; w: number; h: number; rot?: number; bw?: boolean; focus?: string; zoom?: [number, number]; label?: string; credit?: string; image?: boolean; o?: number;
}> = ({src, t, t0, t1 = Infinity, from = 0, rate = 1, x, y, w, h, rot = 0, bw = true, focus = '50% 50%', zoom = [1.02, 1.1], label, credit, image, o = 1}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = prog(t, t0, 0.6);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.35, 0.35, easeIn);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = zoom[0] + (zoom[1] - zoom[0]) * clamp((t - t0) / span);
  const startFrame = frame - Math.round((t - t0) * fps);
  const bar = 54;
  const holes = Math.floor((w + 40) / 46);
  const roll = ((t * 40) % 46);
  const filter = bw ? 'grayscale(1) contrast(1.15)' : 'contrast(1.05) saturate(0.95)';
  return (
    <div style={{position: 'absolute', left: x - w / 2 - 20, top: y - h / 2 - bar, width: w + 40, height: h + bar * 2, background: '#0E0D0C', opacity: a * (1 - out) * o, transform: `translateY(${(1 - a) * 90}px) rotate(${rot}deg) scale(${0.94 + 0.06 * a})`, boxShadow: '0 40px 90px rgba(0,0,0,0.7)', borderRadius: 6, overflow: 'hidden'}}>
      {[0, h + bar].map((top, r) => (
        <div key={r} style={{position: 'absolute', left: 0, top, width: w + 40, height: bar}}>
          {Array.from({length: holes + 2}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: i * 46 - roll, top: bar / 2 - 11, width: 26, height: 22, borderRadius: 5, background: '#2B2925'}} />
          ))}
        </div>
      ))}
      <div style={{position: 'absolute', left: 20, top: bar, width: w, height: h, overflow: 'hidden', background: '#000'}}>
        {image ? (
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter}} />
        ) : (
          <Sequence from={startFrame} layout="none">
            <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} trimBefore={Math.round(from * fps)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter}} />
          </Sequence>
        )}
        <AbsoluteFill style={{background: `rgba(255,246,225,${0.04 + 0.05 * rnd(Math.floor(t * 24))})`, mixBlendMode: 'overlay'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)'}} />
      </div>
      {label ? <div style={{position: 'absolute', left: 30, bottom: bar + 14, fontFamily: F.mono, fontSize: 20, letterSpacing: 2, color: K.cream, background: 'rgba(0,0,0,0.6)', padding: '4px 10px'}}>{label}</div> : null}
      {credit ? <div style={{position: 'absolute', right: 28, bottom: 14, fontFamily: F.mono, fontSize: 14, color: 'rgba(243,235,221,0.55)'}}>{credit}</div> : null}
    </div>
  );
};

export const ArchCredit: React.FC<{text: string; x?: number; y?: number; align?: 'left' | 'right'; o?: number}> = ({text, x = 60, y = 1030, align = 'right', o = 1}) => (
  <div style={{position: 'absolute', top: y, [align]: x, fontFamily: F.mono, fontSize: 16, letterSpacing: 0.4, color: 'rgba(243,235,221,0.68)', whiteSpace: 'nowrap', opacity: o, textShadow: '0 1px 4px rgba(0,0,0,0.9)'}}>{text}</div>
);

/* ---------- Cuenta regresiva de película (líder de noticiero) ---------- */
export const Leader: React.FC<{t: number; t0: number; dur?: number; from?: number}> = ({t, t0, dur = 1.5, from = 3}) => {
  if (t < t0 || t > t0 + dur) return null;
  const k = (t - t0) / dur;
  const n = Math.max(1, from - Math.floor(k * from));
  const sweep = ((k * from) % 1) * 360;
  const r = 330;
  const a = (sweep - 90) * (Math.PI / 180);
  const large = sweep > 180 ? 1 : 0;
  return (
    <AbsoluteFill style={{background: '#CFC6B4'}}>
      <svg width={1920} height={1080}>
        <path d={`M960 540 L960 ${540 - r} A${r} ${r} 0 ${large} 1 ${960 + Math.cos(a) * r} ${540 + Math.sin(a) * r} Z`} fill="#9C9483" />
        <circle cx={960} cy={540} r={r} fill="none" stroke="#2A2620" strokeWidth={8} />
        <circle cx={960} cy={540} r={r - 40} fill="none" stroke="#2A2620" strokeWidth={4} />
        <line x1={960} y1={140} x2={960} y2={940} stroke="#2A2620" strokeWidth={4} />
        <line x1={540} y1={540} x2={1380} y2={540} stroke="#2A2620" strokeWidth={4} />
        <text x={960} y={540 + 150} textAnchor="middle" fontFamily={F.head} fontSize={420} fill="#1E1B17">{n}</text>
      </svg>
      <FilmFX t={t} k={1.4} />
    </AbsoluteFill>
  );
};

/* ---------- Destello solar como transición ---------- */
export const FlareWipe: React.FC<{t: number; at: number; dur?: number}> = ({t, at, dur = 0.7}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  const peak = 1 - Math.abs(k - 0.5) / 0.5;
  const e = easeInOut(peak);
  const x = 960 + (k - 0.5) * 900;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x}px 540px, rgba(255,250,235,${e}) 0%, rgba(255,190,90,${e * 0.9}) ${18 + 50 * e}%, rgba(255,120,30,${e * 0.55}) ${40 + 50 * e}%, rgba(0,0,0,0) ${70 + 40 * e}%)`}} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen', opacity: e}}>
        <rect x={0} y={530} width={1920} height={20} fill="#FFE2B0" opacity={0.6} />
        {[0.3, 0.55, 0.8, 1.15].map((d, i) => (
          <circle key={i} cx={960 + (x - 960) * -d} cy={540} r={30 + i * 26} fill="none" stroke={i % 2 ? '#7FD8FF' : '#FFB86B'} strokeWidth={3} opacity={0.5} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Rótulo de persona (tercio inferior) ---------- */
export const NameTag: React.FC<{t: number; t0: number; t1?: number; name: string; role?: string; x?: number; y?: number; color?: string; align?: 'left' | 'right'}> = ({t, t0, t1 = Infinity, name, role, x = 110, y = 820, color = K.sun, align = 'left'}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const p = easeOut(prog(t, t0, 0.55));
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  return (
    <div style={{position: 'absolute', [align]: x, top: y, opacity: 1 - out, textAlign: align}}>
      <div style={{position: 'absolute', [align]: -40, top: -36, width: 900, height: 200, background: `radial-gradient(ellipse at ${align === 'left' ? '25%' : '75%'} 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)`}} />
      <div style={{position: 'relative', height: 6, width: 90 * p, background: color, marginBottom: 14, marginLeft: align === 'right' ? 'auto' : 0}} />
      <div style={{position: 'relative', fontFamily: F.head, fontSize: 72, color: K.cream, letterSpacing: 2, lineHeight: 1, clipPath: align === 'left' ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`, textShadow: '0 4px 18px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>{name}</div>
      {role ? <div style={{position: 'relative', fontFamily: F.body, fontWeight: 700, fontSize: 28, color: K.mute, letterSpacing: 3, marginTop: 10, opacity: prog(t, t0 + 0.3, 0.4), whiteSpace: 'nowrap'}}>{role}</div> : null}
    </div>
  );
};

/* ---------- Diario (recreación tipográfica) ---------- */
export const Newspaper: React.FC<{
  t: number; t0: number; t1?: number; x: number; y: number; w?: number; rot?: number; masthead: string; date: string; head: string; sub?: string; spin?: boolean; s?: number; dark?: boolean; o?: number;
}> = ({t, t0, t1 = Infinity, x, y, w = 760, rot = -3, masthead, date, head, sub, spin = true, s = 1, dark, o = 1}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = easeOut(prog(t, t0, spin ? 0.75 : 0.45));
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  const r = spin ? rot + (1 - a) * 720 : rot;
  const sc = spin ? 0.15 + 0.85 * a : 1;
  const h = w * 1.18;
  const paper = dark ? '#D9CDB2' : '#EFE6D2';
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: Math.min(1, a * 2) * (1 - out) * o, transform: `rotate(${r}deg) scale(${sc * s})`, background: paper, boxShadow: '0 40px 80px rgba(0,0,0,0.6)', padding: w * 0.045, boxSizing: 'border-box', overflow: 'hidden'}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.6}} />
      <div style={{position: 'relative', textAlign: 'center', fontFamily: F.quote, fontWeight: 900, fontSize: w * 0.085, color: K.ink, letterSpacing: 1, lineHeight: 1}}>{masthead}</div>
      <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between', borderTop: `3px solid ${K.ink}`, borderBottom: `1px solid ${K.ink}`, marginTop: w * 0.015, padding: '4px 0', fontFamily: F.mono, fontSize: w * 0.018, color: K.ink}}>
        <span>{date}</span>
        <span>RECREACIÓN</span>
      </div>
      <div style={{position: 'relative', fontFamily: F.head, fontSize: w * 0.098, lineHeight: 1.0, color: K.ink, marginTop: w * 0.03, textAlign: 'center', textTransform: 'uppercase'}}>{head}</div>
      {sub ? <div style={{position: 'relative', fontFamily: F.quote, fontStyle: 'italic', fontSize: w * 0.036, color: '#3A332A', marginTop: w * 0.02, textAlign: 'center', lineHeight: 1.2}}>{sub}</div> : null}
      <div style={{position: 'relative', display: 'flex', gap: w * 0.03, marginTop: w * 0.035}}>
        {[0, 1, 2].map((c) => (
          <div key={c} style={{flex: 1}}>
            {Array.from({length: 14}, (_, i) => (
              <div key={i} style={{height: w * 0.011, marginBottom: w * 0.012, background: '#2A2620', opacity: 0.32, width: `${70 + rnd(c * 20 + i) * 30}%`}} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Teletipo: franja con texto que corre ---------- */
export const Ticker: React.FC<{t: number; t0: number; t1?: number; text: string; y?: number; color?: string; speed?: number}> = ({t, t0, t1 = Infinity, text, y = 940, color = K.sun, speed = 260}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = prog(t, t0, 0.35);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  const off = 1920 - (t - t0) * speed;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1920, height: 70, background: 'rgba(8,8,10,0.86)', borderTop: `3px solid ${color}`, opacity: a * (1 - out), overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 70, padding: '0 26px', background: color, color: K.ink, fontFamily: F.head, fontSize: 40, lineHeight: '70px', letterSpacing: 3, zIndex: 2}}>ÚLTIMO MOMENTO</div>
      <div style={{position: 'absolute', left: off, top: 0, fontFamily: TYPE, fontSize: 40, lineHeight: '70px', color: K.cream, whiteSpace: 'nowrap', letterSpacing: 2}}>{text}</div>
    </div>
  );
};

/* ---------- Botella de leche con energía solar adentro ---------- */
export const MilkBottle: React.FC<{x: number; y: number; s?: number; fill?: number; glow?: number; crack?: number; label?: boolean; t: number; o?: number; rot?: number}> = ({x, y, s = 1, fill = 1, glow = 1, crack = 0, label = true, t, o = 1, rot = 0}) => {
  const id = `mb${Math.round(x)}${Math.round(y)}`;
  const level = 300 - 230 * fill;
  return (
    <svg width={260 * s} height={420 * s} viewBox="-130 -60 260 420" style={{position: 'absolute', left: x - 130 * s, top: y - 210 * s, opacity: o, transform: `rotate(${rot}deg)`, overflow: 'visible'}}>
      <defs>
        <radialGradient id={id + 'g'} cx="0" cy="190" r="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="0.35" stopColor="#FFC24A" />
          <stop offset="0.75" stopColor="#FF7A1A" />
          <stop offset="1" stopColor="#B83A0A" />
        </radialGradient>
        <clipPath id={id + 'c'}>
          <path d="M-38 -30 L38 -30 L38 20 C38 50 92 70 92 120 L92 300 C92 322 74 334 52 334 L-52 334 C-74 334 -92 322 -92 300 L-92 120 C-92 70 -38 50 -38 20 Z" />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={190} rx={150 * glow} ry={190 * glow} fill="#FF9A3A" opacity={0.22 * glow} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={-100} y={-40} width={200} height={380} fill="rgba(255,255,255,0.06)" />
        <rect x={-100} y={level + Math.sin(t * 3) * 3} width={200} height={380} fill={`url(#${id}g)`} opacity={0.95} />
        {Array.from({length: 7}, (_, i) => (
          <circle key={i} cx={-70 + rnd(i) * 140} cy={320 - (((t * 40 + rnd(i + 5) * 300) % 260))} r={3 + rnd(i + 9) * 5} fill="#FFF3C8" opacity={0.7 * fill} />
        ))}
      </g>
      <path d="M-38 -30 L38 -30 L38 20 C38 50 92 70 92 120 L92 300 C92 322 74 334 52 334 L-52 334 C-74 334 -92 322 -92 300 L-92 120 C-92 70 -38 50 -38 20 Z" fill="none" stroke="#F3EBDD" strokeWidth={6} opacity={0.85} />
      <rect x={-44} y={-52} width={88} height={26} rx={6} fill="#C9C2B4" />
      <path d="M-70 110 C-60 90 -55 85 -48 80" stroke="#FFFFFF" strokeWidth={8} opacity={0.35} fill="none" strokeLinecap="round" />
      {label ? (
        <g>
          <rect x={-78} y={190} width={156} height={92} rx={8} fill="#F3EBDD" opacity={0.95} />
          <text x={0} y={226} textAnchor="middle" fontFamily={F.head} fontSize={30} fill={K.ink} letterSpacing={2}>ENERGÍA</text>
          <text x={0} y={262} textAnchor="middle" fontFamily={F.head} fontSize={30} fill={K.red}>½ LITRO</text>
        </g>
      ) : null}
      {crack > 0 ? (
        <g stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={clamp(crack * 2)}>
          <path d={`M-20 60 L${-20 + 10 * crack} ${60 + 60 * crack} L${-40 * crack} ${120 + 50 * crack} L${20 * crack} ${170 + 70 * crack}`} />
          <path d={`M${-10 + 6 * crack} ${120 + 40 * crack} L${40 * crack} ${130 + 30 * crack} L${70 * crack} ${100 + 40 * crack}`} />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------- Banderas simples ---------- */
export const Flag: React.FC<{kind: 'usa' | 'urss' | 'arg'; w?: number}> = ({kind, w = 300}) => {
  const h = w * 0.62;
  if (kind === 'arg')
    return (
      <svg width={w} height={h} viewBox="0 0 300 186">
        <rect width={300} height={62} fill="#74ACDF" />
        <rect y={62} width={300} height={62} fill="#FFFFFF" />
        <rect y={124} width={300} height={62} fill="#74ACDF" />
        <circle cx={150} cy={93} r={18} fill="#F6B40E" />
        {Array.from({length: 16}, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <line key={i} x1={150 + Math.cos(a) * 20} y1={93 + Math.sin(a) * 20} x2={150 + Math.cos(a) * 28} y2={93 + Math.sin(a) * 28} stroke="#F6B40E" strokeWidth={3} />;
        })}
      </svg>
    );
  if (kind === 'urss')
    return (
      <svg width={w} height={h} viewBox="0 0 300 186">
        <rect width={300} height={186} fill="#CC1F1F" />
        <path d="M52 28 l6 16 h17 l-14 10 l5 16 l-14 -10 l-14 10 l5 -16 l-14 -10 h17 Z" fill="#F6C21A" />
        <path d="M40 92 C40 112 58 124 76 118 L90 132 M50 80 L86 116" stroke="#F6C21A" strokeWidth={7} fill="none" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width={w} height={h} viewBox="0 0 300 186">
      {Array.from({length: 13}, (_, i) => (
        <rect key={i} y={i * (186 / 13)} width={300} height={186 / 13 + 0.5} fill={i % 2 ? '#FFFFFF' : '#B22234'} />
      ))}
      <rect width={130} height={100} fill="#3C3B6E" />
      {Array.from({length: 20}, (_, i) => (
        <circle key={i} cx={14 + (i % 5) * 25} cy={14 + Math.floor(i / 5) * 24} r={4} fill="#FFFFFF" />
      ))}
    </svg>
  );
};

/* ---------- Cita grande con palabras resaltadas ---------- */
export const QuoteCard: React.FC<{t: number; t0: number; t1?: number; lines: {text: string; t0: number; color?: string}[]; who?: string; whoAt?: number; x?: number; y?: number; w?: number; size?: number}> = ({
  t, t0, t1 = Infinity, lines, who, whoAt, x = 960, y = 540, w = 1500, size = 64,
}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.35, 0.35, easeIn);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: 'translateY(-50%)', opacity: (1 - out) * prog(t, t0, 0.3)}}>
      <div style={{position: 'absolute', left: -70, top: -110, fontFamily: F.quote, fontSize: 260, color: K.sun, opacity: 0.5, lineHeight: 1}}>“</div>
      {lines.map((l, i) => {
        const p = prog(t, l.t0, 0.45);
        return (
          <div key={i} style={{fontFamily: F.quote, fontStyle: 'italic', fontWeight: 600, fontSize: size, lineHeight: 1.22, color: l.color ?? K.cream, opacity: p, transform: `translateY(${(1 - easeOut(p)) * 24}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.7)', marginBottom: 12}}>
            {l.text}
          </div>
        );
      })}
      {who ? <div style={{marginTop: 26, fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: K.mute, opacity: prog(t, whoAt ?? t0 + 0.5, 0.4)}}>— {who}</div> : null}
    </div>
  );
};

/* ---------- Encuesta para comentarios ---------- */
export const Poll: React.FC<{t: number; t0: number; t1?: number; q: string; a: string; b: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, q, a, b, x = 960, y = 540}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const p = pop(t, t0, 1.4);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  const tapA = prog(t, t0 + 1.4, 0.3), tapB = prog(t, t0 + 2.0, 0.3);
  const bar = (k: number, pct: number, c: string) => (
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * k}%`, background: c, opacity: 0.32, borderRadius: 18}} />
  );
  return (
    <div style={{position: 'absolute', left: x - 520, top: y - 260, width: 1040, padding: '44px 54px', background: 'rgba(16,18,28,0.92)', border: `2px solid ${K.line}`, borderRadius: 34, transform: `scale(${Math.min(1.04, p)})`, opacity: Math.min(1, p) * (1 - out), boxShadow: '0 40px 100px rgba(0,0,0,0.6)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, fontWeight: 800, fontSize: 26, color: K.mute, letterSpacing: 3}}>
        <svg width={40} height={40} viewBox="0 0 40 40"><path d="M6 8 h28 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-16 l-8 7 v-7 h-4 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4 z" fill={K.sun} /></svg>
        DEJALO EN LOS COMENTARIOS
      </div>
      <div style={{fontFamily: F.head, fontSize: 82, color: K.cream, marginTop: 16, lineHeight: 1.05}}>{q}</div>
      {[[a, tapA, 58, K.green], [b, tapB, 42, K.red]].map(([lab, k, pct, c], i) => (
        <div key={i} style={{position: 'relative', marginTop: i ? 18 : 34, height: 92, borderRadius: 18, border: `2px solid ${K.line}`, overflow: 'hidden'}}>
          {bar(k as number, pct as number, c as string)}
          <div style={{position: 'absolute', left: 30, top: 0, lineHeight: '92px', fontFamily: F.head, fontSize: 52, color: K.cream, letterSpacing: 2}}>{lab as string}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------- Bombita de luz ---------- */
export const Bulb: React.FC<{on: number; x: number; y: number; s?: number; o?: number}> = ({on, x, y, s = 1, o = 1}) => (
  <svg width={300 * s} height={420 * s} viewBox="-150 -170 300 420" style={{position: 'absolute', left: x - 150 * s, top: y - 210 * s, opacity: o, overflow: 'visible'}}>
    <circle cx={0} cy={0} r={190} fill="#FFD27A" opacity={0.25 * on} />
    <path d="M-80 0 C-80 -60 -40 -110 0 -110 C40 -110 80 -60 80 0 C80 40 50 60 40 100 L-40 100 C-50 60 -80 40 -80 0 Z" fill={on > 0.05 ? `rgba(255,214,120,${0.25 + 0.7 * on})` : 'rgba(200,210,230,0.12)'} stroke="#DDE3EE" strokeWidth={5} />
    <path d="M-22 100 L-14 20 L0 40 L14 20 L22 100" fill="none" stroke={on > 0.05 ? '#FFF2C8' : '#7F8796'} strokeWidth={4} />
    <rect x={-44} y={100} width={88} height={22} rx={6} fill="#8A8F99" />
    <rect x={-40} y={124} width={80} height={18} rx={6} fill="#6C717B" />
    <rect x={-34} y={144} width={68} height={16} rx={6} fill="#575B64" />
  </svg>
);

/* ---------- Ficha / documento con texto mecanografiado ---------- */
export const DocSheet: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; w?: number; h?: number; rot?: number; title: string; sub?: string; children?: React.ReactNode}> = ({t, t0, t1 = Infinity, x, y, w = 900, h = 1000, rot = -2, title, sub, children}) => {
  if (t < t0 - 0.02 || t > t1 + 0.02) return null;
  const a = easeOut(prog(t, t0, 0.6));
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.3, 0.3, easeIn);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, background: K.paper, transform: `translateY(${(1 - a) * 300}px) rotate(${rot + (1 - a) * 4}deg)`, opacity: Math.min(1, a * 1.5) * (1 - out), boxShadow: '0 40px 90px rgba(0,0,0,0.65)', padding: '60px 70px', boxSizing: 'border-box', overflow: 'hidden'}}>
      <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.55}} />
      <div style={{position: 'relative', fontFamily: TYPE, fontSize: 30, color: K.ink, letterSpacing: 3, textAlign: 'center'}}>{title}</div>
      {sub ? <div style={{position: 'relative', fontFamily: TYPE, fontSize: 22, color: '#5A5246', letterSpacing: 2, textAlign: 'center', marginTop: 8}}>{sub}</div> : null}
      <div style={{position: 'relative', height: 2, background: K.ink, opacity: 0.6, margin: '22px 0 30px'}} />
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

/* ---------- Enchufe que se desconecta ---------- */
export const Plug: React.FC<{t: number; t0: number; x: number; y: number; s?: number; o?: number}> = ({t, t0, x, y, s = 1, o = 1}) => {
  const k = easeInOut(prog(t, t0, 0.8));
  const gap = 20 + 120 * k;
  return (
    <svg width={900 * s} height={300 * s} viewBox="-450 -150 900 300" style={{position: 'absolute', left: x - 450 * s, top: y - 150 * s, opacity: o, overflow: 'visible'}}>
      <path d={`M-450 0 C-300 0 -260 ${30 * k} ${-gap - 110} 0`} stroke="#2E2A26" strokeWidth={22} fill="none" />
      <g transform={`translate(${-gap},0)`}>
        <rect x={-110} y={-55} width={110} height={110} rx={16} fill="#3C3732" stroke="#F3EBDD" strokeWidth={4} />
        <rect x={0} y={-30} width={46} height={14} fill="#C9C2B4" />
        <rect x={0} y={16} width={46} height={14} fill="#C9C2B4" />
      </g>
      <g transform={`translate(${gap * 0.4},0)`}>
        <rect x={0} y={-70} width={140} height={140} rx={18} fill="#E9E1D2" stroke="#F3EBDD" strokeWidth={4} />
        <rect x={20} y={-30} width={10} height={14} fill="#2E2A26" />
        <rect x={20} y={16} width={10} height={14} fill="#2E2A26" />
      </g>
      {k > 0.6 ? (
        <g opacity={prog(t, t0 + 0.6, 0.3)}>
          <line x1={-30} y1={-90} x2={-10} y2={-60} stroke={K.red} strokeWidth={6} />
          <line x1={10} y1={-95} x2={0} y2={-62} stroke={K.red} strokeWidth={6} />
          <line x1={40} y1={-88} x2={20} y2={-60} stroke={K.red} strokeWidth={6} />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------- Barra de energía (para el NIF) ---------- */
export const EnergyBar: React.FC<{t: number; t0: number; label: string; value: string; frac: number; color: string; y: number; x?: number; maxW?: number; o?: number}> = ({t, t0, label, value, frac, color, y, x = 220, maxW = 1480, o = 1}) => {
  if (t < t0 - 0.02) return null;
  const k = easeOut(prog(t, t0, 0.9));
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: prog(t, t0, 0.25) * o}}>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: K.mute, marginBottom: 10}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
        <div style={{height: 64, width: Math.max(6, maxW * frac * k), background: color, borderRadius: 8, boxShadow: `0 0 30px ${color}88`}} />
        <div style={{fontFamily: F.head, fontSize: 60, color: K.cream, opacity: prog(t, t0 + 0.5, 0.3), whiteSpace: 'nowrap'}}>{value}</div>
      </div>
    </div>
  );
};

/* ---------- Pantalla de osciloscopio / contador de radiación ---------- */
export const Scope: React.FC<{t: number; t0: number; x: number; y: number; w?: number; h?: number; title: string; spikes: number[]; fuel: boolean; color?: string}> = ({t, t0, x, y, w = 760, h = 420, title, spikes, fuel, color = K.green}) => {
  if (t < t0 - 0.02) return null;
  const a = prog(t, t0, 0.5);
  const N = 160;
  const pts: string[] = [];
  const span = 4.0;
  for (let i = 0; i <= N; i++) {
    const tt = t - span + (i / N) * span;
    let v = Math.sin(tt * 40 + i) * 0.03 + (rnd(Math.floor(tt * 60) + i) - 0.5) * 0.05;
    for (const s of spikes) {
      const d = tt - s;
      if (d > 0 && d < 0.5) v += Math.exp(-d * 9) * (0.8 + 0.2 * Math.sin(d * 90));
    }
    const px = (i / N) * w;
    const py = h * 0.72 - v * h * 0.55;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: a}}>
      <div style={{fontFamily: F.head, fontSize: 44, color: K.cream, letterSpacing: 2, marginBottom: 12}}>{title}</div>
      <div style={{position: 'relative', width: w, height: h, background: '#07120C', border: '3px solid #2B4A37', borderRadius: 18, overflow: 'hidden', boxShadow: `inset 0 0 60px rgba(0,0,0,0.8)`}}>
        <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
          {Array.from({length: 9}, (_, i) => <line key={'v' + i} x1={(i / 8) * w} y1={0} x2={(i / 8) * w} y2={h} stroke="#1D3A28" strokeWidth={1.5} />)}
          {Array.from({length: 5}, (_, i) => <line key={'h' + i} x1={0} y1={(i / 4) * h} x2={w} y2={(i / 4) * h} stroke="#1D3A28" strokeWidth={1.5} />)}
          <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={4} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
        </svg>
        <div style={{position: 'absolute', right: 18, top: 14, fontFamily: F.mono, fontSize: 22, color: fuel ? K.sun : K.mute, letterSpacing: 2}}>{fuel ? 'CON COMBUSTIBLE' : 'SIN COMBUSTIBLE'}</div>
      </div>
    </div>
  );
};

/** contador de dinero/número grande con prefijo */
export const MoneyCount: React.FC<{t: number; t0: number; to: number; dur?: number; prefix?: string; suffix?: string; size?: number; color?: string; x?: number; y?: number; label?: string}> = ({t, t0, to, dur = 1.2, prefix = 'US$ ', suffix = '', size = 170, color = K.sun, x = 960, y = 520, label}) => {
  if (t < t0 - 0.02) return null;
  const k = easeOut(clamp((t - t0) / dur));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: prog(t, t0, 0.25)}}>
      {label ? <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, letterSpacing: 5, color: K.mute, marginBottom: 10, whiteSpace: 'nowrap'}}>{label}</div> : null}
      <div style={{fontFamily: F.head, fontSize: size, color, lineHeight: 1, textShadow: `0 0 40px ${color}55, 0 10px 40px rgba(0,0,0,0.7)`, whiteSpace: 'nowrap'}}>
        {prefix}
        {fmt(Math.round(to * k))}
        {suffix}
      </div>
    </div>
  );
};
