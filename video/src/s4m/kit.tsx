/* Piezas del short "¿4 millones se van del conurbano?": íconos, mapa con flujos de gente, barras y subtítulos.
   Reutiliza el sistema visual oscuro de los shorts del episodio 4 (paleta N, titulares, logo). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GeoProjection} from 'd3-geo';
import {F} from '../theme';
import {clamp, easeInOut, easeOut, fmt, pop, prog, rnd} from '../lib/anim';
import {N} from '../ep04/kit';
import {ArgMap, ArgCam} from '../ep04/argmap';
import {TL, Cap} from './lib';

export const VW = 1080, VH = 1920;
export const ramp = (t: number, a: number, b: number, e = easeInOut) => e(clamp((t - a) / (b - a)));
/** 1 dentro de [a, b], con entrada y salida suaves */
export const win = (t: number, a: number, b: number, din = 0.35, dout = 0.3) => Math.min(prog(t, a, din), 1 - prog(t, b - dout, dout));

export const K = {
  energy: N.amber,
  mine: N.teal,
  amba: '#4EA8DE',
  old: '#C9A56B',
  people: '#EEF4F8',
};

/* ---------- lugares ---------- */
export const P: Record<string, [number, number]> = {
  AMBA: [-58.45, -34.62],
  Cordoba: [-64.18, -31.42],
  Neuquen: [-68.06, -38.95],
  NqRn: [-67.9, -39.6],
  Anelo: [-68.79, -38.35],
  SjCat: [-67.2, -29.6],
  SanJuan: [-68.53, -31.54],
  SaJu: [-65.45, -24.5],
  Salta: [-65.41, -24.79],
  SanLuis: [-66.34, -33.3],
};

/* ---------- textos ---------- */
export const Top: React.FC<{children: React.ReactNode; y?: number}> = ({children, y = 230}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center'}}>{children}</div>
);
export const TopShade: React.FC<{h?: number}> = ({h = 700}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: 'linear-gradient(180deg, rgba(4,10,17,0.94) 0%, rgba(4,10,17,0.7) 55%, rgba(4,10,17,0) 100%)'}} />
);
export const BottomShade: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 820, background: 'linear-gradient(0deg, rgba(4,10,17,0.92) 0%, rgba(4,10,17,0.6) 50%, rgba(4,10,17,0) 100%)'}} />
);
export const Kick: React.FC<{children: React.ReactNode; o?: number; color?: string}> = ({children, o = 1, color = N.mute}) => (
  <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, color, opacity: o, textTransform: 'uppercase'}}>{children}</div>
);
export const Big: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = N.text, size = 150, style}) => (
  <div style={{fontFamily: F.head, fontSize: size, lineHeight: 1, color, textTransform: 'uppercase', ...style}}>{children}</div>
);
export const Chip: React.FC<{t: number; t0: number; text: string; color?: string; dark?: boolean; size?: number}> = ({t, t0, text, color = N.yellow, dark = true, size = 30}) => (
  <div style={{display: 'inline-block', background: color, color: dark ? N.bg0 : '#fff', fontFamily: F.body, fontWeight: 800, fontSize: size, letterSpacing: 4, padding: '8px 20px', transform: `scale(${pop(t, t0)})`, opacity: clamp((t - t0) / 0.1)}}>
    {text}
  </div>
);
export const Src: React.FC<{text: string; o?: number; y?: number}> = ({text, o = 1, y = 1236}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: 'rgba(210,225,238,0.72)', opacity: o}}>{text}</div>
);

/* ---------- íconos ---------- */
export const PersonG: React.FC<{x: number; y: number; s?: number; color?: string; o?: number}> = ({x, y, s = 1, color = K.people, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-13} r={6.5} fill={color} />
    <path d="M-9 12 L-9 -1 Q-9 -5 -5 -5 L5 -5 Q9 -5 9 -1 L9 12 Z" fill={color} />
  </g>
);

