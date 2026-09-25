import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {R, F2} from './lib';
import {clamp, easeIn, easeOut, pop, prog, rnd} from '../lib/anim';

/* ================= Texturas ================= */

/** Fondo de papel fotocopiado (fanzine) */
export const Zine: React.FC<{tint?: string; children?: React.ReactNode; dark?: boolean}> = ({tint, children, dark}) => (
  <AbsoluteFill style={{background: tint ?? (dark ? R.black : R.paper)}}>
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: dark ? 'screen' : 'multiply', opacity: dark ? 0.07 : 0.6}} />
    <AbsoluteFill style={{background: dark ? 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%)' : 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(50,30,10,0.22) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/** Trama de puntos (halftone) */
export const Halftone: React.FC<{color?: string; opacity?: number; size?: number; id?: string; style?: React.CSSProperties}> = ({color = '#000', opacity = 0.12, size = 14, id = 'ht', style}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none', ...style}}>
    <defs>
      <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
        <circle cx={size / 2} cy={size / 2} r={size * 0.28} fill={color} />
      </pattern>
      <radialGradient id={id + 'g'} cx="50%" cy="50%" r="70%">
        <stop offset="30%" stopColor="#fff" stopOpacity="0" />
        <stop offset="100%" stopColor="#fff" stopOpacity="1" />
      </radialGradient>
      <mask id={id + 'm'}>
        <rect width="100%" height="100%" fill={`url(#${id}g)`} />
      </mask>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} mask={`url(#${id}m)`} />
  </svg>
);

