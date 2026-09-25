/* Globo 3D con día y noche reales: textura NASA Blue Marble de día, NASA Black Marble (luces) de noche,
   terminador calculado con la posición real del Sol para una fecha y hora UTC. */
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {geoOrthographic, geoPath, GeoProjection, GeoPath} from 'd3-geo';
import {DPR} from '../ep04/kit';

type Tex = {w: number; h: number; d: Uint8ClampedArray};
const TEX: Record<string, Tex> = {};
const NAMES = ['day', 'night'] as const;

if (typeof document !== 'undefined' && !(window as any).__globe5Tex) {
  (window as any).__globe5Tex = true;
  const h = delayRender('texturas del globo (día/noche)', {timeoutInMilliseconds: 120000});
  Promise.all(
    NAMES.map(
      (name) =>
        new Promise<void>((res, rej) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const g = c.getContext('2d')!;
            g.drawImage(img, 0, 0);
            TEX[name] = {w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data};
            res();
          };
          img.onerror = rej;
          img.src = staticFile(`ep05/globe/${name}.jpg`);
        }),
    ),
  ).then(() => continueRender(h));
}

const RAD = Math.PI / 180;

/** punto subsolar (lat, lon) para una fecha (día del año) y hora UTC decimal */
export const subsolar = (doy: number, utcHours: number) => {
  const g = (2 * Math.PI / 365) * (doy - 1 + (utcHours - 12) / 24);
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g)); // minutos
  const lon = -15 * (utcHours - 12 + eot / 60);
  return {lat: decl / RAD, lon: ((lon + 540) % 360) - 180};
};

export type View5 = {lon: number; lat: number; r: number; cx: number; cy: number};
export const makeProj5 = (v: View5): GeoProjection =>
  geoOrthographic().rotate([-v.lon, -v.lat]).scale(v.r).translate([v.cx, v.cy]).clipAngle(90).precision(0.3);

