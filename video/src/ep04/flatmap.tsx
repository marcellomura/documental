/* Mapa plano equirectangular centrado en el Pacífico con la anomalía real de temperatura del mar (NOAA OISST). */
import React, {useMemo} from 'react';
import {Img, staticFile} from 'remotion';
import {geoEquirectangular, geoGraticule10, geoPath, GeoPath, GeoProjection} from 'd3-geo';
import c110 from '../data/ep04/countries110.json';
import c50 from '../data/ep04/countries50.json';
import {N} from './kit';

export type Cam = {lon: number; lat: number; deg: number};
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => {
  // interpola el zoom en escala logarítmica para que el movimiento se sienta natural
  const ld = Math.log(a.deg) + (Math.log(b.deg) - Math.log(a.deg)) * k;
  return {lon: a.lon + (b.lon - a.lon) * k, lat: a.lat + (b.lat - a.lat) * k, deg: Math.exp(ld)};
};

const W0 = 1920, H0 = 1080;
/** lon en dominio 0..360 (Pacífico centrado) */
export const L360 = (lon: number) => ((lon % 360) + 360) % 360;

export const flatProj = (cam: Cam, W = W0, H = H0): {k: number; P: (lon: number, lat: number) => [number, number]; proj: GeoProjection} => {
  const k = W / cam.deg;
  const proj = geoEquirectangular()
    .rotate([-180, 0])
    .scale((k * 180) / Math.PI)
    .translate([W / 2 + (180 - cam.lon) * k, H / 2 + cam.lat * k])
    .precision(0.5);
  const P = (lon: number, lat: number): [number, number] => [W / 2 + (L360(lon) - cam.lon) * k, H / 2 - (lat - cam.lat) * k];
  return {k, P, proj};
};

const SA50 = {type: 'FeatureCollection', features: (c50 as any).features.filter((f: any) => f.properties.c === 'South America')};

export const FlatMap: React.FC<{
  cam: Cam; sst?: '2026' | '1997' | '2015' | null; sstO?: number; land?: '110' | '50sa'; landO?: number; grid?: number;
  reveal?: {lon: number; lat: number; r: number}; children?: (P: (lon: number, lat: number) => [number, number], path: GeoPath, k: number) => React.ReactNode;
  sst2?: '2026' | '1997' | '2015'; mix?: number; highlight?: Record<string, string>; coast?: number; W?: number; H?: number;
}> = ({cam, sst = '2026', sstO = 1, land = '110', landO = 1, grid = 0.5, reveal, children, sst2, mix = 0, highlight, coast = 1, W = W0, H = H0}) => {
  const {k, P, proj} = flatProj(cam, W, H);
  const path = geoPath(proj);
  const feats = land === '110' ? (c110 as any).features : (SA50 as any).features;
  const grat = useMemo(() => geoGraticule10(), []);
  const ix = W / 2 + (-0.125 - cam.lon) * k, iy = H / 2 - (60.25 - cam.lat) * k;
  const imgStyle: React.CSSProperties = {position: 'absolute', left: ix, top: iy, width: 360 * k, height: 120.5 * k, imageRendering: 'auto'};
  let mask: string | undefined;
  if (reveal) {
    const [rx, ry] = P(reveal.lon, reveal.lat);
    const rr = reveal.r * k;
    mask = `radial-gradient(circle ${Math.max(1, rr)}px at ${rx}px ${ry}px, black 70%, transparent 100%)`;
  }
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: N.bg1}}>
      {/* océano de base */}
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, #0F2A44 0%, ${N.bg1} 70%)`}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={path(grat) ?? ''} fill="none" stroke="rgba(150,195,230,0.12)" strokeWidth={1} opacity={grid} />
      </svg>
      {sst ? (
        <div style={{position: 'absolute', inset: 0, opacity: sstO, maskImage: mask, WebkitMaskImage: mask}}>
          <Img src={staticFile(`ep04/maps/sstA_${sst}.png`)} style={imgStyle} />
          {sst2 && mix > 0 ? <Img src={staticFile(`ep04/maps/sstA_${sst2}.png`)} style={{...imgStyle, opacity: mix}} /> : null}
        </div>
      ) : null}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={landO}>
          {feats.map((f: any, i: number) => {
            const id = f.properties.a3 ?? f.properties.n;
            const hl = highlight?.[f.properties.a3];
            return <path key={i} d={path(f) ?? ''} fill={hl ?? N.land} stroke={`rgba(200,225,245,${0.38 * coast})`} strokeWidth={1.1} data-id={id} />;
          })}
        </g>
        {children ? children(P, path, k) : null}
      </svg>
    </div>
  );
};

/** caja de región Niño (lon en grados oeste negativos) */
export const RegionBox: React.FC<{P: (lon: number, lat: number) => [number, number]; lon0: number; lon1: number; lat0: number; lat1: number; p: number; color?: string; label?: string; dash?: boolean}> = ({
  P, lon0, lon1, lat0, lat1, p, color = N.yellow, label, dash,
}) => {
  if (p <= 0) return null;
  const [x0, y0] = P(lon0, lat1);
  const [x1, y1] = P(lon1, lat0);
  const w = x1 - x0, h = y1 - y0;
  const per = 2 * (w + h);
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill={color} fillOpacity={0.08 * p} stroke={color} strokeWidth={3} strokeDasharray={dash ? '10 8' : `${per * p} ${per}`} />
      {label ? (
        <text x={x0} y={y0 - 12} fill={color} fontFamily="Inter" fontWeight={800} fontSize={20} letterSpacing={3} opacity={p}>
          {label}
        </text>
      ) : null}
    </g>
  );
};
