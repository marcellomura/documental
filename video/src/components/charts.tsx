import React from 'react';
import {C, F} from '../theme';
import {clamp, easeOut, fmt, prog} from '../lib/anim';

type Bar = {label: string; value: number; color?: string; valueLabel?: string};

/* Barras verticales */
export const BarsV: React.FC<{
  data: Bar[]; t: number; t0: number; stagger?: number; w?: number; h?: number; max?: number; dark?: boolean;
  grow?: number; valueSize?: number; labelSize?: number; barColor?: string; showValues?: boolean; revealIdx?: number[];
}> = ({data, t, t0, stagger = 0.12, w = 1500, h = 620, max, dark, grow = 0.6, valueSize = 30, labelSize = 26, barColor = C.ink, showValues = true, revealIdx}) => {
  const m = max ?? Math.max(...data.map((d) => d.value));
  const gap = 18;
  const bw = (w - gap * (data.length - 1)) / data.length;
  const ink = dark ? C.white : C.ink;
  return (
    <div style={{position: 'relative', width: w, height: h + 60}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: h, height: 4, background: ink, opacity: 0.8}} />
      {data.map((d, i) => {
        const start = revealIdx ? revealIdx[i] : t0 + i * stagger;
        const p = prog(t, start, grow);
        const bh = (d.value / m) * h * p;
        return (
          <div key={i} style={{position: 'absolute', left: i * (bw + gap), width: bw, top: 0, height: h + 60}}>
            <div style={{position: 'absolute', bottom: 60, left: 0, width: bw, height: bh, background: d.color ?? barColor, borderRadius: '4px 4px 0 0'}} />
            {showValues ? (
              <div style={{position: 'absolute', bottom: 60 + bh + 8, width: bw, textAlign: 'center', fontFamily: F.mono, fontWeight: 800, fontSize: valueSize, color: d.color && d.color !== barColor ? d.color : ink, opacity: clamp((t - start - 0.2) / 0.3)}}>
                {d.valueLabel ?? fmt(d.value * clamp(p), 1)}
              </div>
            ) : null}
            <div style={{position: 'absolute', bottom: 12, width: bw, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: labelSize, color: ink, opacity: 0.85}}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* Gráfico de línea con dibujo progresivo */
export const LineChart: React.FC<{
  pts: {x: number; y: number}[]; t: number; t0: number; t1: number; w?: number; h?: number; xLabels?: number[]; yMax?: number;
  color?: string; dark?: boolean; yFmt?: (v: number) => string; yTicks?: number[]; endLabel?: string; area?: boolean;
}> = ({pts, t, t0, t1, w = 1500, h = 640, xLabels, yMax, color = C.red, dark, yFmt = (v) => fmt(v), yTicks = [], endLabel, area = true}) => {
  const xs = pts.map((p) => p.x);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const ym = yMax ?? Math.max(...pts.map((p) => p.y));
  const X = (x: number) => ((x - x0) / (x1 - x0)) * w;
  const Y = (y: number) => h - (y / ym) * h;
  const p = easeOut(clamp((t - t0) / (t1 - t0)));
  // longitud proporcional en x
  const xCut = x0 + (x1 - x0) * p;
  const vis: {x: number; y: number}[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].x <= xCut) vis.push(pts[i]);
    else {
      const a = pts[i - 1];
      if (a) {
        const k = (xCut - a.x) / (pts[i].x - a.x);
        vis.push({x: xCut, y: a.y + (pts[i].y - a.y) * k});
      }
      break;
    }
  }
  const d = vis.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)} ${Y(q.y).toFixed(1)}`).join(' ');
  const last = vis[vis.length - 1] ?? pts[0];
  const ink = dark ? C.white : C.ink;
  return (
    <svg width={w + 220} height={h + 80} viewBox={`-120 -20 ${w + 220} ${h + 80}`} style={{overflow: 'visible'}}>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={0} x2={w} y1={Y(v)} y2={Y(v)} stroke={ink} strokeOpacity="0.15" strokeWidth="2" strokeDasharray="6 8" />
          <text x={-18} y={Y(v) + 9} textAnchor="end" fontFamily="JetBrains Mono" fontWeight="700" fontSize="24" fill={ink} opacity="0.6">{yFmt(v)}</text>
        </g>
      ))}
      <line x1={0} x2={w} y1={h} y2={h} stroke={ink} strokeWidth="4" />
      {(xLabels ?? []).map((x) => (
        <text key={x} x={X(x)} y={h + 46} textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="26" fill={ink} opacity="0.75">{x}</text>
      ))}
      {area && vis.length > 1 ? <path d={`${d} L${X(last.x)} ${h} L${X(vis[0].x)} ${h} Z`} fill={color} opacity="0.14" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(last.x)} cy={Y(last.y)} r="14" fill={color} stroke={dark ? C.dark : C.paper} strokeWidth="5" />
      {endLabel && p > 0.98 ? (
        <text x={X(last.x) - 24} y={Y(last.y) - 34} textAnchor="end" fontFamily="Anton" fontSize="64" fill={color}>{endLabel}</text>
      ) : null}
    </svg>
  );
};

/* Barras horizontales de comparación */
export const HBars: React.FC<{data: Bar[]; t: number; t0: number; w?: number; bh?: number; stagger?: number; max?: number; dark?: boolean}> = ({data, t, t0, w = 1200, bh = 110, stagger = 0.5, max, dark}) => {
  const m = max ?? Math.max(...data.map((d) => d.value));
  const ink = dark ? C.white : C.ink;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 46}}>
      {data.map((d, i) => {
        const p = prog(t, t0 + i * stagger, 0.9);
        return (
          <div key={i}>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 32, color: ink, marginBottom: 10, letterSpacing: 1, opacity: clamp((t - t0 - i * stagger) / 0.3)}}>{d.label}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: (d.value / m) * w * p, height: bh, background: d.color ?? ink, borderRadius: 6}} />
              <div style={{fontFamily: F.head, fontSize: 70, whiteSpace: 'nowrap', color: d.color ?? ink, opacity: clamp((t - t0 - i * stagger - 0.4) / 0.3)}}>{d.valueLabel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