/** Luces de patrullero (bordes rojo/azul alternando) */
export const PoliceLights: React.FC<{t: number; amount?: number}> = ({t, amount = 1}) => {
  const ph = Math.floor(t * 5) % 2;
  const a = amount * (0.35 + 0.15 * Math.sin(t * 31));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${ph ? 0 : 100}% 50%, rgba(232,50,43,${a}) 0%, rgba(0,0,0,0) 55%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${ph ? 100 : 0}% 50%, rgba(45,107,255,${a}) 0%, rgba(0,0,0,0) 55%)`}} />
    </AbsoluteFill>
  );
};

/** Separación RGB (glitch) sobre un contenido */
export const RGBSplit: React.FC<{amount: number; children: React.ReactNode}> = ({amount, children}) => {
  if (amount <= 0.01) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${-amount * 14}px)`, mixBlendMode: 'screen', filter: 'url(#chR)', opacity: 0.9}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${amount * 14}px)`, mixBlendMode: 'screen', filter: 'url(#chB)', opacity: 0.9}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - amount * 0.5}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Glitch por franjas horizontales (tipo VHS) */
export const SliceGlitch: React.FC<{amount: number; t: number; children: React.ReactNode}> = ({amount, t, children}) => {
  if (amount <= 0.01) return <>{children}</>;
  const bands = 7;
  const step = Math.floor(t * 24);
  return (
    <AbsoluteFill>
      {Array.from({length: bands}).map((_, i) => {
        const off = (rnd(i * 17 + step * 3) - 0.5) * 140 * amount;
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(${(i / bands) * 100}% 0 ${100 - ((i + 1) / bands) * 100}% 0)`, transform: `translateX(${off}px)`}}>
            {children}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(232,50,43,${0.25 * amount}), rgba(45,107,255,${0.25 * amount}))`, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const RockDefs: React.FC = () => (
  <svg width="0" height="0" style={{position: 'absolute'}}>
    <defs>
      <filter id="chR"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
      <filter id="chB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      <filter id="rough2">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
      </filter>
      <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
  </svg>
);

/* ================= Tipografía ================= */

const RANSOM_FONTS = [F2.head, F2.quote, F2.black, F2.type, F2.bungee, F2.mono, F2.hand];
const RANSOM_BG = ['#FFFFFF', R.yellow, R.red, '#111111', '#F4EAD5', R.blue, '#FFFFFF', '#E9D7A8'];

/** Letras recortadas tipo "nota de secuestro" que caen de a una */
export const Ransom: React.FC<{text: string; t: number; t0: number; size?: number; stagger?: number; seed?: number; style?: React.CSSProperties}> = ({text, t, t0, size = 150, stagger = 0.06, seed = 1, style}) => {
  let li = 0;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: size * 0.06, ...style}}>
      {text.split(' ').map((word, wi) => (
        <div key={wi} style={{display: 'flex', gap: size * 0.03, marginRight: size * 0.18}}>
          {word.split('').map((ch, ci) => {
            const i = li++;
            const r = rnd(i * 7 + seed);
            const bg = RANSOM_BG[Math.floor(rnd(i * 3 + seed) * RANSOM_BG.length)];
            const dark = bg === '#111111' || bg === R.red || bg === R.blue;
            const lt = t0 + i * stagger;
            const k = pop(t, lt, 1.3);
            return (
              <div
                key={ci}
                style={{
                  fontFamily: RANSOM_FONTS[Math.floor(rnd(i * 5 + seed + 2) * RANSOM_FONTS.length)], fontSize: size * (0.82 + r * 0.3), lineHeight: 1,
                  background: bg, color: dark ? '#FFFFFF' : '#111111', padding: `${size * 0.05}px ${size * 0.07}px`, textTransform: rnd(i + seed) > 0.25 ? 'uppercase' : 'none',
                  transform: `rotate(${(r - 0.5) * 14}deg) scale(${t < lt ? 0 : k}) translateY(${(r - 0.5) * size * 0.12}px)`,
                  boxShadow: '4px 5px 0 rgba(0,0,0,0.35)', opacity: t < lt ? 0 : 1, fontWeight: 900,
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Texto que se tipea con máquina de escribir */
export const Typed: React.FC<{text: string; t: number; t0: number; cps?: number; style?: React.CSSProperties; cursor?: boolean}> = ({text, t, t0, cps = 28, style, cursor = true}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
  const blink = Math.floor(t * 2.5) % 2 === 0;
  return (
    <span style={{fontFamily: F2.type, whiteSpace: 'pre-wrap', ...style}}>
      {text.slice(0, n)}
      {cursor && n < text.length + 1 && t >= t0 ? <span style={{opacity: blink ? 1 : 0}}>▌</span> : null}
    </span>
  );
};

/* ================= Tarjeta de capítulo: vinilo ================= */

export const TRACKS = [
  {n: '01', name: 'La idea'},
  {n: '02', name: 'La banda'},
  {n: '03', name: 'El túnel'},
  {n: '04', name: 'El golpe'},
  {n: '05', name: 'El show del traje gris'},
  {n: '06', name: 'La fuga'},
  {n: '07', name: 'El cartel'},
  {n: '08', name: 'Los celos'},
  {n: '09', name: 'Bonus track'},
];

export const Vinyl: React.FC<{size?: number; spin?: number; label?: string; color?: string; sub?: string}> = ({size = 600, spin = 0, label = 'CONTEXTO', color = R.red, sub = ''}) => (
  <svg width={size} height={size} viewBox="0 0 600 600" style={{transform: `rotate(${spin}deg)`, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}}>
    <circle cx="300" cy="300" r="296" fill="#0B0B0B" />
    {Array.from({length: 26}).map((_, i) => (
      <circle key={i} cx="300" cy="300" r={120 + i * 6.6} fill="none" stroke="#1E1E1E" strokeWidth="1.6" />
    ))}
    <path d="M300 4 A296 296 0 0 1 560 160" stroke="rgba(255,255,255,0.10)" strokeWidth="60" fill="none" />
    <circle cx="300" cy="300" r="110" fill={color} />
    <circle cx="300" cy="300" r="104" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
    <text x="300" y="282" textAnchor="middle" fontFamily="Anton" fontSize="42" fill="#fff" letterSpacing="2">{label}</text>
    <text x="300" y="335" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="17" fill="#fff" letterSpacing="3">{sub}</text>
    <circle cx="300" cy="300" r="9" fill="#111" />
  </svg>
);

/** Tarjeta de "track": entra con el aguja, lista de temas, sale con barrido */
export const TrackCard: React.FC<{t: number; t0: number; t1: number; idx: number}> = ({t, t0, t1, idx}) => {
  if (t < t0 || t > t1) return null;
  const a = prog(t, t0, 0.35);
  const inn = prog(t, t0, 0.28);
  const out = prog(t, t1 - 0.3, 0.3, easeIn);
  const tr = TRACKS[idx];
  const side = idx < 5 ? 'LADO A' : 'LADO B';
  return (
    <AbsoluteFill style={{clipPath: `inset(0 ${(1 - inn) * 100}% 0 ${out * 100}%)`}}>
      <Zine dark>
        <Halftone color="#fff" opacity={0.06} id={'htc' + idx} />
        <div style={{position: 'absolute', left: 120 - (1 - a) * 700, top: 540 - 330, transform: `scale(${0.9 + 0.1 * a})`}}>
          <Vinyl size={660} spin={(t - t0) * 200} sub={`${side} · ${tr.n}`} />
        </div>
        <div style={{position: 'absolute', left: 1010, top: 170, opacity: prog(t, t0 + 0.1, 0.3)}}>
          <div style={{fontFamily: F2.type, fontSize: 30, color: R.yellow, letterSpacing: 6}}>{side} · TRACK {tr.n}</div>
          <div style={{fontFamily: F2.head, fontSize: 150, color: R.white, lineHeight: 1.02, textTransform: 'uppercase', marginTop: 10, transform: `translateX(${(1 - prog(t, t0 + 0.12, 0.45)) * 60}px)`}}>
            {tr.name}
          </div>
          <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 6}}>
            {TRACKS.map((x, i) =>
              Math.abs(i - idx) <= 2 ? (
                <div key={i} style={{fontFamily: F2.type, fontSize: 28, color: i === idx ? R.red : 'rgba(255,255,255,0.35)', letterSpacing: 2}}>
                  {x.n}. {x.name.toUpperCase()} {i === idx ? '◀' : ''}
                </div>
              ) : null,
            )}
          </div>
        </div>
        {/* brazo del tocadiscos */}
        <svg width="400" height="600" viewBox="0 0 400 600" style={{position: 'absolute', left: 560, top: 60, transformOrigin: '330px 60px', transform: `rotate(${18 - 18 * a}deg)`}}>
          <circle cx="330" cy="60" r="36" fill="#B9B9B9" stroke="#555" strokeWidth="6" />
          <path d="M330 60 L300 420 L240 470" stroke="#D0D0D0" strokeWidth="14" fill="none" strokeLinecap="round" />
          <rect x="200" y="455" width="60" height="34" rx="6" fill="#333" transform="rotate(-40 230 472)" />
        </svg>
      </Zine>
    </AbsoluteFill>
  );
};

/* ================= Personajes (siluetas) ================= */

export type Role = 'cerebro' | 'medico' | 'traje' | 'ingeniero' | 'chofer' | 'misterio' | 'mujer' | 'beto';

/** Busto ilustrado plano con accesorios según el rol */
export const Bust: React.FC<{role: Role; size?: number; style?: React.CSSProperties}> = ({role, size = 320, style}) => {
  const skin = '#2A2522';
  const S = '#111';
  const body: Record<Role, string> = {cerebro: '#3D5A80', medico: '#F5F5F0', traje: '#7D7F84', ingeniero: '#C9612A', chofer: '#2F3A2F', misterio: '#1B1B1B', mujer: '#8E3B5A', beto: '#4A4038'};
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 320 368" style={style}>
      {/* cuerpo */}
      <path d="M40 368 C40 280 90 240 160 240 C230 240 280 280 280 368 Z" fill={body[role]} stroke={S} strokeWidth="6" />
      {role === 'traje' ? (
        <>
          <path d="M160 244 L128 300 L160 368 L192 300 Z" fill="#fff" stroke={S} strokeWidth="4" />
          <path d="M160 262 L150 290 L160 350 L170 290 Z" fill={R.red} />
          <path d="M126 250 L160 330 L110 368" fill="none" stroke={S} strokeWidth="5" />
          <path d="M194 250 L160 330 L210 368" fill="none" stroke={S} strokeWidth="5" />
        </>
      ) : null}
      {role === 'medico' ? (
        <>
          <path d="M160 244 L140 368 M160 244 L180 368" stroke="#bbb" strokeWidth="4" />
          <path d="M112 258 C100 320 150 330 160 300" fill="none" stroke="#333" strokeWidth="7" />
          <circle cx="160" cy="302" r="12" fill="#999" stroke="#333" strokeWidth="4" />
        </>
      ) : null}
      {/* cuello y cabeza */}
      <rect x="140" y="200" width="40" height="50" fill={skin} />
      <ellipse cx="160" cy="150" rx="66" ry="78" fill={skin} stroke={S} strokeWidth="5" />
      {role === 'cerebro' ? (
        <>
          <path d="M92 132 C90 60 230 50 228 132 C215 100 110 100 92 132 Z" fill="#1a1a1a" />
          <path d="M94 140 C80 190 96 230 110 240" stroke="#1a1a1a" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M226 140 C240 190 224 230 210 240" stroke="#1a1a1a" strokeWidth="16" fill="none" strokeLinecap="round" />
          <rect x="96" y="112" width="128" height="16" rx="6" fill={R.red} />
        </>
      ) : null}
      {role === 'medico' ? (
        <>
          {Array.from({length: 11}).map((_, i) => (
            <circle key={i} cx={96 + i * 12.8} cy={96 + Math.sin(i) * 8} r="18" fill="#D9A441" stroke={S} strokeWidth="3" />
          ))}
          <circle cx="94" cy="130" r="16" fill="#D9A441" stroke={S} strokeWidth="3" />
          <circle cx="226" cy="130" r="16" fill="#D9A441" stroke={S} strokeWidth="3" />
        </>
      ) : null}
      {role === 'traje' ? <path d="M96 128 C96 70 224 64 224 128 C200 96 130 92 96 128 Z" fill="#9A9A9A" /> : null}
      {role === 'ingeniero' ? (
        <>
          <path d="M92 118 C92 56 228 56 228 118 Z" fill={R.yellow} stroke={S} strokeWidth="5" />
          <rect x="84" y="112" width="152" height="16" rx="8" fill={R.yellow} stroke={S} strokeWidth="5" />
          <circle cx="160" cy="98" r="10" fill="#fff" stroke={S} strokeWidth="3" />
        </>
      ) : null}
      {role === 'chofer' ? (
        <>
          <path d="M92 120 C92 66 228 66 228 120 Z" fill="#2F3A2F" stroke={S} strokeWidth="5" />
          <path d="M150 118 L262 124 L256 136 L150 132 Z" fill="#2F3A2F" stroke={S} strokeWidth="4" />
          <rect x="104" y="138" width="50" height="24" rx="8" fill="#111" />
          <rect x="166" y="138" width="50" height="24" rx="8" fill="#111" />
          <rect x="150" y="146" width="20" height="5" fill="#111" />
        </>
      ) : null}
      {role === 'beto' ? <path d="M96 124 C96 70 224 70 224 124 C200 104 124 104 96 124 Z" fill="#1a1a1a" /> : null}
      {role === 'mujer' ? (
        <>
          <path d="M88 150 C80 40 240 40 232 150 L240 260 L208 250 L210 140 C190 110 130 110 110 140 L112 250 L80 260 Z" fill="#3a1f14" />
        </>
      ) : null}
      {role === 'misterio' ? (
        <>
          <path d="M70 250 C60 120 100 50 160 50 C220 50 260 120 250 250 Z" fill="#1B1B1B" stroke={S} strokeWidth="5" />
          <text x="160" y="190" textAnchor="middle" fontFamily="Anton" fontSize="120" fill={R.yellow}>?</text>
        </>
      ) : null}
    </svg>
  );
};

/** Pared de identificación policial con altura */
export const LineupWall: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#D8D2C4'}}>
    <Img src={staticFile('tex/paper.png')} style={{position: 'absolute', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.5}} />
    {Array.from({length: 11}).map((_, i) => {
      const y = 140 + i * 72;
      const cm = 210 - i * 10;
      return (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: i % 2 ? 2 : 4, background: 'rgba(0,0,0,0.45)'}}>
          <div style={{position: 'absolute', left: 16, top: -30, fontFamily: F2.type, fontSize: 24, color: 'rgba(0,0,0,0.6)'}}>{cm}</div>
          <div style={{position: 'absolute', right: 16, top: -30, fontFamily: F2.type, fontSize: 24, color: 'rgba(0,0,0,0.6)'}}>{cm}</div>
        </div>
      );
    })}
    {children}
  </AbsoluteFill>
);

/** Cartelito de identificación */
export const Placard: React.FC<{name: string; alias?: string; role: string; num?: string; w?: number}> = ({name, alias, role, num, w = 330}) => (
  <div style={{width: w, background: '#161513', color: '#fff', padding: '12px 16px', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.35)', textAlign: 'center'}}>
    <div style={{fontFamily: F2.type, fontSize: 18, color: R.yellow, letterSpacing: 3}}>{num ?? 'POLICÍA · SAN ISIDRO'}</div>
    <div style={{fontFamily: F2.head, fontSize: 40, lineHeight: 1.05, textTransform: 'uppercase', marginTop: 4}}>{name}</div>
    {alias ? <div style={{fontFamily: F2.scrawl, fontSize: 22, color: R.yellow, marginTop: 2}}>{alias}</div> : null}
    <div style={{fontFamily: F2.type, fontSize: 20, marginTop: 6, color: '#ddd'}}>{role}</div>
  </div>
);

/* ================= HUD del reloj ================= */

export const ClockHUD: React.FC<{time: string; t: number; label?: string; opacity?: number}> = ({time, t, label = 'VIE 13/01/2006', opacity = 1}) => {
  const blink = Math.floor(t * 2) % 2 === 0;
  const [hh, mm] = time.split(':');
  return (
    <div style={{position: 'absolute', right: 56, top: 44, opacity, zIndex: 30, background: 'rgba(10,10,10,0.88)', border: `3px solid ${R.red}`, padding: '8px 18px 6px', borderRadius: 8, textAlign: 'right'}}>
      <div style={{fontFamily: F2.type, fontSize: 18, color: 'rgba(255,255,255,0.7)', letterSpacing: 3}}>{label} · ACASSUSO</div>
      <div style={{fontFamily: F2.bungee, fontSize: 64, color: R.red, lineHeight: 1, textShadow: `0 0 18px ${R.red}`}}>
        {hh}
        <span style={{opacity: blink ? 1 : 0.2}}>:</span>
        {mm}
      </div>
    </div>
  );
};

/* ================= Objetos ilustrados ================= */

const S = '#111';
const SW = 6;

export const ToyGun: React.FC<{size?: number; toy?: number; flag?: number}> = ({size = 420, toy = 0, flag = 0}) => {
  const mix = (a: string, b: string, k: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
  };
  const body = mix('#1c1c1c', '#FF7A1A', toy);
  const grip = mix('#2a2a2a', '#2FB35A', toy);
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 420 260" style={{overflow: 'visible'}}>
      <path d="M20 60 L330 60 L330 118 L150 118 L120 240 L50 240 L78 118 L20 118 Z" fill={body} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M78 118 L150 118 L120 240 L50 240 Z" fill={grip} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M150 118 C160 160 200 160 200 118" fill="none" stroke={S} strokeWidth={SW} />
      <rect x="330" y="72" width="30" height="34" fill={mix('#1c1c1c', '#FFCC33', toy)} stroke={S} strokeWidth={SW} />
      {toy > 0.5 ? <rect x="40" y="76" width="240" height="14" rx="7" fill="#FFCC33" opacity={toy} /> : null}
      {flag > 0 ? (
        <g transform={`translate(360 90) scale(${flag})`}>
          <line x1="0" y1="0" x2="60" y2="0" stroke={S} strokeWidth="4" />
          <rect x="60" y="-40" width="150" height="80" fill="#fff" stroke={S} strokeWidth="5" />
          <text x="135" y="16" textAnchor="middle" fontFamily="Bungee" fontSize="40" fill={R.red}>BANG!</text>
        </g>
      ) : null}
    </svg>
  );
};

export const Phone: React.FC<{size?: number; ring?: number}> = ({size = 300, ring = 0}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 300 240" style={{overflow: 'visible', transform: `rotate(${Math.sin(ring * 60) * 6 * (ring > 0 ? 1 : 0)}deg)`}}>
    <path d="M40 120 L260 120 L240 230 L60 230 Z" fill={R.red} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <circle cx="150" cy="175" r="38" fill="#fff" stroke={S} strokeWidth="5" />
    {Array.from({length: 10}).map((_, i) => {
      const a = (i / 10) * Math.PI * 1.6 + 0.9;
      return <circle key={i} cx={150 + Math.cos(a) * 25} cy={175 + Math.sin(a) * 25} r="5" fill={S} />;
    })}
    <path d="M30 100 C30 40 270 40 270 100 L240 112 C240 78 60 78 60 112 Z" fill={R.red} stroke={S} strokeWidth={SW} strokeLinejoin="round" />
  </svg>
);

export const PizzaBox: React.FC<{w?: number; open?: number}> = ({w = 300, open = 0}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 300 180" style={{overflow: 'visible'}}>
    <path d="M10 90 L150 150 L290 90 L150 40 Z" fill="#D8B27A" stroke={S} strokeWidth="5" strokeLinejoin="round" />
    <path d="M10 90 L10 110 L150 170 L150 150 Z" fill="#C79A5E" stroke={S} strokeWidth="5" strokeLinejoin="round" />
    <path d="M290 90 L290 110 L150 170 L150 150 Z" fill="#B88A50" stroke={S} strokeWidth="5" strokeLinejoin="round" />
    <text x="150" y="104" textAnchor="middle" fontFamily="Bungee" fontSize="26" fill={R.red} transform="rotate(-8 150 100)">PIZZA</text>
  </svg>
);

export const Soda: React.FC<{h?: number; color?: string}> = ({h = 200, color = '#3C1E0E'}) => (
  <svg width={h * 0.4} height={h} viewBox="0 0 80 200">
    <path d="M30 0 L50 0 L50 24 C70 40 72 60 72 90 L72 190 C72 196 68 200 62 200 L18 200 C12 200 8 196 8 190 L8 90 C8 60 10 40 30 24 Z" fill={color} stroke={S} strokeWidth="5" />
    <rect x="8" y="100" width="64" height="44" fill={R.red} stroke={S} strokeWidth="4" />
    <rect x="28" y="-6" width="24" height="12" fill={R.red} stroke={S} strokeWidth="4" />
  </svg>
);

export const Cake: React.FC<{size?: number; t?: number}> = ({size = 360, t = 0}) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 360 324" style={{overflow: 'visible'}}>
    <ellipse cx="180" cy="290" rx="170" ry="26" fill="#ddd" stroke={S} strokeWidth="5" />
    <rect x="40" y="170" width="280" height="120" rx="14" fill="#F4B6C8" stroke={S} strokeWidth={SW} />
    <path d="M40 200 C80 230 110 180 150 210 C190 240 220 180 260 210 C290 232 310 196 320 200" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
    <rect x="80" y="100" width="200" height="80" rx="12" fill="#FBE3EA" stroke={S} strokeWidth={SW} />
    {[130, 180, 230].map((x, i) => (
      <g key={x}>
        <rect x={x - 7} y="50" width="14" height="52" fill={i === 1 ? R.yellow : R.blue} stroke={S} strokeWidth="4" />
        <path d={`M${x} 20 C${x + 12 + Math.sin(t * 20 + i) * 4} 36 ${x + 8} 48 ${x} 50 C${x - 8} 48 ${x - 12 + Math.sin(t * 17 + i) * 4} 36 ${x} 20 Z`} fill={R.orange} stroke={S} strokeWidth="3" />
      </g>
    ))}
  </svg>
);

/** Grilla de cajas de seguridad con puertas que se abren */
export const SafeGrid: React.FC<{cols?: number; rows?: number; opened: number; cell?: number; dark?: boolean; start?: number}> = ({cols = 10, rows = 5, opened, cell = 110, dark, start = 0}) => {
  const total = cols * rows;
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap: 8}}>
      {Array.from({length: total}).map((_, i) => {
        const k = clamp(opened - i);
        const num = String(start + i + 1).padStart(3, '0');
        const loot = rnd(i * 13) > 0.5;
        return (
          <div key={i} style={{position: 'relative', width: cell, height: cell * 0.62, background: '#1b1b1b', border: '4px solid #111', perspective: 400}}>
            <div style={{position: 'absolute', inset: 6, background: loot ? R.bill : '#E7C24A', opacity: k > 0.2 ? 1 : 0, borderRadius: 3}} />
            <div
              style={{
                position: 'absolute', inset: 0, background: dark ? 'linear-gradient(135deg,#8E959F,#5F666F)' : 'linear-gradient(135deg,#B7BDC5,#858C95)', border: '3px solid #2a2a2a',
                transformOrigin: 'left center', transform: `rotateY(${-100 * k}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px',
              }}
            >
              <span style={{fontFamily: F2.mono, fontWeight: 800, fontSize: cell * 0.16, color: '#222'}}>{num}</span>
              <span style={{width: cell * 0.12, height: cell * 0.12, borderRadius: '50%', background: '#222', display: 'inline-block'}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Camioneta tipo Kombi de perfil, con piso cortado */
export const Van: React.FC<{w?: number; hole?: boolean; wheelSpin?: number}> = ({w = 520, hole = true, wheelSpin = 0}) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 520 286" style={{overflow: 'visible'}}>
    <path d="M30 220 L30 90 C30 50 60 30 110 30 L420 30 C470 30 500 60 500 110 L500 220 Z" fill="#E9E3D2" stroke={S} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M30 150 L500 150 L500 220 L30 220 Z" fill={R.red} stroke={S} strokeWidth={SW} />
    <path d="M250 30 C290 60 290 120 250 150 C210 120 210 60 250 30 Z" fill="#fff" stroke={S} strokeWidth="4" opacity="0.9" />
    {[70, 170, 330].map((x) => <rect key={x} x={x} y="55" width="80" height="60" rx="8" fill="#9CC3E6" stroke={S} strokeWidth="4" />)}
    <path d="M430 55 L480 55 C490 75 492 95 492 115 L430 115 Z" fill="#9CC3E6" stroke={S} strokeWidth="4" />
    {hole ? <rect x="200" y="214" width="110" height="12" fill="#111" /> : null}
    {[110, 420].map((x) => (
      <g key={x} transform={`rotate(${wheelSpin} ${x} 228)`}>
        <circle cx={x} cy="228" r="40" fill="#1a1a1a" stroke={S} strokeWidth="4" />
        <circle cx={x} cy="228" r="16" fill="#bbb" />
        <rect x={x - 3} y="192" width="6" height="22" fill="#666" />
      </g>
    ))}
  </svg>
);

