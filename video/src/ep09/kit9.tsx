/* Sistema visual del episodio 9 (Vaca Muerta): negro petróleo con brillo ámbar, transición de crudo que sube,
   sellos de "TRAMPA", display de surtidor, rankings y comparadores. Reusa la tipografía y el archivo del Ep. 8. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from '../theme';
import {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
export {Big, Chip, Count, Credit, FullPhoto, FullVideo, Panel, PersonIcon, SrcLine, Vig} from '../ep06/kit6';
export {clamp, easeIn, easeInOut, easeOut, fmt, pop, prog, rnd};

export const K = {
  bg0: '#06080B',
  bg1: '#0C1116',
  bg2: '#141B22',
  cream: '#F2EEE6',
  mute: '#93A0AB',
  line: 'rgba(242,238,230,0.16)',
  oil: '#F2A93B', // Vaca Muerta / petróleo
  flame: '#FF7A1A',
  red: '#E5383B', // trampas
  yellow: '#FFCC33',
  celeste: '#74ACDF', // Argentina
  sau: '#3DAA6D', // Arabia Saudita
  ven: '#F4C430', // Venezuela
  nor: '#4EA8DE', // Noruega
  water: '#5FC6E8',
};

export const between = (t: number, a: number, b: number) => t >= a && t < b;
export const fadeIO = (t: number, a: number, b: number, d = 0.35) => Math.min(prog(t, a, d), 1 - prog(t, b - d, d, easeIn));

/* ---------- Fondo: negro petróleo con reflejo ámbar que se mueve ---------- */
export const OilBg: React.FC<{t: number; glow?: string; x?: number; y?: number; k?: number}> = ({t, glow = 'rgba(242,169,59,0.16)', x = 50, y = 60, k = 1}) => (
  <AbsoluteFill style={{background: K.bg0}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at ${x + Math.sin(t * 0.15) * 4}% ${y}%, ${glow} 0%, rgba(12,17,22,${0.75 * k}) 50%, ${K.bg0} 100%)`}} />
    <AbsoluteFill
      style={{
        opacity: 0.35,
        background: `linear-gradient(${100 + Math.sin(t * 0.2) * 8}deg, rgba(0,0,0,0) 30%, rgba(255,214,150,0.05) ${45 + Math.sin(t * 0.3) * 6}%, rgba(0,0,0,0) 60%)`,
      }}
    />
  </AbsoluteFill>
);

/** polvo / partículas en suspensión (desierto, luz de equipo) */
export const Dust: React.FC<{t: number; n?: number; o?: number; color?: string}> = ({t, n = 40, o = 1, color = '#FFD9A0'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    <svg width={1920} height={1080}>
      {Array.from({length: n}, (_, i) => {
        const sp = 0.02 + rnd(i) * 0.05;
        const x = ((rnd(i + 3) + t * sp) % 1) * 1920;
        const y = rnd(i + 7) * 1080 + Math.sin(t * 0.7 + i) * 20;
        const r = 1 + rnd(i + 11) * 2.4;
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={(0.15 + rnd(i + 5) * 0.4) * o} />;
      })}
    </svg>
  </AbsoluteFill>
);

/* ---------- Transición: crudo que sube y vuelve a bajar, con borde ondulado y reflejo ámbar ---------- */
export const OilWipe: React.FC<{t: number; at: number; dur?: number; dir?: 1 | -1}> = ({t, at, dur = 0.9, dir = 1}) => {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return null;
  // 0→0.5 sube y tapa; 0.5→1 sigue subiendo y destapa por abajo
  const e = easeInOut(k);
  const top = 1180 - e * 2560; // borde superior del crudo
  const bot = top + 1300;
  const wave = (y0: number, ph: number, amp: number) => {
    let d = `M -20 ${y0}`;
    for (let x = 0; x <= 1960; x += 40) d += ` L ${x} ${y0 + Math.sin(x * 0.006 + ph + t * 7) * amp + Math.sin(x * 0.017 + ph * 2) * amp * 0.4}`;
    return d;
  };
  const body = `${wave(top, 0, 26)} L 1960 ${bot} L -20 ${bot} Z`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: dir < 0 ? 'scaleX(-1)' : undefined}}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="oilG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1A120A" />
            <stop offset="0.08" stopColor="#050403" />
            <stop offset="1" stopColor="#020202" />
          </linearGradient>
        </defs>
        <path d={body} fill="url(#oilG)" />
        <path d={wave(top, 0, 26)} stroke="#FFC266" strokeWidth={5} fill="none" opacity={0.95} />
        <path d={wave(top + 14, 1.2, 22)} stroke="#FF7A1A" strokeWidth={2} fill="none" opacity={0.5} />
        <path d={wave(bot, 2.5, 30)} stroke="#FFC266" strokeWidth={3} fill="none" opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Sello: TRAMPA 1 / 2 / 3 ---------- */
export const TrapTag: React.FC<{t: number; t0: number; t1?: number; n: number; sub: string; x?: number; y?: number; big?: boolean}> = ({t, t0, t1 = Infinity, n, sub, x = 96, y = 86, big}) => {
  if (t < t0) return null;
  const s = big ? 1.9 : 1;
  const a = prog(t, t0, 0.45);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  const stamp = pop(t, t0, 1.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o * a, transform: `scale(${s * (0.6 + 0.4 * stamp)}) rotate(${-3 * (1 - a)}deg)`, transformOrigin: big ? 'center' : 'left top'}}>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{background: K.red, color: '#fff', fontFamily: F.head, fontSize: 44, padding: '6px 20px 2px', letterSpacing: 2, lineHeight: 1.05}}>TRAMPA {n}</div>
        <div style={{background: 'rgba(6,8,11,0.8)', border: `2px solid ${K.red}`, borderLeft: 'none', color: K.cream, fontFamily: F.head, fontSize: 44, padding: '6px 20px 2px', lineHeight: 1.05, letterSpacing: 1, clipPath: `inset(0 ${100 - prog(t, t0 + 0.15, 0.5) * 100}% 0 0)`}}>
          {sub}
        </div>
      </div>
    </div>
  );
};

/* ---------- rótulo de capítulo genérico ---------- */
export const Tag: React.FC<{t: number; t0: number; t1?: number; a: string; b: string; color?: string; x?: number; y?: number}> = ({t, t0, t1 = Infinity, a, b, color = K.oil, x = 96, y = 86}) => {
  if (t < t0) return null;
  const k = prog(t, t0, 0.5);
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, display: 'flex', alignItems: 'stretch', transform: `translateX(${(1 - k) * -40}px)`}}>
      <div style={{background: color, color: K.bg0, fontFamily: F.head, fontSize: 38, padding: '6px 16px 2px', lineHeight: 1.05, clipPath: `inset(0 ${100 - k * 100}% 0 0)`}}>{a}</div>
      <div style={{background: 'rgba(6,8,11,0.75)', border: `2px solid ${color}`, borderLeft: 'none', color: K.cream, fontFamily: F.head, fontSize: 38, padding: '6px 18px 2px', lineHeight: 1.05, letterSpacing: 1, clipPath: `inset(0 ${100 - prog(t, t0 + 0.12, 0.5) * 100}% 0 0)`}}>
        {b}
      </div>
    </div>
  );
};

/* ---------- Display de surtidor (dígitos de 7 segmentos) ---------- */
export const PumpDisplay: React.FC<{value: number; label?: string; sub?: string; color?: string; x: number; y: number; w?: number; o?: number; flash?: number}> = ({value, label = 'NAFTA SÚPER', sub = 'PRECIO POR LITRO', color = '#FF5A36', x, y, w = 760, o = 1, flash = 0}) => {
  const txt = '$ ' + fmt(value);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: 'translate(-50%,-50%)', opacity: o}}>
      <div style={{background: 'linear-gradient(180deg,#2A2F35,#16191D)', borderRadius: 26, padding: '26px 30px 30px', border: '3px solid #3B424A', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.08)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: '#C9D1D8', marginBottom: 14}}>
          <span>{label}</span>
          <span style={{color: '#7F8A94'}}>{sub}</span>
        </div>
        <div
          style={{
            background: '#0B0D0C', borderRadius: 12, padding: '18px 28px 8px', textAlign: 'right', fontFamily: '"DSEG7", "Share Tech Mono", monospace', fontSize: 150, lineHeight: 1,
            color, textShadow: `0 0 ${18 + flash * 30}px ${color}`, border: '2px solid #050605', fontVariantNumeric: 'tabular-nums', letterSpacing: 4,
          }}
        >
          <span style={{fontFamily: F.head}}>{txt}</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Barril (pictograma) ---------- */
export const BarrelIcon: React.FC<{size?: number; color?: string; fill?: number; empty?: string}> = ({size = 60, color = K.oil, fill = 1, empty = 'rgba(255,255,255,0.12)'}) => (
  <svg width={size * 0.72} height={size} viewBox="0 0 72 100">
    <defs>
      <clipPath id={`bc${Math.round(fill * 100)}${color.replace('#', '')}`}>
        <rect x={0} y={100 - fill * 100} width={72} height={fill * 100} />
      </clipPath>
    </defs>
    <path d="M8 6 Q36 0 64 6 Q72 50 64 94 Q36 100 8 94 Q0 50 8 6 Z" fill={empty} />
    <path d="M8 6 Q36 0 64 6 Q72 50 64 94 Q36 100 8 94 Q0 50 8 6 Z" fill={color} clipPath={`url(#bc${Math.round(fill * 100)}${color.replace('#', '')})`} />
    <path d="M3 34 Q36 40 69 34 M3 66 Q36 72 69 66" stroke="rgba(0,0,0,0.35)" strokeWidth={4} fill="none" />
  </svg>
);

export const FactoryIcon: React.FC<{size?: number; color?: string; smoke?: number; t?: number; lights?: number}> = ({size = 200, color = '#C9D1D8', smoke = 1, t = 0, lights = 1}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 200 160">
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={42 + Math.sin(t * 1.3 + i) * 4 + i * 8} cy={30 - ((t * 18 + i * 14) % 40)} r={8 + i * 3} fill="#9AA4AD" opacity={smoke * (0.5 - i * 0.12)} />
    ))}
    <rect x={30} y={30} width={22} height={70} fill={color} />
    <path d="M10 160 L10 80 L60 105 L60 80 L110 105 L110 80 L160 105 L160 70 L190 70 L190 160 Z" fill={color} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={24 + i * 40} y={120} width={22} height={18} fill="#FFCC55" opacity={clamp(lights * 4 - i)} />
    ))}
  </svg>
);

