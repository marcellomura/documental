/* Gráficos con datos reales: NOAA CPC (Niño 3.4 semanal, ONI) y NOAA NCEI (temperatura del océano). */
import React from 'react';
import {F} from '../theme';
import {clamp, easeInOut, easeOut, fmt, pop, prog} from '../lib/anim';
import same from '../data/ep04/samedate.json';
import oni from '../data/ep04/oni.json';
import ocean from '../data/ep04/ocean.json';
import {N} from './kit';

const heat = (v: number) => {
  // escala divergente: azul (frío) → blanco → ámbar → rojo → magenta
  const stops: [number, [number, number, number]][] = [
    [-2, [43, 108, 176]], [-0.5, [120, 180, 230]], [0, [225, 235, 240]], [0.8, [255, 196, 90]], [1.6, [255, 120, 50]], [2.4, [226, 59, 46]], [3.2, [194, 24, 91]],
  ];
  if (v <= stops[0][0]) return `rgb(${stops[0][1].join(',')})`;
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i];
      const k = (v - a) / (b - a);
      return `rgb(${ca.map((c, j) => Math.round(c + (cb[j] - c) * k)).join(',')})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1].join(',')})`;
};
export {heat};

/* ---------- S01: mediados de septiembre, año por año (Niño 3.4) ---------- */
export const SameDateBars: React.FC<{t: number; t0: number; tLast: number; o?: number}> = ({t, t0, tLast, o = 1}) => {
  const rows = (same as any).same as [number, number, number][];
  const n = rows.length;
  const xL = 230, xR = 1690, base = 720, sc = 105;
  const bw = (xR - xL) / n;
  const recY = base - 2.0 * sc;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      {/* ejes */}
      {[-1, 0, 1, 2, 3].map((v) => (
        <g key={v} opacity={prog(t, t0, 0.5)}>
          <line x1={xL - 20} x2={xR + 10} y1={base - v * sc} y2={base - v * sc} stroke={v === 0 ? 'rgba(255,255,255,0.55)' : N.line} strokeWidth={v === 0 ? 2 : 1} />
          <text x={xL - 34} y={base - v * sc + 7} textAnchor="end" fill={N.mute} fontFamily="JetBrains Mono" fontSize={20}>
            {v > 0 ? '+' : ''}
            {v},0°
          </text>
        </g>
      ))}
      {rows.map(([y, v], i) => {
        const last = i === n - 1;
        const ti = last ? tLast : t0 + 0.4 + i * 0.075;
        const p = last ? pop(t, ti, 0.9) : prog(t, ti, 0.5);
        const h = v * sc * p;
        const x = xL + i * bw + bw * 0.15;
        return (
          <g key={y}>
            <rect x={x} y={h >= 0 ? base - h : base} width={bw * 0.7} height={Math.abs(h)} fill={last ? N.hot : heat(v)} opacity={last ? 1 : 0.85} filter={last ? 'url(#bar-glow)' : undefined} />
            {(y % 5 === 0 || last) && p > 0 ? (
              <text x={x + bw * 0.35} y={base + (v < 0 ? 36 - v * sc : 36) + 10} textAnchor="middle" fill={last ? N.yellow : N.mute} fontFamily="JetBrains Mono" fontSize={last ? 24 : 18} fontWeight={last ? 800 : 400}>
                {y}
              </text>
            ) : null}
          </g>
        );
      })}
      <defs>
        <filter id="bar-glow" x="-100%" y="-30%" width="300%" height="160%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* récord anterior */}
      <g opacity={prog(t, t0 + 3.2, 0.5)}>
        <line x1={xL} x2={xR} y1={recY} y2={recY} stroke={N.yellow} strokeWidth={2} strokeDasharray="10 8" />
        <text x={xL + 8} y={recY - 14} fill={N.yellow} fontFamily="Inter" fontWeight={800} fontSize={20} letterSpacing={2}>
          RÉCORD ANTERIOR PARA ESTA FECHA: +2,0° (2015)
        </text>
      </g>
    </svg>
  );
};