export const Heart: React.FC<{size?: number; crack?: number; color?: string}> = ({size = 420, crack = 0, color = R.red}) => {
  const d = 'M200 360 C60 260 10 190 10 120 C10 60 60 20 110 20 C150 20 180 44 200 76 C220 44 250 20 290 20 C340 20 390 60 390 120 C390 190 340 260 200 360 Z';
  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 400 380" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="hl"><path d="M0 0 L200 0 L200 76 L175 140 L220 200 L180 260 L200 380 L0 380 Z" /></clipPath>
        <clipPath id="hr"><path d="M200 0 L400 0 L400 380 L200 380 L180 260 L220 200 L175 140 L200 76 Z" /></clipPath>
      </defs>
      <g clipPath="url(#hl)" transform={`translate(${-crack * 40} ${crack * 20}) rotate(${-crack * 12} 200 360)`}>
        <path d={d} fill={color} stroke={S} strokeWidth="8" />
      </g>
      <g clipPath="url(#hr)" transform={`translate(${crack * 40} ${crack * 20}) rotate(${crack * 12} 200 360)`}>
        <path d={d} fill={color} stroke={S} strokeWidth="8" />
      </g>
      <path d="M90 90 C100 70 120 62 140 64" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" opacity={1 - crack} />
    </svg>
  );
};

