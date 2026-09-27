/* Gráficos del episodio: ranking que se reordena, carrera de líneas, escalera del ranking,
   mapa del mundo con rutas y abanico ferroviario. Todo en SVG/CSS para que quede nítido en 4K. */
import React, {useMemo} from 'react';
import {geoMercator, geoNaturalEarth1, geoPath, geoInterpolate} from 'd3-geo';
import c110 from '../data/ep04/countries110.json';
import c50 from '../data/ep04/countries50.json';
import prov from '../data/ep04/arg_provincias.json';
import gdp from '../data/rico/gdppc.json';
import {R, FONT, clamp, easeInOut, easeOut, fmt, prog, rnd} from './kit';

export const G = gdp as {years: number[]; series: Record<string, (number | null)[]>; names: Record<string, string>; flags: Record<string, string>};
export const val = (iso: string, y: number) => {
  const i = G.years.indexOf(Math.floor(y));
  const a = G.series[iso][i], b = G.series[iso][Math.min(i + 1, G.years.length - 1)];
  if (a == null) return null;
  if (b == null) return a;
  return a + (b - a) * (y - Math.floor(y));
};
export const NAME: Record<string, string> = {
  ARG: 'Argentina', USA: 'Estados Unidos', GBR: 'Gran Bretaña', AUS: 'Australia', CAN: 'Canadá', NZL: 'Nueva Zelanda', FRA: 'Francia', DEU: 'Alemania', ITA: 'Italia',
  ESP: 'España', JPN: 'Japón', KOR: 'Corea del Sur', CHL: 'Chile', URY: 'Uruguay', BRA: 'Brasil', CHE: 'Suiza', NLD: 'Países Bajos', BEL: 'Bélgica', DNK: 'Dinamarca',
  IRL: 'Irlanda', NOR: 'Noruega', SWE: 'Suecia',
};