/* ---------- S05: ONI 1950–2026 con umbrales ---------- */
const O = oni as [string, number, number][];
const SEAS = ['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'];
export const OniChart: React.FC<{t: number; tAxes: number; tFuerte: number; tSuper: number; tDraw: [number, number]; peaks: [number, number, number]; o?: number}> = ({
  t, tAxes, tFuerte, tSuper, tDraw, peaks, o = 1,
}) => {
  const xL = 190, xR = 1720, base = 700, sc = 150;
  const X = (yr: number) => xL + ((yr - 1950) / (2027 - 1950)) * (xR - xL);
  const Y = (v: number) => base - v * sc;
  const pts = O.map(([s, y, v]) => [X(y + (SEAS.indexOf(s) + 0.5) / 12), Y(v)] as [number, number]);
  const lineD = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = `M ${pts[0][0]} ${base} ` + pts.map((p) => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ` L ${pts[pts.length - 1][0]} ${base} Z`;
  const draw = easeInOut(clamp((t - tDraw[0]) / (tDraw[1] - tDraw[0])));
  const clipX = xL + (xR - xL) * draw;
  const PK: [string, number, number, number][] = [
    ['1982', 1983 + 0.5 / 12, 2.14, peaks[0]],
    ['1997', 1997 + 11.5 / 12, 2.37, peaks[1]],
    ['2015', 2015 + 11.5 / 12, 2.59, peaks[2]],
  ];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      <defs>
        <clipPath id="oni-clip">
          <rect x={0} y={0} width={clipX} height={1080} />
        </clipPath>
        <clipPath id="oni-pos">
          <rect x={0} y={0} width={1920} height={base} />
        </clipPath>
        <clipPath id="oni-neg">
          <rect x={0} y={base} width={1920} height={400} />
        </clipPath>
        <linearGradient id="oni-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={N.magenta} />
          <stop offset="0.3" stopColor={N.hot} />
          <stop offset="1" stopColor={N.amber} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <g opacity={prog(t, tAxes, 0.5)}>
        {[-2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={xL} x2={xR} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? 'rgba(255,255,255,0.5)' : N.line} strokeWidth={v === 0 ? 2 : 1} />
            <text x={xL - 16} y={Y(v) + 7} textAnchor="end" fill={N.mute} fontFamily="JetBrains Mono" fontSize={19}>
              {v > 0 ? '+' : ''}
              {v}°
            </text>
          </g>
        ))}
        {[1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <text key={y} x={X(y)} y={base + 3 * sc - 390 + 470} textAnchor="middle" fill={N.mute} fontFamily="JetBrains Mono" fontSize={19}>
            {y}
          </text>
        ))}
      </g>
      {/* umbrales */}
      {[
        [1.5, 'FUERTE', N.amber, tFuerte],
        [2.0, 'SÚPER', N.hot, tSuper],
      ].map(([v, lab, col, tt]) => {
        const p = prog(t, tt as number, 0.6);
        return (
          <g key={lab as string} opacity={p}>
            <rect x={xL} y={Y(v as number) - (v === 2 ? 180 : 0)} width={(xR - xL) * p} height={v === 2 ? 180 : Y(1.5) - Y(2.0)} fill={col as string} opacity={v === 2 ? 0.1 : 0.08} />
            <line x1={xL} x2={xL + (xR - xL) * p} y1={Y(v as number)} y2={Y(v as number)} stroke={col as string} strokeWidth={3} strokeDasharray="12 8" />
            <text x={xR + 14} y={Y(v as number) + 9} fill={col as string} fontFamily="Anton" fontSize={34}>
              {lab as string}
            </text>
            <text x={xR + 14} y={Y(v as number) + 36} fill={N.mute} fontFamily="JetBrains Mono" fontSize={17}>
              +{fmt(v as number, 1)}°C
            </text>
          </g>
        );
      })}
      <g clipPath="url(#oni-clip)">
        <path d={areaD} fill="url(#oni-g)" clipPath="url(#oni-pos)" opacity={0.85} />
        <path d={areaD} fill={N.cold} clipPath="url(#oni-neg)" opacity={0.55} />
        <path d={lineD} fill="none" stroke="#fff" strokeWidth={2} opacity={0.8} />
      </g>
      {PK.map(([lab, yr, v, tp]) => {
        const p = pop(t, tp, 0.9);
        if (t < tp) return null;
        const x = X(yr), y = Y(v);
        return (
          <g key={lab}>
            <circle cx={x} cy={y} r={16 * p} fill="none" stroke={N.yellow} strokeWidth={4} />
            <circle cx={x} cy={y} r={6} fill={N.yellow} />
            <text x={x} y={y - 34} textAnchor="middle" fill={N.yellow} fontFamily="Anton" fontSize={52} opacity={clamp(p)}>
              {lab}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- S05: la misma fecha en los súper Niños (Niño 3.4 semanal) ---------- */
const LINES = (same as any).lines as Record<string, [number, number][]>;
export const SeasonLines: React.FC<{t: number; t0: number; tNow: number; tPeak: number; o?: number}> = ({t, t0, tNow, tPeak, o = 1}) => {
  const xL = 240, xR = 1600, base = 760, sc = 125;
  const X = (d: number) => xL + (d / 334) * (xR - xL);
  const Y = (v: number) => base - v * sc;
  const ser = (y: string, upTo = 999) => LINES[y].filter((p) => p[0] <= upTo).map((p, i) => `${i ? 'L' : 'M'} ${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  const months = ['MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB', 'MAR'];
  const mDays = [0, 31, 61, 92, 123, 153, 184, 214, 245, 276, 304];
  const now = 138;
  const cols: Record<string, string> = {'1982': '#7FA7C9', '1997': '#A8C6DE', '2015': '#D7E6F2', '2023': '#5B7A95'};
  const past = ['1982', '1997', '2015', '2023'];
  const drawP = easeInOut(clamp((t - t0 - 0.3) / 1.6));
  const cut = drawP * 334;
  const now26 = LINES['2026'];
  const d26 = easeOut(clamp((t - (tNow - 2.2)) / 2.2)) * now;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      <defs>
        <clipPath id="sl-cut">
          <rect x={0} y={0} width={X(cut)} height={1080} />
        </clipPath>
        <filter id="sl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={prog(t, t0, 0.5)}>
        {[-1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={xL} x2={xR} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? 'rgba(255,255,255,0.5)' : N.line} />
            <text x={xL - 16} y={Y(v) + 7} textAnchor="end" fill={N.mute} fontFamily="JetBrains Mono" fontSize={19}>
              {v > 0 ? '+' : ''}
              {v}°
            </text>
          </g>
        ))}
        {months.map((m, i) => (
          <text key={m} x={X(mDays[i] + 15)} y={base + 170} textAnchor="middle" fill={N.mute} fontFamily="JetBrains Mono" fontSize={18}>
            {m}
          </text>
        ))}
        <line x1={X(now)} x2={X(now)} y1={Y(3.4)} y2={base + 140} stroke={N.yellow} strokeWidth={2} strokeDasharray="6 6" />
        <text x={X(now)} y={Y(3.4) - 12} textAnchor="middle" fill={N.yellow} fontFamily="Inter" fontWeight={800} fontSize={20} letterSpacing={3}>
          16 SEP
        </text>
      </g>
      <g clipPath="url(#sl-cut)">
        {past.map((y) => (
          <g key={y}>
            <path d={ser(y)} fill="none" stroke={cols[y]} strokeWidth={y === '2023' ? 2.5 : 3.5} opacity={y === '2023' ? 0.55 : 0.85} />
          </g>
        ))}
      </g>
      {past.map((y) => {
        const pts = LINES[y];
        const pk = pts.reduce((a, b) => (b[1] > a[1] ? b : a));
        const show = prog(t, tPeak + (y === '2023' ? 0.3 : 0), 0.5) * (y === '2023' ? 0.7 : 1);
        const lastVis = pts.filter((p) => p[0] <= cut).pop();
        return (
          <g key={y}>
            {lastVis && drawP < 1 ? null : (
              <text x={X(pts[pts.length - 1][0]) + 10} y={Y(pts[pts.length - 1][1]) + 7} fill={cols[y]} fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} opacity={drawP}>
                {y}
              </text>
            )}
            <g opacity={show}>
              <circle cx={X(pk[0])} cy={Y(pk[1])} r={7} fill={cols[y]} />
              <text x={X(pk[0])} y={Y(pk[1]) - 16} textAnchor="middle" fill={cols[y]} fontFamily="Inter" fontWeight={800} fontSize={18}>
                PICO {y}
              </text>
            </g>
          </g>
        );
      })}
      {/* 2026 */}
      <path d={ser('2026', d26)} fill="none" stroke={N.hot} strokeWidth={7} strokeLinecap="round" filter="url(#sl-glow)" />
      {d26 > 5
        ? (() => {
            const pts = now26.filter((p) => p[0] <= d26);
            const lp = pts[pts.length - 1];
            const pulse = (t % 1.2) / 1.2;
            return (
              <g>
                <circle cx={X(lp[0])} cy={Y(lp[1])} r={12 + pulse * 30} fill="none" stroke={N.hot} strokeWidth={3} opacity={1 - pulse} />
                <circle cx={X(lp[0])} cy={Y(lp[1])} r={11} fill={N.yellow} />
                <text x={X(lp[0]) - 24} y={Y(lp[1]) - 26} textAnchor="end" fill={N.yellow} fontFamily="Anton" fontSize={64}>
                  2026: +{fmt(lp[1], 1)}°
                </text>
              </g>
            );
          })()
        : null}
      {/* ¿hasta dónde sube? */}
      <g opacity={prog(t, tPeak, 0.6)}>
        <path d={`M ${X(now) + 14} ${Y(3.0)} C ${X(now + 30)} ${Y(3.3)} ${X(now + 60)} ${Y(3.5)} ${X(now + 90)} ${Y(3.6)}`} fill="none" stroke={N.yellow} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" />
        <text x={X(now + 100)} y={Y(3.55)} fill={N.yellow} fontFamily="Anton" fontSize={80}>
          ?
        </text>
      </g>
    </svg>
  );
};

/* ---------- S09: franjas de calentamiento del océano 1850–2026 ---------- */
export const Stripes: React.FC<{t: number; t0: number; o?: number; tLine?: number; h?: number; y?: number}> = ({t, t0, o = 1, tLine = 999, h = 1080, y = 0}) => {
  const rows = [...(ocean as any).annual, [2026, (ocean as any).y2026]] as [number, number][];
  const n = rows.length;
  const w = 1920 / n;
  const col = (v: number) => {
    // paleta de franjas: azul profundo → blanco → rojo
    const k = clamp((v + 0.45) / 1.5);
    const stops: [number, [number, number, number]][] = [
      [0, [8, 48, 107]], [0.25, [66, 146, 198]], [0.45, [198, 219, 239]], [0.55, [252, 187, 161]], [0.75, [239, 59, 44]], [1, [103, 0, 13]],
    ];
    for (let i = 1; i < stops.length; i++) {
      if (k <= stops[i][0]) {
        const [a, ca] = stops[i - 1], [b, cb] = stops[i];
        const q = (k - a) / (b - a);
        return `rgb(${ca.map((c, j) => Math.round(c + (cb[j] - c) * q)).join(',')})`;
      }
    }
    return 'rgb(103,0,13)';
  };
  const lineP = easeInOut(clamp((t - tLine) / 2));
  const Y = (v: number) => y + h * 0.72 - v * h * 0.42;
  const lineD = rows.slice(0, Math.max(1, Math.round(n * lineP))).map(([yr, v], i) => `${i ? 'L' : 'M'} ${(i + 0.5) * w} ${Y(v).toFixed(1)}`).join(' ');
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
      {rows.map(([yr, v], i) => {
        const p = prog(t, t0 + i * 0.012, 0.4);
        return <rect key={yr} x={i * w} y={y + h * (1 - p) * 0.5} width={w + 0.6} height={h * p} fill={col(v)} />;
      })}
      {lineP > 0 ? <path d={lineD} fill="none" stroke="#fff" strokeWidth={4} opacity={0.9} /> : null}
    </svg>
  );
};
