/* Mapas del episodio 14 con datos reales (provincias de ep04, ríos de Natural Earth 10 m): estilo "pergamino" para la
   época colonial (tinta sepia, retícula de grados, rosa de los vientos, rótulos en IM Fell) y estilo "moderno" oscuro
   para hoy (líneas finas, rótulos en Archivo, trazas cian). Vista animable: centro y escala de una Mercator. */
import React from 'react';
import {geoMercator, geoPath, type GeoProjection} from 'd3-geo';
import {clamp, easeInOut, prog, rnd} from '../lib/anim';
import geo from '../data/ep14/geo.json';
import {K, F, ar, fell} from './kit14';

type LonLat = [number, number];
const G = geo as unknown as {provincias: Record<string, LonLat[][][]>; rios: Record<string, LonLat[][]>; puntos: Record<string, LonLat>};
export const PT = G.puntos;
export type View = {lon: number; lat: number; scale: number; rot?: number};
export const mercator = (v: View, cx = 960, cy = 540): GeoProjection => geoMercator().center([v.lon, v.lat]).scale(v.scale).translate([cx, cy]);
export const lerpView = (a: View, b: View, k: number): View => {
  const kk = easeInOut(clamp(k));
  // escala en log para que el zoom se sienta parejo
  return {lon: a.lon + (b.lon - a.lon) * kk, lat: a.lat + (b.lat - a.lat) * kk, scale: Math.exp(Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * kk), rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * kk};
};
/** vista por tramos: [[t, view], ...] con transición de dur segundos desde cada t */
export const viewPath = (t: number, keys: [number, View][], dur = 1.6): View => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, vk] = keys[i];
    const k = clamp((t - tk) / dur);
    if (k > 0) v = lerpView(v, vk, k);
  }
  return v;
};
/** km → grados en una latitud */
export const kmToDeg = (km: number, lat: number): LonLat => [km / (111.32 * Math.cos((lat * Math.PI) / 180)), km / 110.57];
/** elipse del campo de cráteres (18,5 × 3 km, rumbo N 62° E) como anillo de lon/lat */
export const craterField = (c: LonLat = PT['Campo del Cielo'], a = 9.25, b = 1.5, az = 62, n = 72): LonLat[] => {
  const th = ((90 - az) * Math.PI) / 180;
  const [dx, dy] = kmToDeg(1, c[1]);
  return Array.from({length: n + 1}, (_, i) => {
    const u = (i / n) * Math.PI * 2;
    const x = a * Math.cos(u), y = b * Math.sin(u);
    return [c[0] + (x * Math.cos(th) - y * Math.sin(th)) * dx, c[1] + (x * Math.sin(th) + y * Math.cos(th)) * dy] as LonLat;
  });
};
/** punto a lo largo de una polilínea (para la punta de una ruta que se dibuja) */
const along = (pts: [number, number][], k: number): [number, number] => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = L[L.length - 1] * clamp(k);
  for (let i = 1; i < pts.length; i++)
    if (L[i] >= target) {
      const f = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    }
  return pts[pts.length - 1];
};
/** curva suave entre puntos (Catmull-Rom → muestras) para que las rutas no se vean como líneas rectas de regla */
export const smoothRoute = (pts: LonLat[], wobble = 0.06, seed = 1): LonLat[] => {
  const out: LonLat[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const u = k / 24, u2 = u * u, u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      const w = Math.sin(u * Math.PI) * wobble * (rnd(seed + i) - 0.5);
      out.push([f(p0[0], p1[0], p2[0], p3[0]) + w, f(p0[1], p1[1], p2[1], p3[1]) - w * 0.6]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export type Route14 = {pts: LonLat[]; p: number; color?: string; width?: number; dash?: string; label?: string; labelAt?: number; head?: boolean};
export type Mark14 = {at: LonLat; label?: string; o: number; kind?: 'town' | 'iron' | 'pin' | 'x' | 'q' | 'dot'; dx?: number; dy?: number; size?: number; color?: string; italic?: boolean; pulse?: number};
export type Area14 = {ring: LonLat[]; o: number; fill?: string; stroke?: string; label?: string; dash?: string};

/** mapa con datos reales. style 'old' = pergamino; 'modern' = oscuro. provO/riverO/gridO: opacidades de capas */
export const Map14: React.FC<{
  t: number; view: View; style?: 'old' | 'modern'; provO?: number; riverO?: number; gridO?: number; prov?: string[]; fills?: Record<string, string>; rivers?: string[]; riverLabels?: boolean;
  routes?: Route14[]; marks?: Mark14[]; areas?: Area14[]; regionLabels?: {at: LonLat; text: string; o: number; size?: number; rot?: number}[]; border?: {o: number; p: number; color?: string}; children?: (proj: GeoProjection) => React.ReactNode;
}> = ({t, view, style = 'old', provO = 1, riverO = 1, gridO = 1, prov, fills = {}, rivers = ['Salado', 'Dulce', 'Bermejo', 'Paraná'], riverLabels = true, routes = [], marks = [], areas = [], regionLabels = [], border, children}) => {
  const proj = mercator(view);
  const path = geoPath(proj);
  const old = style === 'old';
  const inkC = old ? 'rgba(52,36,20,0.78)' : 'rgba(226,232,245,0.42)';
  const waterC = old ? 'rgba(52,84,110,0.75)' : 'rgba(110,180,255,0.62)';
  const names = prov ?? Object.keys(G.provincias);
  const line = (pts: LonLat[]) => {
    const pp = pts.map((p) => proj(p) as [number, number]);
    return pp.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  };
  // retícula de grados
  const grid: React.ReactNode[] = [];
  if (gridO > 0) {
    for (let lon = -70; lon <= -54; lon++) {
      const a = proj([lon, -36]) as [number, number], b = proj([lon, -20]) as [number, number];
      grid.push(<line key={'lo' + lon} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={old ? 'rgba(80,56,30,0.22)' : 'rgba(150,180,230,0.1)'} strokeWidth={lon % 5 === 0 ? 1.4 : 0.8} />);
    }
    for (let lat = -36; lat <= -20; lat++) {
      const a = proj([-70, lat]) as [number, number], b = proj([-54, lat]) as [number, number];
      grid.push(<line key={'la' + lat} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={old ? 'rgba(80,56,30,0.22)' : 'rgba(150,180,230,0.1)'} strokeWidth={lat % 5 === 0 ? 1.4 : 0.8} />);
    }
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {old ? (
        <defs>
          {/* trazo de pluma de las provincias: un solo filtro para todas y recortado a la pantalla (con zoom, cada
              provincia por separado calculaba el ruido sobre miles de píxeles fuera de cuadro) */}
          <filter id="quillMap14" filterUnits="userSpaceOnUse" x={-10} y={-10} width={1940} height={1100}>
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={1} seed={2} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} />
          </filter>
        </defs>
      ) : null}
      <g opacity={gridO}>{grid}</g>
      {/* provincias */}
      <g opacity={provO} style={old ? {filter: 'url(#quillMap14)'} : undefined}>
        {names.map((n) => {
          const polys = G.provincias[n];
          if (!polys) return null;
          const d = path({type: 'MultiPolygon', coordinates: polys} as any) ?? '';
          return <path key={n} d={d} fill={fills[n] ?? 'none'} stroke={inkC} strokeWidth={old ? 1.6 : 1.1} strokeLinejoin="round" />;
        })}
      </g>
      {/* frontera Chaco - Santiago del Estero (línea recta de 61° 43') */}
      {border && border.o > 0 ? (() => {
        const a = proj([-61.71, -25.74]) as [number, number], b = proj([-61.71, -28.0]) as [number, number];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={border.color ?? K.ember} strokeWidth={4} strokeDasharray={L} strokeDashoffset={L * (1 - clamp(border.p))} opacity={border.o} strokeLinecap="round" />;
      })() : null}
      {/* ríos */}
      <g opacity={riverO} fill="none" stroke={waterC} strokeLinecap="round" strokeLinejoin="round">
        {rivers.map((r) =>
          (G.rios[r] ?? []).map((ln, i) => <path key={r + i} d={line(ln)} strokeWidth={r === 'Paraná' ? 3.4 : r === 'Salado' ? 2.6 : 2} />),
        )}
      </g>
      {riverLabels && riverO > 0.05
        ? [['Salado', [-63.15, -27.15], -48], ['Dulce', [-63.9, -28.4], -60], ['Bermejo', [-61.2, -24.95], -38]].map(([n, at, rot]) => {
            const p = proj(at as LonLat) as [number, number];
            return (
              <text key={n as string} x={p[0]} y={p[1]} transform={`rotate(${rot} ${p[0]} ${p[1]})`} textAnchor="middle" opacity={riverO} style={(old ? {...fell(22, 'rgba(40,66,90,0.9)', true)} : {...ar(15, 600, 'rgba(140,195,255,0.85)', 85, 0.16)}) as React.CSSProperties}>
                {old ? `Río ${n}` : `RÍO ${(n as string).toUpperCase()}`}
              </text>
            );
          })
        : null}
      {/* áreas */}
      {areas.map((a, i) =>
        a.o > 0 ? <path key={'a' + i} d={line(a.ring) + 'Z'} fill={a.fill ?? 'none'} stroke={a.stroke ?? K.ember} strokeWidth={2.5} strokeDasharray={a.dash} opacity={a.o} /> : null,
      )}
      {/* rótulos de regiones */}
      {regionLabels.map((r, i) => {
        if (r.o <= 0) return null;
        const p = proj(r.at) as [number, number];
        return (
          <text key={'r' + i} x={p[0]} y={p[1]} textAnchor="middle" transform={`rotate(${r.rot ?? 0} ${p[0]} ${p[1]})`} opacity={r.o} style={(old ? {...fell(r.size ?? 30, 'rgba(60,40,22,0.8)'), letterSpacing: '0.32em'} : {...ar(r.size ?? 22, 650, 'rgba(226,232,245,0.6)', 90, 0.32)}) as React.CSSProperties}>
            {r.text}
          </text>
        );
      })}
      {/* rutas que se dibujan */}
      {routes.map((r, i) => {
        if (r.p <= 0) return null;
        const pp = r.pts.map((p) => proj(p) as [number, number]);
        const L = pp.reduce((a, p, k) => (k ? a + Math.hypot(p[0] - pp[k - 1][0], p[1] - pp[k - 1][1]) : 0), 0);
        const d = pp.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        const c = r.color ?? (old ? K.inkRed : K.cyan);
        const head = along(pp, r.p);
        const lab = r.label ? along(pp, r.labelAt ?? 0.5) : null;
        return (
          <g key={'rt' + i}>
            <mask id={`rm${i}`}>
              <path d={d} fill="none" stroke="#fff" strokeWidth={(r.width ?? 4) + 6} strokeDasharray={L} strokeDashoffset={L * (1 - clamp(r.p))} strokeLinecap="round" />
            </mask>
            <path d={d} fill="none" stroke={c} strokeWidth={r.width ?? 4} strokeDasharray={r.dash ?? (old ? '14 9' : '10 7')} strokeLinecap="round" mask={`url(#rm${i})`} />
            {r.head !== false && r.p < 1 ? <circle cx={head[0]} cy={head[1]} r={7} fill={c} /> : null}
            {lab && r.p > (r.labelAt ?? 0.5) ? (
              <text x={lab[0] + 14} y={lab[1] - 14} opacity={clamp((r.p - (r.labelAt ?? 0.5)) * 8)} style={(old ? fell(26, c, true) : ar(18, 650, c, 85, 0.14)) as React.CSSProperties}>
                {r.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* marcas */}
      {marks.map((m, i) => {
        if (m.o <= 0) return null;
        const p = proj(m.at) as [number, number];
        const c = m.color ?? (old ? K.ink : K.bone);
        const s = m.size ?? 1;
        const pulse = m.pulse ? 1 + 0.25 * Math.sin(t * 5 + i) : 1;
        let sym: React.ReactNode = null;
        if (m.kind === 'iron') sym = <g transform={`scale(${s * pulse})`}><path d="M-12 -6 L-4 -12 L10 -9 L13 2 L4 11 L-9 9 Z" fill={old ? K.sepia : K.ember} stroke={c} strokeWidth={1.5} /></g>;
        else if (m.kind === 'pin') sym = <g transform={`scale(${s})`}><circle r={22 * pulse} fill="none" stroke={m.color ?? K.ember} strokeWidth={2} opacity={0.5} /><circle r={8} fill={m.color ?? K.ember} /></g>;
        else if (m.kind === 'x') sym = <g stroke={m.color ?? K.inkRed} strokeWidth={5} strokeLinecap="round" transform={`scale(${s})`}><line x1={-14} y1={-14} x2={14} y2={14} /><line x1={14} y1={-14} x2={-14} y2={14} /></g>;
        else if (m.kind === 'q') sym = <text textAnchor="middle" y={22 * s} style={{fontFamily: F.display, fontSize: 64 * s * pulse, fontWeight: 600, fill: m.color ?? K.ember} as React.CSSProperties}>?</text>;
        else if (m.kind === 'dot') sym = <circle r={5 * s} fill={c} />;
        else sym = <g transform={`scale(${s})`}><circle r={7} fill={old ? 'none' : c} stroke={c} strokeWidth={2} /><line x1={0} y1={-12} x2={0} y2={-20} stroke={c} strokeWidth={2} /><line x1={-4} y1={-16} x2={4} y2={-16} stroke={c} strokeWidth={2} /></g>;
        return (
          <g key={'m' + i} transform={`translate(${p[0]},${p[1]})`} opacity={m.o}>
            {sym}
            {m.label ? (
              <text x={m.dx ?? 16} y={m.dy ?? 8} style={(old ? fell(28 * Math.min(1.4, s), c, m.italic) : ar(19, 650, c, 85, 0.12)) as React.CSSProperties}>
                {m.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {children ? children(proj) : null}
    </svg>
  );
};

/** rosa de los vientos de cartógrafo */
export const Compass: React.FC<{x: number; y: number; r?: number; o?: number; rot?: number; color?: string}> = ({x, y, r = 90, o = 1, rot = 0, color = K.ink}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
    <circle r={r} fill="none" stroke={color} strokeWidth={1.4} opacity={0.6} />
    <circle r={r * 0.78} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />
    {Array.from({length: 8}, (_, i) => {
      const a = (i * Math.PI) / 4, long = i % 2 === 0 ? r : r * 0.6;
      const w = i % 2 === 0 ? r * 0.12 : r * 0.08;
      const p = (aa: number, rr: number) => `${Math.sin(aa) * rr},${-Math.cos(aa) * rr}`;
      return (
        <g key={i}>
          <polygon points={`0,0 ${p(a - 0.25, w)} ${p(a, long)}`} fill={color} opacity={0.85} />
          <polygon points={`0,0 ${p(a + 0.25, w)} ${p(a, long)}`} fill={color} opacity={0.35} />
        </g>
      );
    })}
    <text y={-r - 12} textAnchor="middle" style={fell(28, color) as React.CSSProperties}>N</text>
  </g>
);

/** traza de búsqueda a mano (detector): zigzag irregular alrededor de un centro, progresivo */
export const searchTrack = (c: LonLat, w: number, h: number, rows: number, seed: number): LonLat[] => {
  const out: LonLat[] = [];
  for (let r = 0; r < rows; r++) {
    const y = c[1] - h / 2 + (r / (rows - 1)) * h;
    const xs = r % 2 === 0 ? [-w / 2, w / 2] : [w / 2, -w / 2];
    for (let k = 0; k <= 8; k++) {
      const x = xs[0] + ((xs[1] - xs[0]) * k) / 8;
      out.push([c[0] + x + (rnd(seed + r * 9 + k) - 0.5) * w * 0.05, y + (rnd(seed * 3 + r * 9 + k) - 0.5) * h * 0.04]);
    }
  }
  return out;
};
export const progOf = prog;
