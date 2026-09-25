/* Piezas visuales del episodio 5 (Tu reloj está mal): relojes 3D, trayectoria del Sol, mapa 3D, ilustraciones. */
import React from 'react';
import {geoMercator} from 'd3-geo';
import prov from '../data/ep04/arg_provincias.json';
import {F} from '../theme';
import {clamp, easeInOut, easeOut, pop, prog} from '../lib/anim';
import {N} from '../ep04/kit';

export const SUN = '#FFB547';
export const DAWN = '#FF7A45';
export const NIGHT = '#0A1430';

/* =====================================================================
   Reloj de paletas (split-flap) con giro 3D de cada dígito
   ===================================================================== */
const fmtHM = (m: number) => {
  const mm = ((Math.round(m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
};
export const FlipClock: React.FC<{t: number; value: (t: number) => number; size?: number; color?: string; label?: string; glow?: string}> = ({
  t, value, size = 200, color = '#F4F1EA', label, glow,
}) => {
  const now = fmtHM(value(t));
  const W = size * 0.62, H = size * 0.92;
  const cards = now.split('');
  return (
    <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: size * 0.05, perspective: size * 6}}>
        {cards.map((ch, i) => {
          if (ch === ':')
            return (
              <div key={i} style={{width: size * 0.18, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: size * 0.16}}>
                {[0, 1].map((k) => (
                  <div key={k} style={{width: size * 0.09, height: size * 0.09, borderRadius: size, background: color, opacity: 0.85}} />
                ))}
              </div>
            );
          // buscar el último cambio de este dígito para animar el giro
          let dt = 99, prev = ch;
          for (let k = 1; k <= 10; k++) {
            const d = fmtHM(value(t - k / 30))[i];
            if (d !== ch) {
              dt = (k - 1) / 30;
              prev = d;
              break;
            }
          }
          const p = clamp(dt / 0.26);
          const top = p < 0.5 ? prev : ch;
          const flipA = p < 0.5 ? -p * 2 * 90 : 0;
          const flipB = p >= 0.5 ? 90 - (p - 0.5) * 2 * 90 : 90;
          const face = (d: string, half: 'top' | 'bot', rot = 0, z = 0) => (
            <div
              style={{
                position: 'absolute', left: 0, right: 0, height: H / 2, [half === 'top' ? 'top' : 'bottom']: 0, overflow: 'hidden',
                background: half === 'top' ? 'linear-gradient(180deg,#2B2E36,#1D2027)' : 'linear-gradient(180deg,#191B21,#23262E)',
                borderRadius: half === 'top' ? `${size * 0.08}px ${size * 0.08}px 0 0` : `0 0 ${size * 0.08}px ${size * 0.08}px`,
                transformOrigin: half === 'top' ? '50% 100%' : '50% 0%', transform: `rotateX(${rot}deg) translateZ(${z}px)`, backfaceVisibility: 'hidden',
              }}
            >
              <div style={{position: 'absolute', left: 0, right: 0, top: half === 'top' ? 0 : -H / 2, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.head, fontSize: size * 0.8, color, lineHeight: 1}}>
                {d}
              </div>
            </div>
          );
          return (
            <div key={i} style={{position: 'relative', width: W, height: H, transformStyle: 'preserve-3d', boxShadow: `0 ${size * 0.06}px ${size * 0.14}px rgba(0,0,0,0.5)`, borderRadius: size * 0.08}}>
              {face(ch, 'top')}
              {face(prev === ch ? ch : prev, 'bot')}
              {p < 1 ? face(top, 'top', flipA, 1) : null}
              {p < 1 && p >= 0.5 ? face(ch, 'bot', flipB, 1) : null}
              {p >= 1 ? face(ch, 'bot') : null}
              <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 1, height: 2, background: 'rgba(0,0,0,0.7)'}} />
              {glow ? <div style={{position: 'absolute', inset: -2, borderRadius: size * 0.08, boxShadow: `0 0 ${size * 0.25}px ${glow}`, pointerEvents: 'none'}} /> : null}
            </div>
          );
        })}
      </div>
      {label ? <div style={{marginTop: size * 0.12, fontFamily: F.body, fontWeight: 800, fontSize: size * 0.16, letterSpacing: size * 0.04, color: N.mute}}>{label}</div> : null}
    </div>
  );
};

/* =====================================================================
   Reloj analógico 3D (capas en profundidad con preserve-3d)
   ===================================================================== */
