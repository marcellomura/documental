/* Ilustraciones 2D del episodio 14: el monte chaqueño en capas de siluetas con paralaje (quebrachos y algarrobos de
   copa ancha y chata), con cuatro climas de luz; y piezas dibujadas para las escenas (grúa y patrullero de 1990,
   pistola de chispa, cincel, volcán, corte del suelo). */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, rnd} from '../lib/anim';
import {K, NightSky} from './kit14';

export type Mood = 'dusk' | 'night' | 'golden' | 'day';
export const MOODS: Record<Mood, {sky: [string, string, string]; layers: [string, string, string, string]; ground: [string, string]; stars: number; glow: string}> = {
  dusk: {sky: ['#0A1130', '#3B3360', '#D27B4C'], layers: ['#4A3E5E', '#2E2741', '#1A1626', '#0A0910'], ground: ['#1C1720', '#0B0A0E'], stars: 0.55, glow: 'rgba(255,150,90,0.55)'},
  night: {sky: ['#02040C', '#0A1430', '#22305A'], layers: ['#1C2640', '#141C30', '#0C1222', '#05080F'], ground: ['#0B1020', '#04060B'], stars: 1, glow: 'rgba(120,150,230,0.25)'},
  golden: {sky: ['#36507E', '#E3A46C', '#F7D394'], layers: ['#A88870', '#735A47', '#46382C', '#1E1813'], ground: ['#5A4634', '#2A2018'], stars: 0, glow: 'rgba(255,214,150,0.7)'},
  day: {sky: ['#5E93D6', '#A9CBEB', '#E2EEF4'], layers: ['#90A08C', '#6B7C5D', '#4A5A3E', '#2B3523'], ground: ['#7A6A4E', '#4E4232'], stars: 0, glow: 'rgba(255,255,255,0.3)'},
};

type Tree = {x: number; h: number; w: number; th: number; lean: number; lobes: {dx: number; dy: number; r: number}[]; branches: [number, number][]};
const LAYERS: Tree[][] = [0, 1, 2, 3].map((L) => {
  const n = [52, 36, 20, 4][L];
  const span = 1920 * [1.5, 1.7, 2.0, 2.4][L];
  return Array.from({length: n}, (_, i) => {
    const seed = L * 1000 + i * 7;
    const scale = [0.42, 0.62, 0.95, 1.9][L] * (0.75 + rnd(seed + 1) * 0.5);
    const w = (170 + rnd(seed + 2) * 150) * scale;
    const h = (150 + rnd(seed + 3) * 110) * scale;
    const th = h * (0.42 + rnd(seed + 8) * 0.18);
    const nl = 10 + Math.floor(rnd(seed + 4) * 6);
    const crownH = h - th;
    // la capa cercana: solo árboles en los bordes del cuadro, enmarcando
    const x = L === 3 ? [-1220, -980, 980, 1260][i] + (rnd(seed + 5) - 0.5) * 120 : (i + rnd(seed + 5) * 0.8) * (span / n) - span / 2;
    return {
      x, h, w, th, lean: (rnd(seed + 6) - 0.5) * 0.22,
      lobes: Array.from({length: nl}, (_, k) => {
        const a = rnd(seed + 10 + k) * Math.PI * 2, rr = Math.sqrt(rnd(seed + 20 + k));
        return {dx: Math.cos(a) * rr * w * 0.46, dy: -crownH * 0.45 + Math.sin(a) * rr * crownH * 0.42 - (1 - rr) * crownH * 0.12, r: w * (0.1 + rnd(seed + 30 + k) * 0.13)};
      }),
      branches: Array.from({length: 3}, (_, k) => [(rnd(seed + 50 + k) - 0.5) * w * 0.7, -crownH * (0.25 + rnd(seed + 60 + k) * 0.35)] as [number, number]),
    };
  });
});

