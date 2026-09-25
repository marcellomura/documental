/* Corte transversal del Pacífico ecuatorial: alisios, pileta de agua caliente, termoclina, afloramiento.
   k = 0 año normal → k = 1 El Niño. */
import React from 'react';
import {F} from '../theme';
import {clamp, easeInOut, prog} from '../lib/anim';
import {Cloud, Fish, N, Rain} from './kit';

const X0 = 300, X1 = 1620; // costas oeste (Indonesia) y este (Sudamérica)
const sm = (x: number) => x * x * (3 - 2 * x);

/** nivel del mar (y) según x */
const surf = (x: number, k: number, t: number) => {
  const u = clamp((x - X0) / (X1 - X0));
  const tilt = (1 - k) * 36; // oeste más alto en año normal (exagerado)
  return 556 - tilt / 2 + tilt * u + Math.sin(x * 0.02 + t * 2.2) * 3 + Math.sin(x * 0.047 - t * 1.6) * 1.6;
};
/** termoclina (y) según x */
const thermo = (x: number, k: number) => {
  const u = clamp((x - X0) / (X1 - X0));
  const normal = 880 - 250 * sm(u) - (u > 0.82 ? 150 * sm((u - 0.82) / 0.18) : 0);
  const nino = 790 - 40 * u;
  return normal + (nino - normal) * k;
};

export type SectionCues = {
  label?: number; wind?: number; fan?: number; warm?: number; high?: number; up?: number; chips?: [number, number, number]; eq?: number;
  weak?: number; fanOff?: number; slosh?: number; evap?: number; rainMove?: number;
};

