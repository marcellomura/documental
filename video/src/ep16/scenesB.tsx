/* Ep16 · escenas s04-s07: el imán corrido, la abolladura del cinturón, el chip y el Hubble, Don Pettit y los protones
   reales del MetOp-A. */
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {contours} from 'd3-contour';
import {clamp, easeInOut, easeOut, rnd} from '../lib/anim';
import {Atmosphere, BeltShell, Dots, Earth, GlowTube, METOP_N, Metop, Stage16, beltH, dipoleAxis, orbitPos} from './globe16';
import {Big, Caps, Corrupt, Count, Credit16, K, Label, MapBase, Mono, NameTag, P, Phosphenes, Photo16, Quote16, Snow, mapXY, mix, ss, vis, type MapView} from './kit16';
import {IssVideo, cloudsFor, insetsFor, type SceneP} from './scenesA';
import {altR, camPath, fmtN, project, sunFrom, xyz, type GeoCam, type V3} from './lib16';
import CAMPO from '../data/ep16/campo.json';

const C = CAMPO as unknown as {grillas: {paso: number; nx: number; ny: number; lat0: number; lon0: number; datos: Record<string, number[]>}; hubble: {track: number[]; orbitas_cruzan: number; umbral_nT: number; periodo_min: number}};
/** satélites de órbita baja (posiciones fijas, para «miles de satélites») */
const SATS: V3[] = [...Array(2600)].map((_, i) => {
  const inc = [53, 53, 70, 97.6, 43, 87.9][i % 6], node = rnd(i * 3.3) * 360, u = rnd(i * 7.1) * Math.PI * 2, h = 480 + rnd(i * 1.9) * 140;
  return orbitPos(inc, node, h, u);
});

/* ------------------------------------------------------------------ s04: el imán corrido y la abolladura */
/** perfil a lo largo de 24,5° S: la superficie donde rebota el cinturón interior (IGRF-14), con la Estación, el Hubble y
 *  la capa de satélites; altura exagerada */