/** cigüeña de petróleo; `t` hace cabecear el balancín */
export const Pumpjack: React.FC<{x: number; y: number; s?: number; t: number; color?: string; o?: number}> = ({x, y, s = 1, t, color = K.energy, o = 1}) => {
  const a = Math.sin(t * 2.4 + x * 0.01) * 12;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <line x1={-46} y1={0} x2={46} y2={0} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <path d="M-14 0 L0 -44 L14 0" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      <g transform={`rotate(${a} 0 -44)`}>
        <line x1={-40} y1={-44} x2={34} y2={-44} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <path d="M34 -56 Q48 -44 34 -30 Z" fill={color} />
        <rect x={-50} y={-52} width={14} height={18} rx={3} fill={color} />
      </g>
      <line x1={40} y1={-44 + Math.sin((t * 2.4 + x * 0.01)) * 9} x2={40} y2={0} stroke={color} strokeWidth={3} />
    </g>
  );
};

export const Pickaxe: React.FC<{x: number; y: number; s?: number; color?: string; o?: number; rot?: number}> = ({x, y, s = 1, color = K.mine, o = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`} opacity={o}>
    <line x1={-26} y1={26} x2={18} y2={-18} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <path d="M-20 -30 Q12 -40 34 -8 Q10 -22 -20 -30 Z" fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const Factory: React.FC<{x: number; y: number; s?: number; t: number; color?: string; o?: number}> = ({x, y, s = 1, t, color = K.old, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-50 0 L-50 -34 L-28 -48 L-28 -34 L-6 -48 L-6 -34 L16 -48 L16 -34 L28 -34 L28 -72 L42 -72 L42 0 Z" fill={color} />
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.5 + i / 3) % 1);
      return <circle key={i} cx={35 + k * 18} cy={-80 - k * 40} r={6 + k * 10} fill={color} opacity={0.5 * (1 - k)} />;
    })}
    {[-40, -18, 4].map((wx) => <rect key={wx} x={wx} y={-24} width={10} height={10} fill={N.bg0} opacity={0.7} />)}
  </g>
);

export const Building: React.FC<{x: number; y: number; s?: number; kind: 'school' | 'hospital'; color?: string; o?: number}> = ({x, y, s = 1, kind, color = N.text, o = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    {kind === 'school' ? (
      <>
        <path d="M-60 0 L-60 -60 L0 -96 L60 -60 L60 0 Z" fill={color} />
        <line x1={0} y1={-96} x2={0} y2={-136} stroke={color} strokeWidth={4} />
        <path d="M0 -136 L30 -128 L0 -120 Z" fill={N.cold} />
        <circle cx={0} cy={-64} r={10} fill={N.bg0} />
        {[-42, -18, 18, 42].map((wx) => <rect key={wx} x={wx - 7} y={-40} width={14} height={16} fill={N.bg0} />)}
        <rect x={-10} y={-24} width={20} height={24} fill={N.bg0} />
      </>
    ) : (
      <>
        <rect x={-60} y={-100} width={120} height={100} rx={4} fill={color} />
        <rect x={-14} y={-88} width={28} height={64} fill={N.red} />
        <rect x={-32} y={-70} width={64} height={28} fill={N.red} />
        <rect x={-12} y={-18} width={24} height={18} fill={N.bg0} />
      </>
    )}
  </g>
);

/* ---------- gente ---------- */
/** grilla de personitas que se llena de a una (`p` 0→1) */
export const PeopleGrid: React.FC<{x: number; y: number; cols: number; rows: number; gap: number; p: number; color?: string; s?: number; t: number; hi?: number; hiColor?: string}> = ({
  x, y, cols, rows, gap, p, color = K.people, s = 1, t, hi = -1, hiColor = N.yellow,
}) => {
  const n = cols * rows;
  const shown = p * n;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const k = clamp(shown - i);
        if (k <= 0) return null;
        const j = Math.sin(t * 3 + i) * 0.6;
        return <PersonG key={i} x={x + c * gap} y={y + r * gap + j} s={s * (0.6 + 0.4 * easeOut(k))} o={k} color={i < hi ? hiColor : color} />;
      })}
    </g>
  );
};

/* ---------- mapa con flujos ---------- */
const quad = (a: [number, number], b: [number, number], bend: number): [number, number] => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return [mx - dy * bend, my + dx * bend];
};
const qp = (a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0],
  (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1],
];

/** flecha curva de A a B que se dibuja con `p`, con personitas que viajan por ella */
export const Flow: React.FC<{proj: GeoProjection; from: [number, number]; to: [number, number]; p: number; t: number; color: string; bend?: number; dots?: number; width?: number; o?: number; speed?: number}> = ({
  proj, from, to, p, t, color, bend = 0.25, dots = 6, width = 9, o = 1, speed = 0.45,
}) => {
  if (p <= 0) return null;
  const a = proj(from)! as [number, number], b = proj(to)! as [number, number];
  const c = quad(a, b, bend);
  const N_ = 40, pts: string[] = [];
  for (let i = 0; i <= N_ * p; i++) {
    const [x, y] = qp(a, c, b, i / N_);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const [hx, hy] = qp(a, c, b, p);
  const [px, py] = qp(a, c, b, Math.max(0, p - 0.02));
  const ang = (Math.atan2(hy - py, hx - px) * 180) / Math.PI;
  return (
    <g opacity={o}>
      <polyline points={pts.join(' ')} fill="none" stroke={N.bg0} strokeWidth={width + 8} strokeLinecap="round" opacity={0.55} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      <g transform={`translate(${hx},${hy}) rotate(${ang})`}>
        <path d={`M ${width * 2.4} 0 L ${-width * 1.2} ${-width * 2} L ${-width * 1.2} ${width * 2} Z`} fill={color} />
      </g>
      {p >= 1
        ? Array.from({length: dots}).map((_, i) => {
            const u = (t * speed + i / dots) % 1;
            const [x, y] = qp(a, c, b, u);
            return <circle key={i} cx={x} cy={y} r={width * 0.55} fill="#fff" opacity={Math.sin(Math.PI * u)} />;
          })
        : null}
    </g>
  );
};

/** punto con pulso y etiqueta */
export const Pin: React.FC<{proj: GeoProjection; at: [number, number]; t: number; t0: number; color?: string; label?: string; sub?: string; dx?: number; dy?: number; r?: number; size?: number; align?: 'left' | 'right' | 'middle'}> = ({
  proj, at, t, t0, color = N.yellow, label, sub, dx = 26, dy = 10, r = 13, size = 40, align = 'left',
}) => {
  if (t < t0 - 0.05) return null;
  const [x, y] = proj(at)!;
  const k = pop(t, t0);
  const pulse = ((t - t0) % 1.5) / 1.5;
  const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
  return (
    <g>
      <circle cx={x} cy={y} r={r + pulse * 40} fill="none" stroke={color} strokeWidth={4} opacity={(1 - pulse) * 0.9} />
      <circle cx={x} cy={y} r={r * k} fill={color} stroke={N.bg0} strokeWidth={4} />
      {label ? (
        <text x={x + dx} y={y + dy} textAnchor={anchor} fill="#fff" fontFamily="Anton" fontSize={size} letterSpacing={1} opacity={prog(t, t0 + 0.1, 0.3)} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={8}>
          {label}
        </text>
      ) : null}
      {sub ? (
        <text x={x + dx} y={y + dy + size * 0.72} textAnchor={anchor} fill={color} fontFamily="Inter" fontWeight={800} fontSize={size * 0.52} letterSpacing={2} opacity={prog(t, t0 + 0.2, 0.3)} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.9)" strokeWidth={7}>
          {sub}
        </text>
      ) : null}
    </g>
  );
};

/** etiqueta grande sobre el mapa (p. ej. "2 M") */
export const MapTag: React.FC<{proj: GeoProjection; at: [number, number]; t: number; t0: number; text: string; color: string; dx?: number; dy?: number; size?: number}> = ({proj, at, t, t0, text, color, dx = 0, dy = 0, size = 92}) => {
  if (t < t0 - 0.05) return null;
  const [x, y] = proj(at)!;
  const k = pop(t, t0);
  return (
    <g transform={`translate(${x + dx},${y + dy}) scale(${k})`}>
      <text x={0} y={0} textAnchor="middle" fill={color} fontFamily="Anton" fontSize={size} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.92)" strokeWidth={14}>
        {text}
      </text>
    </g>
  );
};

/** cámara del mapa vertical: la Argentina entera (z=1) o acercada sobre un punto */
export const mapCam = (z: number, focus: [number, number], at: [number, number] = [560, 900]): ArgCam => ({box: [40, 60, 1040, 1860], z, focus, at});
export const lerpArr = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

export {ArgMap};

/* ---------- barras ---------- */
export const HBar: React.FC<{t: number; t0: number; label: string; value: number; max: number; text: string; color: string; w?: number; sub?: string}> = ({t, t0, label, value, max, text, color, w = 620, sub}) => {
  const a = prog(t, t0 - 0.1, 0.3);
  const g = prog(t, t0, 0.9);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: a, transform: `translateX(${(1 - a) * -40}px)`, marginBottom: 40}}>
      <div style={{width: 250, textAlign: 'right'}}>
        <div style={{fontFamily: F.head, fontSize: 48, color: N.text, textTransform: 'uppercase', lineHeight: 1}}>{label}</div>
        {sub ? <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 20, color: N.mute, letterSpacing: 2, marginTop: 4}}>{sub}</div> : null}
      </div>
      <div style={{position: 'relative', width: w, height: 74}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: w, background: 'rgba(255,255,255,0.06)'}} />
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: (w * value * g) / max, background: color, boxShadow: `0 0 30px ${color}55`}} />
        <div style={{position: 'absolute', left: (w * value * g) / max + 16, top: 4, fontFamily: F.head, fontSize: 60, color, lineHeight: 1, whiteSpace: 'nowrap'}}>{text}</div>
      </div>
    </div>
  );
};

/* ---------- transición vertical entre segmentos ---------- */
export const VWipe: React.FC<{t: number; at: number; color?: string}> = ({t, at, color = N.yellow}) => {
  const d = 0.5;
  const k = (t - (at - d / 2)) / d;
  if (k <= 0 || k >= 1) return null;
  const y1 = VH - easeInOut(clamp(k / 0.55)) * (VH + 200);
  const y2 = VH + 200 - easeInOut(clamp((k - 0.45) / 0.55)) * (VH + 400);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: Math.max(-200, y1), bottom: Math.max(0, VH - y2), background: color}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: Math.max(-200, y1 + 60), bottom: Math.max(0, VH - y2 + 60), background: N.bg1}} />
    </AbsoluteFill>
  );
};

/* ---------- subtítulos palabra por palabra ---------- */
const chunks = (() => {
  const out: {words: Cap[]; s: number; e: number}[] = [];
  let cur: Cap[] = [];
  TL.caps.forEach((w, i) => {
    cur.push(w);
    const txt = cur.map((x) => x.w).join(' ');
    const next = TL.caps[i + 1];
    if (cur.length >= 3 || /[.,:?!»]$/.test(w.w) || txt.length > 14 || !next || next.who !== w.who) {
      out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
      cur = [];
    }
  });
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.e + 0.35) : c.e + 0.3));
  return out;
})();

export const Captions: React.FC<{T: number; y?: number}> = ({T, y = 1330}) => {
  const c = chunks.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!c || T > TL.endCard - 0.1) return null;
  const k = pop(T, c.s - 0.05, 1.4);
  const stroke = '#05090E';
  const fs = c.words[0].who === 'fs';
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: y, textAlign: 'center', transform: `scale(${0.86 + 0.14 * k})`}}>
      {c.words.map((w, i) => {
        const on = T >= w.s - 0.03 && T < w.e + 0.15;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', margin: '0 12px', fontFamily: F.head, fontSize: 96, lineHeight: 1.15, textTransform: 'uppercase',
              color: on ? (fs ? '#7FD3FF' : N.yellow) : '#fff',
              textShadow: `6px 6px 0 ${stroke}, -6px -6px 0 ${stroke}, 6px -6px 0 ${stroke}, -6px 6px 0 ${stroke}, 0 6px 0 ${stroke}, 6px 0 0 ${stroke}, -6px 0 0 ${stroke}, 0 -6px 0 ${stroke}, 0 16px 30px rgba(0,0,0,0.6)`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

export {fmt, rnd};
