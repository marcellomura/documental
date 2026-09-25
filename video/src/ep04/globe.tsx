/* Globo 3D en canvas: proyección ortográfica inversa por píxel sobre texturas reales
   (NASA Blue Marble + anomalía de temperatura del mar NOAA OISST). */
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {geoOrthographic, geoPath, GeoProjection, GeoPath} from 'd3-geo';
import {DPR} from './kit';

type Tex = {w: number; h: number; d: Uint8ClampedArray};
const TEX: Record<string, Tex> = {};
export const TEXTURES = ['base', 'sst2026', 'sst1997'] as const;
export type TexName = (typeof TEXTURES)[number];

if (typeof document !== 'undefined' && !(window as any).__globeTex) {
  (window as any).__globeTex = true;
  const h = delayRender('texturas del globo', {timeoutInMilliseconds: 120000});
  Promise.all(
    TEXTURES.map(
      (name) =>
        new Promise<void>((res, rej) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
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
          img.src = staticFile(`ep04/globe/${name}.jpg`);
        }),
    ),
  ).then(() => continueRender(h));
}

export type GlobeView = {lon: number; lat: number; r: number; cx: number; cy: number};

export const makeProj = (v: GlobeView): GeoProjection =>
  geoOrthographic().rotate([-v.lon, -v.lat]).scale(v.r).translate([v.cx, v.cy]).clipAngle(90).precision(0.3);

const RAD = Math.PI / 180;

/** dibuja el globo en un canvas que cubre solo la parte visible en pantalla */
export const Globe: React.FC<{
  view: GlobeView; tex?: TexName; tex2?: TexName; mix?: number; light?: number; W?: number; H?: number;
  children?: (proj: GeoProjection, path: GeoPath) => React.ReactNode; atmo?: number;
}> = ({view, tex = 'base', tex2, mix = 0, light = 1, W = 1920, H = 1080, children, atmo = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const {lon, lat, r, cx, cy} = view;
  // rectángulo visible
  const x0 = Math.max(0, Math.floor(cx - r - 2)), y0 = Math.max(0, Math.floor(cy - r - 2));
  const x1 = Math.min(W, Math.ceil(cx + r + 2)), y1 = Math.min(H, Math.ceil(cy + r + 2));
  const cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  useLayoutEffect(() => {
    const cv = ref.current;
    const A = TEX[tex];
    if (!cv || !A) return;
    const B = tex2 ? TEX[tex2] : undefined;
    const pw = Math.round(cw * DPR), ph = Math.round(ch * DPR);
    if (cv.width !== pw) cv.width = pw;
    if (cv.height !== ph) cv.height = ph;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(pw, ph);
    const out = img.data;
    const sinP = Math.sin(lat * RAD), cosP = Math.cos(lat * RAD);
    const lam0 = lon * RAD;
    const rr = r * DPR;
    const ccx = (cx - x0) * DPR, ccy = (cy - y0) * DPR;
    // luz desde arriba-izquierda-frente
    let lx = -0.45, ly = 0.5, lz = 0.74;
    const ln = Math.hypot(lx, ly, lz);
    lx /= ln; ly /= ln; lz /= ln;
    const tw = A.w, th = A.h;
    const mk = B ? mix : 0;
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
        // coordenadas de textura (lon -180..180 → 0..w)
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
        const Ad = A.d;
        let R = Ad[i00] * w00 + Ad[i10] * w10 + Ad[i01] * w01 + Ad[i11] * w11;
        let G = Ad[i00 + 1] * w00 + Ad[i10 + 1] * w10 + Ad[i01 + 1] * w01 + Ad[i11 + 1] * w11;
        let Bc = Ad[i00 + 2] * w00 + Ad[i10 + 2] * w10 + Ad[i01 + 2] * w01 + Ad[i11 + 2] * w11;
        if (B && mk > 0) {
          const Bd = B.d;
          const R2 = Bd[i00] * w00 + Bd[i10] * w10 + Bd[i01] * w01 + Bd[i11] * w11;
          const G2 = Bd[i00 + 1] * w00 + Bd[i10 + 1] * w10 + Bd[i01 + 1] * w01 + Bd[i11 + 1] * w11;
          const B2 = Bd[i00 + 2] * w00 + Bd[i10 + 2] * w10 + Bd[i01 + 2] * w01 + Bd[i11 + 2] * w11;
          R += (R2 - R) * mk; G += (G2 - G) * mk; Bc += (B2 - Bc) * mk;
        }
        // sombreado difuso + atmósfera en el borde
        const dif = Math.max(0, x * lx + y * ly + z * lz);
        const shade = (0.38 + 0.8 * dif) * light;
        const rim = Math.pow(1 - z, 2.6) * atmo;
        const o = (py * pw + px) * 4;
        out[o] = Math.min(255, R * shade + rim * 60);
        out[o + 1] = Math.min(255, G * shade + rim * 140);
        out[o + 2] = Math.min(255, Bc * shade + rim * 255);
        // borde antialias
        const edge = (1 - Math.sqrt(rho2)) * rr;
        out[o + 3] = edge < 1.2 ? Math.max(0, edge / 1.2) * 255 : 255;
      }
    }
    g.putImageData(img, 0, 0);
  });
  const proj = useMemo(() => makeProj(view), [lon, lat, r, cx, cy]);
  const path = useMemo(() => geoPath(proj), [proj]);
  return (
    <>
      {/* halo atmosférico */}
      <div
        style={{
          position: 'absolute', left: cx - r * 1.18, top: cy - r * 1.18, width: r * 2.36, height: r * 2.36, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(80,170,255,0) 80%, rgba(80,170,255,${0.32 * atmo}) 84.5%, rgba(80,170,255,0) 100%)`,
          pointerEvents: 'none',
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

/** ¿el punto está en la cara visible del globo? */
export const visible = (v: GlobeView, lon: number, lat: number) => {
  const c = Math.sin(v.lat * RAD) * Math.sin(lat * RAD) + Math.cos(v.lat * RAD) * Math.cos(lat * RAD) * Math.cos((lon - v.lon) * RAD);
  return c > 0.02;
};

/** arco de gran círculo entre dos puntos, recortado a lo visible */
export const arcPath = (path: GeoPath, a: [number, number], b: [number, number], k = 1) => {
  const n = 64;
  const pts: [number, number][] = [];
  // interpolación esférica
  const toV = (p: [number, number]) => [Math.cos(p[1] * RAD) * Math.cos(p[0] * RAD), Math.cos(p[1] * RAD) * Math.sin(p[0] * RAD), Math.sin(p[1] * RAD)];
  const A = toV(a), B = toV(b);
  const dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
  const om = Math.acos(Math.max(-1, Math.min(1, dot)));
  for (let i = 0; i <= n * k; i++) {
    const s = i / n;
    const sa = Math.sin((1 - s) * om) / Math.sin(om), sb = Math.sin(s * om) / Math.sin(om);
    const v = [A[0] * sa + B[0] * sb, A[1] * sa + B[1] * sb, A[2] * sa + B[2] * sb];
    pts.push([Math.atan2(v[1], v[0]) / RAD, Math.asin(v[2]) / RAD]);
  }
  return path({type: 'LineString', coordinates: pts} as any) ?? '';
};