/** contorno ondulado de arbustos bajos a lo largo de una línea de árboles (base en y = 0) */
// la capa cercana tiene solo cuatro árboles: sus arbustos se estiran hasta ±2600 px para que el borde no aparezca en los
// giros grandes de cámara
const bushX = (L: number, trees: Tree[]) => [Math.min(Math.min(...trees.map((t) => t.x)) - 400, L === 3 ? -2600 : 0), Math.max(Math.max(...trees.map((t) => t.x)) + 400, L === 3 ? 2600 : 0)];
const bushLine = (L: number, trees: Tree[]) => {
  const [x0, x1] = bushX(L, trees);
  const amp = [10, 16, 26, 40][L];
  let d = `M${x0} 400 L${x0} 0`;
  for (let x = x0; x <= x1; x += 24) d += ` L${x} ${-amp * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.013 + L) * Math.sin(x * 0.031 + L * 2)))}`;
  return d + ` L${x1} 400 Z`;
};
/** caja de cada capa (coordenadas locales: x relativa al centro, y relativa a la base), con margen para el filtro */
export const LAYER_BOX = LAYERS.map((trees, L) => {
  let [x0, x1] = bushX(L, trees), y0 = -[10, 16, 26, 40][L];
  for (const tr of trees) {
    const tx = tr.x + tr.lean * tr.th, top = -tr.th;
    for (const lb of tr.lobes) {
      x0 = Math.min(x0, tx + lb.dx - lb.r);
      x1 = Math.max(x1, tx + lb.dx + lb.r);
      y0 = Math.min(y0, top + lb.dy - lb.r);
    }
    for (const [bx, by] of tr.branches) y0 = Math.min(y0, top + by - 4);
    y0 = Math.min(y0, top);
  }
  const m = 50;
  return {x0: Math.floor(x0 - m), y0: Math.floor(y0 - m), w: Math.ceil(x1 - x0 + 2 * m), h: Math.ceil(400 - y0 + 2 * m)};
});
/** una línea de árboles como dibujo fijo, con el filtro de follaje (ruido + desplazamiento). Ese filtro es carísimo con
    WebGL por software (varios segundos por cuadro), así que no se dibuja en el render: se hornea una vez a PNG
    (bake_monte14.mjs → public/ep14/monte/) y el monte usa las imágenes */