/* ---------- banderas simples en SVG (sin depender de emojis) ---------- */
export const Flag: React.FC<{iso: string; w?: number}> = ({iso, w = 64}) => {
  const h = w * 0.66;
  const stripes = (cols: string[], vertical = false) => (
    <>
      {cols.map((c, i) =>
        vertical ? <rect key={i} x={(w / cols.length) * i} y={0} width={w / cols.length + 0.5} height={h} fill={c} /> : <rect key={i} x={0} y={(h / cols.length) * i} width={w} height={h / cols.length + 0.5} fill={c} />,
      )}
    </>
  );
  let body: React.ReactNode;
  switch (iso) {
    case 'ARG':
      body = (<>{stripes(['#74ACDF', '#FFFFFF', '#74ACDF'])}<circle cx={w / 2} cy={h / 2} r={h * 0.12} fill="#F6B40E" /></>);
      break;
    case 'USA':
      body = (<>{Array.from({length: 7}).map((_, i) => <rect key={i} x={0} y={(h / 7) * i} width={w} height={h / 14} fill="#B22234" />)}<rect x={0} y={0} width={w * 0.42} height={h * 0.54} fill="#3C3B6E" /></>);
      break;
    case 'GBR':
      body = (<><rect width={w} height={h} fill="#012169" /><path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#fff" strokeWidth={h * 0.2} /><path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#C8102E" strokeWidth={h * 0.07} /><path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#fff" strokeWidth={h * 0.32} /><path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#C8102E" strokeWidth={h * 0.18} /></>);
      break;
    case 'AUS':
    case 'NZL':
      body = (<><rect width={w} height={h} fill="#012169" /><g transform={`scale(0.5)`}><path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#fff" strokeWidth={h * 0.2} /><path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#fff" strokeWidth={h * 0.32} /><path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#C8102E" strokeWidth={h * 0.18} /></g>{[[0.75, 0.3], [0.68, 0.55], [0.82, 0.62], [0.75, 0.82]].map(([x, y], i) => <circle key={i} cx={w * x} cy={h * y} r={h * 0.05} fill={iso === 'AUS' ? '#fff' : '#C8102E'} stroke="#fff" strokeWidth={iso === 'NZL' ? 1.5 : 0} />)}{iso === 'AUS' ? <circle cx={w * 0.25} cy={h * 0.75} r={h * 0.09} fill="#fff" /> : null}</>);
      break;
    case 'CAN':
      body = (<>{stripes(['#D52B1E', '#FFFFFF', '#FFFFFF', '#D52B1E'], true)}<path d={`M${w / 2} ${h * 0.2} L${w * 0.56} ${h * 0.42} L${w * 0.66} ${h * 0.38} L${w * 0.6} ${h * 0.6} L${w * 0.52} ${h * 0.62} L${w * 0.52} ${h * 0.8} L${w * 0.48} ${h * 0.8} L${w * 0.48} ${h * 0.62} L${w * 0.4} ${h * 0.6} L${w * 0.34} ${h * 0.38} L${w * 0.44} ${h * 0.42} Z`} fill="#D52B1E" /></>);
      break;
    case 'CHE':
      body = (<><rect width={w} height={h} fill="#D52B1E" /><rect x={w * 0.42} y={h * 0.2} width={w * 0.16} height={h * 0.6} fill="#fff" /><rect x={w * 0.3} y={h * 0.4} width={w * 0.4} height={h * 0.2} fill="#fff" /></>);
      break;
    case 'FRA': body = stripes(['#0055A4', '#FFFFFF', '#EF4135'], true); break;
    case 'ITA': body = stripes(['#009246', '#FFFFFF', '#CE2B37'], true); break;
    case 'BEL': body = stripes(['#000000', '#FDDA24', '#EF3340'], true); break;
    case 'IRL': body = stripes(['#169B62', '#FFFFFF', '#FF883E'], true); break;
    case 'DEU': body = stripes(['#000000', '#DD0000', '#FFCE00']); break;
    case 'NLD': body = stripes(['#AE1C28', '#FFFFFF', '#21468B']); break;
    case 'ESP': body = (<>{stripes(['#AA151B', '#F1BF00', '#F1BF00', '#AA151B'])}</>); break;
    case 'JPN': body = (<><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="#BC002D" /></>); break;
    case 'KOR': body = (<><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.25} fill="#0047A0" /><path d={`M${w / 2 - h * 0.25} ${h / 2} A${h * 0.25} ${h * 0.25} 0 0 1 ${w / 2 + h * 0.25} ${h / 2} Z`} fill="#CD2E3A" /></>); break;
    case 'CHL': body = (<><rect width={w} height={h / 2} fill="#fff" /><rect y={h / 2} width={w} height={h / 2} fill="#D52B1E" /><rect width={w / 3} height={h / 2} fill="#0039A6" /><circle cx={w / 6} cy={h / 4} r={h * 0.08} fill="#fff" /></>); break;
    case 'URY': body = (<>{Array.from({length: 9}).map((_, i) => <rect key={i} y={(h / 9) * i} width={w} height={h / 9 + 0.5} fill={i % 2 ? '#0038A8' : '#fff'} />)}<rect width={w * 0.38} height={h * 0.55} fill="#fff" /><circle cx={w * 0.19} cy={h * 0.27} r={h * 0.13} fill="#FCD116" /></>); break;
    case 'BRA': body = (<><rect width={w} height={h} fill="#009C3B" /><path d={`M${w / 2} ${h * 0.1} L${w * 0.9} ${h / 2} L${w / 2} ${h * 0.9} L${w * 0.1} ${h / 2} Z`} fill="#FFDF00" /><circle cx={w / 2} cy={h / 2} r={h * 0.2} fill="#002776" /></>); break;
    case 'DNK': body = (<><rect width={w} height={h} fill="#C8102E" /><rect x={w * 0.3} width={w * 0.12} height={h} fill="#fff" /><rect y={h * 0.43} width={w} height={h * 0.14} fill="#fff" /></>); break;
    case 'NOR': body = (<><rect width={w} height={h} fill="#BA0C2F" /><rect x={w * 0.28} width={w * 0.18} height={h} fill="#fff" /><rect y={h * 0.38} width={w} height={h * 0.24} fill="#fff" /><rect x={w * 0.32} width={w * 0.1} height={h} fill="#00205B" /><rect y={h * 0.44} width={w} height={h * 0.12} fill="#00205B" /></>); break;
    case 'SWE': body = (<><rect width={w} height={h} fill="#006AA7" /><rect x={w * 0.3} width={w * 0.14} height={h} fill="#FECC00" /><rect y={h * 0.42} width={w} height={h * 0.16} fill="#FECC00" /></>); break;
    default: body = <rect width={w} height={h} fill="#888" />;
  }
  return (
    <svg width={w} height={h} style={{borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.35)', flexShrink: 0, display: 'block'}}>
      <defs><clipPath id={`fc-${iso}-${w}`}><rect width={w} height={h} rx={4} /></clipPath></defs>
      <g clipPath={`url(#fc-${iso}-${w})`}>{body}</g>
    </svg>
  );
};

/* ---------- tablero de ranking que se reordena ---------- */
export type Row = {iso: string; v: number};
/** muestra `a` y, desde tSwap, anima hacia `b` (cada fila viaja a su nuevo puesto) */
export const Board: React.FC<{t: number; t0: number; a: Row[]; b?: Row[]; tSwap?: number; w?: number; rowH?: number; max: number; hi?: string; title?: string; n?: number; dark?: boolean}> = ({
  t, t0, a, b, tSwap = Infinity, w = 1100, rowH = 92, max, hi = 'ARG', n = 6,
}) => {
  const k = b ? easeInOut(clamp((t - tSwap) / 1.4)) : 0;
  const all = Array.from(new Set([...a.map((r) => r.iso), ...(b ?? []).map((r) => r.iso)]));
  const pos = (list: Row[], iso: string) => {
    const i = list.findIndex((r) => r.iso === iso);
    return i < 0 ? {i: n + 1, v: 0} : {i, v: list[i].v};
  };
  return (
    <div style={{position: 'relative', width: w, height: rowH * n}}>
      {all.map((iso) => {
        const pa = pos(a, iso), pb = b ? pos(b, iso) : pa;
        const i = pa.i + (pb.i - pa.i) * k;
        const v = pa.v + (pb.v - pa.v) * k;
        const vis = Math.min(1, n - i + 0.2);
        if (vis <= 0) return null;
        const appear = prog(t, t0 + pa.i * 0.12, 0.6);
        const isHi = iso === hi;
        const bw = (v / max) * (w - 420) * easeOut(clamp((t - t0 - pa.i * 0.12) / 1.0));
        const rank = Math.round(i) + 1;
        const lift = isHi && b ? Math.sin(Math.PI * k) * 30 : 0;
        return (
          <div key={iso} style={{position: 'absolute', left: 0, top: i * rowH - lift, width: w, height: rowH - 14, display: 'flex', alignItems: 'center', gap: 18, opacity: appear * clamp(vis), transform: `translateX(${(1 - appear) * -60}px) scale(${isHi && b ? 1 + Math.sin(Math.PI * k) * 0.04 : 1})`, zIndex: isHi ? 5 : 1}}>
            <div style={{width: 64, fontFamily: FONT.head, fontSize: 52, color: isHi ? R.goldHi : 'rgba(255,255,255,0.55)', textAlign: 'right'}}>{rank}</div>
            <Flag iso={iso} w={70} />
            <div style={{width: 250, fontFamily: FONT.body, fontWeight: 800, fontSize: 32, color: isHi ? R.goldHi : R.cream, whiteSpace: 'nowrap'}}>{NAME[iso]}</div>
            <div style={{position: 'relative', height: rowH - 40, width: Math.max(bw, 4), borderRadius: 6, background: isHi ? `linear-gradient(90deg, ${R.goldDeep}, ${R.gold} 60%, ${R.goldHi})` : 'linear-gradient(90deg, rgba(120,189,240,0.35), rgba(120,189,240,0.7))', boxShadow: isHi ? `0 0 30px rgba(227,179,76,0.55)` : 'none'}}>
              <div style={{position: 'absolute', left: '100%', marginLeft: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: isHi ? R.goldHi : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap'}}>US$ {fmt(v)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- carrera de líneas (PBI per cápita en el tiempo) ---------- */
export const LineRace: React.FC<{
  t: number; t0: number; dur: number; isos: string[]; y0: number; y1: number; w?: number; h?: number; log?: boolean; hi?: string; vmax?: number; events?: {y: number; label: string}[]; hold?: number; colors?: Record<string, string>; ratio?: string; yearTo?: number;
}> = ({t, t0, dur, isos, y0, y1, w = 1500, h = 700, log = true, hi = 'ARG', vmax = 70000, events = [], colors = {}, ratio, yearTo}) => {
  const k = easeInOut(clamp((t - t0) / dur));
  const yNow = yearTo != null ? Math.min(yearTo, y0 + (y1 - y0) * k) : y0 + (y1 - y0) * k;
  const vmin = 1500;
  const X = (y: number) => ((y - y0) / (y1 - y0)) * w;
  const Y = (v: number) => (log ? h - ((Math.log(v) - Math.log(vmin)) / (Math.log(vmax) - Math.log(vmin))) * h : h - (v / vmax) * h);
  const col = (iso: string) => colors[iso] ?? (iso === hi ? R.gold : 'rgba(120,189,240,0.9)');
  const ticks = log ? [2000, 5000, 10000, 20000, 50000] : [10000, 20000, 30000, 40000, 50000, 60000];
  return (
    <svg width={w + 260} height={h + 70} style={{overflow: 'visible'}}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={0} x2={w} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 8" />
          <text x={-16} y={Y(v) + 8} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily="JetBrains Mono" fontSize={20}>{fmt(v / 1000)}k</text>
        </g>
      ))}
      {Array.from({length: Math.floor((y1 - y0) / 25) + 1}).map((_, i) => {
        const y = Math.ceil(y0 / 25) * 25 + i * 25;
        if (y > y1) return null;
        return <text key={y} x={X(y)} y={h + 44} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontFamily="JetBrains Mono" fontSize={20}>{y}</text>;
      })}
      {events.map((e, i) => {
        if (yNow < e.y) return null;
        const o = clamp((yNow - e.y) / 3);
        return (
          <g key={i} opacity={o}>
            <line x1={X(e.y)} x2={X(e.y)} y1={0} y2={h} stroke={R.red} strokeWidth={2} strokeDasharray="6 6" />
            <text x={X(e.y) + 10} y={24 + (i % 2) * 34} fill={R.red} fontFamily="Inter" fontWeight={800} fontSize={22}>{e.label}</text>
          </g>
        );
      })}
      {isos.map((iso) => {
        const pts: string[] = [];
        let last: [number, number] | null = null;
        for (let y = y0; y <= yNow; y += 1) {
          const v = val(iso, y);
          if (v == null) continue;
          const p: [number, number] = [X(y), Y(v)];
          pts.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
          last = p;
        }
        const vEnd = val(iso, yNow);
        if (vEnd != null) { last = [X(yNow), Y(vEnd)]; pts.push(`${last[0].toFixed(1)},${last[1].toFixed(1)}`); }
        const isHi = iso === hi;
        return (
          <g key={iso}>
            {isHi ? <polyline points={pts.join(' ')} fill="none" stroke={R.gold} strokeWidth={16} opacity={0.18} strokeLinejoin="round" /> : null}
            <polyline points={pts.join(' ')} fill="none" stroke={col(iso)} strokeWidth={isHi ? 7 : 4.5} strokeLinejoin="round" strokeLinecap="round" />
            {last ? (
              <g transform={`translate(${last[0]}, ${last[1]})`}>
                <circle r={isHi ? 11 : 8} fill={col(iso)} />
                <foreignObject x={18} y={-22} width={240} height={44}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: col(iso), whiteSpace: 'nowrap'}}>
                    <Flag iso={iso} w={36} />
                    {NAME[iso]}
                  </div>
                </foreignObject>
              </g>
            ) : null}
          </g>
        );
      })}
      <text x={w} y={-24} textAnchor="end" fill={R.goldHi} fontFamily="Anton" fontSize={64}>{Math.floor(yNow)}</text>
      {ratio ? <text x={0} y={-24} fill="rgba(255,255,255,0.6)" fontFamily="Inter" fontWeight={700} fontSize={22} letterSpacing={2}>{ratio}</text> : null}
    </svg>
  );
};

/* ---------- escalera del ranking: la ficha argentina baja puesto a puesto ---------- */
export const RankFall: React.FC<{t: number; t0: number; stops: {year: number; rank: number; n: number}[]; step?: number; h?: number; w?: number}> = ({t, t0, stops, step = 1.2, h = 760, w = 1500}) => {
  const maxR = 70;
  const Y = (r: number) => ((r - 1) / (maxR - 1)) * h;
  const kf = clamp((t - t0) / step, 0, stops.length - 1);
  const i0 = Math.floor(kf), i1 = Math.min(stops.length - 1, i0 + 1);
  const f = easeInOut(kf - i0);
  const r = stops[i0].rank + (stops[i1].rank - stops[i0].rank) * f;
  const X = (i: number) => (i / (stops.length - 1)) * (w - 200) + 100;
  const x = X(i0) + (X(i1) - X(i0)) * f;
  return (
    <div style={{position: 'relative', width: w, height: h + 120}}>
      {[1, 10, 20, 30, 40, 50, 60, 70].map((q) => (
        <div key={q} style={{position: 'absolute', left: 0, right: 0, top: Y(q), height: 0, borderTop: '1.5px dashed rgba(255,255,255,0.12)'}}>
          <span style={{position: 'absolute', left: -70, top: -14, fontFamily: FONT.mono, fontSize: 22, color: 'rgba(255,255,255,0.45)'}}>#{q}</span>
        </div>
      ))}
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polyline
          points={stops.slice(0, i0 + 1).map((s, i) => `${X(i)},${Y(s.rank)}`).concat([`${x},${Y(r)}`]).join(' ')}
          fill="none" stroke={R.red} strokeWidth={6} strokeLinejoin="round"
        />
      </svg>
      {stops.map((s, i) =>
        i <= kf + 0.001 ? (
          <div key={i} style={{position: 'absolute', left: X(i) - 90, top: Y(s.rank) + (i === 0 ? -86 : 22), width: 180, textAlign: 'center', opacity: prog(t, t0 + i * step, 0.4)}}>
            <div style={{fontFamily: FONT.head, fontSize: 40, color: R.cream}}>{s.year}</div>
            <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.55)'}}>de {s.n} países</div>
          </div>
        ) : null,
      )}
      <div style={{position: 'absolute', left: x - 70, top: Y(r) - 40, width: 140, height: 80, borderRadius: 40, background: R.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 0 40px rgba(227,179,76,0.7)'}}>
        <Flag iso="ARG" w={40} />
        <span style={{fontFamily: FONT.head, fontSize: 44, color: R.ink}}>#{Math.round(r)}</span>
      </div>
    </div>
  );
};

/* ---------- mapa del mundo con rutas animadas ---------- */
const WORLD = c110 as any;
export const WorldArcs: React.FC<{
  t: number; t0: number; arcs: {from: [number, number]; to: [number, number]; color?: string; at?: number; n?: number}[]; hi?: Record<string, string>; scale?: number; center?: [number, number]; w?: number; h?: number; land?: string; pulse?: [number, number][];
}> = ({t, t0, arcs, hi = {}, scale = 330, center = [-20, 5], w = 1920, h = 1080, land = '#1D2B45', pulse = []}) => {
  const proj = useMemo(() => geoNaturalEarth1().scale(scale).center(center as [number, number]).translate([w / 2, h / 2]), [scale, center[0], center[1], w, h]);
  const path = geoPath(proj);
  return (
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {WORLD.features.map((f: any, i: number) => (
        <path key={i} d={path(f) ?? ''} fill={hi[f.properties.a3] ?? land} stroke="rgba(170,200,240,0.25)" strokeWidth={1} />
      ))}
      {arcs.map((a, i) => {
        const st = t0 + (a.at ?? i * 0.25);
        const k = easeInOut(clamp((t - st) / 1.6));
        if (k <= 0) return null;
        const interp = geoInterpolate(a.from, a.to);
        const N = 60;
        const pts: string[] = [];
        for (let j = 0; j <= N * k; j++) {
          const [lon, lat] = interp(j / N);
          const p = proj([lon, lat])!;
          const lift = Math.sin((j / N) * Math.PI) * 90;
          pts.push(`${p[0]},${p[1] - lift}`);
        }
        const color = a.color ?? R.gold;
        // "barcos" (puntos) viajando por la ruta en loop
        const dots = Array.from({length: a.n ?? 3}).map((_, d) => {
          const u = ((t - st) * 0.35 + d / (a.n ?? 3)) % 1;
          if (k < 1 || t < st) return null;
          const [lon, lat] = interp(u);
          const p = proj([lon, lat])!;
          const lift = Math.sin(u * Math.PI) * 90;
          return <circle key={d} cx={p[0]} cy={p[1] - lift} r={6} fill={R.cream} />;
        });
        return (
          <g key={i}>
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={10} opacity={0.2} strokeLinecap="round" />
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
            {dots}
          </g>
        );
      })}
      {pulse.map((p, i) => {
        const q = proj(p)!;
        const ph = ((t * 0.8 + i * 0.3) % 1);
        return (
          <g key={'p' + i}>
            <circle cx={q[0]} cy={q[1]} r={10 + ph * 50} fill="none" stroke={R.goldHi} strokeWidth={3} opacity={1 - ph} />
            <circle cx={q[0]} cy={q[1]} r={9} fill={R.goldHi} />
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- Argentina con el abanico ferroviario que crece desde los puertos ---------- */
const PROV = prov as any;
const SA = {type: 'FeatureCollection', features: (c50 as any).features.filter((f: any) => f.properties.c === 'South America' && f.properties.a3 !== 'ARG')};
// trazados aproximados de las troncales (lon, lat) que salían de los puertos de Buenos Aires, Rosario y Bahía Blanca
export const RAILS: [number, number][][] = [
  [[-58.38, -34.6], [-59.13, -34.57], [-60.0, -34.6], [-61.9, -34.0], [-63.4, -33.8], [-64.35, -33.12], [-66.3, -33.3], [-68.83, -32.89]],
  [[-58.38, -34.6], [-59.2, -34.2], [-60.64, -32.95], [-62.1, -32.6], [-63.2, -32.4], [-64.18, -31.42], [-64.8, -29.4], [-65.2, -26.82], [-65.4, -24.78]],
  [[-60.64, -32.95], [-60.7, -31.63], [-61.3, -29.8], [-60.7, -28.2], [-59.0, -27.45]],
  [[-58.38, -34.6], [-58.0, -35.6], [-57.55, -38.0]],
  [[-58.38, -34.6], [-59.1, -35.2], [-60.3, -36.3], [-61.5, -37.6], [-62.27, -38.72]],
  [[-62.27, -38.72], [-64.3, -38.9], [-66.2, -38.95], [-68.06, -38.95]],
  [[-58.38, -34.6], [-60.95, -35.45], [-62.4, -35.9], [-64.29, -36.62], [-65.4, -36.7]],
  [[-60.64, -32.95], [-61.2, -33.9], [-62.0, -35.0]],
  [[-58.38, -34.6], [-58.5, -33.0], [-58.6, -31.4], [-58.02, -29.2], [-56.0, -27.4]],
  [[-64.18, -31.42], [-65.8, -31.3], [-66.85, -29.4], [-67.4, -28.4]],
];
export const RailFan: React.FC<{t: number; t0: number; dur?: number; box?: [number, number, number, number]; land?: string}> = ({t, t0, dur = 4, box = [560, 60, 1360, 1030], land = '#E8D9B8'}) => {
  const proj = useMemo(() => geoMercator().fitExtent([[box[0], box[1]], [box[2], box[3]]], {type: 'FeatureCollection', features: PROV.features.filter((f: any) => f.properties.n !== 'Tierra del Fuego')} as any), [box.join(',')]);
  const path = geoPath(proj);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {SA.features.map((f: any, i: number) => <path key={'s' + i} d={path(f) ?? ''} fill="rgba(110,82,48,0.10)" stroke="rgba(110,82,48,0.3)" strokeWidth={1.2} />)}
      {PROV.features.map((f: any, i: number) => <path key={i} d={path(f) ?? ''} fill={land} stroke="rgba(110,82,48,0.55)" strokeWidth={1.4} />)}
      {RAILS.map((line, i) => {
        const k = clamp((t - t0 - i * (dur / RAILS.length) * 0.5) / (dur * 0.6));
        if (k <= 0) return null;
        const pts = line.map((p) => proj(p)!);
        // longitud y recorte progresivo
        const segL = pts.slice(1).map((p, j) => Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1]));
        const L = segL.reduce((a, b) => a + b, 0);
        let rem = L * easeOut(k);
        const out: [number, number][] = [pts[0]];
        for (let j = 0; j < segL.length && rem > 0; j++) {
          const f = Math.min(1, rem / segL[j]);
          out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
          rem -= segL[j];
        }
        const d = out.map((p) => p.join(',')).join(' ');
        return (
          <g key={i}>
            <polyline points={d} fill="none" stroke={R.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={d} fill="none" stroke={R.paper} strokeWidth={2.2} strokeDasharray="7 7" strokeLinejoin="round" />
          </g>
        );
      })}
      {[[-58.38, -34.6, 'Buenos Aires'], [-60.64, -32.95, 'Rosario'], [-62.27, -38.72, 'Bahía Blanca']].map(([lon, lat, n], i) => {
        const p = proj([lon as number, lat as number])!;
        return (
          <g key={'c' + i} opacity={prog(t, t0 + 0.3 + i * 0.3, 0.5)}>
            <circle cx={p[0]} cy={p[1]} r={13} fill={R.red} stroke={R.paper} strokeWidth={4} />
            <text x={p[0] + 22} y={p[1] + 9} fontFamily="Playfair Display" fontWeight={800} fontSize={30} fill={R.ink}>{n}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- grilla de personitas (1 de cada 3) ---------- */
export const People: React.FC<{t: number; t0: number; n?: number; cols?: number; hiEvery?: number; size?: number; color?: string; hiColor?: string}> = ({t, t0, n = 30, cols = 10, hiEvery = 3, size = 70, color = 'rgba(23,19,14,0.3)', hiColor = R.red}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: size * 0.28}}>
    {Array.from({length: n}).map((_, i) => {
      const a = prog(t, t0 + i * 0.03, 0.4);
      const hi = i % hiEvery === hiEvery - 1 && t > t0 + 1.2 + (i / n) * 0.8;
      return (
        <svg key={i} width={size} height={size * 1.3} viewBox="0 0 40 52" style={{opacity: a, transform: `translateY(${(1 - a) * 20}px) scale(${hi ? 1.08 : 1})`}}>
          <circle cx={20} cy={11} r={9} fill={hi ? hiColor : color} />
          <path d="M4 50 Q4 24 20 24 Q36 24 36 50 Z" fill={hi ? hiColor : color} />
        </svg>
      );
    })}
  </div>
);

export const seedR = rnd;
