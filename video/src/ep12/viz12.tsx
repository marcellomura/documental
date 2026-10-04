/* Visualizaciones del episodio 12: el canal SOFAR con rayos de sonido calculados (perfil de Munk + ley de Snell),
   el mapa del Atlántico con las estaciones hidroacústicas y el frente de onda geodésico, el espectrograma de la
   grabación real del Titan, la búsqueda (área contra España), las llamadas, el calendario y las horas. */
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import countries from '../data/ep04/countries50.json';
import {K, F12, vf, mono, clamp, easeIn, easeInOut, easeOut, prog, fadeIO, rnd, fmt} from './kit12';

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const D2R = Math.PI / 180;

/* ================================================================== MAPA */
export type MapV = {lon: number; lat: number; scale: number};
export const mxy = (v: MapV, lon: number, lat: number): [number, number] => {
  const k = Math.cos(v.lat * D2R);
  return [960 + (lon - v.lon) * v.scale * k, 540 - (lat - v.lat) * v.scale];
};
const FEATS = (countries as any).features as any[];
const ringsOf = (f: any): number[][][] => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map((p: any) => p[0]));
export const pathOf = (v: MapV, ring: number[][]) => ring.map((c, i) => {
  const [x, y] = mxy(v, c[0], c[1]);
  return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
}).join('') + 'Z';
/** mapa oscuro: mar, lo que va "debajo" (frentes de onda), tierra y lo que va encima */
export const GeoMap: React.FC<{v: MapV; under?: React.ReactNode; children?: React.ReactNode; land?: string; sea?: string; hl?: Record<string, string>; grid?: boolean; o?: number}> = ({
  v, under, children, land = '#0E2232', sea = K.abyss, hl = {}, grid = true, o = 1,
}) => {
  const k = Math.cos(v.lat * D2R);
  const lonMin = v.lon - 1150 / (v.scale * k), lonMax = v.lon + 1150 / (v.scale * k);
  const latMin = v.lat - 640 / v.scale, latMax = v.lat + 640 / v.scale;
  const paths: React.ReactNode[] = [];
  for (const f of FEATS) {
    let d = '';
    for (const ring of ringsOf(f)) {
      if (!ring.some((c) => c[0] > lonMin && c[0] < lonMax && c[1] > latMin && c[1] < latMax)) continue;
      d += pathOf(v, ring);
    }
    if (d) paths.push(<path key={f.properties.a3 + paths.length} d={d} fill={hl[f.properties.a3] ?? land} stroke="rgba(120,200,255,0.22)" strokeWidth={1.2} />);
  }
  const gl: React.ReactNode[] = [];
  if (grid) {
    for (let lo = Math.ceil(lonMin / 10) * 10; lo < lonMax; lo += 10) {
      const [x] = mxy(v, lo, 0);
      gl.push(<line key={'x' + lo} x1={x} y1={0} x2={x} y2={1080} stroke="rgba(86,216,255,0.07)" strokeWidth={1} />);
    }
    for (let la = Math.ceil(latMin / 10) * 10; la < latMax; la += 10) {
      const [, y] = mxy(v, 0, la);
      gl.push(<line key={'y' + la} x1={0} y1={y} x2={1920} y2={y} stroke="rgba(86,216,255,0.07)" strokeWidth={1} />);
    }
  }
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #061A2C 0%, ${sea} 75%)`, opacity: o}}>
      <svg width={1920} height={1080}>
        {gl}
        {under}
        {paths}
        {children}
      </svg>
    </AbsoluteFill>
  );
};
/** punto geodésico a distancia angular d (rad) y rumbo th desde (lat0, lon0) */
const destination = (lat0: number, lon0: number, d: number, th: number): [number, number] => {
  const p1 = lat0 * D2R, l1 = lon0 * D2R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(th));
  const l2 = l1 + Math.atan2(Math.sin(th) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [((l2 / D2R + 540) % 360) - 180, p2 / D2R];
};
export const gcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const a = Math.sin(((lat2 - lat1) * D2R) / 2) ** 2 + Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin(((lon2 - lon1) * D2R) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};
/** frente de onda: círculo geodésico de radio km alrededor de un punto */
export const Wavefront: React.FC<{v: MapV; lat: number; lon: number; km: number; color?: string; o?: number; fill?: boolean; width?: number}> = ({v, lat, lon, km, color = K.cyan, o = 1, fill = true, width = 3}) => {
  if (km <= 0 || o <= 0) return null;
  const d = km / 6371;
  let s = '';
  for (let i = 0; i <= 180; i++) {
    const [lo, la] = destination(lat, lon, d, (i / 180) * Math.PI * 2);
    const [x, y] = mxy(v, lo, la);
    s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return (
    <g opacity={o}>
      {fill ? <path d={s + 'Z'} fill={color} opacity={0.07} /> : null}
      <path d={s} fill="none" stroke={color} strokeWidth={width} />
    </g>
  );
};
/** arco de círculo máximo entre dos puntos, dibujado hasta p */
export const GreatArc: React.FC<{v: MapV; a: [number, number]; b: [number, number]; p: number; color?: string; width?: number; dash?: boolean}> = ({v, a, b, p, color = K.amber, width = 3, dash}) => {
  if (p <= 0) return null;
  const toV = (lat: number, lon: number) => [Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)];
  const A = toV(a[0], a[1]), B = toV(b[0], b[1]);
  const om = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
  let s = '';
  const n = 90;
  for (let i = 0; i <= Math.round(n * clamp(p)); i++) {
    const f = i / n;
    const k1 = Math.sin((1 - f) * om) / Math.sin(om), k2 = Math.sin(f * om) / Math.sin(om);
    const x = k1 * A[0] + k2 * B[0], y = k1 * A[1] + k2 * B[1], z = k1 * A[2] + k2 * B[2];
    const lat = Math.asin(z) / D2R, lon = Math.atan2(y, x) / D2R;
    const [px, py] = mxy(v, lon, lat);
    s += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
  }
  return <path d={s} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash ? '12 9' : undefined} strokeLinecap="round" />;
};
export const Pin12: React.FC<{v: MapV; lat: number; lon: number; label?: string; sub?: string; color?: string; o?: number; side?: 'l' | 'r'; t?: number; size?: number}> = ({v, lat, lon, label, sub, color = K.cyan, o = 1, side = 'r', t = 0, size = 28}) => {
  if (o <= 0) return null;
  const [x, y] = mxy(v, lon, lat);
  const pulse = (t * 0.8) % 1;
  const tx = side === 'r' ? x + 26 : x - 26;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={8 + pulse * 30} fill="none" stroke={color} strokeWidth={2} opacity={1 - pulse} />
      <circle cx={x} cy={y} r={8} fill={color} stroke={K.abyss} strokeWidth={3} />
      {label ? (
        <text x={tx} y={y + 2} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={F12.mono} fontWeight={600} fontSize={size} fill={K.bone} letterSpacing="0.06em" stroke={K.abyss} strokeWidth={6} paintOrder="stroke">{label}</text>
      ) : null}
      {sub ? (
        <text x={tx} y={y + 2 + size * 1.1} textAnchor={side === 'r' ? 'start' : 'end'} fontFamily={F12.mono} fontWeight={500} fontSize={size * 0.72} fill={color} letterSpacing="0.06em" stroke={K.abyss} strokeWidth={5} paintOrder="stroke">{sub}</text>
      ) : null}
    </g>
  );
};
/** silueta de España llevada (a escala real) sobre otro punto del mapa */
export const SpainGhost: React.FC<{v: MapV; lat: number; lon: number; o?: number; p?: number}> = ({v, lat, lon, o = 1, p = 1}) => {
  const f = FEATS.find((q) => q.properties.a3 === 'ESP');
  if (!f || o <= 0) return null;
  const rings = ringsOf(f).filter((r) => r.length > 60); // sin islas chicas
  const c0 = [-3.7, 40.2];
  let d = '';
  for (const r of rings) {
    d += r.map((c, i) => {
      const dx = (c[0] - c0[0]) * Math.cos(c0[1] * D2R), dy = c[1] - c0[1]; // grados "de latitud" equivalentes
      const lo = lon + dx / Math.cos(lat * D2R), la = lat + dy;
      const [x, y] = mxy(v, lo, la);
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join('') + 'Z';
  }
  return <path d={d} fill={K.amber} fillOpacity={0.16 * o} stroke={K.amber} strokeWidth={3} strokeDasharray="10 6" opacity={o} transform={`translate(0 ${(1 - p) * -60})`} />;
};

/* lugares */
export const PL = {
  ascension: {lat: -7.93, lon: -14.37},
  crozet: {lat: -46.43, lon: 51.86},
  evento: {lat: -46.12, lon: -59.69},
  restos: {lat: -45.9497, lon: -59.7728},
  ultima: {lat: -46.133, lon: -59.9}, // posición estimada a las 7:30 (46°08'S 59°54'O)
  pos0030: {lat: -46.733, lon: -60.133}, // 46°44'S 60°08'O
  ushuaia: {lat: -54.8, lon: -68.3},
  mdp: {lat: -38.0, lon: -57.55},
  comodoro: {lat: -45.86, lon: -67.48},
  sanjorge: {lat: -46.0, lon: -66.5},
};
/** estaciones hidroacústicas de la red del Tratado (HA = hidrófonos, T = sísmicas de fase T) */
export const STATIONS: {id: string; lat: number; lon: number; kind: 'H' | 'T'}[] = [
  {id: 'HA01', lat: -34.9, lon: 114.1, kind: 'H'},
  {id: 'HA02', lat: 53.3, lon: -132.5, kind: 'T'},
  {id: 'HA03', lat: -33.7, lon: -78.8, kind: 'H'},
  {id: 'HA04', lat: -46.43, lon: 51.86, kind: 'H'},
  {id: 'HA05', lat: 33.1, lon: 139.8, kind: 'T'},
  {id: 'HA06', lat: 19.0, lon: -110.9, kind: 'T'},
  {id: 'HA07', lat: 39.4, lon: -31.2, kind: 'T'},
  {id: 'HA08', lat: -7.3, lon: 72.4, kind: 'H'},
  {id: 'HA09', lat: -37.1, lon: -12.3, kind: 'T'},
  {id: 'HA10', lat: -7.93, lon: -14.37, kind: 'H'},
  {id: 'HA11', lat: 19.3, lon: 166.6, kind: 'H'},
];

/* ================================================================== CANAL SOFAR */
/** perfil de velocidad del sonido de Munk (m/s) a la profundidad z (m) */
export const munk = (z: number, axis = 1100, B = 1100) => {
  const eta = (2 * (z - axis)) / B;
  return 1490 * (1 + 0.00737 * (eta + Math.exp(-eta) - 1));
};
type Ray = {pts: [number, number][]; trapped: boolean};
const RANGE_KM = 600;
const RAYS: Ray[] = (() => {
  const out: Ray[] = [];
  const angles = [-8, -6, -4, -2, 2, 4, 6, 8, -19, 19];
  for (const a0 of angles) {
    let th = a0 * D2R, z = 1100, trapped = true;
    const pts: [number, number][] = [[0, z]];
    for (let r = 1; r <= RANGE_KM; r++) {
      const dcdz = (munk(z + 1) - munk(z - 1)) / 2;
      th += -(1 / munk(z)) * dcdz * 1000; // ecuación del rayo (ángulo pequeño), paso de 1 km
      z += Math.tan(th) * 1000;
      if (z < 0) {
        z = -z;
        th = -th;
        trapped = false;
      }
      if (z > 5000) {
        z = 10000 - z;
        th = -th;
        trapped = false;
      }
      pts.push([r, z]);
    }
    out.push({pts, trapped});
  }
  return out;
})();
/** corte del océano con los rayos de sonido atrapados en el canal */
/** build: armado del corte (0→1) · scan: línea que baja hasta el canal (0→1) con su opacidad scanO · band: pulso de la capa · zoom: acercamiento lento */
export const SofarDiagram: React.FC<{t: number; t0: number; p: number; showProfile?: number; label?: number; o?: number; build?: number; scan?: number; scanO?: number; band?: number; zoom?: number; axis5?: number}> = ({
  t, t0, p, showProfile = 1, label = 1, o = 1, build = 1, scan = 0, scanO = 0, band = 0, zoom = 0, axis5 = 1,
}) => {
  const X0 = 420, X1 = 1840, Y0 = 210, Y1 = 960;
  const px = (r: number) => X0 + (r / RANGE_KM) * (X1 - X0);
  const py = (z: number) => Y0 + (z / 5000) * (Y1 - Y0);
  const prof = useMemo(() => {
    let s = '';
    for (let z = 0; z <= 5000; z += 50) {
      const c = munk(z);
      const x = 120 + ((c - 1485) / 60) * 220;
      s += (z ? 'L' : 'M') + x.toFixed(1) + ' ' + py(z).toFixed(1);
    }
    return s;
  }, []);
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${1 + 0.05 * zoom})`, transformOrigin: `${px(0)}px ${py(1100)}px`}}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0E4F6E" />
            <stop offset="0.25" stopColor="#072A44" />
            <stop offset="1" stopColor="#010509" />
          </linearGradient>
          <filter id="glow12">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x={X0} y={Y0} width={X1 - X0} height={(Y1 - Y0) * build} fill="url(#seaG)" />
        <line x1={X0} y1={Y0} x2={X0 + (X1 - X0) * clamp(build * 1.6)} y2={Y0} stroke={K.cyan} strokeWidth={2} opacity={0.6} />
        {/* nieve marina dentro del corte */}
        {Array.from({length: 70}, (_, i) => {
          const H = Y1 - Y0, y = Y0 + ((rnd(i + 50) * H + t * 14 * (0.5 + rnd(i + 9))) % H);
          return y < Y0 + H * build ? <circle key={i} cx={X0 + rnd(i) * (X1 - X0) + Math.sin(t * 0.7 + i) * 6} cy={y} r={1 + rnd(i + 3) * 1.6} fill="#BFE6F5" opacity={0.12 + 0.22 * rnd(i + 7)} /> : null;
        })}
        {/* banda del canal */}
        <rect x={X0} y={py(700)} width={X1 - X0} height={py(1550) - py(700)} fill={K.cyan} opacity={0.06 * label + 0.16 * band} />
        {[700, 1550].map((z) => (
          <line key={z} x1={X0} y1={py(z)} x2={X1} y2={py(z)} stroke={K.cyan} strokeWidth={1} opacity={0.35 * band} />
        ))}
        <line x1={X0} y1={py(1100)} x2={X0 + (X1 - X0) * label} y2={py(1100)} stroke={K.cyan} strokeWidth={1.5} strokeDasharray="8 8" opacity={0.6 * label} />
        {[0, 1000, 2000, 3000, 4000, 5000].map((z, i) => (
          <text key={z} x={X0 - 14} y={py(z) + 7} textAnchor="end" fontFamily={F12.mono} fontSize={20} fill={K.mute} opacity={clamp(build * 7 - i) * (z === 5000 ? axis5 : 1)}>{fmt(z)} m</text>
        ))}
        {[0, 150, 300, 450, 600].map((r, i) => (
          <text key={r} x={px(r)} y={Y1 + 34} textAnchor="middle" fontFamily={F12.mono} fontSize={20} fill={K.mute} opacity={clamp(build * 6 - i)}>{fmt(r)} km</text>
        ))}
        {/* escaneo de profundidad hasta el canal */}
        {scanO > 0 ? (
          <g opacity={scanO}>
            <rect x={X0} y={Y0} width={X1 - X0} height={py(1100 * scan) - Y0} fill={K.cyan} opacity={0.05} />
            <line x1={X0} y1={py(1100 * scan)} x2={X1} y2={py(1100 * scan)} stroke={K.cyan} strokeWidth={2.5} filter="url(#glow12)" />
            <text x={X0 + 24} y={py(1100 * scan) - 14} fontFamily={F12.mono} fontWeight={600} fontSize={26} fill={K.bone}>{fmt(Math.round(1000 * scan / 10) * 10)} m</text>
          </g>
        ) : null}
        {/* rayos */}
        {RAYS.map((ray, i) => {
          const n = Math.max(2, Math.round(ray.pts.length * clamp(p)));
          const d = ray.pts.slice(0, n).map((q, j) => (j ? 'L' : 'M') + px(q[0]).toFixed(1) + ' ' + py(q[1]).toFixed(1)).join('');
          const fade = ray.trapped ? 1 : 0.35;
          return <path key={i} d={d} fill="none" stroke={ray.trapped ? K.cyan : K.mute} strokeWidth={ray.trapped ? 2.2 : 1.3} opacity={fade * o} filter={ray.trapped ? 'url(#glow12)' : undefined} />;
        })}
        {/* fuente */}
        <circle cx={px(0)} cy={py(1100)} r={10} fill={K.amber} />
        <circle cx={px(0)} cy={py(1100)} r={10 + ((t - t0) * 40) % 60} fill="none" stroke={K.amber} strokeWidth={2} opacity={1 - (((t - t0) * 40) % 60) / 60} />
        {/* perfil de velocidad */}
        <g opacity={showProfile}>
          <line x1={120} y1={Y0} x2={120} y2={Y1} stroke={K.line} />
          <path d={prof} fill="none" stroke={K.amber} strokeWidth={3} />
          <text x={110} y={Y0 - 22} fontFamily={F12.mono} fontWeight={600} fontSize={20} fill={K.amber} letterSpacing="0.1em">VELOCIDAD</text>
          <text x={110} y={Y0 - 0} fontFamily={F12.mono} fontWeight={600} fontSize={20} fill={K.amber} letterSpacing="0.1em">DEL SONIDO</text>
          <text x={150} y={py(1100) + 6} fontFamily={F12.mono} fontSize={18} fill={K.bone}>mínima</text>
        </g>
        <g opacity={label}>
          <text x={X1 - 20} y={py(1100) - 18} textAnchor="end" fontFamily={F12.mono} fontWeight={600} fontSize={24} fill={K.cyan} letterSpacing="0.16em">CANAL SOFAR · ≈ 1.000 m</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
/** fibra óptica: la luz rebota adentro del tubo (analogía) */
export const FiberInset: React.FC<{t: number; t0: number; t1?: number; x: number; y: number; w?: number}> = ({t, t0, t1 = Infinity, x, y, w = 520}) => {
  const o = fadeIO(t, t0, t1, 0.35);
  if (o <= 0) return null;
  const h = 90;
  const p = clamp((t - t0) / 1.6);
  let d = '';
  const n = 9;
  for (let i = 0; i <= n; i++) d += (i ? 'L' : 'M') + ((i / n) * w).toFixed(1) + ' ' + (i % 2 ? h - 14 : 14);
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
      <svg width={w + 20} height={h + 60} style={{overflow: 'visible'}}>
        <rect x={0} y={0} width={w} height={h} rx={h / 2} fill="rgba(86,216,255,0.06)" stroke={K.cyan} strokeWidth={2} />
        <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray={w * 1.6} strokeDashoffset={w * 1.6 * (1 - p)} />
      </svg>
      <div style={{...mono(20, K.mute, 500), letterSpacing: '0.16em', marginTop: -36}}>COMO LA LUZ EN UNA FIBRA ÓPTICA</div>
    </div>
  );
};

/* ================================================================== ESPECTROGRAMA */
/** espectrograma de una grabación real que se revela al ritmo del audio */
export const Spectro: React.FC<{t: number; t0: number; dur: number; x?: number; y?: number; w?: number; h?: number; title?: string; src?: string; wave?: string; o?: number}> = ({
  t, t0, dur, x = 160, y = 300, w = 1600, h = 420, title, src = 'ep12/img/titan_espectro.png', wave = 'ep12/img/titan_onda.png', o = 1,
}) => {
  if (o <= 0) return null;
  const p = clamp((t - t0) / dur);
  const head = x + w * p;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {title ? <div style={{position: 'absolute', left: x, top: y - 140, ...mono(24, K.amber, 600), letterSpacing: '0.24em'}}>{title}</div> : null}
      <div style={{position: 'absolute', left: x, top: y - 100, width: w, height: 90, overflow: 'hidden', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
        <Img src={staticFile(wave)} style={{width: w, height: 90, objectFit: 'fill', opacity: 0.85}} />
      </div>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#01050A', outline: `1px solid ${K.line}`}} />
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
        <Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'fill'}} />
      </div>
      <div style={{position: 'absolute', left: head - 1, top: y - 104, width: 2, height: h + 110, background: K.bone, boxShadow: `0 0 18px ${K.cyan}`}} />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <div key={f} style={{position: 'absolute', left: x + w * f, top: y + h + 14, transform: 'translateX(-50%)', ...mono(18, K.mute)}}>{(dur * f).toFixed(0)} s</div>
      ))}
      <div style={{position: 'absolute', left: x - 18, top: y, transform: 'translateX(-100%)', ...mono(16, K.mute)}}>1.400 Hz</div>
      <div style={{position: 'absolute', left: x - 18, top: y + h - 18, transform: 'translateX(-100%)', ...mono(16, K.mute)}}>0 Hz</div>
    </AbsoluteFill>
  );
};

/** línea de señal en vivo (representación): ruido de fondo y un pico */
export const LiveTrace: React.FC<{t: number; t0: number; spikeAt: number; x?: number; y?: number; w?: number; amp?: number; color?: string; label?: string}> = ({t, t0, spikeAt, x = 160, y = 760, w = 1600, amp = 160, color = K.cyan, label}) => {
  const N = 400;
  let d = '';
  for (let i = 0; i <= N; i++) {
    const tt = t - (N - i) * 0.012;
    const noise = (rnd(Math.floor(tt * 90) + 7) - 0.5) * 0.18 + Math.sin(tt * 23) * 0.04;
    const k = tt - spikeAt;
    const sp = k > 0 ? Math.exp(-k * 2.2) * Math.sin(k * 60) * (1 - Math.exp(-k * 40)) : 0;
    const yy = y + (noise + sp) * amp;
    d += (i ? 'L' : 'M') + (x + (i / N) * w).toFixed(1) + ' ' + yy.toFixed(1);
  }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: prog(t, t0, 0.5)}}>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={K.line} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} />
      {label ? <text x={x} y={y - amp - 20} fontFamily={F12.mono} fontWeight={600} fontSize={22} fill={K.mute} letterSpacing="0.16em">{label}</text> : null}
    </svg>
  );
};

/* ================================================================== HORAS */
/** eje de horas con marcas y tramos (por ejemplo 07:30 → 10:51) */
export const HourAxis: React.FC<{t: number; t0: number; from: number; to: number; marks: {h: number; label: string; color?: string; at: number}[]; spans?: {a: number; b: number; label: string; color: string; at: number; unknown?: boolean}[]; y?: number; x0?: number; x1?: number; o?: number}> = ({
  t, t0, from, to, marks, spans = [], y = 600, x0 = 180, x1 = 1740, o = 1,
}) => {
  const hx = (h: number) => x0 + ((h - from) / (to - from)) * (x1 - x0);
  const p = prog(t, t0, 0.9);
  const hh = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      <line x1={x0} y1={y} x2={x0 + (x1 - x0) * p} y2={y} stroke={K.bone} strokeWidth={3} opacity={0.6} />
      {Array.from({length: Math.floor(to - from) + 1}, (_, i) => from + i).map((h) => (
        <g key={h} opacity={p}>
          <line x1={hx(h)} y1={y - 12} x2={hx(h)} y2={y + 12} stroke={K.bone} strokeWidth={2} opacity={0.5} />
          <text x={hx(h)} y={y + 48} textAnchor="middle" fontFamily={F12.mono} fontSize={22} fill={K.mute}>{hh(h)}</text>
        </g>
      ))}
      {spans.map((s, i) => {
        const q = prog(t, s.at, 1.0, easeInOut);
        if (q <= 0) return null;
        const xa = hx(s.a), xb = mix(xa, hx(s.b), q);
        return (
          <g key={i}>
            <rect x={xa} y={y - 46} width={xb - xa} height={30} fill={s.color} opacity={s.unknown ? 0.18 : 0.85} />
            {s.unknown
              ? Array.from({length: Math.floor((xb - xa) / 28)}, (_, k) => (
                  <text key={k} x={xa + 14 + k * 28} y={y - 23} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={22} fill={s.color} opacity={0.5 + 0.5 * rnd(k + Math.floor(t * 8))}>?</text>
                ))
              : null}
            <text x={(xa + hx(s.b)) / 2} y={y - 70} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={26} fill={s.color} opacity={q} letterSpacing="0.1em">{s.label}</text>
          </g>
        );
      })}
      {marks.map((m, i) => {
        const q = prog(t, m.at, 0.5);
        if (q <= 0) return null;
        const x = hx(m.h);
        return (
          <g key={i} opacity={q}>
            <line x1={x} y1={y + 70} x2={x} y2={y - 150} stroke={m.color ?? K.cyan} strokeWidth={3} />
            <circle cx={x} cy={y} r={11} fill={m.color ?? K.cyan} />
            <text x={x} y={y - 166} textAnchor="middle" fontFamily={F12.mono} fontWeight={600} fontSize={44} fill={K.bone}>{hh(m.h)}</text>
            <text x={x} y={y + 110} textAnchor="middle" fontFamily={F12.mono} fontWeight={500} fontSize={22} fill={m.color ?? K.cyan} letterSpacing="0.12em">{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ================================================================== CALENDARIO */
/** cross: tacha los días 1..to de a uno desde at (cuenta regresiva) · zoom: acercamiento lento */
export const Calendar: React.FC<{t: number; t0: number; t1?: number; x?: number; y?: number; marks: {d: number; color: string; label: string; at: number}[]; o?: number; cross?: {to: number; at: number; step: number}; zoom?: number}> = ({
  t, t0, t1 = Infinity, x = 560, y = 540, marks, o = 1, cross, zoom = 1,
}) => {
  const oo = fadeIO(t, t0, t1, 0.4) * o;
  if (oo <= 0) return null;
  const first = 3; // 1/11/2018 fue jueves (L=0)
  const cell = 104;
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${zoom})`, opacity: oo}}>
      <div style={{fontSize: 64, color: K.bone, ...vf(84, 800), marginBottom: 8}}>NOVIEMBRE 2018</div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(7, ${cell}px)`, gap: 6}}>
        {days.map((d, i) => (
          <div key={'h' + i} style={{...mono(22, K.mute, 600), textAlign: 'center', paddingBottom: 6}}>{d}</div>
        ))}
        {Array.from({length: first + 30}, (_, i) => {
          const d = i - first + 1;
          const m = marks.find((q) => q.d === d);
          const q = m ? prog(t, m.at, 0.4) : 0;
          const app = prog(t, t0 + i * 0.012, 0.3);
          return (
            <div key={i} style={{height: cell * 0.82, border: d > 0 ? `1px solid ${K.line}` : 'none', position: 'relative', opacity: app, background: m && q > 0 ? `${m.color}${Math.round(q * 40).toString(16).padStart(2, '0')}` : 'transparent'}}>
              {d > 0 ? <div style={{position: 'absolute', left: 10, top: 6, ...mono(26, m && q > 0 ? m.color : K.bone, 600), opacity: cross && d <= cross.to ? 1 - 0.55 * prog(t, cross.at + (d - 1) * cross.step, 0.2) : 1}}>{d}</div> : null}
              {cross && d > 0 && d <= cross.to && t > cross.at + (d - 1) * cross.step ? (
                <svg width={cell} height={cell * 0.82} style={{position: 'absolute', left: 0, top: 0}}>
                  <line x1={cell * 0.18} y1={cell * 0.66} x2={cell * 0.18 + cell * 0.64 * prog(t, cross.at + (d - 1) * cross.step, 0.18)} y2={cell * 0.66 - cell * 0.5 * prog(t, cross.at + (d - 1) * cross.step, 0.18)} stroke={K.mute} strokeWidth={3} strokeLinecap="round" />
                </svg>
              ) : null}
              {m && q > 0 ? (
                <svg width={cell} height={cell * 0.82} style={{position: 'absolute', left: 0, top: 0}}>
                  <ellipse cx={cell / 2} cy={cell * 0.41} rx={cell * 0.44} ry={cell * 0.36} fill="none" stroke={m.color} strokeWidth={4} strokeDasharray={300} strokeDashoffset={300 * (1 - q)} />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 22}}>
        {marks.map((m, i) => (
          <div key={i} style={{...mono(24, m.color, 600), letterSpacing: '0.08em', marginTop: 6, opacity: prog(t, m.at + 0.2, 0.4)}}>
            {String(m.d).padStart(2, '0')} · {m.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================== LLAMADAS */
const PhoneIcon: React.FC<{color: string}> = ({color}) => (
  <svg width={70} height={70} viewBox="0 0 24 24">
    <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.6 1 1 0 01-.25 1z" fill={color} />
  </svg>
);
export const CallsRow: React.FC<{t: number; t0: number; strike?: number; x?: number; y?: number}> = ({t, t0, strike = Infinity, x = 960, y = 470}) => {
  const s = prog(t, strike, 0.5);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', display: 'flex', gap: 36}}>
      {Array.from({length: 7}, (_, i) => {
        const p = prog(t, t0 + i * 0.22, 0.4);
        const blink = t < strike ? 0.55 + 0.45 * Math.abs(Math.sin((t - t0) * 5 + i)) : 1;
        const c = s > 0.5 ? K.red : K.sonar;
        return (
          <div key={i} style={{width: 150, height: 190, border: `2px solid ${c}`, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: p * blink, transform: `translateY(${(1 - p) * 40}px)`, background: 'rgba(3,14,26,0.7)', position: 'relative'}}>
            <PhoneIcon color={c} />
            <div style={{...mono(20, c, 600), letterSpacing: '0.1em'}}>{s > 0.5 ? 'DESCARTADA' : 'FALLIDA'}</div>
            {s > 0 ? <div style={{position: 'absolute', left: -10, top: '50%', width: 170 * s, height: 5, background: K.red, transform: 'rotate(-22deg)', transformOrigin: 'left center'}} /> : null}
          </div>
        );
      })}
    </div>
  );
};

/* ================================================================== NOMBRES */
export const CREW: [string, string][] = [
  ['Capitán de fragata', 'Pedro Martín Fernández'],
  ['Capitán de corbeta', 'Jorge Ignacio Bergallo'],
  ['Teniente de navío', 'Fernando Vicente Villarreal'],
  ['Teniente de navío', 'Fernando Ariel Mendoza'],
  ['Teniente de navío', 'Diego Manuel Wagner'],
  ['Teniente de navío', 'Eliana María Krawczyk'],
  ['Teniente de navío', 'Víctor Andrés Maroli'],
  ['Teniente de fragata', 'Adrián Zunda Meoqui'],
  ['Teniente de fragata', 'Renzo David Martín Silva'],
  ['Teniente de corbeta', 'Jorge Luis Mealla'],
  ['Teniente de corbeta', 'Alejandro Damián Tagliapietra'],
  ['Suboficial principal', 'Javier Alejandro Gallardo'],
  ['Suboficial primero', 'Alberto Cipriano Sánchez'],
  ['Suboficial primero', 'Walter Germán Real'],
  ['Suboficial primero', 'Hernán Ramón Rodríguez'],
  ['Suboficial primero', 'Víctor Hugo Coronel'],
  ['Suboficial segundo', 'Cayetano Hipólito Vargas'],
  ['Suboficial segundo', 'Roberto Daniel Medina'],
  ['Suboficial segundo', 'Celso Oscar Vallejos'],
  ['Suboficial segundo', 'Hugo Arnaldo Herrera'],
  ['Suboficial segundo', 'Víctor Marcelo Enríquez'],
  ['Suboficial segundo', 'Ricardo Gabriel Alfaro Rodríguez'],
  ['Suboficial segundo', 'Daniel Adrián Fernández'],
  ['Suboficial segundo', 'Luis Marcelo Leiva'],
  ['Cabo principal', 'Jorge Ariel Monzón'],
  ['Cabo principal', 'Jorge Eduardo Valdez'],
  ['Cabo principal', 'Cristian David Ibáñez'],
  ['Cabo principal', 'Mario Armando Toconas'],
  ['Cabo principal', 'Franco Javier Espinoza'],
  ['Cabo principal', 'Jorge Isabelino Ortiz'],
  ['Cabo principal', 'Hugo Dante César Aramayo'],
  ['Cabo principal', 'Luis Esteban García'],
  ['Cabo principal', 'Sergio Antonio Cuellar'],
  ['Cabo principal', 'Fernando Gabriel Santilli'],
  ['Cabo principal', 'Alberto Ramiro Arjona'],
  ['Cabo principal', 'Enrique Damián Castillo'],
  ['Cabo principal', 'Luis Carlos Nolasco'],
  ['Cabo principal', 'David Alonso Melián'],
  ['Cabo principal', 'Germán Oscar Suárez'],
  ['Cabo principal', 'Daniel Alejandro Polo'],
  ['Cabo principal', 'Leandro Fabián Cisneros'],
  ['Cabo principal', 'Luis Alberto Niz'],
  ['Cabo principal', 'Federico Alejandro Alcaraz Coria'],
  ['Cabo segundo', 'Aníbal Tolaba'],
];
export {easeIn, easeOut, rnd};