export const Clapper: React.FC<{size?: number; clap?: number; title?: string}> = ({size = 420, clap = 0, title = 'EL ROBO DEL SIGLO'}) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 420 356" style={{overflow: 'visible'}}>
    <rect x="20" y="110" width="380" height="240" rx="8" fill="#161513" stroke={S} strokeWidth={SW} />
    <text x="40" y="180" fontFamily="Special Elite" fontSize="26" fill="#fff">PROD.</text>
    <text x="40" y="230" fontFamily="Anton" fontSize="38" fill={R.yellow}>{title}</text>
    <text x="40" y="290" fontFamily="Special Elite" fontSize="24" fill="#fff">ESCENA 1 · TOMA 1 · 2020</text>
    <g transform={`rotate(${-24 * (1 - clap)} 20 110)`}>
      <rect x="20" y="62" width="380" height="48" fill="#fff" stroke={S} strokeWidth={SW} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${40 + i * 64} 62 L${76 + i * 64} 62 L${56 + i * 64} 110 L${20 + i * 64} 110 Z`} fill="#161513" />)}
    </g>
  </svg>
);

export const Bars: React.FC<{p: number; lift?: number; color?: string}> = ({p, lift = 0, color = '#2b2b2b'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', transform: `translateY(${-lift * 110}%)`}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: `${-100 + p * 100}%`, height: '100%'}}>
      {Array.from({length: 11}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 60 + i * 180, top: 0, width: 34, height: '100%', background: `linear-gradient(90deg, #111, ${color} 40%, #666 55%, #111)`}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 34, background: 'linear-gradient(180deg,#111,#555,#111)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, height: 34, background: 'linear-gradient(180deg,#111,#555,#111)'}} />
    </div>
  </AbsoluteFill>
);