/* ---------- Ranking animado ---------- */
export type RankRow = {name: string; hl?: boolean; color?: string};
export const Ranking: React.FC<{t: number; t0: number; title: string; rows: RankRow[]; x: number; y: number; w?: number; hlAt?: number; sub?: string}> = ({t, t0, title, rows, x, y, w = 640, hlAt = t0 + 0.8, sub}) => {
  if (t < t0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, opacity: prog(t, t0, 0.4)}}>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: K.mute, marginBottom: 6}}>{title}</div>
      {sub ? <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 20, color: 'rgba(147,160,171,0.8)', marginBottom: 14}}>{sub}</div> : null}
      {rows.map((r, i) => {
        const a = prog(t, t0 + 0.12 + i * 0.1, 0.45);
        const h = r.hl ? prog(t, hlAt, 0.5) : 0;
        const c = r.color ?? K.oil;
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 22, height: 74, marginBottom: 8, padding: '0 22px', borderRadius: 10,
              background: h ? `rgba(242,169,59,${0.16 + 0.1 * h})` : 'rgba(255,255,255,0.05)', border: `2px solid ${h ? c : 'rgba(255,255,255,0.08)'}`,
              transform: `translateX(${(1 - a) * -50}px) scale(${1 + 0.04 * h})`, opacity: a * (r.hl ? 1 : 1 - 0.45 * prog(t, hlAt, 0.5)), transformOrigin: 'left center',
            }}
          >
            <div style={{fontFamily: F.head, fontSize: 48, color: h ? c : K.mute, width: 54}}>{i + 1}</div>
            <div style={{fontFamily: F.head, fontSize: 46, color: K.cream, letterSpacing: 1}}>{r.name}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Comparador en pantalla partida ---------- */
export const SplitVs: React.FC<{
  t: number; t0: number; left: {src: string; name: string; color: string; credit?: string}; right: {src: string; name: string; color: string; credit?: string}; tR?: number; mid?: string; o?: number;
}> = ({t, t0, left, right, tR = t0 + 0.8, mid = '¿?', o = 1}) => {
  if (t < t0) return null;
  const a = prog(t, t0, 0.7);
  const b = prog(t, tR, 0.7);
  const side = (s: typeof left, k: number, isL: boolean) => (
    <div
      style={{
        position: 'absolute', top: 0, bottom: 0, left: isL ? 0 : undefined, right: isL ? undefined : 0, width: 1000, overflow: 'hidden',
        clipPath: isL ? `polygon(0 0, ${100 * k}% 0, ${100 * k - 8}% 100%, 0 100%)` : `polygon(${100 - 100 * k + 8}% 0, 100% 0, 100% 100%, ${100 - 100 * k}% 100%)`,
      }}
    >
      <Img src={staticFile(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - 0.06 * clamp((t - t0) / 6)})`, filter: 'contrast(1.05) saturate(0.9)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)'}} />
      <div style={{position: 'absolute', bottom: 120, [isL ? 'left' : 'right']: isL ? 90 : 90, fontFamily: F.head, fontSize: 104, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,0.7)', opacity: k, lineHeight: 1}}>
        {s.name}
        <div style={{height: 10, width: 220 * k, background: s.color, marginTop: 14, marginLeft: isL ? 0 : 'auto'}} />
      </div>
      {s.credit ? <div style={{position: 'absolute', bottom: 30, [isL ? 'left' : 'right']: 40, fontFamily: F.mono, fontSize: 15, color: 'rgba(242,238,230,0.6)'}}>{s.credit}</div> : null}
    </div>
  );
  return (
    <AbsoluteFill style={{background: K.bg0, opacity: o}}>
      {side(left, a, true)}
      {side(right, b, false)}
      <div style={{position: 'absolute', left: 960, top: 520, transform: `translate(-50%,-50%) scale(${pop(t, tR + 0.3)})`, width: 170, height: 170, borderRadius: 85, background: K.bg0, border: `5px solid ${K.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: 84, color: K.cream}}>
        {mid}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Ventana de archivo (foto o video) con marco y epígrafe ---------- */
export const Framed: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; w: number; h: number; caption?: string; credit?: string; children: React.ReactNode; rot?: number}> = ({
  t, t0, t1 = Infinity, x, y, w, h, caption, credit, children, rot = 0,
}) => {
  if (t < t0) return null;
  const a = pop(t, t0, 0.9);
  const o = Math.min(prog(t, t0, 0.3), t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * a}) rotate(${rot}deg)`, opacity: o}}>
      <div style={{width: w, height: h, overflow: 'hidden', borderRadius: 6, border: '10px solid #F2EEE6', boxShadow: '0 40px 80px rgba(0,0,0,0.65)', background: '#000', position: 'relative'}}>{children}</div>
      {caption ? <div style={{marginTop: 16, fontFamily: F.head, fontSize: 36, color: K.cream, letterSpacing: 1}}>{caption}</div> : null}
      {credit ? <div style={{marginTop: 4, fontFamily: F.mono, fontSize: 15, color: 'rgba(242,238,230,0.6)'}}>{credit}</div> : null}
    </div>
  );
};

/* ---------- Regla de profundidad ---------- */
export const DepthGauge: React.FC<{x: number; y0: number; y1: number; km: number; o?: number; label?: string; color?: string}> = ({x, y0, y1, km, o = 1, label = 'PROFUNDIDAD', color = K.oil}) => {
  const ticks = [0, 1, 2, 3];
  const H = y1 - y0;
  const cur = y0 + (H * clamp(km)) / 3;
  return (
    <div style={{position: 'absolute', left: x, top: y0, opacity: o}}>
      <div style={{position: 'absolute', left: 0, top: -50, fontFamily: F.body, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: K.mute, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 4, height: H, background: 'rgba(242,238,230,0.25)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 4, height: cur - y0, background: color, boxShadow: `0 0 16px ${color}`}} />
      {ticks.map((k) => (
        <div key={k} style={{position: 'absolute', left: -10, top: (H * k) / 3 - 1, width: 24, height: 3, background: 'rgba(242,238,230,0.6)'}}>
          <div style={{position: 'absolute', left: 34, top: -16, fontFamily: F.head, fontSize: 30, color: K.cream, whiteSpace: 'nowrap'}}>{k === 0 ? '0' : `${k} KM`}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: -12, top: cur - y0 - 14, width: 28, height: 28, borderRadius: 14, background: color, boxShadow: `0 0 20px ${color}`}} />
    </div>
  );
};

/* ---------- contador de años hacia atrás ---------- */
export const YearsBack: React.FC<{t: number; t0: number; to: number; x?: number; y?: number; dur?: number; o?: number; label?: string}> = ({t, t0, to, x = 960, y = 540, dur = 2.4, o = 1, label = 'AÑOS ATRÁS'}) => {
  if (t < t0) return null;
  const k = easeInOut(clamp((t - t0) / dur));
  const v = Math.round(to * k);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: o * prog(t, t0, 0.3)}}>
      <div style={{fontFamily: F.head, fontSize: 150, color: K.cream, lineHeight: 0.95, fontVariantNumeric: 'tabular-nums', textShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>−{fmt(v)}</div>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: K.oil, marginTop: 8}}>{label}</div>
    </div>
  );
};

/** etiqueta flotante anclada a un punto (de un objeto 3D proyectado) */
export const Pin: React.FC<{x: number; y: number; text: string; sub?: string; color?: string; o?: number; side?: 'up' | 'down'; size?: number}> = ({x, y, text, sub, color = K.oil, o = 1, side = 'up', size = 34}) =>
  o <= 0.01 ? null : (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, ${side === 'up' ? '-100%' : '0'})`, opacity: o, textAlign: 'center', pointerEvents: 'none'}}>
      {side === 'down' ? <div style={{width: 3, height: 34, background: color, margin: '0 auto'}} /> : null}
      <div style={{background: 'rgba(6,8,11,0.82)', border: `2px solid ${color}`, borderRadius: 8, padding: '6px 14px 2px', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: F.head, fontSize: size, color: K.cream, lineHeight: 1.05, letterSpacing: 1}}>{text}</div>
        {sub ? <div style={{fontFamily: F.body, fontWeight: 700, fontSize: size * 0.5, color: K.mute, letterSpacing: 2, paddingBottom: 4}}>{sub}</div> : null}
      </div>
      {side === 'up' ? <div style={{width: 3, height: 34, background: color, margin: '0 auto'}} /> : null}
    </div>
  );

/** gran número con unidad, alineado a la izquierda */
export const Stat: React.FC<{t: number; t0: number; t1?: number; value: React.ReactNode; label: string; sub?: string; x?: number; y?: number; color?: string; size?: number}> = ({
  t, t0, t1 = Infinity, value, label, sub, x = 110, y = 330, color = K.oil, size = 200,
}) => {
  if (t < t0) return null;
  const o = t1 === Infinity ? 1 : 1 - prog(t, t1 - 0.3, 0.3);
  const a = prog(t, t0, 0.5);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o * a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <div style={{fontFamily: F.head, fontSize: size, lineHeight: 0.92, color, textShadow: '0 10px 40px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{value}</div>
      <div style={{fontFamily: F.head, fontSize: size * 0.3, color: K.cream, marginTop: 10, opacity: prog(t, t0 + 0.2, 0.4), whiteSpace: 'nowrap'}}>{label}</div>
      {sub ? <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: K.mute, marginTop: 10, opacity: prog(t, t0 + 0.35, 0.4)}}>{sub}</div> : null}
    </div>
  );
};