export const Section: React.FC<{t: number; k: number; wind: number; c: SectionCues; o?: number; rk?: number}> = ({t, k, wind, c, o = 1, rk}) => {
  const xs: number[] = [];
  for (let x = X0; x <= X1; x += 20) xs.push(x);
  const surfD = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${surf(x, k, t).toFixed(1)}`).join(' ');
  const thermD = xs.map((x, i) => `${i ? 'L' : 'M'} ${x} ${thermo(x, k).toFixed(1)}`).join(' ');
  const warmD = surfD + ' ' + [...xs].reverse().map((x) => `L ${x} ${thermo(x, k).toFixed(1)}`).join(' ') + ' Z';
  const oceanD = surfD + ` L ${X1} 1010 L ${X0} 1010 Z`;
  const show = (tc?: number) => (tc === undefined ? 0 : prog(t, tc, 0.6));
  // posición de la celda de lluvia: oeste en año normal, se muda al centro-este con El Niño
  const rainX = 470 + (1180 - 470) * easeInOut(clamp(rk ?? k));
  const windA = wind;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      <defs>
        <linearGradient id="sec-cold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E5E96" />
          <stop offset="1" stopColor="#081B30" />
        </linearGradient>
        <linearGradient id="sec-warmN" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={N.hot} />
          <stop offset="0.55" stopColor={N.amber} />
          <stop offset="0.85" stopColor="#E9C46A" />
          <stop offset="1" stopColor="#5FB4C9" />
        </linearGradient>
        <linearGradient id="sec-warmE" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={N.amber} />
          <stop offset="0.5" stopColor={N.hot} />
          <stop offset="1" stopColor={N.magenta} />
        </linearGradient>
        <linearGradient id="sec-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1A2A" stopOpacity={0} />
          <stop offset="1" stopColor="#16324D" stopOpacity={0.55} />
        </linearGradient>
        <filter id="sec-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* aire */}
      <rect x={0} y={120} width={1920} height={440} fill="url(#sec-air)" />
      {/* celda de Walker */}
      <WalkerLoop t={t} k={k} a={show(c.wind) * (0.35 + 0.65 * windA)} rainX={rainX} />
      {/* océano */}
      <path d={oceanD} fill="url(#sec-cold)" />
      <path d={warmD} fill="url(#sec-warmN)" opacity={(1 - k) * (0.35 + 0.65 * show(c.warm ?? -1))} />
      <path d={warmD} fill="url(#sec-warmE)" opacity={k} />
      {/* partículas en el agua */}
      {Array.from({length: 46}).map((_, i) => {
        const r1 = ((Math.sin(i * 91.7) * 4375.5) % 1 + 1) % 1, r2 = ((Math.sin(i * 12.3) * 9123.1) % 1 + 1) % 1;
        const x = X0 + 30 + (((r1 + t * (0.012 + r2 * 0.01) * (windA > 0.4 ? -1 : 1)) % 1) + 1) % 1 * (X1 - X0 - 60);
        const y = thermo(x, k) + 30 + r2 * (980 - thermo(x, k) - 40);
        return <circle key={i} cx={x} cy={y} r={2.2} fill="#9CD3FF" opacity={0.35} />;
      })}
      <path d={thermD} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={2.5} strokeDasharray="12 10" />
      <text x={X0 + 36} y={thermo(X0 + 36, k) + 34} fill="rgba(255,255,255,0.7)" fontFamily="Inter" fontWeight={700} fontSize={19} letterSpacing={3}>
        TERMOCLINA
      </text>
      {/* superficie */}
      <path d={surfD} fill="none" stroke="#DDF1FF" strokeWidth={3} opacity={0.85} />
      {/* afloramiento de agua fría */}
      <Upwelling t={t} a={show(c.up) * (1 - k)} />
      {/* nutrientes y peces frente a Sudamérica */}
      {c.chips ? (
        <g>
          {Array.from({length: 18}).map((_, i) => {
            const a = prog(t, c.chips![1] + i * 0.02, 0.4) * (1 - k);
            const x = 1400 + ((i * 53) % 200), y = 600 + ((i * 37) % 70);
            return <circle key={i} cx={x} cy={y + Math.sin(t * 2 + i) * 4} r={4} fill="#B8F2E6" opacity={a * 0.9} />;
          })}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = prog(t, c.chips![2] + i * 0.08, 0.4) * (1 - Math.min(1, k * 1.6));
            return <Fish key={i} x={1380 + i * 42 + Math.sin(t * 1.5 + i) * 8} y={590 + (i % 2) * 30} s={0.9} o={a} flip />;
          })}
        </g>
      ) : null}
      {/* evaporación con El Niño */}
      {c.evap !== undefined
        ? Array.from({length: 9}).map((_, i) => {
            const a = show(c.evap) * k;
            const x = 900 + i * 70;
            const ph = (t * 0.6 + i * 0.37) % 1;
            const y = surf(x, k, t) - 10 - ph * 120;
            return <path key={i} d={`M ${x} ${y} q 10 -14 0 -28 q -10 -14 0 -28`} fill="none" stroke="#FFD6C2" strokeWidth={3} strokeLinecap="round" opacity={a * (1 - ph) * 0.8} />;
          })
        : null}
      {/* vientos alisios (de este a oeste) */}
      <Trades t={t} a={show(c.wind) * windA} />
      {/* costas */}
      <path d={`M 0 1010 L 0 470 C 60 455 120 430 180 452 C 230 470 270 500 ${X0} 540 L ${X0 + 18} 1010 Z`} fill="#1B2838" stroke="rgba(200,225,245,0.35)" strokeWidth={2} />
      <path
        d={`M 1920 1010 L 1920 420 L 1860 360 L 1810 400 L 1770 330 L 1720 410 L 1680 470 L ${X1} 560 L ${X1 - 16} 1010 Z`}
        fill="#1B2838"
        stroke="rgba(200,225,245,0.35)"
        strokeWidth={2}
      />
      <text x={150} y={640} textAnchor="middle" fill={N.text} fontFamily="Inter" fontWeight={800} fontSize={24} letterSpacing={3}>
        INDONESIA
      </text>
      <text x={150} y={672} textAnchor="middle" fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={19} letterSpacing={3}>
        Y AUSTRALIA
      </text>
      <text x={1775} y={640} textAnchor="middle" fill={N.text} fontFamily="Inter" fontWeight={800} fontSize={24} letterSpacing={3}>
        SUDAMÉRICA
      </text>
      <text x={1775} y={672} textAnchor="middle" fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={19} letterSpacing={3}>
        PERÚ · ECUADOR
      </text>
      <text x={X0 + 20} y={1045} fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={18} letterSpacing={4}>← OESTE</text>
      <text x={X1 - 20} y={1045} textAnchor="end" fill={N.mute} fontFamily="Inter" fontWeight={800} fontSize={18} letterSpacing={4}>ESTE →</text>
      {/* medio metro más alto */}
      {c.high !== undefined ? <SeaHigh t={t} t0={c.high} k={k} /> : null}
      {/* profundidad */}
      <g opacity={0.55}>
        {[0, 100, 200, 300].map((d, i) => (
          <text key={d} x={X1 - 26} y={surf(X1, 0, 0) + 20 + i * 120} textAnchor="end" fill={N.mute} fontFamily="JetBrains Mono" fontSize={15}>
            {d} m
          </text>
        ))}
      </g>
    </svg>
  );
};

/** flechas de viento animadas de derecha a izquierda */
const Trades: React.FC<{t: number; a: number}> = ({t, a}) => {
  if (a <= 0.01) return null;
  const rows = [462, 490, 518];
  return (
    <g opacity={a} filter="url(#sec-glow)">
      {rows.map((y, r) => {
        const d = `M ${X1 - 40} ${y} C 1200 ${y - 16} 900 ${y + 14} 600 ${y - 6} S 380 ${y + 6} ${X0 + 40} ${y}`;
        return (
          <g key={r}>
            <path d={d} fill="none" stroke="rgba(230,245,255,0.3)" strokeWidth={2} />
            <path d={d} fill="none" stroke="#EAF6FF" strokeWidth={4} strokeLinecap="round" strokeDasharray="70 90" strokeDashoffset={-(t * 420 * (0.4 + 0.6 * a)) - r * 50} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const x = X1 - 80 - ((t * 260 * (0.4 + 0.6 * a) + i * 320) % 1180);
        return <path key={i} d={`M ${x} 490 l 26 -18 M ${x} 490 l 26 18`} stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" />;
      })}
    </g>
  );
};

/** circulación de Walker: sube en el oeste, viaja en altura, baja en el este */
const WalkerLoop: React.FC<{t: number; k: number; a: number; rainX: number}> = ({t, k, a, rainX}) => {
  if (a <= 0.01) return null;
  const xr = rainX, xd = 1480 - k * 200;
  const d = `M ${xd} 440 C ${xd} 320 ${xd - 60} 240 ${(xr + xd) / 2} 240 C ${xr + 60} 240 ${xr} 320 ${xr} 430`;
  return (
    <g opacity={a}>
      <path d={d} fill="none" stroke="rgba(180,215,240,0.35)" strokeWidth={3} strokeDasharray="4 12" strokeDashoffset={t * 30} />
      <g transform={`translate(${xr},0)`}>
        <Cloud x={0} y={300} s={1.6} color="#C9D8E6" o={0.95} />
        <Cloud x={-50} y={330} s={1.2} color="#AFC2D4" o={0.9} />
        <Cloud x={60} y={335} s={1.1} color="#B8CADB" o={0.9} />
      </g>
      <Rain t={t} x={xr - 90} y={350} w={180} h={185} n={24} color="#9ED0FF" />
    </g>
  );
};

const Upwelling: React.FC<{t: number; a: number}> = ({t, a}) => {
  if (a <= 0.01) return null;
  return (
    <g opacity={a}>
      {[0, 1, 2].map((i) => {
        const x = 1380 + i * 70;
        const d = `M ${x - 120} 960 C ${x - 40} 900 ${x} 820 ${x + 20} 640`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#7FD1FF" strokeWidth={6} strokeLinecap="round" strokeDasharray="30 26" strokeDashoffset={-t * 90 - i * 20} />
            <path d={`M ${x + 20} 628 l -16 22 M ${x + 20} 628 l 12 24`} stroke="#7FD1FF" strokeWidth={6} strokeLinecap="round" />
          </g>
        );
      })}
      <text x={1600} y={935} textAnchor="end" fill="#9ED9FF" fontFamily="Inter" fontWeight={800} fontSize={22} letterSpacing={3}>
        SUBE AGUA FRÍA
      </text>
    </g>
  );
};

const SeaHigh: React.FC<{t: number; t0: number; k: number}> = ({t, t0, k}) => {
  const a = prog(t, t0, 0.5) * (1 - k);
  if (a <= 0.01) return null;
  const yl = surf(X0, 0, t), yr = surf(X1, 0, t);
  return (
    <g opacity={a}>
      <line x1={X0 + 10} y1={yr} x2={X1 - 10} y2={yr} stroke="rgba(255,255,255,0.45)" strokeWidth={2} strokeDasharray="6 8" />
      <line x1={X0 + 60} y1={yr} x2={X0 + 60} y2={yl} stroke={N.yellow} strokeWidth={4} />
      <line x1={X0 + 44} y1={yl} x2={X0 + 76} y2={yl} stroke={N.yellow} strokeWidth={4} />
      <line x1={X0 + 44} y1={yr} x2={X0 + 76} y2={yr} stroke={N.yellow} strokeWidth={4} />
      <text x={X0 + 96} y={(yl + yr) / 2 + 14} fill={N.yellow} fontFamily="Anton" fontSize={44}>
        +50 CM
      </text>
    </g>
  );
};

export {X0, X1, surf, thermo};
