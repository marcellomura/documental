/* Mapa de la Argentina por provincias (Natural Earth) con ríos Paraná y Uruguay. */
import React from 'react';
import {geoMercator, geoPath, GeoProjection, GeoPath} from 'd3-geo';
import prov from '../data/ep04/arg_provincias.json';
import rios from '../data/ep04/rios.json';
import c50 from '../data/ep04/countries50.json';
import {N} from './kit';

const PROV = prov as any;
const SA = {type: 'FeatureCollection', features: (c50 as any).features.filter((f: any) => f.properties.c === 'South America' && f.properties.a3 !== 'ARG')};
// continente: se excluyen las Malvinas/Georgias del ajuste para centrar bien
const FIT = {type: 'FeatureCollection', features: PROV.features};

export type ArgCam = {box: [number, number, number, number]; z?: number; focus?: [number, number]; at?: [number, number]};

export const argProj = (cam: ArgCam): GeoProjection => {
  const [x0, y0, x1, y1] = cam.box;
  const p = geoMercator().fitExtent([[x0, y0], [x1, y1]], FIT as any);
  const z = cam.z ?? 1;
  if (z === 1 && !cam.focus) return p;
  const f = cam.focus ?? [-64, -38];
  const [fx, fy] = p(f)!;
  const [tx, ty] = p.translate();
  const at = cam.at ?? [fx, fy];
  return p.scale(p.scale() * z).translate([at[0] - (fx - tx) * z, at[1] - (fy - ty) * z]);
};

export const ArgMap: React.FC<{
  cam: ArgCam; fills?: Record<string, {c: string; o: number}>; base?: string; rivers?: number; riverColor?: string; neighbors?: number;
  labels?: Record<string, number>; t?: number; stroke?: string; children?: (proj: GeoProjection, path: GeoPath) => React.ReactNode;
}> = ({cam, fills = {}, base = '#1C2A3A', rivers = 0, riverColor = '#5CC8FF', neighbors = 1, labels = {}, t = 0, stroke = 'rgba(210,230,245,0.55)', children}) => {
  const proj = argProj(cam);
  const path = geoPath(proj);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <filter id="rv-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={neighbors}>
        {SA.features.map((f: any, i: number) => (
          <path key={i} d={path(f) ?? ''} fill="#111C28" stroke="rgba(200,225,245,0.18)" strokeWidth={1} />
        ))}
      </g>
      {PROV.features.map((f: any, i: number) => {
        const n = f.properties.n;
        const fl = fills[n];
        return (
          <g key={i}>
            <path d={path(f) ?? ''} fill={base} stroke={stroke} strokeWidth={1.2} />
            {fl && fl.o > 0 ? <path d={path(f) ?? ''} fill={fl.c} opacity={fl.o} stroke={stroke} strokeWidth={1.2} /> : null}
          </g>
        );
      })}
      {rivers > 0
        ? (rios as any).features.map((f: any, i: number) => {
            const d = path(f) ?? '';
            return (
              <path key={i} d={d} fill="none" stroke={riverColor} strokeWidth={4.5} strokeLinecap="round" pathLength={1} strokeDasharray={`${rivers} 1`} filter="url(#rv-glow)" />
            );
          })
        : null}
      {PROV.features.map((f: any, i: number) => {
        const n = f.properties.n;
        const o = labels[n] ?? 0;
        if (o <= 0) return null;
        const [x, y] = path.centroid(f);
        const off = LABEL_OFF[n] ?? [0, 0];
        return (
          <text key={'l' + i} x={x + off[0]} y={y + off[1]} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={21} letterSpacing={1.5} opacity={o} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.85)" strokeWidth={5}>
            {n.toUpperCase()}
          </text>
        );
      })}
      {children ? children(proj, path) : null}
    </svg>
  );
};

const LABEL_OFF: Record<string, [number, number]> = {
  Misiones: [8, 0], Corrientes: [0, 6], 'Entre Ríos': [0, 8], 'Santa Fe': [0, 0], Chaco: [0, 0], Formosa: [0, 6], 'Buenos Aires': [0, 0],
};

export const PLACES: Record<string, [number, number]> = {
  Concordia: [-58.02, -31.39],
  SantaFe: [-60.7, -31.63],
  Rosario: [-60.64, -32.95],
  BuenosAires: [-58.38, -34.6],
  Mendoza: [-68.84, -32.89],
  SanJuan: [-68.53, -31.54],
  Resistencia: [-58.98, -27.45],
};
