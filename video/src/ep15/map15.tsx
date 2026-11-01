/* Mapas del ep15 con datos reales: países (Natural Earth 1:50 m), provincias argentinas, ríos (Natural Earth 10 m; el
   Paraguay va trazado a mano sobre la frontera porque NE no lo trae) y el contorno del Parque Nacional El
   Impenetrable (OpenStreetMap). Estilo «tablero de investigación»: tierra casi negra, ríos de acero, rutas rojas o
   ámbar que se dibujan, pines que laten. La vista (centro y escala de una Mercator) se anima con viewPath. */
import React, {useLayoutEffect, useRef} from 'react';
import {useVideoConfig} from 'remotion';
import {geoMercator, geoOrthographic, geoPath, geoInterpolate, geoGraticule10, type GeoProjection} from 'd3-geo';
import {clamp, easeInOut, prog, rnd} from '../lib/anim';
import geo from '../data/ep15/geo15.json';
import world from '../data/ep04/countries50.json';
import provs from '../data/ep04/arg_provincias.json';
import {K, F} from './kit';

export type LonLat = [number, number];
const G = geo as unknown as {paises: Record<string, LonLat[][][]>; rios: Record<string, LonLat[][]>; puntos: Record<string, LonLat>; parque: LonLat[]};
export const PT = G.puntos;
export const PARQUE = G.parque;
export type View = {lon: number; lat: number; scale: number};
export const lerpView = (a: View, b: View, k: number): View => {
  const kk = easeInOut(clamp(k));
  return {lon: a.lon + (b.lon - a.lon) * kk, lat: a.lat + (b.lat - a.lat) * kk, scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * kk)};
};
/** vista por tramos: [[t, view], ...]; desde cada t, transición de dur segundos */
export const viewPath = (t: number, keys: [number, View][], dur = 1.8): View => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, vk] = keys[i];
    const k = clamp((t - tk) / dur);
    if (k > 0) v = lerpView(v, vk, k);
  }
  return v;
};
/** un polígono real llevado a otro lugar conservando su tamaño en km (para comparar superficies) */
export const moveShape = (ring: LonLat[], to: LonLat): LonLat[] => {
  const c = ring.reduce((s, p) => [s[0] + p[0] / ring.length, s[1] + p[1] / ring.length], [0, 0]);
  const k0 = Math.cos((c[1] * Math.PI) / 180), k1 = Math.cos((to[1] * Math.PI) / 180);
  return ring.map(([x, y]) => [to[0] + ((x - c[0]) * k0) / k1, to[1] + (y - c[1])] as LonLat);
};
/** cuadrado de lado km centrado en un punto (250.000 ha = 50 × 50 km) */
export const squareKm = (c: LonLat, km: number): LonLat[] => {
  const dl = km / 2 / (111.32 * Math.cos((c[1] * Math.PI) / 180)), dp = km / 2 / 110.57;
  return [[c[0] - dl, c[1] - dp], [c[0] + dl, c[1] - dp], [c[0] + dl, c[1] + dp], [c[0] - dl, c[1] + dp], [c[0] - dl, c[1] - dp]];
};
export const LUX = (G.paises.LUX[0][0]) as LonLat[];