export const LayerArt = React.memo<{L: number; color: string}>(({L, color}) => {
  const trees = LAYERS[L], B = LAYER_BOX[L];
  return (
    <svg width={B.w} height={B.h} viewBox={`${B.x0} ${B.y0} ${B.w} ${B.h}`} style={{position: 'absolute', left: B.x0, top: B.y0}}>
      <defs>
        <filter id={`leaf14_${L}`} filterUnits="userSpaceOnUse" x={B.x0} y={B.y0} width={B.w} height={B.h}>
          <feTurbulence type="fractalNoise" baseFrequency={[0.09, 0.06, 0.04, 0.025][L]} numOctaves={3} seed={L * 7 + 3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={[5, 9, 16, 30][L]} xChannelSelector="R" yChannelSelector="G" result="d" />
          {L === 0 ? <feGaussianBlur in="d" stdDeviation="1" /> : null}
        </filter>
      </defs>
      <g fill={color} filter={`url(#leaf14_${L})`}>
        {/* masa de arbustos al pie */}
        <path d={bushLine(L, trees)} />
        {trees.map((tr, i) => {
          const top = -tr.th;
          const tx = tr.x + tr.lean * tr.th;
          const tw = tr.w * 0.035;
          return (
            <g key={i}>
              <path d={`M${tr.x - tw} 0 Q${tr.x + tr.lean * tr.th * 0.4} ${-tr.th * 0.5} ${tx - tw * 0.6} ${top} L${tx + tw * 0.6} ${top} Q${tr.x + tr.lean * tr.th * 0.4 + tw} ${-tr.th * 0.5} ${tr.x + tw} 0 Z`} />
              {tr.branches.map(([bx, by], k) => (
                <path key={k} d={`M${tx - tw * 0.5} ${top + 4} Q${tx + bx * 0.4} ${top + by * 0.3} ${tx + bx} ${top + by} L${tx + bx + 3} ${top + by + 2} Q${tx + bx * 0.4 + 4} ${top + by * 0.3 + 6} ${tx + tw * 0.5} ${top + 6} Z`} />
              ))}
              {tr.lobes.map((lb, k) => (
                <circle key={k} cx={tx + lb.dx} cy={top + lb.dy} r={lb.r} />
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
});
/** monte en capas: cielo, estrellas, resplandor del horizonte y cuatro líneas de árboles con paralaje.
    pan: desplazamiento horizontal de cámara (px de la capa cercana), tilt: vertical; horizon: altura del horizonte */
export const MonteBackdrop: React.FC<{t: number; mood?: Mood; pan?: number; tilt?: number; horizon?: number; o?: number; mist?: number; groundO?: number}> = ({
  t, mood = 'dusk', pan = 0, tilt = 0, horizon = 560, o = 1, mist = 0.6,
}) => {
  const M = MOODS[mood];
  const par = [0.12, 0.25, 0.5, 1];
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${M.sky[0]} 0%, ${M.sky[1]} ${(horizon + tilt) / 10.8 * 0.72}%, ${M.sky[2]} ${(horizon + tilt) / 10.8}%, ${M.ground[0]} ${(horizon + tilt) / 10.8 + 0.5}%, ${M.ground[1]} 100%)`}} />
      {M.stars > 0 ? (
        <AbsoluteFill style={{WebkitMaskImage: `linear-gradient(180deg, #000 0%, #000 ${(horizon + tilt) / 10.8 * 0.55}%, transparent ${(horizon + tilt) / 10.8 * 0.9}%)`, maskImage: `linear-gradient(180deg, #000 0%, #000 ${(horizon + tilt) / 10.8 * 0.55}%, transparent ${(horizon + tilt) / 10.8 * 0.9}%)`}}>
          <NightSky t={t} o={M.stars} milky={mood === 'night' ? 0.9 : 0.4} horizon={0} dx={-pan * 0.05} dy={tilt * 0.05} />
        </AbsoluteFill>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: horizon + tilt - 260, width: 1920, height: 420, background: `radial-gradient(ellipse 60% 50% at ${50 - pan * 0.004}% 70%, ${M.glow} 0%, rgba(0,0,0,0) 70%)`}} />
      {LAYERS.map((_, L) => {
        const base = horizon + tilt * (0.6 + 0.4 * par[L]) + [6, 16, 40, 110][L];
        const ox = 960 - pan * par[L];
        return (
          <div key={L} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${ox.toFixed(2)}px, ${base.toFixed(2)}px)`}}>
            <Img src={staticFile(`ep14/monte/${mood}_${L}.png`)} style={{position: 'absolute', left: LAYER_BOX[L].x0, top: LAYER_BOX[L].y0, width: LAYER_BOX[L].w, height: LAYER_BOX[L].h}} />
          </div>
        );
      })}
      {mist > 0 ? <div style={{position: 'absolute', left: 0, top: horizon + tilt - 40, width: 1920, height: 160, background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${M.glow.replace(/[\d.]+\)$/, `${0.35 * mist})`)} 45%, rgba(0,0,0,0) 100%)`}} /> : null}
    </AbsoluteFill>
  );
};

/** pasto alto en primer plano (silueta oscura que se mece), delante del 3D: da profundidad y escala */
const BLADES = Array.from({length: 260}, (_, i) => ({x: rnd(i * 3 + 1) * 2600 - 340, h: 40 + rnd(i * 5 + 2) ** 1.6 * 200, w: 3 + rnd(i * 7) * 6, c: (rnd(i * 11) - 0.5) * 80, ph: rnd(i * 13) * 6.28}));
export const ForeGrass: React.FC<{t: number; pan?: number; color?: string; o?: number; y?: number}> = ({t, pan = 0, color = '#07060A', o = 1, y = 1080}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o, pointerEvents: 'none'}}>
    <g fill={color} transform={`translate(${-pan * 1.4},0)`}>
      {BLADES.map((b, i) => {
        const sw = Math.sin(t * 1.1 + b.ph) * 10 + b.c;
        return <path key={i} d={`M${b.x - b.w} ${y + 10} Q${b.x + sw * 0.3} ${y - b.h * 0.55} ${b.x + sw} ${y - b.h} Q${b.x + sw * 0.3 + b.w * 0.4} ${y - b.h * 0.5} ${b.x + b.w} ${y + 10} Z`} />;
      })}
    </g>
  </svg>
);

/* ------------------------------------------------------------------ piezas dibujadas */
/** grúa sobre camión (silueta lateral), con brazo que se levanta (arm 0-1) */
export const CraneTruck: React.FC<{x: number; y: number; s?: number; arm?: number; color?: string; lights?: number; t?: number}> = ({x, y, s = 1, arm = 0.3, color = '#14161C', lights = 0, t = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-260} y={-90} width={360} height={60} rx={6} fill={color} />
    <path d={`M100 -30 L100 -120 L170 -120 L205 -70 L205 -30 Z`} fill={color} />
    <rect x={118} y={-112} width={40} height={34} fill="rgba(160,200,255,0.18)" />
    {[-200, -120, 150].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy={-22} r={30} fill="#0A0B0E" />
        <circle cx={cx} cy={-22} r={12} fill="#30343C" />
      </g>
    ))}
    <g transform={`translate(-150,-90) rotate(${-10 - arm * 38})`}>
      <rect x={0} y={-12} width={330} height={24} rx={4} fill={color} />
      <line x1={322} y1={0} x2={322} y2={90 + arm * 40} stroke="#2A2E36" strokeWidth={3} />
      <path d={`M314 ${90 + arm * 40} l16 0 l-8 14 z`} fill="#2A2E36" />
    </g>
    {lights > 0 ? <circle cx={200} cy={-60} r={10} fill="#FFE9A6" opacity={lights} /> : null}
    {lights > 0 ? <path d={`M205 -62 L520 -110 L520 -10 Z`} fill="rgba(255,236,170,0.12)" opacity={lights} /> : null}
  </g>
);
/** camión con caja abierta (lleva el meteorito) */
export const Truck: React.FC<{x: number; y: number; s?: number; color?: string; cargo?: React.ReactNode}> = ({x, y, s = 1, color = '#1A1D24', cargo}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-250} y={-110} width={300} height={80} rx={4} fill={color} />
    <rect x={-250} y={-120} width={300} height={12} fill="#2A2F38" />
    <path d={`M60 -30 L60 -140 L140 -140 L175 -90 L175 -30 Z`} fill={color} />
    <rect x={78} y={-130} width={46} height={40} fill="rgba(160,200,255,0.16)" />
    {[-190, -100, 120].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy={-22} r={28} fill="#0A0B0E" />
        <circle cx={cx} cy={-22} r={11} fill="#30343C" />
      </g>
    ))}
    {cargo}
  </g>
);
/** patrullero con balizas (rojo y azul alternados) */
export const PoliceCar: React.FC<{x: number; y: number; s?: number; t: number; on?: number}> = ({x, y, s = 1, t, on = 1}) => {
  const ph = Math.floor(t * 6) % 2;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-170 -30 L-160 -70 L-90 -76 L-50 -112 L60 -112 L110 -74 L170 -66 L178 -30 Z" fill="#0F1116" />
      <rect x={-40} y={-104} width={88} height={26} fill="rgba(160,200,255,0.16)" />
      <rect x={-20} y={-126} width={22} height={12} rx={3} fill={ph ? '#FF2E2E' : '#5A1010'} />
      <rect x={4} y={-126} width={22} height={12} rx={3} fill={ph ? '#1A2A5A' : '#3D7BFF'} />
      {[-110, 110].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={-26} r={26} fill="#07080A" />
          <circle cx={cx} cy={-26} r={10} fill="#2C3038" />
        </g>
      ))}
      <circle cx={-9} cy={-120} r={70} fill={ph ? 'rgba(255,46,46,0.28)' : 'rgba(61,123,255,0.28)'} opacity={on} style={{filter: 'blur(12px)'}} />
    </g>
  );
};
/** pistola de chispa (perfil) dibujada a línea */
export const FlintlockPistol: React.FC<{x: number; y: number; s?: number; p?: number; color?: string; rot?: number}> = ({x, y, s = 1, p = 1, color = K.ironLight, rot = 0}) => {
  const len = 2600;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp(p))}>
      <path d="M-300 -20 L120 -20 L130 -30 L140 -20 L150 -20 L150 4 L-300 4 Z" />
      <path d="M150 -14 C190 -16 220 -6 240 20 C262 54 270 110 250 150 C238 172 206 176 196 156 C188 138 196 110 186 84 C176 60 156 40 120 30" />
      <path d="M40 4 C46 30 70 44 96 40" />
      <path d="M60 30 C56 44 62 56 74 58" />
      <path d="M90 -30 L108 -64 L122 -60 L112 -28" />
      <path d="M60 -20 C60 -40 74 -48 86 -44" />
      <path d="M-300 -8 L120 -8" opacity={0.5} />
    </g>
  );
};
/** volcán esquemático (la conclusión equivocada de Rubín de Celis) */
export const Volcano: React.FC<{x: number; y: number; s?: number; color?: string; p?: number}> = ({x, y, s = 1, color = K.ink, p = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" opacity={clamp(p * 2)}>
    <path d="M-170 80 L-50 -60 L-20 -50 L20 -58 L50 -60 L170 80" strokeDasharray={600} strokeDashoffset={600 * (1 - clamp(p))} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${-20 + i * 20} -70 C${-30 + i * 25} -110 ${-10 + i * 20} -130 ${-24 + i * 26} -170`} strokeDasharray={140} strokeDashoffset={140 * (1 - clamp(p * 1.4 - 0.4 - i * 0.1))} />
    ))}
  </g>
);