export const Clock3D: React.FC<{size: number; minutes: number; rx?: number; ry?: number; face?: string; rim?: string; hands?: string; crack?: number; glowColor?: string}> = ({
  size, minutes, rx = 0, ry = 0, face = '#F4F1EA', rim = '#C9A24A', hands = '#161513', crack = 0, glowColor,
}) => {
  const hA = ((minutes / 60) % 12) * 30, mA = (minutes % 60) * 6;
  const R = size / 2;
  const layer = (z: number, style: React.CSSProperties, children?: React.ReactNode) => (
    <div style={{position: 'absolute', inset: 0, transform: `translateZ(${z}px)`, borderRadius: '50%', ...style}}>{children}</div>
  );
  return (
    <div style={{width: size, height: size, perspective: size * 4}}>
      <div style={{position: 'relative', width: size, height: size, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg)`}}>
        {/* caja trasera y canto */}
        {Array.from({length: 8}).map((_, i) =>
          layer(-size * 0.09 + i * size * 0.012, {background: i < 7 ? '#5E4A1F' : rim, boxShadow: i === 0 ? `0 ${size * 0.05}px ${size * 0.12}px rgba(0,0,0,0.6)` : undefined}),
        )}
        {layer(0, {background: rim, transform: 'translateZ(0px)'})}
        {layer(size * 0.004, {inset: size * 0.045, background: `radial-gradient(circle at 45% 40%, #FFFFFF 0%, ${face} 55%, #D9D3C6 100%)`})}
        {/* marcas */}
        {layer(
          size * 0.008,
          {inset: size * 0.045},
          <svg viewBox="-100 -100 200 200" width="100%" height="100%">
            {Array.from({length: 60}).map((_, i) => {
              const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0;
              return <line key={i} x1={Math.sin(a) * (big ? 76 : 82)} y1={-Math.cos(a) * (big ? 76 : 82)} x2={Math.sin(a) * 88} y2={-Math.cos(a) * 88} stroke="#222" strokeWidth={big ? 3.2 : 1.2} />;
            })}
            {[12, 3, 6, 9].map((n, i) => (
              <text key={n} x={Math.sin((i * Math.PI) / 2) * 62} y={-Math.cos((i * Math.PI) / 2) * 62 + 8} textAnchor="middle" fontFamily="Anton" fontSize={24} fill="#222">
                {n}
              </text>
            ))}
            {crack > 0 ? (
              <g stroke="rgba(255,255,255,0.9)" strokeWidth={1.4} fill="none" opacity={crack}>
                <path d="M 20 -30 L 40 -60 L 52 -78 M 20 -30 L 70 -20 L 90 -24 M 20 -30 L 10 20 L -8 60 L -10 88 M 20 -30 L -40 -50 L -70 -64 M 10 20 L 50 40 L 80 64" />
              </g>
            ) : null}
          </svg>,
        )}
        {/* agujas en capas */}
        {layer(
          size * 0.03,
          {inset: 0},
          <svg viewBox="-100 -100 200 200" width="100%" height="100%">
            <g transform={`rotate(${hA})`}>
              <path d="M -4 10 L 0 -48 L 4 10 Z" fill={hands} />
            </g>
          </svg>,
        )}
        {layer(
          size * 0.045,
          {inset: 0},
          <svg viewBox="-100 -100 200 200" width="100%" height="100%">
            <g transform={`rotate(${mA})`}>
              <path d="M -3 12 L 0 -74 L 3 12 Z" fill={hands} />
            </g>
            <circle r={6} fill={N.red} />
          </svg>,
        )}
        {/* vidrio */}
        {layer(size * 0.06, {inset: size * 0.045, background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)'})}
        {glowColor ? layer(-size * 0.1, {boxShadow: `0 0 ${size * 0.4}px ${glowColor}`}) : null}
      </div>
      {R ? null : null}
    </div>
  );
};

/* =====================================================================
   Trayectoria del Sol en 3D sobre un reloj de sol (hemisferio sur: el Sol culmina al norte)
   ===================================================================== */
export const SunPath3D: React.FC<{t: number; k: number; show: number; cx?: number; cy?: number; s?: number; noonTag?: number}> = ({t, k, show, cx = 960, cy = 700, s = 1, noonTag = 0}) => {
  // cámara: plano del suelo inclinado; y hacia el norte (arriba en pantalla), x hacia el este
  const tilt = 62 * (Math.PI / 180), dist = 1400;
  const P = (x: number, y: number, z: number): [number, number] => {
    const yr = y * Math.cos(tilt) - z * Math.sin(tilt);
    const zr = y * Math.sin(tilt) + z * Math.cos(tilt);
    const f = dist / (dist + zr);
    return [cx + x * f * s, cy + yr * f * s];
  };
  // arco del Sol: de este (x+) a oeste (x-) pasando por el norte con elevación máxima al mediodía
  const sunAt = (u: number) => {
    const az = Math.PI * u; // 0 = este, 0.5 = norte, 1 = oeste
    const elev = Math.sin(Math.PI * u) * 58 * (Math.PI / 180);
    const Rr = 520;
    const x = Math.cos(az) * Math.cos(elev) * Rr;
    const y = -Math.sin(az) * Math.cos(elev) * Rr * 0.75; // norte hacia atrás
    const z = Math.sin(elev) * Rr;
    return {x, y, z, elev};
  };
  const arc: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const p = sunAt(i / 60);
    const [X, Y] = P(p.x, p.y, p.z);
    arc.push(`${i ? 'L' : 'M'} ${X.toFixed(1)} ${Y.toFixed(1)}`);
  }
  const sp = sunAt(k);
  const [sx, sy] = P(sp.x, sp.y, sp.z);
  // sombra del gnomon (alto 120) en dirección opuesta al Sol
  const hG = 120;
  const L = hG / Math.tan(Math.max(0.12, sp.elev));
  const dir = Math.hypot(sp.x, sp.y) || 1;
  const shx = (-sp.x / dir) * Math.min(L, 700), shy = (-sp.y / dir) * Math.min(L, 700);
  const g0 = P(0, 0, 0), g1 = P(0, 0, hG), sh = P(shx, shy, 0);
  const ground: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const [X, Y] = P(Math.cos(a) * 620, Math.sin(a) * 620, 0);
    ground.push(`${i ? 'L' : 'M'} ${X.toFixed(1)} ${Y.toFixed(1)}`);
  }
  const hours = Array.from({length: 13}).map((_, i) => {
    const a = Math.PI + (i / 12) * Math.PI;
    const [X, Y] = P(Math.cos(a) * 560, Math.sin(a) * 560 * -1, 0);
    return {X, Y, h: 6 + i};
  });
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: show}}>
      <defs>
        <radialGradient id="sun-g">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="0.35" stopColor={SUN} />
          <stop offset="1" stopColor={SUN} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="ground-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E3A2A" />
          <stop offset="1" stopColor="#10261B" />
        </linearGradient>
      </defs>
      <path d={ground.join(' ') + ' Z'} fill="url(#ground-g)" stroke="rgba(200,240,210,0.25)" strokeWidth={2} />
      {hours.map((h) => (
        <circle key={h.h} cx={h.X} cy={h.Y} r={3} fill="rgba(230,240,230,0.5)" />
      ))}
      <path d={arc.join(' ')} fill="none" stroke={SUN} strokeWidth={3} strokeDasharray="8 10" opacity={0.7} />
      <line x1={g0[0]} y1={g0[1]} x2={sh[0]} y2={sh[1]} stroke="rgba(0,0,0,0.55)" strokeWidth={14} strokeLinecap="round" />
      <line x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]} stroke="#E8E2D2" strokeWidth={10} strokeLinecap="round" />
      <circle cx={sx} cy={sy} r={110} fill="url(#sun-g)" />
      <circle cx={sx} cy={sy} r={34} fill="#FFF3C4" />
      {noonTag > 0 ? (
        <g opacity={noonTag}>
          <line x1={sx} y1={sy + 44} x2={sx} y2={g1[1] - 20} stroke={SUN} strokeWidth={2} strokeDasharray="4 6" />
          <text x={sx + 50} y={sy + 10} fill={SUN} fontFamily="Anton" fontSize={54}>MEDIODÍA</text>
          <text x={sx + 52} y={sy + 44} fill="rgba(255,240,210,0.8)" fontFamily="Inter" fontWeight={700} fontSize={22}>sol en lo más alto · sombra más corta</text>
        </g>
      ) : null}
      {[['N', 0, -600], ['E', 640, 0], ['O', -640, 0]].map(([l, x, y]) => {
        const [X, Y] = P(x as number, y as number, 0);
        return (
          <text key={l as string} x={X} y={Y + 10} textAnchor="middle" fill="rgba(230,240,230,0.7)" fontFamily="Inter" fontWeight={800} fontSize={26}>
            {l as string}
          </text>
        );
      })}
      {t < 0 ? null : null}
    </svg>
  );
};