/** arco entre dos puntos (para un vuelo): curva que sube y vuelve */
export const arcRoute = (a: LonLat, b: LonLat, h = 0.25, n = 48): LonLat[] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  return Array.from({length: n + 1}, (_, i) => {
    const u = i / n, s = Math.sin(u * Math.PI) * h * L;
    return [a[0] + dx * u - (dy / L) * s, a[1] + dy * u + (dx / L) * s] as LonLat;
  });
};
/** curva suave entre puntos (Catmull-Rom) para rutas terrestres */
export const smoothRoute = (pts: LonLat[], n = 20): LonLat[] => {
  const out: LonLat[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export type Route = {pts: LonLat[]; p: number; color?: string; width?: number; dash?: boolean; o?: number; head?: boolean; label?: string; labelAt?: number};
export type Pin = {at: LonLat; label?: string; sub?: string; o: number; color?: string; dx?: number; dy?: number; size?: number; align?: 'left' | 'right'; pulse?: boolean; dot?: boolean};
export type Area = {ring: LonLat[]; o: number; fill?: string; stroke?: string; p?: number; label?: string; labelAt?: LonLat; dash?: boolean; width?: number};
export type MapLabel = {at: LonLat; text: string; o: number; size?: number; color?: string; rot?: number; spacing?: number; italic?: boolean};

const COUNTRY_LABELS: [string, LonLat, number][] = [
  ['PARAGUAY', [-58.2, -23.2], 1], ['BRASIL', [-53.2, -24.3], 1], ['BOLIVIA', [-63.6, -20.4], 1], ['ARGENTINA', [-63.6, -30.6], 1.2], ['URUGUAY', [-56.0, -32.8], 0.9], ['CHILE', [-70.4, -29.5], 0.9],
];
const RIVER_LABELS: [string, LonLat, number][] = [
  ['RÍO PARANÁ', [-58.25, -27.62], 4], ['RÍO BERMEJO', [-60.2, -25.95], -38], ['RÍO PILCOMAYO', [-59.4, -24.25], -28], ['RÍO PARAGUAY', [-57.45, -24.35], -70], ['RÍO URUGUAY', [-56.6, -29.6], -48],
];

/** el mapa. Todo en coordenadas reales; el cuadro se adapta al formato (horizontal o vertical) */
export const Map15: React.FC<{
  t: number; view: View; countriesO?: number; provO?: number; riversO?: number; gridO?: number; labelsO?: number; riverLabelsO?: number;
  hi?: string[]; hiProv?: string[]; routes?: Route[]; pins?: Pin[]; areas?: Area[]; labels?: MapLabel[]; children?: (proj: GeoProjection) => React.ReactNode;
}> = ({t, view, countriesO = 1, provO = 0.5, riversO = 1, gridO = 0.5, labelsO = 1, riverLabelsO = 0.8, hi = [], hiProv = [], routes = [], pins = [], areas = [], labels = [], children}) => {
  const {width: W, height: H} = useVideoConfig();
  // precision(0): sin remuestreo adaptativo (con zoom grande generaba millones de puntos); clipExtent: sólo lo visible
  const proj = geoMercator().center([view.lon, view.lat]).scale(view.scale).translate([W / 2, H / 2]).precision(0).clipExtent([[-60, -60], [W + 60, H + 60]]);
  const path = geoPath(proj);
  const v = H > W;
  const line = (pts: LonLat[]) => pts.map((p, i) => { const q = proj(p) as [number, number]; return `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }).join(' ');
  const polyLen = (pts: LonLat[]) => { let L = 0; let a = proj(pts[0]) as [number, number]; for (let i = 1; i < pts.length; i++) { const b = proj(pts[i]) as [number, number]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); a = b; } return L; };
  const along = (pts: LonLat[], k: number): [number, number, number] => {
    const P = pts.map((p) => proj(p) as [number, number]);
    const Ls = [0]; for (let i = 1; i < P.length; i++) Ls.push(Ls[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const tg = Ls[Ls.length - 1] * clamp(k);
    for (let i = 1; i < P.length; i++) if (Ls[i] >= tg) { const f = (tg - Ls[i - 1]) / Math.max(1e-6, Ls[i] - Ls[i - 1]); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f, Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])]; }
    const n = P.length - 1; return [P[n][0], P[n][1], Math.atan2(P[n][1] - P[n - 1][1], P[n][0] - P[n - 1][0])];
  };
  const fs = (s: number) => s * (v ? 1.25 : 1);
  return (
    <>
    <BaseLayer proj={proj} zoom={view.scale} W={W} H={H} countriesO={countriesO} provO={provO} riversO={riversO} gridO={gridO} hi={hi} hiProv={hiProv} />
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {riverLabelsO > 0 && riversO > 0.05
        ? RIVER_LABELS.map(([n, at, rot]) => {
            const p = proj(at) as [number, number];
            if (p[0] < -100 || p[0] > W + 100 || p[1] < -100 || p[1] > H + 100) return null;
            return <text key={n} x={p[0]} y={p[1]} transform={`rotate(${rot} ${p[0]} ${p[1]})`} textAnchor="middle" style={{fontFamily: F.mono, fontSize: fs(15), letterSpacing: 3, fill: 'rgba(120,175,210,0.9)', fontStyle: 'italic'}} opacity={riverLabelsO * riversO}>{n}</text>;
          })
        : null}
      {/* nombres de países */}
      {labelsO > 0
        ? COUNTRY_LABELS.map(([n, at, s]) => {
            const p = proj(at) as [number, number];
            return <text key={n} x={p[0]} y={p[1]} textAnchor="middle" style={{fontFamily: F.mono, fontWeight: 500, fontSize: fs(22 * s), letterSpacing: 12 * s, fill: 'rgba(163,168,170,0.55)'}} opacity={labelsO}>{n}</text>;
          })
        : null}
      {/* áreas (el parque, comparaciones) */}
      {areas.map((a, i) => {
        if (a.o <= 0) return null;
        const d = line(a.ring);
        const L = polyLen(a.ring);
        const p = a.p ?? 1;
        const lp = a.labelAt ? (proj(a.labelAt) as [number, number]) : null;
        return (
          <g key={'a' + i} opacity={a.o}>
            <path d={d} fill={a.fill ?? 'rgba(227,155,71,0.18)'} opacity={prog(p, 0.7, 0.3)} />
            <path d={d} fill="none" stroke={a.stroke ?? K.ember} strokeWidth={(a.width ?? 2.6) * 4} strokeOpacity={0.18} strokeDasharray={a.dash ? '8 6' : `${L} ${L}`} strokeDashoffset={a.dash ? 0 : L * (1 - clamp(p))} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={a.stroke ?? K.ember} strokeWidth={a.width ?? 2.6} strokeDasharray={a.dash ? '8 6' : `${L} ${L}`} strokeDashoffset={a.dash ? 0 : L * (1 - clamp(p))} strokeLinejoin="round" />
            {lp && a.label ? <text x={lp[0]} y={lp[1]} textAnchor="middle" style={{fontFamily: F.mono, fontWeight: 500, fontSize: fs(22), letterSpacing: 3, paintOrder: 'stroke', stroke: '#070A0D', strokeWidth: 5, fill: a.stroke ?? K.ember}} opacity={prog(p, 0.6, 0.4)}>{a.label}</text> : null}
          </g>
        );
      })}
      {/* rutas */}
      {routes.map((r, i) => {
        if ((r.o ?? 1) <= 0 || r.p <= 0) return null;
        const c = r.color ?? K.blood;
        // la parte ya recorrida de la ruta (se corta por longitud en pantalla)
        const P = r.pts.map((q) => proj(q) as [number, number]);
        const Ls = [0]; for (let j = 1; j < P.length; j++) Ls.push(Ls[j - 1] + Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]));
        const tg = Ls[Ls.length - 1] * clamp(r.p);
        const part: [number, number][] = [P[0]];
        for (let j = 1; j < P.length; j++) {
          if (Ls[j] <= tg) { part.push(P[j]); continue; }
          const f = (tg - Ls[j - 1]) / Math.max(1e-6, Ls[j] - Ls[j - 1]);
          part.push([P[j - 1][0] + (P[j][0] - P[j - 1][0]) * f, P[j - 1][1] + (P[j][1] - P[j - 1][1]) * f]);
          break;
        }
        const d = part.map((q, j) => `${j ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
        const n = part.length - 1;
        const hx = part[n][0], hy = part[n][1], ha = n > 0 ? Math.atan2(part[n][1] - part[n - 1][1], part[n][0] - part[n - 1][0]) : 0;
        const lab = r.label ? along(r.pts, r.labelAt ?? 0.5) : null;
        return (
          <g key={'r' + i} opacity={r.o ?? 1}>
            {r.dash ? null : <path d={d} fill="none" stroke={c} strokeWidth={(r.width ?? 4) * 3.5} strokeOpacity={0.2} strokeLinecap="round" strokeLinejoin="round" />}
            <path d={d} fill="none" stroke={c} strokeWidth={r.width ?? 4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r.dash ? '3 11' : undefined} />
            {r.head !== false && r.p < 0.999 ? (
              <g transform={`translate(${hx} ${hy}) rotate(${(ha * 180) / Math.PI})`}>
                <circle r={9} fill={c} opacity={0.35} />
                <path d="M -7 -6 L 7 0 L -7 6 Z" fill={c} />
              </g>
            ) : null}
            {lab && r.label ? <text x={lab[0]} y={lab[1] - 16} textAnchor="middle" style={{fontFamily: F.mono, fontWeight: 500, fontSize: fs(19), letterSpacing: 2.5, fill: c, paintOrder: 'stroke', stroke: '#070A0D', strokeWidth: 5}} opacity={prog(r.p, 0.25, 0.3)}>{r.label}</text> : null}
          </g>
        );
      })}
      {/* rótulos libres */}
      {labels.map((l, i) => {
        if (l.o <= 0) return null;
        const p = proj(l.at) as [number, number];
        return <text key={'l' + i} x={p[0]} y={p[1]} textAnchor="middle" transform={l.rot ? `rotate(${l.rot} ${p[0]} ${p[1]})` : undefined} style={{fontFamily: F.mono, fontWeight: 500, fontSize: fs(l.size ?? 18), letterSpacing: l.spacing ?? 4, fill: l.color ?? K.bone, fontStyle: l.italic ? 'italic' : 'normal'}} opacity={l.o}>{l.text}</text>;
      })}
      {/* pines */}
      {pins.map((p, i) => {
        if (p.o <= 0) return null;
        const [x, y] = proj(p.at) as [number, number];
        const c = p.color ?? K.bone;
        const s = (p.size ?? 1) * (v ? 1.25 : 1);
        const ph = ((t * 0.9 + i * 0.37) % 1);
        const right = (p.align ?? 'right') === 'right';
        const lx = x + (p.dx ?? (right ? 18 : -18)) * s, ly = y + (p.dy ?? 0) * s;
        return (
          <g key={'p' + i} opacity={p.o}>
            {p.pulse !== false ? <circle cx={x} cy={y} r={(8 + ph * 26) * s} fill="none" stroke={c} strokeWidth={2} opacity={(1 - ph) * 0.8} /> : null}
            {p.dot !== false ? <circle cx={x} cy={y} r={6 * s} fill={c} stroke="#070A0D" strokeWidth={2} /> : null}
            {p.label ? (
              <text x={lx} y={ly + 6 * s} textAnchor={right ? 'start' : 'end'} style={{fontFamily: F.title, fontSize: 30 * s, letterSpacing: 1.5, fill: c, paintOrder: 'stroke', stroke: '#070A0D', strokeWidth: 6}}>{p.label}</text>
            ) : null}
            {p.sub ? <text x={lx} y={ly + 32 * s} textAnchor={right ? 'start' : 'end'} style={{fontFamily: F.mono, fontSize: 15 * s, letterSpacing: 2.5, fill: K.ash, paintOrder: 'stroke', stroke: '#070A0D', strokeWidth: 5}}>{p.sub}</text> : null}
          </g>
        );
      })}
      {children ? children(proj) : null}
      <Inset view={view} proj={proj} W={W} H={H} v={v} />
      <text x={v ? 60 : 64} y={H - (v ? 330 : 58)} style={{fontFamily: F.mono, fontSize: v ? 20 : 16, letterSpacing: 3, fill: 'rgba(163,168,170,0.75)'}}>{dms(view.lat, 'S', 'N')} · {dms(view.lon, 'O', 'E')}</text>
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
    </>
  );
};
let DOTS: HTMLCanvasElement | null = null;
const dotsCanvas = (hiC: boolean) => {
  const c = document.createElement('canvas'); c.width = 7; c.height = 7;
  const g = c.getContext('2d')!;
  g.fillStyle = hiC ? 'rgba(227,155,71,0.24)' : 'rgba(238,231,217,0.10)';
  g.beginPath(); g.arc(3.5, 3.5, hiC ? 1.1 : 0.9, 0, Math.PI * 2); g.fill();
  return c;
};
let DOTS_HI: HTMLCanvasElement | null = null;
/** capa fija del mapa (retícula, países, provincias, ríos) dibujada en un canvas: mucho más rápido que el SVG */
const BaseLayer: React.FC<{proj: GeoProjection; zoom: number; W: number; H: number; countriesO: number; provO: number; riversO: number; gridO: number; hi: string[]; hiProv: string[]}> = ({proj, zoom, W, H, countriesO, provO, riversO, gridO, hi, hiProv}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalAlpha = 1; g.fillStyle = '#070A0D'; g.fillRect(0, 0, W, H);
    DOTS = DOTS ?? dotsCanvas(false); DOTS_HI = DOTS_HI ?? dotsCanvas(true);
    const dots = g.createPattern(DOTS, 'repeat')!, dotsHi = g.createPattern(DOTS_HI, 'repeat')!;
    const path = geoPath(proj, g);
    if (gridO > 0) { g.globalAlpha = gridO; g.beginPath(); path(geoGraticule10()); g.strokeStyle = 'rgba(141,176,195,0.08)'; g.lineWidth = 1; g.stroke(); }
    g.globalAlpha = countriesO;
    Object.entries(G.paises).forEach(([k, polys]) => {
      if (k === 'LUX' || k === 'ITA') return;
      g.beginPath(); path({type: 'MultiPolygon', coordinates: polys} as never);
      g.fillStyle = hi.includes(k) ? '#1A2228' : k === 'ARG' ? '#11171C' : '#0D1216'; g.fill();
      g.fillStyle = dots; g.fill();
      // con mucho zoom la frontera de 1:50 m no coincide con los ríos de 1:10 m: se atenúa
      const za = zoom > 15000 ? 0.35 : zoom > 9000 ? 0.65 : 1;
      g.strokeStyle = hi.includes(k) ? `rgba(238,231,217,${0.65 * za})` : `rgba(163,168,170,${0.38 * za})`; g.lineWidth = hi.includes(k) ? 1.8 : 1.2; g.lineJoin = 'round'; g.stroke();
    });
    if (provO > 0) {
      g.globalAlpha = provO;
      (provs as unknown as {features: {properties: {n: string}; geometry: never}[]}).features.forEach((f) => {
        const h = hiProv.includes(f.properties.n);
        g.beginPath(); path(f.geometry);
        if (h) { g.fillStyle = dotsHi; g.fill(); }
        g.strokeStyle = h ? 'rgba(227,155,71,0.7)' : 'rgba(163,168,170,0.28)'; g.lineWidth = h ? 1.6 : 0.8; g.stroke();
      });
    }
    if (riversO > 0) {
      g.globalAlpha = riversO * 0.85; g.strokeStyle = '#4F86A8'; g.lineCap = 'round'; g.lineJoin = 'round';
      Object.entries(G.rios).forEach(([n, ls]) => {
        g.lineWidth = n === 'Paraná' || n === 'Paraguay' ? 3.2 : 2.2;
        ls.forEach((l) => {
          g.beginPath();
          l.forEach((p, i) => { const q = proj(p) as [number, number]; if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); });
          g.stroke();
        });
      });
    }
    g.globalAlpha = 1;
  });
  return <canvas ref={ref} width={Math.round(W * dpr)} height={Math.round(H * dpr)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />;
};
const dms = (x: number, neg: string, pos: string) => {
  const a = Math.abs(x), d = Math.floor(a), m = Math.floor((a - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′ ${x < 0 ? neg : pos}`;
};
/** minimapa de ubicación (Sudamérica austral) con el recuadro de lo que se ve */
const Inset: React.FC<{view: View; proj: GeoProjection; W: number; H: number; v: boolean}> = ({view, proj, W, H, v}) => {
  if (view.scale < 2500) return null;
  const w = v ? 200 : 170, h = v ? 240 : 205, x0 = v ? W - w - 50 : W - w - 56, y0 = v ? H - h - 420 : H - h - 60;
  const ip = geoMercator().center([-62, -32]).scale(v ? 300 : 255).translate([x0 + w / 2, y0 + h / 2]).precision(0);
  const ipath = geoPath(ip);
  const a = proj.invert ? proj.invert([0, 0]) : null, b = proj.invert ? proj.invert([W, H]) : null;
  const pa = a ? (ip(a as [number, number]) as [number, number]) : null, pb = b ? (ip(b as [number, number]) as [number, number]) : null;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill="rgba(5,7,9,0.82)" stroke="rgba(163,168,170,0.35)" strokeWidth={1} />
      <clipPath id="insetClip15"><rect x={x0} y={y0} width={w} height={h} /></clipPath>
      <g clipPath="url(#insetClip15)">
        {['ARG', 'PRY', 'BRA', 'BOL', 'URY', 'CHL'].map((k) => <path key={k} d={ipath({type: 'MultiPolygon', coordinates: G.paises[k]} as never) ?? ''} fill={k === 'ARG' ? '#232B31' : '#141A1F'} stroke="rgba(163,168,170,0.45)" strokeWidth={0.6} />)}
        {pa && pb ? <rect x={Math.min(pa[0], pb[0])} y={Math.min(pa[1], pb[1])} width={Math.max(3, Math.abs(pb[0] - pa[0]))} height={Math.max(3, Math.abs(pb[1] - pa[1]))} fill="rgba(192,53,43,0.25)" stroke={K.blood} strokeWidth={1.6} /> : null}
      </g>
    </g>
  );
};

/** globo que gira de Roma a la Argentina con el arco del viaje (el de Manuel Roseo, a los 21 años) */
export const GlobeArc: React.FC<{t: number; t0: number; from: LonLat; to: LonLat; dur?: number; label?: [string, string]}> = ({t, t0, from, to, dur = 4.5, label}) => {
  const {width: W, height: H} = useVideoConfig();
  const v = H > W;
  const k = easeInOut(clamp((t - t0) / dur));
  const ip = geoInterpolate(from, to);
  const c = ip(clamp(k * 1.05));
  const R = (v ? 0.42 : 0.4) * Math.min(W, H) * (v ? 1.05 : 1.15);
  const proj = geoOrthographic().rotate([-c[0], -c[1] * 0.85]).scale(R).translate([W / 2, H / 2]).clipAngle(90);
  const path = geoPath(proj);
  const arc = {type: 'LineString', coordinates: Array.from({length: 65}, (_, i) => ip((i / 64) * clamp(k * 1.15)))};
  const feats = (world as unknown as {features: {properties: {a3: string}; geometry: never}[]}).features;
  const pf = proj(from), pt = proj(to);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="globe15" cx="40%" cy="35%" r="75%"><stop offset="0%" stopColor="#0E1820" /><stop offset="100%" stopColor="#03060A" /></radialGradient>
        <radialGradient id="halo15" cx="50%" cy="50%" r="50%"><stop offset="86%" stopColor="#4F86A8" stopOpacity={0} /><stop offset="93%" stopColor="#4F86A8" stopOpacity={0.35} /><stop offset="100%" stopColor="#4F86A8" stopOpacity={0} /></radialGradient>
        <filter id="glowG15" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={W} height={H} fill="#050709" />
      <circle cx={W / 2} cy={H / 2} r={R * 1.09} fill="url(#halo15)" />
      <path d={path({type: 'Sphere'} as never) ?? ''} fill="url(#globe15)" stroke="rgba(141,176,195,0.35)" strokeWidth={1.5} />
      <path d={path(geoGraticule10()) ?? ''} fill="none" stroke="rgba(141,176,195,0.08)" strokeWidth={1} />
      {feats.map((f, i) => {
        const a3 = f.properties.a3;
        const hiC = a3 === 'ITA' || a3 === 'ARG';
        return <path key={i} d={path(f.geometry) ?? ''} fill={hiC ? '#4A4F52' : '#262E35'} stroke={hiC ? K.bone : 'rgba(163,168,170,0.45)'} strokeWidth={hiC ? 1.8 : 0.6} />;
      })}
      <path d={path(arc as never) ?? ''} fill="none" stroke={K.ember} strokeWidth={14} strokeOpacity={0.22} strokeLinecap="round" />
      <path d={path(arc as never) ?? ''} fill="none" stroke={K.ember} strokeWidth={4} strokeLinecap="round" />
      {pf ? <circle cx={pf[0]} cy={pf[1]} r={7} fill={K.bone} /> : null}
      {pt && k > 0.95 ? <circle cx={pt[0]} cy={pt[1]} r={7 + 5 * Math.sin(t * 6)} fill={K.ember} /> : null}
      {label && pf ? <text x={pf[0] + 14} y={pf[1] - 12} style={{fontFamily: F.title, fontSize: v ? 40 : 34, fill: K.bone, paintOrder: 'stroke', stroke: '#050709', strokeWidth: 6}} opacity={1 - prog(t, t0 + dur * 0.6, 0.5)}>{label[0]}</text> : null}
      {label && pt ? <text x={pt[0] + 14} y={pt[1] - 12} style={{fontFamily: F.title, fontSize: v ? 40 : 34, fill: K.ember, paintOrder: 'stroke', stroke: '#050709', strokeWidth: 6}} opacity={prog(t, t0 + dur * 0.9, 0.4)}>{label[1]}</text> : null}
    </svg>
  );
};
export {rnd};