export const Globe5: React.FC<{
  view: View5; sun: {lat: number; lon: number}; W?: number; H?: number; nightBoost?: number; dayOnly?: boolean;
  children?: (proj: GeoProjection, path: GeoPath) => React.ReactNode; atmo?: number;
}> = ({view, sun, W = 1920, H = 1080, nightBoost = 1, dayOnly = false, children, atmo = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const {lon, lat, r, cx, cy} = view;
  const x0 = Math.max(0, Math.floor(cx - r - 2)), y0 = Math.max(0, Math.floor(cy - r - 2));
  const x1 = Math.min(W, Math.ceil(cx + r + 2)), y1 = Math.min(H, Math.ceil(cy + r + 2));
  const cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  useLayoutEffect(() => {
    const cv = ref.current;
    const D = TEX.day, Nt = TEX.night;
    if (!cv || !D || !Nt) return;
    const pw = Math.round(cw * DPR), ph = Math.round(ch * DPR);
    if (cv.width !== pw) cv.width = pw;
    if (cv.height !== ph) cv.height = ph;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(pw, ph);
    const out = img.data;
    const sinP = Math.sin(lat * RAD), cosP = Math.cos(lat * RAD);
    const lam0 = lon * RAD, rr = r * DPR, ccx = (cx - x0) * DPR, ccy = (cy - y0) * DPR;
    const sd = Math.sin(sun.lat * RAD), cd = Math.cos(sun.lat * RAD), sl = sun.lon * RAD;
    const tw = D.w, th = D.h;
    for (let py = 0; py < ph; py++) {
      const y = -(py + 0.5 - ccy) / rr;
      if (y < -1.01 || y > 1.01) continue;
      for (let px = 0; px < pw; px++) {
        const x = (px + 0.5 - ccx) / rr;
        const rho2 = x * x + y * y;
        if (rho2 > 1) continue;
        const z = Math.sqrt(1 - rho2);
        const phi = Math.asin(Math.max(-1, Math.min(1, y * cosP + z * sinP)));
        const lam = lam0 + Math.atan2(x, z * cosP - y * sinP);
        let u = ((lam / RAD + 180) / 360) % 1;
        if (u < 0) u += 1;
        const v = (90 - phi / RAD) / 180;
        const fx = u * tw - 0.5, fy = v * th - 0.5;
        const ix = Math.floor(fx), iy = Math.floor(fy);
        const ax = fx - ix, ay = fy - iy;
        const xa = ((ix % tw) + tw) % tw, xb = (xa + 1) % tw;
        const ya = Math.max(0, Math.min(th - 1, iy)), yb = Math.max(0, Math.min(th - 1, iy + 1));
        const i00 = (ya * tw + xa) * 4, i10 = (ya * tw + xb) * 4, i01 = (yb * tw + xa) * 4, i11 = (yb * tw + xb) * 4;
        const w00 = (1 - ax) * (1 - ay), w10 = ax * (1 - ay), w01 = (1 - ax) * ay, w11 = ax * ay;
        const Dd = D.d, Nd = Nt.d;
        // coseno del ángulo cenital del Sol en ese punto
        const cz = Math.sin(phi) * sd + Math.cos(phi) * cd * Math.cos(lam - sl);
        const day = dayOnly ? 1 : Math.min(1, Math.max(0, (cz + 0.1) / 0.2));
        const lit = 0.32 + 0.78 * Math.max(0, cz);
        let R = (Dd[i00] * w00 + Dd[i10] * w10 + Dd[i01] * w01 + Dd[i11] * w11) * lit * day;
        let G = (Dd[i00 + 1] * w00 + Dd[i10 + 1] * w10 + Dd[i01 + 1] * w01 + Dd[i11 + 1] * w11) * lit * day;
        let B = (Dd[i00 + 2] * w00 + Dd[i10 + 2] * w10 + Dd[i01 + 2] * w01 + Dd[i11 + 2] * w11) * lit * day;
        if (day < 1) {
          const k = (1 - day) * nightBoost;
          R += (Nd[i00] * w00 + Nd[i10] * w10 + Nd[i01] * w01 + Nd[i11] * w11) * k;
          G += (Nd[i00 + 1] * w00 + Nd[i10 + 1] * w10 + Nd[i01 + 1] * w01 + Nd[i11 + 1] * w11) * k;
          B += (Nd[i00 + 2] * w00 + Nd[i10 + 2] * w10 + Nd[i01 + 2] * w01 + Nd[i11 + 2] * w11) * k;
        }
        // brillo naranja del amanecer/atardecer sobre el terminador
        const tw2 = Math.max(0, 1 - Math.abs(cz) / 0.12) * (dayOnly ? 0 : 1);
        R += 120 * tw2; G += 55 * tw2; B += 10 * tw2;
        const rim = Math.pow(1 - z, 2.6) * atmo;
        const o = (py * pw + px) * 4;
        out[o] = Math.min(255, R + rim * 60);
        out[o + 1] = Math.min(255, G + rim * 140);
        out[o + 2] = Math.min(255, B + rim * 255);
        const edge = (1 - Math.sqrt(rho2)) * rr;
        out[o + 3] = edge < 1.2 ? Math.max(0, edge / 1.2) * 255 : 255;
      }
    }
    g.putImageData(img, 0, 0);
  });
  const proj = useMemo(() => makeProj5(view), [lon, lat, r, cx, cy]);
  const path = useMemo(() => geoPath(proj), [proj]);
  return (
    <>
      <div
        style={{
          position: 'absolute', left: cx - r * 1.18, top: cy - r * 1.18, width: r * 2.36, height: r * 2.36, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(80,170,255,0) 80%, rgba(80,170,255,${0.3 * atmo}) 84.5%, rgba(80,170,255,0) 100%)`, pointerEvents: 'none',
        }}
      />
      <canvas ref={ref} style={{position: 'absolute', left: x0, top: y0, width: cw, height: ch}} />
      {children ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {children(proj, path)}
        </svg>
      ) : null}
    </>
  );
};

/** franja horaria UTC+k como polígono geográfico (de polo a polo) */
export const zoneBand = (k: number) => {
  const a = k * 15 - 7.5, b = k * 15 + 7.5;
  const ring: [number, number][] = [];
  for (let la = -89; la <= 89; la += 4) ring.push([a, la]);
  for (let la = 89; la >= -89; la -= 4) ring.push([b, la]);
  ring.push([a, -89]);
  return {type: 'Polygon', coordinates: [ring]} as any;
};

export const visible5 = (v: View5, lon: number, lat: number) =>
  Math.sin(v.lat * RAD) * Math.sin(lat * RAD) + Math.cos(v.lat * RAD) * Math.cos(lat * RAD) * Math.cos((lon - v.lon) * RAD) > 0.02;