const BeltProfile: React.FC<{t: number; t0: number; tDos: number; tEst: number; tHub: number; tMiles: number; t1: number; w: number; h: number; vertical?: boolean}> = ({t, t0, tDos, tEst, tHub, tMiles, t1, w, h, vertical}) => {
  const k = vis(t, t0, t1, 0.6, 0.6);
  if (k <= 0) return null;
  const L0 = vertical ? -105 : -150, L1 = vertical ? -5 : 45;
  const bx = vertical ? 70 : 140, bw = w - 2 * bx, base = vertical ? 1100 : 860, top = vertical ? 470 : 230;
  const X = (lon: number) => bx + ((lon - L0) / (L1 - L0)) * bw;
  const Y = (km: number) => base - (km / 2000) * (base - top);
  const draw = easeInOut(clamp((t - t0 - 0.2) / 1.6));
  const pts: [number, number][] = [];
  for (let lon = L0; lon <= L0 + (L1 - L0) * draw; lon += 0.5) pts.push([X(lon), Y(Math.min(beltH(-24.5, lon), 2000))]);
  const curve = pts.map((q, i) => `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const fill = pts.length > 1 ? `${curve} L ${pts[pts.length - 1][0]} ${top - 30} L ${pts[0][0]} ${top - 30} Z` : '';
  const dipX = X(-59.5), dipY = Y(200);
  const lines: [number, string, string, number][] = [[400, 'Estación Espacial · 400 km', '#8DB8FF', tEst], [530, 'Hubble · 530 km', '#C9B6FF', tHub]];
  const satK = vis(t, tMiles - 0.2, Infinity, 0.5);
  const regions: [number, string][] = vertical ? [[-85, 'Pacífico'], [-60, 'Sudamérica'], [-30, 'Atlántico']] : [[-120, 'Pacífico'], [-62, 'Sudamérica'], [-25, 'Atlántico Sur'], [22, 'África']];
  return (
    <AbsoluteFill style={{opacity: k, background: 'linear-gradient(180deg, #010207 0%, #030B18 70%, #07162A 100%)'}}>
      <svg width={w} height={h}>
        <defs>
          <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="14" stroke="rgba(255,154,60,0.35)" strokeWidth="3" /></pattern>
          <linearGradient id="beltg" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="rgba(255,122,31,0.55)" /><stop offset="100%" stopColor="rgba(255,122,31,0.04)" /></linearGradient>
        </defs>
        {fill ? <path d={fill} fill="url(#beltg)" /> : null}
        {fill ? <path d={fill} fill="url(#hatch)" /> : null}
        {curve ? <path d={curve} fill="none" stroke={K.hot2} strokeWidth={4} /> : null}
        {/* capa de satélites */}
        {satK > 0 ? <rect x={bx} y={Y(620)} width={bw} height={Y(480) - Y(620)} fill={`rgba(191,211,255,${0.10 * satK})`} /> : null}
        {satK > 0 ? [...Array(160)].map((_, i) => <circle key={i} cx={bx + rnd(i * 3.1) * bw} cy={Y(480 + rnd(i * 7.7) * 140)} r={2} fill="#BFD3FF" opacity={satK * 0.8} />) : null}
        {lines.map(([km, name, col, tt]) => {
          const kk = vis(t, tt - 0.2, Infinity, 0.5);
          return kk > 0 ? <line key={name} x1={bx} x2={bx + bw * kk} y1={Y(km)} y2={Y(km)} stroke={col} strokeWidth={3} /> : null;
        })}
        {/* superficie */}
        <rect x={bx} y={base} width={bw} height={14} fill="#1E3A2A" />
        <line x1={bx} x2={bx + bw} y1={base} y2={base} stroke="#6FB08A" strokeWidth={2} />
        {regions.map(([lon, name]) => <text key={name} x={X(lon)} y={base + 52} textAnchor="middle" fontFamily={K.mono} fontSize={vertical ? 24 : 19} letterSpacing="0.18em" fill={K.dim}>{name.toUpperCase()}</text>)}
        {[0, 500, 1000, 1500, 2000].map((km) => <text key={km} x={bx - 14} y={Y(km) + 6} textAnchor="end" fontFamily={K.mono} fontSize={vertical ? 20 : 16} fill={K.dim}>{fmtN(km)}</text>)}
      </svg>
      {lines.map(([km, name, col, tt]) => (
        <Caps key={name} size={vertical ? 21 : 17} color={col} style={{position: 'absolute', left: vertical ? bx + 10 : X(-145), top: Y(km) - 32, opacity: vis(t, tt, Infinity, 0.5)}}>{name}</Caps>
      ))}
      <Caps size={vertical ? 21 : 17} color="#BFD3FF" style={{position: 'absolute', right: vertical ? 70 : X(38) > w ? 140 : w - X(40), top: Y(620) - 34, opacity: satK}}>miles de satélites · 480-620 km</Caps>
      <Label x={dipX} y={dipY} dx={vertical ? 140 : 190} dy={vertical ? -330 : 120} k={vis(t, tDos - 0.1, Infinity, 0.6)} title="Sobre Sudamérica" value="200" unit="km" color={K.hot2} size={vertical ? 54 : 50} />
      <div style={{position: 'absolute', left: vertical ? 70 : 140, top: vertical ? 300 : 84}}>
        <Caps size={vertical ? 22 : 18} color={K.ink}>Dónde empieza el cinturón de radiación interior</Caps>
        <Mono size={vertical ? 19 : 16} color={K.dim} style={{marginTop: 8}}>corte a 24,5° S · modelo IGRF-14 (2025) · alturas exageradas</Mono>
      </div>
      <Caps size={vertical ? 20 : 17} color={K.hot} style={{position: 'absolute', left: X(vertical ? -100 : -140), top: Y(1900), opacity: draw}}>cinturón interior · protones atrapados</Caps>
    </AbsoluteFill>
  );
};
export const S04: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s04', p, n);
  const s0 = T.start('s04'), s1 = T.end('s04');
  if (t < s0 - 1 || t > s1 + 1.2) return null;
  const tIncl = A('Está inclinado'), tCorr = A('Y está corrido'), tPac = A('Pacífico'), tDel = A('Del lado opuesto'), tNuestro = A('Ese lado es'), tSobre = A('Sobre Sudamérica');
  const tDos = A('doscientos'), tEst = A('Por debajo de la Estación'), tHub = A('Por debajo del Hubble'), tMiles = A('Por debajo de miles'), tEs = A('Es la Anomalía');
  const sk = ss(tPac, tNuestro, t);
  const sA = sunFrom(8, 70), sB = sunFrom(-18, -28);
  const sun: V3 = [mix(sA[0], sB[0], sk), mix(sA[1], sB[1], sk), mix(sA[2], sB[2], sk)];
  const {c: dc, ax, tilt, offKm} = dipoleAxis(2025);
  const cam = camPath(t, [
    [s0 - 1, {lat: 6, lon: 50, range: 3.6, fov: 30}],
    [tCorr, {lat: 4, lon: 48, range: 3.2, fov: 30}],
    [tPac + 0.8, {lat: 6, lon: 46, range: 3.25, fov: 30}],
    [tNuestro, {lat: -18, lon: -42, range: 3.3, fov: 30}],
    [tSobre + 0.5, {lat: -24, lon: -48, range: 3.0, fov: 30}],
    [tEs - 0.5, {lat: -30, lon: -40, range: 3.6, fov: 30, dy: vertical ? 0.13 : 0.07}],
    [s1 + 1.2, {lat: -32, lon: -44, range: 3.45, fov: 30, dy: vertical ? 0.13 : 0.07}],
  ]);
  const ghost = 1 - ss(tDel - 0.2, tDel + 1.2, t);
  const alpha = mix(1, 0.6, ghost * ss(s0 - 0.5, s0 + 0.6, t));
  const axK = ghost * ss(s0, s0 + 0.8, t);
  const geoAx: V3[] = [[0, -1.35, 0], [0, 1.35, 0]];
  const magAx: V3[] = [[dc[0] - ax[0] * 1.3, dc[1] - ax[1] * 1.3, dc[2] - ax[2] * 1.3], [dc[0] + ax[0] * 1.3, dc[1] + ax[1] * 1.3, dc[2] + ax[2] * 1.3]];
  const offK = ss(tCorr, tCorr + 0.8, t);
  const fK = ss(tDel + 0.2, tNuestro, t);
  const prof = vis(t, tSobre - 0.3, tEs - 0.2, 0.6, 0.5);
  const final = ss(tEs - 0.6, tEs, t);
  const pDc = project(cam, dc, w, h, false), pC = project(cam, [0, 0, 0], w, h, false), pN = project(cam, [0, 1.2, 0], w, h, false), pM = project(cam, [dc[0] + ax[0] * 1.2, dc[1] + ax[1] * 1.2, dc[2] + ax[2] * 1.2], w, h, false);
  return (
    <>
      {prof < 0.999 ? (
        <AbsoluteFill style={{opacity: vis(t, s0 - 1, s1 + 1.2, 0.6, 0.6)}}>
          <Stage16 cam={cam} w={w} h={h}>
            <Earth t={t} sun={sun} cam={cam} alpha={alpha} spec={1 - ghost} clouds={0.7 * (1 - ghost * 0.6)} night={0.8} field={{year: 2025, k: fK * 0.95, full: 0, thr: 26000, hi: 0.8, iso: 0.7}} />
            {alpha > 0.9 ? <Atmosphere sun={sun} cam={cam} /> : null}
            {axK > 0 ? <GlowTube id="geoax" pts={geoAx} radius={0.004} color="#ECF1F6" k={axK * 0.8} dash={18} seg={64} /> : null}
            {axK > 0 ? <GlowTube id="magax" pts={magAx} radius={0.0075} color="#FF7A1F" k={axK * 1.4} reveal={ss(s0 + 0.3, tIncl, t)} seg={64} /> : null}
            {axK > 0 ? <Dots pts={[dc, [0, 0, 0]]} size={vertical ? 26 : 18} color="#FFC24A" k={axK * offK} /> : null}
            {final > 0 ? <BeltShell t={t} cam={cam} k={final * 0.55} hot={0.25} /> : null}
          </Stage16>
          <Label x={pM.x} y={pM.y} dx={vertical ? -80 : 140} dy={-120} k={vis(t, tIncl - 0.2, tDel, 0.6, 0.5) * axK} title="Eje magnético" value={`${fmtN(tilt, 1)}°`} unit="de inclinación" color={K.hot} />
          <Label x={pN.x} y={pN.y} dx={-150} dy={-60} k={vis(t, tIncl + 0.3, tDel, 0.6, 0.5) * axK} title="Eje de rotación" color={K.ink} />
          {offK > 0 && axK > 0 ? (
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: offK * axK}} width={1} height={1}>
              <line x1={pC.x} y1={pC.y} x2={pDc.x} y2={pDc.y} stroke={K.hot2} strokeWidth={3} />
            </svg>
          ) : null}
          <Label x={pDc.x} y={pDc.y} dx={vertical ? -40 : 170} dy={170} k={vis(t, tCorr + 0.6, tDel, 0.6, 0.5) * axK} title="Centro del imán" value={fmtN(offKm)} unit="km · hacia el Pacífico" color={K.hot2} />
          <Big t={t} t0={tNuestro - 0.05} t1={tSobre - 0.3} text="ese lado es el nuestro" size={vertical ? 70 : 64} y={vertical ? 1500 : 880} font="serif" color={K.ink} />
          <Big t={t} t0={tEs - 0.1} t1={s1 + 1.0} text={vertical ? <>ANOMALÍA<br />DEL ATLÁNTICO<br />SUR</> : 'ANOMALÍA DEL ATLÁNTICO SUR'} size={vertical ? 92 : 84} y={vertical ? 300 : 110} color={K.ink} />
        </AbsoluteFill>
      ) : null}
      <BeltProfile t={t} t0={tSobre - 0.3} tDos={tDos} tEst={tEst} tHub={tHub} tMiles={tMiles} t1={tEs - 0.2} w={w} h={h} vertical={vertical} />
    </>
  );
};

/* ------------------------------------------------------------------ s05: chip, satélites que se apagan, Hubble, GEDI */
const Chip: React.FC<{t: number; t0: number; tHit: number; tFlip: number; t1: number; w: number; h: number}> = ({t, t0, tHit, tFlip, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const cols = 24, rows = 12, cs = Math.min(w * 0.75 / cols, h * 0.55 / rows);
  const ox = (w - cols * cs) / 2, oy = (h - rows * cs) / 2 + 20;
  const fr = 9, fc = 13;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let v = rnd(r * 31 + c * 7.7) > 0.45 ? 1 : 0;
    const target = r === fr && c === fc;
    if (target) v = t < tFlip ? 1 : 0;
    const hot = target && t >= tFlip - 0.1;
    cells.push(
      <text key={`${r}-${c}`} x={ox + c * cs + cs / 2} y={oy + r * cs + cs * 0.68} textAnchor="middle" fontFamily={K.mono} fontSize={cs * 0.55} fill={hot ? K.warn : v ? 'rgba(141,184,255,0.85)' : 'rgba(141,184,255,0.28)'} fontWeight={hot ? 700 : 400}>{v}</text>,
    );
  }
  // el protón: una raya que cruza en diagonal y pasa por la celda que cambia
  const hx = ox + fc * cs + cs / 2, hy = oy + fr * cs + cs / 2;
  const pk = clamp((t - tHit + 0.35) / 0.5);
  const x0 = hx - 900, y0 = hy - 620, x1 = hx + 900, y1 = hy + 620;
  return (
    <AbsoluteFill style={{opacity: k, background: 'radial-gradient(ellipse at 50% 50%, #0A1120 0%, #010207 75%)'}}>
      <svg width={w} height={h}>
        {[...Array(18)].map((_, i) => <path key={i} d={`M ${rnd(i) * w} ${oy - 120} V ${oy - 30 - rnd(i + 3) * 60} H ${rnd(i + 9) * w}`} stroke="rgba(141,184,255,0.12)" strokeWidth={2} fill="none" />)}
        <rect x={ox - 24} y={oy - 24} width={cols * cs + 48} height={rows * cs + 48} fill="none" stroke="rgba(141,184,255,0.25)" strokeWidth={2} />
        {cells}
        {t >= tFlip - 0.1 ? <rect x={hx - cs / 2} y={hy - cs / 2} width={cs} height={cs} fill="none" stroke={K.warn} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 10)} /> : null}
        {pk > 0 && pk < 1.6 ? <line x1={x0} y1={y0} x2={mix(x0, x1, Math.min(pk, 1))} y2={mix(y0, y1, Math.min(pk, 1))} stroke="#FFF2D6" strokeWidth={4} strokeLinecap="round" opacity={1 - clamp(pk - 1) * 1.6} /> : null}
        {pk > 0.45 && pk < 1.4 ? <circle cx={hx} cy={hy} r={20 + (pk - 0.45) * 160} fill="none" stroke="#FFF2D6" strokeWidth={3} opacity={1 - (pk - 0.45)} /> : null}
      </svg>
      <div style={{position: 'absolute', left: 96, top: 84}}>
        <Caps size={18} color={K.ink}>Memoria de un chip · esquema</Caps>
        <Mono size={17} color={K.dim} style={{marginTop: 8}}>un protón de alta energía deja carga a su paso</Mono>
      </div>
      <Label x={hx + cs / 2} y={hy} dx={260} dy={150} k={vis(t, tFlip + 0.1, t1, 0.5, 0.3)} title="Cambio de bit (single event upset)" value="1 → 0" color={K.warn} />
    </AbsoluteFill>
  );
};
/** contorno de la anomalía (|B| bajo un umbral, a cierta altura) en coordenadas de mapa */
const contourPaths = (key: string, thr: number, v: MapView) => {
  const g = C.grillas;
  const vals = g.datos[key];
  const cs = contours().size([g.nx, g.ny]).thresholds([-thr])(vals.map((x) => -x));
  const out: string[] = [];
  for (const mp of cs) for (const poly of mp.coordinates) for (const ring of poly) {
    out.push(ring.map(([x, y], i) => {
      const lon = g.lon0 + (x - 0.5) * g.paso, lat = g.lat0 - (y - 0.5) * g.paso;
      const [px, py] = mapXY(v, lat, lon);
      return `${i ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`;
    }).join(' ') + ' Z');
  }
  return out;
};
const HubbleDay: React.FC<{t: number; t0: number; t1: number; tCount: number; w: number; h: number}> = ({t, t0, t1, tCount, w, h}) => {
  const k = vis(t, t0, t1, 0.6, 0.6);
  if (k <= 0) return null;
  const v: MapView = {lon0: -180, lon1: 180, lat0: -60, lat1: 60, x: 0, y: (h - w / 3) / 2, w, h: w / 3};
  const saa = contourPaths('525_2025', C.hubble.umbral_nT, v);
  const tr = C.hubble.track;
  const n = tr.length / 3;
  const p = easeInOut(clamp((t - t0 - 0.4) / (tCount + 3.5 - t0)));
  const m = Math.floor(n * p);
  const segs: React.ReactNode[] = [];
  let cur = '', curIn = -1, key = 0, crossings = 0, prevIn = 0;
  const per = n / 15.14;
  for (let i = 0; i < m; i++) {
    const lon = tr[i * 3], lat = tr[i * 3 + 1], ins = tr[i * 3 + 2];
    if (ins && !prevIn) crossings++;
    prevIn = ins;
    const [x, y] = mapXY(v, lat, lon);
    const jump = i > 0 && Math.abs(lon - tr[(i - 1) * 3]) > 180;
    if (ins !== curIn || jump) {
      if (cur) segs.push(<path key={key++} d={cur} stroke={curIn ? K.warn : 'rgba(201,182,255,0.55)'} strokeWidth={curIn ? 4 : 2} fill="none" />);
      cur = `M ${x.toFixed(1)} ${y.toFixed(1)}`; curIn = ins;
    } else cur += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  if (cur) segs.push(<path key={key++} d={cur} stroke={curIn ? K.warn : 'rgba(201,182,255,0.55)'} strokeWidth={curIn ? 4 : 2} fill="none" />);
  const orbit = Math.min(15, Math.floor(m / per) + 1);
  const [hx, hy] = m > 0 ? mapXY(v, tr[(m - 1) * 3 + 1], tr[(m - 1) * 3]) : [0, 0];
  const pausedOrbits = new Set<number>();
  for (let i = 0; i < m; i++) if (tr[i * 3 + 2]) pausedOrbits.add(Math.floor(i / per));
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <MapBase v={v} k={1} dark={0.62} />
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        {saa.map((d, i) => <path key={i} d={d} fill="rgba(255,90,40,0.16)" stroke={K.hot} strokeWidth={2} strokeDasharray="6 6" />)}
        {segs}
        {m > 0 ? <circle cx={hx} cy={hy} r={9} fill="#FFFFFF" /> : null}
      </svg>
      <div style={{position: 'absolute', left: 96, top: 70}}>
        <Caps size={18} color={K.ink}>Hubble · un día de órbitas · simulación con el IGRF-14</Caps>
        <Mono size={17} color={K.dim} style={{marginTop: 8}}>28,5° de inclinación · 525 km · una vuelta cada {fmtN(C.hubble.periodo_min, 0)} minutos</Mono>
      </div>
      <div style={{position: 'absolute', right: 96, top: 60, textAlign: 'right'}}>
        <Caps size={16} color={K.dim}>órbita</Caps>
        <Mono size={64} color={K.ink}>{orbit}<span style={{fontSize: 28, color: K.dim}}> / 15</span></Mono>
      </div>
      <div style={{position: 'absolute', right: 96, bottom: 80, textAlign: 'right', opacity: vis(t, tCount, t1, 0.5, 0.5)}}>
        <Caps size={17} color={K.warn}>cruzan la anomalía</Caps>
        <Mono size={58} color={K.warn}>{crossings > 0 ? pausedOrbits.size : 0}<span style={{fontSize: 26, color: K.dim}}> de 15</span></Mono>
        <Mono size={18} color={K.dim} style={{marginTop: 8}}>en cada cruce, más de 20 minutos sin observar (STScI)</Mono>
      </div>
    </AbsoluteFill>
  );
};
const Gedi: React.FC<{t: number; t0: number; t1: number; w: number; h: number}> = ({t, t0, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.6);
  if (k <= 0) return null;
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const p = clamp((t - t0 - 0.5) / (t1 - t0 - 1.2));
  const cw = (w - 192) / 12;
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <div style={{position: 'absolute', left: 96, top: 84}}>
        <Caps size={18} color={K.ink}>GEDI · lidar de la NASA en la Estación Espacial</Caps>
        <Mono size={17} color={K.dim} style={{marginTop: 8}}>un reinicio por mes al cruzar la anomalía (NASA, 2020)</Mono>
      </div>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        {months.map((m, i) => {
          const x = 96 + i * cw;
          const on = p * 12 > i + 0.5;
          const day = 4 + Math.floor(rnd(i * 3.7) * 22);
          const rx = x + (day / 30) * cw;
          return (
            <g key={m}>
              <rect x={x + 4} y={420} width={cw - 8} height={240} fill="rgba(141,184,255,0.05)" stroke="rgba(141,184,255,0.25)" />
              <text x={x + cw / 2} y={400} textAnchor="middle" fontFamily={K.mono} fontSize={20} fill={K.dim}>{m}</text>
              {/* el láser: datos continuos hasta el reinicio, con un hueco de un par de horas */}
              <line x1={x + 4} x2={on ? rx - 3 : x + 4 + clamp(p * 12 - i) * (cw - 8)} y1={540} y2={540} stroke={K.cool} strokeWidth={6} />
              {on ? <line x1={rx + 5} x2={x + 4 + clamp(p * 12 - i) * (cw - 8)} y1={540} y2={540} stroke={K.cool} strokeWidth={6} /> : null}
              {on ? <line x1={rx + 1} x2={rx + 1} y1={470} y2={610} stroke={K.warn} strokeWidth={3} /> : null}
              {on ? <text x={rx + 1} y={640} textAnchor="middle" fontFamily={K.mono} fontSize={15} fill={K.warn}>reinicio</text> : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
export const S05: React.FC<SceneP> = ({t, T, w, h}) => {
  const A = (p: string, n = 0) => T.at('s05', p, n);
  const s0 = T.start('s05'), s1 = T.end('s05');
  if (t < s0 - 1 || t > s1 + 1) return null;
  const tAtr = A('atravesar'), tUno = A('un uno'), tCero = A('cero'), tPor = A('Por eso'), tApag = A('apagan'), tHub = A('El Hubble'), tSiete = A('siete'), tLaser = A('Y un instrumento');
  return (
    <>
      <Chip t={t} t0={s0 - 0.6} tHit={tAtr + 0.2} tFlip={mix(tUno, tCero, 0.6)} t1={tPor + 0.2} w={w} h={h} />
      <SatOff t={t} t0={tPor - 0.2} tOff={tApag} t1={tHub + 0.1} w={w} h={h} />
      <HubbleDay t={t} t0={tHub - 0.3} t1={tLaser + 0.1} tCount={tSiete} w={w} h={h} />
      <Gedi t={t} t0={tLaser - 0.2} t1={s1 + 1} w={w} h={h} />
    </>
  );
};
/** tablero de un satélite que apaga equipos antes de entrar, con el satélite que se mete en la zona débil */
const SatOff: React.FC<{t: number; t0: number; tOff: number; t1: number; w: number; h: number}> = ({t, t0, tOff, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const sys = [['Cámara principal', 0], ['Espectrómetro', 0.25], ['Memoria de datos', 0.5], ['Control de orientación', -1], ['Transmisor', -1]] as [string, number][];
  // el satélite recorre un arco y entra en la zona (a la derecha)
  const cx = w * 0.74, cy = h * 0.56, R = 300;
  const p = clamp((t - t0) / (t1 - t0));
  // órbita vista de costado: una elipse achatada que cruza la zona por abajo
  const ang = Math.PI * (1 - p);
  const sx = cx + Math.cos(ang) * (R + 40), sy = cy + 60 + Math.sin(ang) * R * 0.42;
  const inside = t > tOff;
  return (
    <AbsoluteFill style={{opacity: k, background: 'radial-gradient(ellipse at 30% 50%, #0B1424 0%, #010207 70%)'}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><radialGradient id="saaz"><stop offset="0%" stopColor="rgba(255,122,31,0.55)" /><stop offset="100%" stopColor="rgba(255,122,31,0)" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={R} fill="#06101E" stroke="rgba(141,184,255,0.35)" strokeWidth={2} />
        <ellipse cx={cx + 40} cy={cy + 70} rx={230} ry={150} fill="url(#saaz)" />
        <ellipse cx={cx} cy={cy + 60} rx={R + 40} ry={R * 0.42} fill="none" stroke="rgba(141,184,255,0.3)" strokeDasharray="4 10" />
        <g transform={`translate(${sx} ${sy}) rotate(${-((Math.atan2(Math.cos(ang) * R * 0.42, -Math.sin(ang) * (R + 40)) * 180) / Math.PI)})`}>
          <rect x={-60} y={-9} width={42} height={18} fill="#2A4E8A" stroke="#8DB8FF" strokeWidth={1.5} />
          <rect x={18} y={-9} width={42} height={18} fill="#2A4E8A" stroke="#8DB8FF" strokeWidth={1.5} />
          <rect x={-16} y={-16} width={32} height={32} rx={4} fill="#C9D3E2" />
          <circle cx={0} cy={0} r={5} fill={inside ? K.warn : K.ok} />
        </g>
      </svg>
      <Caps size={18} color={K.hot} style={{position: 'absolute', left: cx - 80, top: cy + 250, opacity: 0.9}}>zona débil</Caps>
      <div style={{position: 'absolute', left: 140, top: 240}}>
        <Caps size={20} color={K.dim}>Satélite en órbita baja · esquema</Caps>
        <Mono size={40} color={inside ? K.hot : K.ink} style={{marginTop: 16}}>{inside ? 'ENTRANDO EN LA ZONA DÉBIL' : 'FUERA DE LA ZONA'}</Mono>
        <div style={{marginTop: 54}}>
          {sys.map(([name, d]) => {
            const off = d >= 0 && t > tOff + d;
            return (
              <div key={name} style={{display: 'flex', gap: 36, alignItems: 'center', marginTop: 26}}>
                <Mono size={34} color={K.ink} style={{width: 500}}>{name}</Mono>
                <div style={{width: 20, height: 20, borderRadius: 10, background: off ? 'rgba(255,65,48,0.25)' : K.ok, boxShadow: off ? 'none' : `0 0 18px ${K.ok}`}} />
                <Mono size={30} color={off ? K.warn : K.ok}>{off ? 'APAGADO' : 'ENCENDIDO'}</Mono>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ s06: Don Pettit */
const Eye: React.FC<{t: number; t0: number; t1: number; w: number; h: number}> = ({t, t0, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.5);
  if (k <= 0) return null;
  const cx = w / 2, cy = h / 2 + 10, R = 300;
  const hits = [0.3, 0.9, 1.4, 1.75].map((d, i) => ({tt: t0 + d, a: -0.6 + i * 0.38}));
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <svg width={w} height={h}>
        <defs><radialGradient id="eyeg"><stop offset="0%" stopColor="#1A2236" /><stop offset="100%" stopColor="#05070D" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={R} fill="url(#eyeg)" stroke="rgba(236,241,246,0.5)" strokeWidth={3} />
        {/* cristalino y córnea a la izquierda, retina a la derecha */}
        <ellipse cx={cx - R + 70} cy={cy} rx={40} ry={110} fill="rgba(141,184,255,0.15)" stroke="rgba(141,184,255,0.6)" strokeWidth={2} />
        <path d={`M ${cx - R - 30} ${cy - 150} Q ${cx - R - 80} ${cy} ${cx - R - 30} ${cy + 150}`} fill="none" stroke="rgba(141,184,255,0.5)" strokeWidth={3} />
        <path d={`M ${cx + R * Math.cos(-1.1)} ${cy + R * Math.sin(-1.1)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(1.1)} ${cy + R * Math.sin(1.1)}`} fill="none" stroke={K.hot} strokeWidth={10} opacity={0.85} />
        {hits.map(({tt, a}, i) => {
          const pk = clamp((t - tt) / 0.35);
          if (pk <= 0) return null;
          const ex = cx + R * Math.cos(a), ey = cy + R * Math.sin(a);
          const sx = ex + 900, sy = ey - 600 + i * 260;
          const fl = Math.exp(-(t - tt - 0.35) * 5) * (t > tt + 0.35 ? 1 : 0);
          return (
            <g key={i}>
              <line x1={sx} y1={sy} x2={mix(sx, ex - (sx - ex) * 0.25, pk)} y2={mix(sy, ey - (sy - ey) * 0.25, pk)} stroke="#FFF2D6" strokeWidth={3} opacity={0.9} />
              {fl > 0.02 ? <circle cx={ex} cy={ey} r={30 + 60 * (1 - fl)} fill="#FFE7C2" opacity={fl} /> : null}
            </g>
          );
        })}
      </svg>
      <Label x={cx + R * Math.cos(0.5)} y={cy + R * Math.sin(0.5)} dx={220} dy={120} k={vis(t, t0 + 0.5, t1, 0.5, 0.3)} title="Retina" value="cada impacto, un destello" color={K.hot} size={30} />
      <Caps size={17} color={K.dim} style={{position: 'absolute', left: 96, top: 84}}>Ojo humano · esquema</Caps>
    </AbsoluteFill>
  );
};
/** marcas de destellos por minuto: afuera de la zona, uno o dos cada diez minutos; adentro, varios por minuto */
const FlashRate: React.FC<{t: number; t0: number; tIn: number; t1: number; w: number; h: number}> = ({t, t0, tIn, t1, w, h}) => {
  const k = vis(t, t0, t1, 0.5, 0.6);
  if (k <= 0) return null;
  const vert = w < h; // en vertical: más ancho útil y las dos tasas en renglones distintos (se pisaban)
  const x0 = vert ? 80 : 160, x1 = w - x0, y = h * 0.56;
  const prog = clamp((t - t0) / (t1 - t0 - 0.4));
  const ticks = [];
  // 40 minutos de pasada: 0-15 afuera (1-2 cada 10 min), 15-27 adentro (≈ 5 por minuto), 27-40 afuera
  let id = 0;
  for (let m = 0; m < 40; m += 0.02) {
    const inside = m > 15 && m < 27;
    const rate = inside ? 5 / 50 : 0.15 / 50;
    if (rnd(m * 91.7 + 3) < rate) {
      const x = mix(x0, x1, m / 40);
      if (m / 40 <= prog) ticks.push(<line key={id++} x1={x} x2={x} y1={y - (inside ? 70 : 50)} y2={y + (inside ? 70 : 50)} stroke={inside ? K.hot2 : K.ink} strokeWidth={3} opacity={0.9} />);
    }
  }
  const zx0 = mix(x0, x1, 15 / 40), zx1 = mix(x0, x1, 27 / 40);
  return (
    <AbsoluteFill style={{opacity: k, background: '#010207'}}>
      <svg width={w} height={h}>
        <rect x={zx0} y={y - 110} width={zx1 - zx0} height={220} fill="rgba(255,122,31,0.10)" stroke="rgba(255,122,31,0.5)" strokeDasharray="6 6" />
        <line x1={x0} x2={x1} y1={y} y2={y} stroke={K.faint} strokeWidth={1.5} />
        {ticks}
        <line x1={mix(x0, x1, prog)} x2={mix(x0, x1, prog)} y1={y - 140} y2={y + 140} stroke="rgba(236,241,246,0.5)" strokeWidth={1.5} />
      </svg>
      <Caps size={18} color={K.ink} style={{position: 'absolute', left: x0, right: vert ? x0 : undefined, top: y - (vert ? 236 : 210)}}>Destellos vistos con los ojos cerrados · una pasada · esquema</Caps>
      <Mono size={26} color={K.ink} style={{position: 'absolute', left: x0, top: y + 140}}>1 o 2 cada 10 minutos</Mono>
      <Mono size={26} color={K.hot2} style={{position: 'absolute', left: zx0 + 20, top: y + 140 + (vert ? 46 : 0), opacity: ss(tIn - 0.2, tIn + 0.4, t)}}>varios por minuto</Mono>
      <Caps size={16} color={K.hot} style={{position: 'absolute', left: zx0 + 20, top: y - 160}}>zona débil</Caps>
    </AbsoluteFill>
  );
};
export const S06: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s06', p, n);
  const s0 = T.start('s06'), s1 = T.end('s06');
  if (t < s0 - 1 || t > s1 + 1) return null;
  const tNote = A('las notebooks'), tCuel = A('se cuelgan'), tCam = A('Que las cámaras'), tNev = A('nevara'), tY = A('Y que'), tDest = A('destellos'), tEl = A('Él los'), tHadas = A('hadas'), tSon = A('Son partículas'), tSobre = A('Sobre esta zona'), tVarias = A('a varias');
  return (
    <>
      <Photo16 t={t} t0={s0 - 0.6} t1={tCam + 0.2} file="ep16/img/pettit_cupula.jpg" z0={vertical ? 1.08 : 1.04} z1={vertical ? 1.2 : 1.16} x0={vertical ? 160 : 0} x1={vertical ? 120 : -30} grade={0.3} />
      <Corrupt t={t} k={vis(t, tNote, tCam - 0.1, 0.15, 0.2) * 0.8} seed={4} w={w} h={h} />
      {t > tCuel - 0.2 && t < tCam ? <Mono size={vertical ? 30 : 26} color={K.warn} style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 300 : 120, opacity: Math.floor(t * 5) % 2 ? 1 : 0.4}}>NOTEBOOK · SIN RESPUESTA</Mono> : null}
      <NameTag t={t} t0={s0 + 0.6} t1={tNote + 0.4} name="DON PETTIT" role="astronauta de la NASA · en la cúpula, 2012" x={vertical ? 60 : 96} y={vertical ? 1560 : 840} />
      <Credit16 t={t} t0={s0} t1={tCam} text="Foto: NASA (ISS031-E-112292)" right={!vertical} />
      {t > tCam - 0.5 && t < tY + 0.3 ? (
        <AbsoluteFill style={{opacity: vis(t, tCam - 0.4, tY + 0.2, 0.4, 0.4)}}>
          <IssVideo clip="carib" from={tCam - 3} t={t} dur={22} w={w} h={h} pos="50% 50%" />
          <Snow t={t} t0={tCam} rate={mix(30, 900, ss(tCam, tNev + 0.6, t))} w={w} h={h} max={2600} />
          <Caps size={vertical ? 18 : 16} color={K.dim} style={{position: 'absolute', right: vertical ? 60 : 96, top: vertical ? 300 : 90}}>simulación del daño sobre una foto real de la Estación</Caps>
        </AbsoluteFill>
      ) : null}
      {t > tY - 0.3 && t < tSon + 0.2 ? (
        <AbsoluteFill style={{background: '#000', opacity: vis(t, tY - 0.3, tSon + 0.2, 0.3, 0.3)}}>
          <Phosphenes t={t} t0={tDest - 0.4} t1={tSon - 0.2} rate={2.6} w={w} h={h} seed={21} />
          <Quote16 t={t} t0={tEl - 0.2} t1={tSon} text="hadas danzantes" who="Don Pettit · así llamó a los destellos" x={vertical ? 60 : 160} y={vertical ? 760 : 420} w={vertical ? 960 : 1600} size={vertical ? 120 : 130} color="#FFE9C6" />
        </AbsoluteFill>
      ) : null}
      <Eye t={t} t0={tSon - 0.3} t1={tSobre + 0.1} w={w} h={h} />
      <FlashRate t={t} t0={tSobre - 0.2} tIn={tVarias} t1={s1 + 1} w={w} h={h} />
    </>
  );
};

/* ------------------------------------------------------------------ s07: los protones medidos por el MetOp-A */
export const S07: React.FC<SceneP & {vertical?: boolean}> = ({t, T, w, h, vertical}) => {
  const A = (p: string, n = 0) => T.at('s07', p, n);
  const s0 = T.start('s07'), s1 = T.end('s07');
  if (t < s0 - 1.2 || t > s1 + 1.5) return null;
  const tCada = A('Cada punto'), tMes = A('mes'), tCasi = A('Casi todo'), tAca = A('acá'), tEsto = A('esto');
  const sun = sunFrom(0, 40);
  const cam = camPath(t, [
    [s0 - 1.2, {lat: 15, lon: 120, range: 3.5, fov: 30}],
    [tCasi, {lat: 10, lon: 135, range: 3.3, fov: 30}],
    [tAca - 0.5, {lat: 5, lon: 150, range: 3.3, fov: 30}],
    [tEsto + 0.3, {lat: -22, lon: -45, range: 3.0, fov: 30}],
    [s1 + 1.5, {lat: -24, lon: -48, range: 2.9, fov: 30}],
  ], (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2));
  const reveal = mix(0, 31.2, ss(s0 - 0.5, tMes + 0.4, t));
  const hot = ss(tAca - 0.2, tEsto + 0.4, t);
  const n = METOP_N();
  return (
    <AbsoluteFill style={{opacity: vis(t, s0 - 1.2, s1 + 1.5, 0.6, 0.7)}}>
      <Stage16 cam={cam} w={w} h={h}>
        <Earth t={t} sun={sun} cam={cam} dim={0.5} desat={0.6} clouds={0.45} night={0.4} />
        <Atmosphere sun={sun} cam={cam} k={0.5} />
        <Metop reveal={reveal} hot={hot} size={vertical ? 10 : 8} calm={0.55} />
      </Stage16>
      <div style={{position: 'absolute', left: vertical ? 60 : 96, top: vertical ? 160 : 84}}>
        <Caps size={vertical ? 20 : 18} color={K.ink}>MetOp-A · detector SEM-2 · 820-850 km</Caps>
        <Mono size={vertical ? 19 : 17} color={K.dim} style={{marginTop: 8}}>protones de más de 16 MeV · marzo de 2014</Mono>
      </div>
      <div style={{position: 'absolute', right: vertical ? 60 : 96, top: vertical ? 160 : 84, textAlign: 'right', opacity: vis(t, tCada - 0.3, s1 + 1.4, 0.5, 0.5)}}>
        <Caps size={15} color={K.dim}>mediciones</Caps>
        <Mono size={vertical ? 46 : 44} color={K.ink}>{fmtN(Math.floor(n * clamp(reveal / 31.2)))}</Mono>
        <Mono size={vertical ? 20 : 18} color={K.dim} style={{marginTop: 6}}>{Math.max(1, Math.min(31, Math.ceil(reveal)))} de marzo de 2014</Mono>
      </div>
      <Big t={t} t0={tCasi + 0.1} t1={tAca - 0.2} text="en calma" size={vertical ? 70 : 64} y={vertical ? 1500 : 880} font="serif" color={K.ice} />
      <Credit16 t={t} t0={s0} t1={s1 + 1} text="Datos: NOAA/NCEI · MetOp-A (EUMETSAT), instrumento SEM-2 de NOAA" right={!vertical} />
    </AbsoluteFill>
  );
};