/** Letrero de show con lamparitas */
export const Marquee: React.FC<{t: number; text: string; sub?: string; w?: number; h?: number; size?: number}> = ({t, text, sub, w = 1300, h = 280, size = 92}) => {
  const W = w - 20;
  const H = h - 20;
  const bulbs = Math.round((2 * (W + H)) / 80);
  return (
    <div style={{position: 'relative', width: w, height: h, boxSizing: 'border-box', padding: '20px 60px', background: '#1a0d06', border: '10px solid #C8962E', borderRadius: 24, boxShadow: '0 0 80px rgba(255,190,60,0.35)', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      {Array.from({length: bulbs}).map((_, i) => {
        const per = 2 * (W + H);
        const d = (i / bulbs) * per;
        let x = 0, y = 0;
        if (d < W) { x = d; y = 0; } else if (d < W + H) { x = W; y = d - W; } else if (d < 2 * W + H) { x = W - (d - W - H); y = H; } else { x = 0; y = H - (d - 2 * W - H); }
        const on = (Math.floor(t * 8) + i) % 3 !== 0;
        return <div key={i} style={{position: 'absolute', left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 12, background: on ? '#FFE9A8' : '#6b4a1a', boxShadow: on ? '0 0 16px #FFD36B' : 'none'}} />;
      })}
      <div style={{fontFamily: F2.bungee, fontSize: size, color: R.yellow, textAlign: 'center', textShadow: `0 0 24px rgba(255,204,51,0.7)`, lineHeight: 1.05, whiteSpace: 'pre-line'}}>{text}</div>
      {sub ? <div style={{fontFamily: F2.type, fontSize: 34, color: '#fff', textAlign: 'center', marginTop: 12, letterSpacing: 4}}>{sub}</div> : null}
    </div>
  );
};

/** Checklist tipo planilla */
export const Check: React.FC<{t: number; t0: number; text: string; ok?: boolean; size?: number; color?: string}> = ({t, t0, text, ok = true, size = 60, color = '#111'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: t > t0 - 0.05 ? 1 : 0, transform: `translateX(${(1 - prog(t, t0, 0.35)) * -40}px)`}}>
    <div style={{width: size, height: size, border: `5px solid ${color}`, borderRadius: 8, position: 'relative', flex: 'none'}}>
      {t > t0 + 0.15 ? (
        <svg width={size * 1.25} height={size * 1.25} viewBox="0 0 100 100" style={{position: 'absolute', left: -size * 0.02, top: -size * 0.42, overflow: 'visible'}}>
          {ok ? (
            <path d="M10 56 L40 84 L96 6" fill="none" stroke={R.green} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="150" strokeDashoffset={150 * (1 - prog(t, t0 + 0.15, 0.22))} />
          ) : (
            <path d="M14 14 L86 86 M86 14 L14 86" fill="none" stroke={R.red} strokeWidth="15" strokeLinecap="round" strokeDasharray="210" strokeDashoffset={210 * (1 - prog(t, t0 + 0.15, 0.3))} />
          )}
        </svg>
      ) : null}
    </div>
    <div style={{fontFamily: F2.head, fontSize: size * 0.95, color, textTransform: 'uppercase'}}>{text}</div>
  </div>
);

/** Humo que se mueve */
export const Smoke: React.FC<{t: number; x: number; y: number; n?: number; color?: string; scale?: number}> = ({t, x, y, n = 9, color = 'rgba(210,210,200,0.55)', scale = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, filter: 'blur(18px)'}}>
    {Array.from({length: n}).map((_, i) => {
      const life = ((t * 0.35 + i / n) % 1);
      const px = Math.sin(life * 6 + i) * 60 * life * scale;
      const py = -life * 520 * scale;
      const r = (40 + life * 140) * scale;
      return <div key={i} style={{position: 'absolute', left: px - r, top: py - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: (1 - life) * 0.9}} />;
    })}
  </div>
);