/* =====================================================================
   Mapa de la Argentina en 3D con barras (minutos que el mediodía llega tarde)
   ===================================================================== */
const PROV = (prov as any).features as any[];
export const Map3D: React.FC<{
  t: number; tilt: number; rotZ?: number; cx?: number; cy?: number; scale?: number; bars?: {lon: number; lat: number; h: number; label: string; sub?: string; color?: string; t0: number}[];
  fills?: Record<string, string>; opacity?: number;
}> = ({t, tilt, rotZ = 0, cx = 960, cy = 560, scale = 1, bars = [], fills = {}, opacity = 1}) => {
  const base = geoMercator().center([-64, -40]).scale(1350 * scale).translate([0, 0]);
  const th = tilt * (Math.PI / 180), rz = rotZ * (Math.PI / 180), dist = 2600;
  const P3 = (lon: number, lat: number, z: number): [number, number] => {
    const [x0, y0] = base([lon, lat])!;
    const x = x0 * Math.cos(rz) - y0 * Math.sin(rz), y = x0 * Math.sin(rz) + y0 * Math.cos(rz);
    const yr = y * Math.cos(th) - z * Math.sin(th);
    const zr = y * Math.sin(th) + z * Math.cos(th);
    const f = dist / (dist + zr);
    return [cx + x * f, cy + yr * f];
  };
  const ringPath = (ring: number[][], z = 0) => ring.map((p, i) => {
    const [X, Y] = P3(p[0], p[1], z);
    return `${i ? 'L' : 'M'} ${X.toFixed(1)} ${Y.toFixed(1)}`;
  }).join(' ') + ' Z';
  const polyPaths = (g: any, z = 0) => {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    return polys.map((rings: number[][][]) => rings.map((r) => ringPath(r, z)).join(' ')).join(' ');
  };
  // espesor del mapa: copias hacia abajo
  const thick = [ -26, -18, -10, -2];
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity}}>
      {thick.map((z, i) => (
        <g key={i}>
          {PROV.map((f, j) => (
            <path key={j} d={polyPaths(f.geometry, z)} fill={i === 0 ? '#060B12' : '#0C1826'} />
          ))}
        </g>
      ))}
      {PROV.map((f, j) => (
        <path key={j} d={polyPaths(f.geometry, 0)} fill={fills[f.properties.n] ?? '#1D3148'} stroke="rgba(210,230,245,0.55)" strokeWidth={1.1} />
      ))}
      {[...bars].sort((a, b) => P3(a.lon, a.lat, 0)[1] - P3(b.lon, b.lat, 0)[1]).map((b, i) => {
        const g = easeOut(clamp((t - b.t0) / 0.8));
        if (g <= 0) return null;
        const h = b.h * g, w = 0.28;
        const c = b.color ?? SUN;
        const pts = (z: number) => [
          P3(b.lon - w, b.lat - w * 0.7, z), P3(b.lon + w, b.lat - w * 0.7, z), P3(b.lon + w, b.lat + w * 0.7, z), P3(b.lon - w, b.lat + w * 0.7, z),
        ];
        const bot = pts(0), top = pts(h);
        const face = (a: number, b2: number, col: string) => (
          <path d={`M ${bot[a][0]} ${bot[a][1]} L ${bot[b2][0]} ${bot[b2][1]} L ${top[b2][0]} ${top[b2][1]} L ${top[a][0]} ${top[a][1]} Z`} fill={col} />
        );
        const [lx, ly] = P3(b.lon, b.lat, h);
        return (
          <g key={i}>
            {face(0, 1, '#B36B12')}
            {face(1, 2, '#8A500C')}
            <path d={`M ${top.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`} fill={c} />
            <text x={lx} y={ly - 22} textAnchor="middle" fill={c} fontFamily="Anton" fontSize={50} opacity={clamp((t - b.t0 - 0.3) / 0.3)} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.85)" strokeWidth={6}>
              {b.label}
            </text>
            {b.sub ? (
              <text x={lx} y={ly - 78} textAnchor="middle" fill="#fff" fontFamily="Inter" fontWeight={800} fontSize={22} letterSpacing={2} opacity={clamp((t - b.t0 - 0.3) / 0.3)} style={{paintOrder: 'stroke'}} stroke="rgba(4,10,17,0.85)" strokeWidth={5}>
                {b.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

/* =====================================================================
   Escuela de noche (ilustración): cielo que aclara según `dawn` (0 noche → 1 amanecer)
   ===================================================================== */
export const NightSchool: React.FC<{t: number; dawn: number; kids: number}> = ({t, dawn, kids}) => {
  const sky = (a: string, b: string, k: number) => {
    const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
  };
  const top = sky('050A1A', '2A3E6E', dawn), mid = sky('0B1633', 'C0607A', dawn), low = sky('14244A', 'FFB36B', dawn);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="ns-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <radialGradient id="ns-lamp">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FFE3A3" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#ns-sky)" />
      {Array.from({length: 90}).map((_, i) => {
        const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 1920;
        const y = ((Math.sin(i * 78.233) * 12345.678) % 1 + 1) % 1 * 520;
        return <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 2 : 1.2} fill="#fff" opacity={(0.4 + 0.3 * Math.sin(t * 2 + i)) * (1 - dawn)} />;
      })}
      {/* cordillera al fondo */}
      <path d="M 0 700 L 160 560 L 260 620 L 420 470 L 560 600 L 720 500 L 880 610 L 1040 450 L 1200 590 L 1380 480 L 1540 600 L 1700 520 L 1920 640 L 1920 1080 L 0 1080 Z" fill={sky('0A1226', '4A3A5E', dawn)} />
      <path d="M 420 470 L 470 510 L 440 520 L 400 500 Z M 1040 450 L 1090 495 L 1060 500 L 1020 480 Z M 1380 480 L 1420 515 L 1390 520 L 1360 500 Z" fill="#DDE6F2" opacity={0.6} />
      {/* escuela */}
      <g transform="translate(560,560)">
        <rect x={0} y={60} width={800} height={340} fill="#2A2F3F" />
        <polygon points="-20,60 400,-10 820,60" fill="#3A3140" />
        <rect x={340} y={200} width={120} height={200} fill="#1A1C26" />
        {Array.from({length: 10}).map((_, i) => {
          const x = 40 + (i % 5) * 150 + (i % 5 >= 2 ? 0 : 0), y = 100 + Math.floor(i / 5) * 140;
          if (x > 320 && x < 480) return null;
          return <rect key={i} x={x} y={y} width={90} height={80} fill="#FFD27A" opacity={0.85 + 0.1 * Math.sin(t * 3 + i)} />;
        })}
        {/* reloj de la fachada */}
        <circle cx={400} cy={100} r={34} fill="#F4F1EA" stroke="#C9A24A" strokeWidth={5} />
        <line x1={400} y1={100} x2={400} y2={76} stroke="#161513" strokeWidth={4} transform="rotate(180 400 100)" />
        <line x1={400} y1={100} x2={400} y2={82} stroke="#161513" strokeWidth={5} transform="rotate(225 400 100)" />
        {/* mástil y bandera */}
        <line x1={860} y1={-40} x2={860} y2={400} stroke="#9AA3B2" strokeWidth={6} />
        <g transform={`translate(864,-36) skewY(${Math.sin(t * 3) * 3})`}>
          <rect width={120} height={26} fill="#74ACDF" />
          <rect y={26} width={120} height={26} fill="#fff" />
          <rect y={52} width={120} height={26} fill="#74ACDF" />
          <circle cx={60} cy={39} r={8} fill={SUN} />
        </g>
      </g>
      {/* piso y faroles */}
      <rect x={0} y={958} width={1920} height={122} fill="#141824" />
      {[240, 1680].map((x) => (
        <g key={x}>
          <circle cx={x} cy={700} r={160} fill="url(#ns-lamp)" opacity={1 - dawn * 0.7} />
          <line x1={x} y1={700} x2={x} y2={960} stroke="#2E3440" strokeWidth={10} />
          <circle cx={x} cy={700} r={16} fill="#FFE9B8" />
        </g>
      ))}
      {/* chicos con mochila caminando */}
      {Array.from({length: 7}).map((_, i) => {
        const a = clamp((kids - i * 0.08) * 1.6);
        if (a <= 0) return null;
        const x = 100 + ((t * 70 + i * 260) % 1700);
        const bob = Math.abs(Math.sin(t * 6 + i)) * 6;
        const sc = 0.8 + (i % 3) * 0.12;
        return (
          <g key={i} transform={`translate(${x},${958 - bob}) scale(${sc})`} opacity={a}>
            <circle cx={0} cy={-150} r={20} fill="#0B0E16" />
            <path d="M -22 -128 L 22 -128 L 26 -50 L -26 -50 Z" fill="#E9EDF4" />
            <rect x={-38} y={-125} width={20} height={48} rx={6} fill={['#E23B2E', '#2F6FA8', '#1E8C5A', '#FFB547'][i % 4]} />
            <line x1={-12} y1={-50} x2={-16 + Math.sin(t * 6 + i) * 10} y2={0} stroke="#0B0E16" strokeWidth={10} strokeLinecap="round" />
            <line x1={12} y1={-50} x2={16 - Math.sin(t * 6 + i) * 10} y2={0} stroke="#0B0E16" strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- íconos simples ---------- */
export const Icon: React.FC<{name: 'glass' | 'bag' | 'camera' | 'plate' | 'barrel' | 'plane' | 'owl' | 'bulb' | 'leaf' | 'bus'; size?: number; color?: string}> = ({name, size = 120, color = '#F4F1EA'}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100">
    {name === 'glass' ? (<g fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round"><path d="M -24 -34 L 24 -34 L 0 2 Z" /><line x1={0} y1={2} x2={0} y2={32} /><line x1={-16} y1={34} x2={16} y2={34} /><circle cx={10} cy={-24} r={4} fill={color} /></g>) : null}
    {name === 'bag' ? (<g fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round"><path d="M -30 -14 L 30 -14 L 26 36 L -26 36 Z" /><path d="M -14 -14 C -14 -40 14 -40 14 -14" /></g>) : null}
    {name === 'camera' ? (<g fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round"><rect x={-36} y={-20} width={72} height={48} rx={6} /><path d="M -14 -20 L -8 -32 L 8 -32 L 14 -20" /><circle cx={0} cy={4} r={14} /></g>) : null}
    {name === 'plate' ? (<g fill="none" stroke={color} strokeWidth={6}><circle r={26} /><circle r={14} /><line x1={-42} y1={-26} x2={-42} y2={26} /><line x1={42} y1={-26} x2={42} y2={26} /></g>) : null}
    {name === 'barrel' ? (<g fill="none" stroke={color} strokeWidth={6}><ellipse cx={0} cy={-30} rx={26} ry={8} /><path d="M -26 -30 L -26 30 A 26 8 0 0 0 26 30 L 26 -30" /><line x1={-26} y1={-8} x2={26} y2={-8} /><line x1={-26} y1={12} x2={26} y2={12} /></g>) : null}
    {name === 'plane' ? (<path d="M -40 4 L 40 -4 M 0 0 L -16 -30 L -6 -30 L 16 -2 M 0 0 L -16 30 L -6 30 L 16 2 M -34 2 L -40 -12 M -34 2 L -40 16" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />) : null}
    {name === 'owl' ? (<g fill="none" stroke={color} strokeWidth={5}><path d="M -26 -24 L -18 -38 L -8 -28 L 8 -28 L 18 -38 L 26 -24 L 26 20 C 26 36 -26 36 -26 20 Z" /><circle cx={-11} cy={-12} r={8} /><circle cx={11} cy={-12} r={8} /><path d="M -4 0 L 0 6 L 4 0" /></g>) : null}
    {name === 'bulb' ? (<g fill="none" stroke={color} strokeWidth={6}><path d="M -18 8 C -34 -10 -22 -38 0 -38 C 22 -38 34 -10 18 8 L 14 18 L -14 18 Z" /><line x1={-12} y1={28} x2={12} y2={28} /></g>) : null}
    {name === 'leaf' ? (<path d="M -30 30 C -30 -20 10 -36 34 -34 C 36 -10 20 30 -30 30 Z M -30 30 L 14 -14" fill={color} stroke="none" />) : null}
    {name === 'bus' ? (<g fill="none" stroke={color} strokeWidth={6}><rect x={-38} y={-26} width={76} height={46} rx={8} /><line x1={-38} y1={-4} x2={38} y2={-4} /><circle cx={-20} cy={26} r={7} fill={color} /><circle cx={20} cy={26} r={7} fill={color} /></g>) : null}
  </svg>
);

export {easeInOut, pop, prog, clamp};