/** Escena "papel rasgado": borde irregular para fotos */
export const tornClip = (seed = 1) => {
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${rnd(i + seed) * 3}%`);
  for (let i = 0; i <= n; i++) pts.push(`${100 - rnd(i + seed + 40) * 2}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - rnd(i + seed + 80) * 3}%`);
  for (let i = n; i >= 0; i--) pts.push(`${rnd(i + seed + 120) * 2}% ${(i / n) * 100}%`);
  return `polygon(${pts.join(',')})`;
};

/** Foto con tratamiento rockero: duotono + trama + borde rasgado */
export const RockPhoto: React.FC<{src: string; t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; rot?: number; credit?: string; duo?: string; zoom?: [number, number]; focus?: string; seed?: number}> = ({
  src, t, t0, t1 = Infinity, x, y, w, h, rot = 0, credit, duo, zoom = [1.04, 1.14], focus = '50% 50%', seed = 3,
}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const a = pop(t, t0, 1.1);
  const out = t1 === Infinity ? 0 : prog(t, t1 - 0.25, 0.25, easeIn);
  const span = t1 === Infinity ? 8 : t1 - t0;
  const sc = zoom[0] + (zoom[1] - zoom[0]) * clamp((t - t0) / span);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${(0.75 + 0.25 * a) * (1 - out * 0.2)})`, opacity: Math.min(clamp((t - t0) / 0.12), 1 - out), filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))'}}>
      <div style={{position: 'absolute', inset: 0, background: '#F7F1E4', clipPath: tornClip(seed)}} />
      <div style={{position: 'absolute', inset: 14, overflow: 'hidden', clipPath: tornClip(seed + 9)}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, transform: `scale(${sc})`, transformOrigin: focus, filter: duo ? 'grayscale(1) contrast(1.25)' : 'contrast(1.1) saturate(0.9)'}} />
        {duo ? <div style={{position: 'absolute', inset: 0, background: duo, mixBlendMode: 'multiply'}} /> : null}
        <Halftone opacity={0.18} id={'hp' + seed} size={10} />
      </div>
      {credit ? <div style={{position: 'absolute', right: 18, bottom: -30, fontFamily: F2.type, fontSize: 16, color: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{credit}</div> : null}
    </div>
  );
};
